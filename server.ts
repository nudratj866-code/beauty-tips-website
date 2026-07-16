import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Path to persist JSON database
const DB_FILE = path.join(process.cwd(), "src", "db.json");

// Define basic interface for state
interface Comment {
  id: string;
  username: string;
  content: string;
  date: string;
}

interface Article {
  id: string;
  title: string;
  category: string;
  excerpt: string;
  content: string;
  author: string;
  date: string;
  readingTime: string;
  image: string;
  videoUrl?: string;
  likesCount: number;
  comments: Comment[];
  views: number;
}

interface User {
  id: string;
  email: string;
  password?: string; // stored plainly for simple local-mock auth, but we filter it out in API
  name: string;
  bio: string;
  skinType: string;
  hairType: string;
  avatar: string;
  isVerified: boolean;
  isAdmin: boolean;
  favorites: string[]; // array of articleIds
}

interface DBState {
  users: User[];
  articles: Article[];
  newsletter: string[];
}

// Initial seed articles (Rich, gorgeous, practical content)
const INITIAL_ARTICLES: Article[] = [
  {
    id: "skincare-01",
    title: "The Ultimate 5-Step Morning Skincare Routine for Glowing Skin",
    category: "Skincare",
    excerpt: "Unlock radiant skin with a scientifically-backed morning routine that protects, hydrates, and brightens your complexion all day.",
    content: `Achieving a natural, radiant glow isn't about using a dozen products; it's about using the right ones in the correct order. In the morning, your skin's primary need is protection from environmental stressors (UV rays, pollution) and hydration. Here is our recommended 5-step morning skincare routine designed to leave your skin plump, bright, and protected:

### Step 1: Gentle Cleansing
Start with a lukewarm water splash or a gentle, non-stripping water-based cleanser. Overnight, your skin produces sebum and sheds cells, but a harsh cleanser can damage your skin barrier. A mild hydrating cleanser containing **Ceramides** or **Glycerin** is perfect.

### Step 2: Hydrating Toner
Pat on a hydrating toner containing **Hyaluronic Acid** or **Centella Asiatica (Cica)**. This plumps up the cells, increases skin elasticity, and prepares your face to absorb the active ingredients in the next steps.

### Step 3: Antioxidant Serum (Vitamin C)
Apply 3-4 drops of **Vitamin C serum** (10-20% L-Ascorbic Acid). Vitamin C is a potent antioxidant that neutralizes free radicals, boosts collagen synthesis, reduces hyperpigmentation, and amplifies your sunscreen's efficacy.

### Step 4: Eye Cream & Lightweight Moisturizer
Gently dab a hydrating eye cream around the orbital bone. Follow with a lightweight, oil-free moisturizer containing **Niacinamide** or **Squalane**. This locks in hydration without feeling heavy under makeup.

### Step 5: Broad-Spectrum Sunscreen (The Non-Negotiable)
Finish with a generous amount (the 2-finger rule) of a broad-spectrum SPF 30 or higher sunscreen. Choose physical filters (Zinc Oxide) for sensitive skin or chemical filters for zero white cast. This step is single-handedly responsible for preventing 90% of premature skin aging.

*Pro-Tip: Allow 60 seconds between each step for maximum absorption!*`,
    author: "Elena Rose",
    date: "2026-07-10",
    readingTime: "4 min read",
    image: "https://images.unsplash.com/photo-1556228720-195a672e8a03?q=80&w=600&auto=format&fit=crop",
    likesCount: 24,
    views: 142,
    comments: [
      { id: "c1", username: "Sophia_K", content: "I started doing this a week ago, and my skin feels so incredibly hydrated!", date: "2026-07-11" },
      { id: "c2", username: "Aria_M", content: "Does the Vitamin C serum cause purging? I am a bit hesitant to start.", date: "2026-07-12" }
    ]
  },
  {
    id: "makeup-01",
    title: "Flawless Base Makeup: A Step-by-Step Guide to Airbrushed Finish",
    category: "Makeup",
    excerpt: "Stop your foundation from looking cakey or settling into fine lines. Master the art of a seamless, long-lasting complexion base.",
    content: `Have you ever wondered how professional makeup artists achieve that perfectly smooth, 'airbrushed' complexion? The secret lies in a combination of skin prep, strategic product layering, and precise blending tools. Follow this step-by-step masterclass to get a flawless, cake-free makeup base that lasts all day and night.

### 1. Prep is Everything: Hydrate First
Makeup will only look as good as the canvas beneath it. Cleanse your skin, apply a hydrating toner, and massage a lightweight moisturizer into your face. Wait 5-10 minutes before applying any makeup to let the skincare absorb fully.

### 2. Primer Selection
Primer acts as a barrier between your skin and makeup, holding everything in place.
- **For Large Pores:** Use a silicone-based, pore-filling primer in your T-zone.
- **For Dry Skin:** Use a radiant, water-based primer for a dewy look.
- **For Oily Skin:** Apply a mattifying primer to control excess sebum.

### 3. Foundation Layering: Less is More
Instead of pouring foundation directly on your face, dot a small amount on the center of your face (nose, cheeks, chin) and blend outwards. Use a damp **makeup sponge** in a bouncing motion (never swipe) or a flat-top buffing brush for full coverage. This ensures a seamless transition towards your hairline and jaw.

### 4. Spot Concealing & Brightening
Apply a hydrating concealer that matches your skin tone to cover active blemishes or redness. Next, use a concealer 1-2 shades lighter under your eyes in an upside-down triangle shape. Blend gently using your ring finger or a small sponge.

### 5. Setting with Powder & Finishing Spray
To avoid cakeyness, use a translucent loose setting powder. Tap a damp beauty sponge into the powder, press it on your hand first, then gently press it into oily zones (under-eyes, smile lines, T-zone). Lock the entire look with a hydrating setting spray to melt the powder into the skin for a seamless, natural skin finish.`,
    author: "Camila V.",
    date: "2026-07-08",
    readingTime: "5 min read",
    image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=600&auto=format&fit=crop",
    likesCount: 18,
    views: 95,
    comments: [
      { id: "c3", username: "Chloe_Beauty", content: "Pressing the powder with a damp sponge is an absolute game-changer! No more dry patches.", date: "2026-07-09" }
    ]
  },
  {
    id: "hair-01",
    title: "Nourishing Your Hair: How to Combat Dryness & Frizz Naturally",
    category: "Hair Care",
    excerpt: "Is your hair feeling dull, dry, and unmanageable? Revitalize your locks with a targeted care routine and deep-conditioning techniques.",
    content: `Hair dryness and frizz are often symptoms of a compromised hair cuticle. When the outer layer of your hair shaft is raised, moisture escapes and atmospheric moisture enters, causing the strand to swell and frizz. To rebuild healthy, silky-smooth hair, we need to balance protein levels and seal in moisture. Here is how:

### 1. Use Sulfate-Free Shampoos
Sulfates are harsh detergents that strip away the natural sebum your scalp produces to lubricate the hair shaft. Switch to a sulfate-free, pH-balanced formula containing nourishing oils (Argan Oil, Jojoba Oil) or Aloe Vera extract.

### 2. The Golden Rule of Conditioning
Never skip conditioner! Focus the product purely on the mid-lengths to the ends. Leave it on for at least 3 minutes before rinsing with cold water. Cold water seals the hair cuticles, trapping the moisture inside and adding natural shine.

### 3. Weekly Deep-Conditioning Treatment
Once a week, replace your conditioner with a rich hair mask. For dry, brittle hair, look for ingredients like **Shea Butter**, **Hydrolyzed Keratin**, or **Coconut Oil**. Apply to damp hair, wrap in a warm microfiber towel for 15-20 minutes, then rinse.

### 4. Protect from Heat Styling
Heat tools break down the hydrogen bonds in hair, draining its natural humidity. Always apply a silicone-based or water-based heat protectant spray prior to blow-drying or flat-ironing. Limit heat settings to below 350°F (180°C).

### 5. Overnight Care with Silk or Satin
Cotton pillowcases absorb moisture from your hair and cause friction, leading to tangles, frizz, and breakage. Switch to a silk or satin pillowcase, or wrap your hair in a silk bonnet before sleep. You will wake up with noticeably smoother, tangle-free hair.`,
    author: "Seraphina Green",
    date: "2026-07-05",
    readingTime: "5 min read",
    image: "https://images.unsplash.com/photo-1562322140-8baeececf3df?q=80&w=600&auto=format&fit=crop",
    likesCount: 32,
    views: 167,
    comments: []
  },
  {
    id: "nail-01",
    title: "The At-Home Manicure Guide for Strong, Elegant Nails",
    category: "Nail Care",
    excerpt: "Skip the expensive salon visit. Learn the step-by-step technique to achieve healthy, perfectly shaped, and long-lasting nails at home.",
    content: `You don't need to spend hours and fortunes at a professional salon to have beautifully manicured, elegant hands. With the right tools and a little patience, you can master a professional-quality manicure right at home. Plus, focusing on nail health will prevent peeling, chipping, and breaking.

### Essential Tools Needed:
- Glass nail file (gentler than emery boards)
- Wooden cuticle pusher (orange stick)
- Buffer block
- Base coat, nail polish, and top coat
- Cuticle oil or sweet almond oil

### The At-Home Procedure:

1. **Clean and Prep:** Remove any old nail polish using an acetone-free remover (acetone dries out the nail plate). Wash and dry your hands thoroughly.
2. **File and Shape:** Always file in one direction only—do not saw back and forth, as this causes microscopic splits. A rounded square or soft oval shape provides the most strength.
3. **Tend to the Cuticles:** Apply a drop of cuticle remover or warm oil to your cuticles. Use your wooden stick to gently push them back. *Never cut your cuticles*, as they are the natural barrier protecting your nail matrix from bacterial infections.
4. **Buff and Cleanse:** Buff the nail surface very lightly to remove ridges and oils. Wipe each nail with rubbing alcohol to ensure a completely dry, oil-free surface.
5. **The Layering Secret:**
   - **Base Coat:** Apply a thin layer of fortifying base coat. This prevents staining and helps the color adhere.
   - **Color Coat:** Apply two thin layers of your favorite polish. Use the three-stroke method: down the center, then down each side. Let it dry for 2 minutes between coats.
   - **Top Coat:** Seal the free edge (tip of the nail) and the entire plate with a shiny top coat.
6. **Rehydrate:** Once dry, massage a drop of cuticle oil onto each nail bed to nourish and soften.`,
    author: "Lilly Dupont",
    date: "2026-07-03",
    readingTime: "3 min read",
    image: "https://images.unsplash.com/photo-1604654894610-df63bc536371?q=80&w=600&auto=format&fit=crop",
    likesCount: 12,
    views: 74,
    comments: []
  },
  {
    id: "natural-01",
    title: "Harnessing the Power of Honey and Aloe Vera for Natural Glow",
    category: "Natural Remedies",
    excerpt: "Discover how simple pantry ingredients can deliver powerful skincare results without synthetic chemicals or additives.",
    content: `Long before commercial cosmetics hit store shelves, nature provided us with an array of botanical and organic skin treatments. Two of the most potent, scientifically validated remedies are **Raw Honey** and **Aloe Vera**. Rich in vitamins, enzymes, and antioxidants, this dynamic duo can soothe irritation, treat acne, and restore your skin's natural radiance.

### Raw Honey: The Humectant & Antibacterial Hero
Honey is a natural humectant, meaning it draws moisture from the air deep into the skin, ensuring intense hydration. Furthermore, it contains enzymes that produce natural hydrogen peroxide, giving it robust antibacterial properties that fight acne-causing bacteria.
- **Honey Face Wash:** Massage a teaspoon of raw, organic honey onto damp skin. Rinse with lukewarm water. It cleanses gently while retaining skin elasticity.

### Aloe Vera: The Ultimate Soothing & Healing Gel
Pure Aloe Vera gel contains **Polysaccharides** and **Gibberellins**, compounds that promote cell regeneration, reduce inflammation, and accelerate wound healing. It is an excellent remedy for sunburns, redness, acne scars, and dehydrated skin.
- **Aloe Compress:** Extract fresh gel from an aloe leaf, blend it, and freeze it in ice cube trays. Rub an aloe ice cube over your face in the evening to reduce puffiness and soothe redness.

### DIY Radiance Face Mask Recipe:
Combine these two natural powerhouses for a deeply hydrating, brightening mask:
- 1 tablespoon of raw organic honey
- 1 tablespoon of fresh Aloe Vera gel
- 1/2 teaspoon of organic turmeric powder (for extra anti-inflammatory glow)

*Directions: Mix into a smooth paste, apply to a clean face, let sit for 15 minutes, and rinse with warm water. Repeat twice a week for bright, luminous, natural skin.*`,
    author: "Elena Rose",
    date: "2026-06-30",
    readingTime: "4 min read",
    image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?q=80&w=600&auto=format&fit=crop",
    likesCount: 29,
    views: 120,
    comments: [
      { id: "c4", username: "NatureLover", content: "Turmeric and honey is literally magic for dark spots! Highly recommend.", date: "2026-07-01" }
    ]
  },
  {
    id: "products-01",
    title: "Ingredient Spotlight: Why Hyaluronic Acid & Retinol Are Must-Haves",
    category: "Beauty Products",
    excerpt: "Demystify skincare ingredients. Learn how to combine active ingredients safely for maximum age-defying and hydrating benefits.",
    content: `Walk down the cosmetic aisle, and you'll find hundreds of products claiming miraculous results. To cut through the marketing noise, you need to understand the active ingredients. Today, we spotlight two gold-standard ingredients that dermatologists swear by: **Hyaluronic Acid** (for hydration) and **Retinol** (for cellular renewal).

### Hyaluronic Acid: The Ultimate Hydrator
Hyaluronic Acid (HA) is a sugar molecule found naturally in our skin, capable of holding up to **1000 times its weight in water**. As we age, our natural reserves deplete, leading to dehydration and fine lines.
- **How to Use:** Always apply HA serum onto *damp skin*. If applied to a dry face in a dry environment, HA can pull water from the deeper layers of your skin, leaving it drier than before. Seal it immediately with a moisturizer.

### Retinol: The Age-Defying Superstar
Retinol is a derivative of Vitamin A that penetrates deep into the dermis. It speeds up cell turnover, stimulates collagen production, unclogs pores, and fades dark spots. It is the most clinically proven anti-aging ingredient available.
- **How to Use:** Introduce retinol slowly. Use a pea-sized amount at *night only* on dry skin, starting twice a week. Always wear sunscreen the next morning, as retinol makes your skin highly sensitive to UV rays.

### Can You Use Them Together?
Yes! In fact, they are a perfect match. Apply your Hyaluronic Acid serum first to hydrate and soothe, let it dry, then apply your Retinol. This significantly reduces the flaking and irritation commonly associated with starting Retinol.`,
    author: "Dr. Clara Sterling",
    date: "2026-06-25",
    readingTime: "5 min read",
    image: "https://images.unsplash.com/photo-1608248597481-496100c80836?q=80&w=600&auto=format&fit=crop",
    likesCount: 41,
    views: 210,
    comments: []
  },
  {
    id: "bridal-01",
    title: "The 3-Month Bridal Beauty Timeline for a Radiant Wedding Day",
    category: "Bridal Beauty",
    excerpt: "Planning your wedding? Follow this comprehensive beauty schedule to ensure your skin, hair, and makeup are perfect for your special day.",
    content: `Your wedding day is one of the most photographed moments of your life. Achieving that sought-after bridal radiance isn't a quick overnight task—it requires a structured, scientific beauty timeline. Here is a professional 3-month count-down checklist to guide your preparations:

### Month 3: Foundation and Consultations
- **Professional Skin Assessment:** Visit a dermatologist or licensed esthetician. If you plan on doing chemical peels or laser treatments, start now. Never try these close to the wedding date due to peeling timelines.
- **Hair and Makeup Trials:** Book your artist and do trials. Take photos in both indoor artificial lighting and natural daylight to see how the makeup translates on camera.
- **Healthy Habits:** Increase water intake to 2.5L daily, and establish a consistent sleep schedule of 8 hours.

### Month 2: Hair and Body Care
- **Hair Trim & Color:** If you're altering your color, do it now. This gives you time to adjust if it's not perfect.
- **Body Exfoliation:** Start dry-brushing or using a gentle AHA body wash twice a week to eliminate texture on your arms and back.
- **Hand Care:** Apply cuticle oil nightly. Regular manicures now will ensure your hands look beautiful for those close-up ring photos.

### Month 1: The Final Touches
- **2 Weeks Before:** Get your final hair trim and color touch-up. Avoid trying *any* new skincare products now to prevent unexpected allergic reactions or breakouts.
- **1 Week Before:** Get a professional deep-hydrating facial (no extractions, just hydration and massage). Gently shape your eyebrows.
- **3 Days Before:** Exfoliate your body and apply a gradual, natural-looking self-tanner if desired.
- **The Night Before:** Apply a deeply hydrating lip mask and a lightweight sheet mask. Sleep on a silk pillowcase!`,
    author: "Olivia Vance",
    date: "2026-06-18",
    readingTime: "6 min read",
    image: "https://images.unsplash.com/photo-1519741497674-611481863552?q=80&w=600&auto=format&fit=crop",
    likesCount: 22,
    views: 110,
    comments: []
  },
  {
    id: "wellness-01",
    title: "Inner Beauty: How Nutrition, Sleep & Hydration Transform Your Skin",
    category: "Wellness",
    excerpt: "Skincare is only half the battle. Discover how your diet, sleep quality, and hydration levels manifest directly on your face.",
    content: `No amount of luxury cream can compensate for a poor diet, lack of sleep, or chronic dehydration. Your skin is your body's largest organ, and its condition is a direct reflection of your internal health. To achieve true, long-lasting beauty, we must nurture our bodies from the inside out. Let's explore the three vital pillars of wellness:

### 1. Advanced Hydration: Water is Life
When your body is dehydrated, it pulls moisture from your skin cells to prioritize vital internal organs. This leaves your complexion looking dull, dry, and emphasizes fine lines. Aim for at least 8-10 glasses of filtered water daily. To make it more beneficial, infuse it with antioxidant-rich cucumber, lemon, or mint.

### 2. Beauty Sleep: The Golden Repair Phase
During deep sleep (specifically between 10 PM and 2 AM), your body enters cell mitosis and repair mode. Growth hormone levels spike, accelerating tissue repair and collagen production. Concurrently, cortisol (the stress hormone) drops. Lack of sleep keeps cortisol high, which breaks down skin collagen and can trigger inflammatory flare-ups like acne and eczema.

### 3. Nutrition: Skin-Loving Superfoods
Incorporate these powerful nutrients into your daily meals:
- **Omega-3 Fatty Acids:** Found in salmon, walnuts, and flaxseeds. They strengthen the skin's lipid barrier, keeping moisture in and irritants out.
- **Vitamin E:** A powerful antioxidant found in avocados and almonds that shields cells from oxidative damage.
- **Vitamin C:** Crucial for collagen synthesis. Pack your diet with citrus fruits, strawberries, and bell peppers.
- **Probiotics:** Found in yogurt, kefir, and kombucha. A healthy gut microbiome directly correlates with clear, calm skin, reducing systemic inflammation.`,
    author: "Seraphina Green",
    date: "2026-06-12",
    readingTime: "5 min read",
    image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=600&auto=format&fit=crop",
    likesCount: 37,
    views: 189,
    comments: []
  }
];

// Seed state
let state: DBState = {
  users: [
    {
      id: "u1",
      email: "user@example.com",
      password: "password123",
      name: "Sophia Harris",
      bio: "Beauty enthusiast looking for the perfect natural skincare routine. Love organic and natural beauty remedies!",
      skinType: "Combination",
      hairType: "Wavy",
      avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=150&auto=format&fit=crop",
      isVerified: true,
      isAdmin: false,
      favorites: ["skincare-01", "natural-01"]
    },
    {
      id: "admin",
      email: "admin@example.com",
      password: "adminpassword",
      name: "Beauty Admin",
      bio: "Lead Editorial Director & Skincare Expert. Crafting professional beauty guidelines for all skin types.",
      skinType: "Normal",
      hairType: "Straight",
      avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?q=80&w=150&auto=format&fit=crop",
      isVerified: true,
      isAdmin: true,
      favorites: []
    }
  ],
  articles: INITIAL_ARTICLES,
  newsletter: ["user@example.com"]
};

// Load database if file exists
if (fs.existsSync(DB_FILE)) {
  try {
    const raw = fs.readFileSync(DB_FILE, "utf-8");
    state = JSON.parse(raw);
    console.log("Database successfully loaded from", DB_FILE);
  } catch (err) {
    console.error("Failed to read database file, using initial seed data.", err);
  }
} else {
  // Ensure the directory exists and write the initial file
  try {
    const dir = path.dirname(DB_FILE);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
    console.log("Database seeded and created at", DB_FILE);
  } catch (err) {
    console.error("Could not write initial db.json file", err);
  }
}

// Save database utility
function saveDB() {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2));
  } catch (err) {
    console.error("Failed to save database file.", err);
  }
}

// Lazy initialization of Gemini API to prevent app crash on missing key
let aiClient: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey === "MY_GEMINI_API_KEY") {
    throw new Error("GEMINI_API_KEY environment variable is not configured. Please add your key in the Secrets Panel in AI Studio.");
  }
  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        }
      }
    });
  }
  return aiClient;
}

// HELPER: Simple session management
// Map token -> user info (id, name, email, isAdmin, skinType, hairType, favorites, avatar, bio)
const SESSIONS = new Map<string, string>(); // token -> userId

// API ROUTES

// AUTHENTICATION

// Sign Up
app.post("/api/auth/signup", (req, res) => {
  const { email, password, name, skinType, hairType } = req.body;
  if (!email || !password || !name) {
    return res.status(400).json({ error: "Email, password, and name are required." });
  }

  const existing = state.users.find((u) => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ error: "Email already exists." });
  }

  const newUser: User = {
    id: "u_" + Math.random().toString(36).substr(2, 9),
    email,
    password,
    name,
    bio: "Welcome to my beauty diary!",
    skinType: skinType || "Normal",
    hairType: hairType || "Straight",
    avatar: `https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=150&auto=format&fit=crop`,
    isVerified: false,
    isAdmin: false,
    favorites: []
  };

  state.users.push(newUser);
  saveDB();

  // Create session
  const token = "tok_" + Math.random().toString(36).substr(2, 16);
  SESSIONS.set(token, newUser.id);

  const { password: _, ...userSafe } = newUser;
  res.json({ token, user: userSafe });
});

// Sign In
app.post("/api/auth/signin", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required." });
  }

  const user = state.users.find(
    (u) => u.email.toLowerCase() === email.toLowerCase() && u.password === password
  );

  if (!user) {
    return res.status(401).json({ error: "Invalid email or password." });
  }

  const token = "tok_" + Math.random().toString(36).substr(2, 16);
  SESSIONS.set(token, user.id);

  const { password: _, ...userSafe } = user;
  res.json({ token, user: userSafe });
});

// Sign Out
app.post("/api/auth/signout", (req, res) => {
  const authHeader = req.headers.authorization;
  if (authHeader) {
    const token = authHeader.replace("Bearer ", "");
    SESSIONS.delete(token);
  }
  res.json({ success: true });
});

// Profile fetching
app.get("/api/auth/profile", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ error: "No authorization header." });
  }

  const token = authHeader.replace("Bearer ", "");
  const userId = SESSIONS.get(token);

  if (!userId) {
    return res.status(401).json({ error: "Invalid or expired token." });
  }

  const user = state.users.find((u) => u.id === userId);
  if (!user) {
    return res.status(404).json({ error: "User not found." });
  }

  const { password: _, ...userSafe } = user;
  res.json({ user: userSafe });
});

// Edit Profile
app.post("/api/auth/profile/update", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized." });

  const token = authHeader.replace("Bearer ", "");
  const userId = SESSIONS.get(token);
  if (!userId) return res.status(401).json({ error: "Unauthorized." });

  const { name, bio, skinType, hairType, avatar } = req.body;
  const userIndex = state.users.findIndex((u) => u.id === userId);

  if (userIndex === -1) return res.status(404).json({ error: "User not found." });

  state.users[userIndex] = {
    ...state.users[userIndex],
    name: name || state.users[userIndex].name,
    bio: bio !== undefined ? bio : state.users[userIndex].bio,
    skinType: skinType || state.users[userIndex].skinType,
    hairType: hairType || state.users[userIndex].hairType,
    avatar: avatar || state.users[userIndex].avatar
  };

  saveDB();

  const { password: _, ...userSafe } = state.users[userIndex];
  res.json({ user: userSafe });
});

// Change Password
app.post("/api/auth/change-password", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized." });

  const token = authHeader.replace("Bearer ", "");
  const userId = SESSIONS.get(token);
  if (!userId) return res.status(401).json({ error: "Unauthorized." });

  const { oldPassword, newPassword } = req.body;
  const user = state.users.find((u) => u.id === userId);

  if (!user) return res.status(404).json({ error: "User not found." });
  if (user.password !== oldPassword) {
    return res.status(400).json({ error: "Incorrect old password." });
  }

  user.password = newPassword;
  saveDB();

  res.json({ success: true, message: "Password updated successfully." });
});

// Forgot Password
app.post("/api/auth/forgot-password", (req, res) => {
  const { email } = req.body;
  const user = state.users.find((u) => u.email.toLowerCase() === email?.toLowerCase());
  if (!user) {
    return res.status(404).json({ error: "No registered user found with that email." });
  }

  // Generate simulated recovery code
  res.json({
    success: true,
    message: `A secure reset password instructions has been simulated to your email ${email}. For demonstration, your current password is: ${user.password}`
  });
});

// Verify Email
app.post("/api/auth/verify-email", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized." });

  const token = authHeader.replace("Bearer ", "");
  const userId = SESSIONS.get(token);
  if (!userId) return res.status(401).json({ error: "Unauthorized." });

  const user = state.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  user.isVerified = true;
  saveDB();

  const { password: _, ...userSafe } = user;
  res.json({ success: true, user: userSafe });
});

// ARTICLES & TIPS SYSTEM

// Get Articles with search and filters
app.get("/api/articles", (req, res) => {
  const { search, category } = req.query;
  let filtered = [...state.articles];

  if (category && category !== "All") {
    filtered = filtered.filter(
      (art) => art.category.toLowerCase() === (category as string).toLowerCase()
    );
  }

  if (search) {
    const query = (search as string).toLowerCase();
    filtered = filtered.filter(
      (art) =>
        art.title.toLowerCase().includes(query) ||
        art.excerpt.toLowerCase().includes(query) ||
        art.content.toLowerCase().includes(query)
    );
  }

  res.json({ articles: filtered });
});

// Like an article
app.post("/api/articles/:id/like", (req, res) => {
  const { id } = req.params;
  const article = state.articles.find((a) => a.id === id);
  if (!article) return res.status(404).json({ error: "Article not found." });

  article.likesCount += 1;
  saveDB();

  res.json({ likesCount: article.likesCount });
});

// Post a comment to an article
app.post("/api/articles/:id/comments", (req, res) => {
  const { id } = req.params;
  const { username, content } = req.body;
  if (!username || !content) {
    return res.status(400).json({ error: "Username and comment content are required." });
  }

  const article = state.articles.find((a) => a.id === id);
  if (!article) return res.status(404).json({ error: "Article not found." });

  const newComment: Comment = {
    id: "c_" + Math.random().toString(36).substr(2, 9),
    username,
    content,
    date: new Date().toISOString().split("T")[0]
  };

  article.comments.unshift(newComment);
  saveDB();

  res.json({ comments: article.comments });
});

// Favorite / Bookmark article
app.post("/api/articles/:id/favorite", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized. Please sign in to save favorites." });

  const token = authHeader.replace("Bearer ", "");
  const userId = SESSIONS.get(token);
  if (!userId) return res.status(401).json({ error: "Invalid session." });

  const { id } = req.params;
  const user = state.users.find((u) => u.id === userId);
  if (!user) return res.status(404).json({ error: "User not found." });

  const artIndex = state.articles.findIndex((a) => a.id === id);
  if (artIndex === -1) return res.status(404).json({ error: "Article not found." });

  const favIndex = user.favorites.indexOf(id);
  let isFavorited = false;

  if (favIndex === -1) {
    user.favorites.push(id);
    isFavorited = true;
  } else {
    user.favorites.splice(favIndex, 1);
    isFavorited = false;
  }

  saveDB();
  res.json({ favorites: user.favorites, isFavorited });
});

// NEWSLETTER
app.post("/api/newsletter/subscribe", (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Email is required." });

  if (state.newsletter.includes(email.toLowerCase())) {
    return res.json({ success: true, message: "You are already subscribed!" });
  }

  state.newsletter.push(email.toLowerCase());
  saveDB();

  res.json({ success: true, message: "Thank you for subscribing to our premium beauty newsletter!" });
});

// AI BEAUTY ASSISTANT (Gemini API Integration)
app.post("/api/beauty-assistant", async (req, res) => {
  const { message, skinType, hairType, history } = req.body;
  if (!message) {
    return res.status(400).json({ error: "Message is required." });
  }

  try {
    const ai = getGeminiClient();

    // Construct precise system guidelines for the beauty expert assistant
    const systemInstruction = `You are "Aura", a highly professional, compassionate, and luxurious AI Beauty & Skincare Expert.
You specialize in giving scientific, safe, and actionable beauty guidelines for women.
The user has specified their profile:
- Skin Type: ${skinType || "Normal / Unspecified"}
- Hair Type: ${hairType || "Straight / Unspecified"}

Provide professional recommendations, customized skincare routines, ingredient explanations, makeup techniques, and haircare tips based on their profile.
Focus on safety, suggest natural remedies or dermatologically-tested active ingredients (like Niacinamide, Hyaluronic Acid, Retinol, Ceramides, Aloe Vera).
Keep your tone elegant, premium, warm, and comforting. Use structured layouts (headers, bullet points, and numbered lists) to make suggestions highly readable. Avoid using promotional sales pitches for specific brands. Offer objective guidance.`;

    // Process chat request
    const contents: any[] = [];
    if (history && Array.isArray(history)) {
      history.forEach((h: { role: string; text: string }) => {
        contents.push({
          role: h.role === "user" ? "user" : "model",
          parts: [{ text: h.text }]
        });
      });
    }

    // Append current message
    contents.push({
      role: "user",
      parts: [{ text: message }]
    });

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents,
      config: {
        systemInstruction,
        temperature: 0.7
      }
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error("Gemini API error:", error);
    res.status(500).json({
      error: error.message || "Something went wrong with the AI Assistant. Make sure GEMINI_API_KEY is configured in Secrets."
    });
  }
});

// ADMIN PANEL ROUTES

// Admin Stats
app.get("/api/admin/stats", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized." });

  const token = authHeader.replace("Bearer ", "");
  const userId = SESSIONS.get(token);
  const user = state.users.find((u) => u.id === userId);

  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: "Access denied. Admin rights required." });
  }

  const categoryCounts: Record<string, number> = {};
  state.articles.forEach((art) => {
    categoryCounts[art.category] = (categoryCounts[art.category] || 0) + 1;
  });

  const totalLikes = state.articles.reduce((sum, art) => sum + art.likesCount, 0);
  const totalComments = state.articles.reduce((sum, art) => sum + art.comments.length, 0);
  const totalViews = state.articles.reduce((sum, art) => sum + art.views, 0);

  res.json({
    usersCount: state.users.length,
    articlesCount: state.articles.length,
    newsletterCount: state.newsletter.length,
    totalLikes,
    totalComments,
    totalViews,
    categoryCounts,
    usersList: state.users.map(({ password, ...u }) => u)
  });
});

// Admin Add Article
app.post("/api/admin/articles", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized." });

  const token = authHeader.replace("Bearer ", "");
  const userId = SESSIONS.get(token);
  const user = state.users.find((u) => u.id === userId);

  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const { title, category, excerpt, content, image, readingTime } = req.body;
  if (!title || !category || !content) {
    return res.status(400).json({ error: "Title, category, and content are required." });
  }

  const newArticle: Article = {
    id: "art_" + Math.random().toString(36).substr(2, 9),
    title,
    category,
    excerpt: excerpt || content.substring(0, 120) + "...",
    content,
    author: user.name,
    date: new Date().toISOString().split("T")[0],
    readingTime: readingTime || "3 min read",
    image: image || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?q=80&w=600&auto=format&fit=crop",
    likesCount: 0,
    views: 0,
    comments: []
  };

  state.articles.unshift(newArticle);
  saveDB();

  res.json({ success: true, article: newArticle });
});

// Admin Delete Article
app.delete("/api/admin/articles/:id", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized." });

  const token = authHeader.replace("Bearer ", "");
  const userId = SESSIONS.get(token);
  const user = state.users.find((u) => u.id === userId);

  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const { id } = req.params;
  const initialLength = state.articles.length;
  state.articles = state.articles.filter((art) => art.id !== id);

  if (state.articles.length === initialLength) {
    return res.status(404).json({ error: "Article not found." });
  }

  saveDB();
  res.json({ success: true, message: "Article successfully deleted." });
});

// Admin Delete Comment
app.delete("/api/admin/comments/:id", (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: "Unauthorized." });

  const token = authHeader.replace("Bearer ", "");
  const userId = SESSIONS.get(token);
  const user = state.users.find((u) => u.id === userId);

  if (!user || !user.isAdmin) {
    return res.status(403).json({ error: "Admin access required." });
  }

  const { id } = req.params;
  let found = false;

  state.articles.forEach((art) => {
    const originalLength = art.comments.length;
    art.comments = art.comments.filter((c) => c.id !== id);
    if (art.comments.length < originalLength) {
      found = true;
    }
  });

  if (!found) {
    return res.status(404).json({ error: "Comment not found." });
  }

  saveDB();
  res.json({ success: true, message: "Comment deleted successfully." });
});

// SERVE FRONTEND (Vite / Express Integration)

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server started on http://localhost:${PORT}`);
  });
}

startServer();

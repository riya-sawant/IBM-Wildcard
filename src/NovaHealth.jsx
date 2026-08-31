import React, { useState, useRef, useEffect, useCallback } from "react";
import { Send, Camera, MapPin, Building2, Siren, BookOpen, Sun, Moon, Eye, Star, Upload, Loader2, Mic, MicOff, Copy, Check, AlertTriangle, Wallet } from "lucide-react";
import ManageCareCosts from "./ManageCareCosts";

// ---------- Theme tokens ----------
const THEMES = {
  light: {
    bg: "#FFFFFF", panel: "#F1EFE8", ink: "#2C2C2A", sub: "#5F5E5A", mute: "#8A887F",
    border: "#D3D1C7", accent: "#534AB7", accentBg: "#EEEDFE",
    teal: "#0F6E56", tealBg: "#E1F5EE", amber: "#854F0B", amberBg: "#FAEEDA",
    pink: "#993556", pinkBg: "#FBEAF0", coral: "#993C1D", coralBg: "#FAECE7",
  },
  dark: {
    bg: "#1B1B19", panel: "#232320", ink: "#F1EFE8", sub: "#B4B2A9", mute: "#7C7A72",
    border: "#3A3934", accent: "#AFA9EC", accentBg: "#3C3489",
    teal: "#6FD3B4", tealBg: "#1E3B33", amber: "#E8B463", amberBg: "#3E2E13",
    pink: "#E9A9C0", pinkBg: "#3E1F2A", coral: "#E8A188", coralBg: "#3E2318",
  },
  colorblind: {
    bg: "#FFFFFF", panel: "#F1EFE8", ink: "#2C2C2A", sub: "#5F5E5A", mute: "#8A887F",
    border: "#D3D1C7", accent: "#185FA5", accentBg: "#E6F1FB",
    teal: "#185FA5", tealBg: "#E6F1FB", amber: "#854F0B", amberBg: "#FAEEDA",
    pink: "#185FA5", pinkBg: "#E6F1FB", coral: "#854F0B", coralBg: "#FAEEDA",
  },
};

const TABS = [
  { id: "home",        label: "Home",           icon: Send     },
  { id: "insurance",   label: "Insurance lens",  icon: MapPin   },
  { id: "noinsurance", label: "No insurance",    icon: Building2},
  { id: "urgent",      label: "Urgent",          icon: Siren    },
  { id: "costs",       label: "Manage costs",    icon: Wallet   },
  { id: "learn",       label: "Learn",           icon: BookOpen },
];

// ---------- Insurance lens data ----------
const IL_PROVIDERS = [
  { name: "Dr. Amara Osei", specialty: "Family medicine", distance: "0.8 mi", rating: 4.8, years: 14, gender: "Female", nonprofit: false, verified: true,  awards: ["Top Doctor 2023"], asl: true,  phone: true,  languages: ["English","Twi"], insurance: "low",    accessibility: ["elevator","ramp"], tags: ["Accessible","ASL","Phone"] },
  { name: "Riverside Health Clinic", specialty: "Internal medicine", distance: "1.2 mi", rating: 4.5, years: 22, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [], asl: false, phone: true,  languages: ["English","Spanish","Yoruba"], insurance: "medium", accessibility: ["elevator","transportation"], tags: ["Accessible","Spanish","Yoruba"] },
  { name: "Dr. Priya Nair", specialty: "Pediatrics", distance: "1.6 mi", rating: 4.9, years: 9,  gender: "Female", nonprofit: false, verified: true,  awards: ["Patient Choice Award"], asl: false, phone: true,  languages: ["English","Hindi"], insurance: "high",   accessibility: ["ramp"], tags: ["Accessible","Hindi"] },
  { name: "Dr. Marcus Lee", specialty: "Dermatology", distance: "2.1 mi", rating: 4.6, years: 17, gender: "Male",   nonprofit: false, verified: false, awards: [], asl: true,  phone: false, languages: ["English"], insurance: "high",   accessibility: ["elevator"], tags: ["ASL"] },
  { name: "City Community Clinic", specialty: "Family medicine", distance: "0.5 mi", rating: 4.3, years: 30, gender: "Mixed",  nonprofit: true,  verified: true,  awards: ["HRSA Gold Award"], asl: true,  phone: true,  languages: ["English","Spanish","Mandarin"], insurance: "low",    accessibility: ["elevator","ramp","transportation"], tags: ["Accessible","ASL","Phone","Spanish","Mandarin"] },
  { name: "Dr. Leon Harris", specialty: "Psychiatry", distance: "2.8 mi", rating: 4.7, years: 11, gender: "Male",   nonprofit: false, verified: true,  awards: [], asl: false, phone: true,  languages: ["English","French"], insurance: "medium", accessibility: ["elevator"], tags: ["Phone","French"] },
  { name: "Rural Health Partners", specialty: "General practice", distance: "18 mi", rating: 4.2, years: 25, gender: "Mixed",  nonprofit: true,  verified: true,  awards: [], asl: false, phone: true,  languages: ["English","Spanish"], insurance: "low",    accessibility: ["ramp","transportation"], tags: ["Rural","Phone","Spanish"] },
  { name: "Dr. Sofia Reyes", specialty: "OB-GYN", distance: "1.9 mi", rating: 4.8, years: 13, gender: "Female", nonprofit: false, verified: true,  awards: ["Best OB 2022"], asl: false, phone: true,  languages: ["English","Spanish"], insurance: "medium", accessibility: ["elevator","ramp"], tags: ["Accessible","Spanish"] },
];

const IL_SPECIALTIES = ["All", "Family medicine", "Internal medicine", "Pediatrics", "Dermatology", "Psychiatry", "OB-GYN", "General practice"];

const IL_RESOURCES = [
  { cat: "Government",       title: "HealthCare.gov — Find a Plan",          body: "Compare ACA Marketplace plans by ZIP, income and coverage need. Subsidies available at all income levels.", link: "https://www.healthcare.gov/using-marketplace-coverage/getting-medical-care/", icon: "▲" },
  { cat: "Government",       title: "Medicare Care Compare",                  body: "Official CMS tool to compare hospitals, nursing homes, doctors and home health agencies nationwide.", link: "https://www.medicare.gov/care-compare/", icon: "▲" },
  { cat: "Government",       title: "UHC Health Plans by State",             body: "United Healthcare plan finder by state — see what plans are available where you live.", link: "https://www.uhcprovider.com/en/health-plans-by-state.html", icon: "▲" },
  { cat: "Community Clinic", title: "HRSA Find a Health Center",             body: "Federally Qualified Health Centers offering sliding-scale fees — no one turned away regardless of ability to pay.", link: "https://findahealthcenter.hrsa.gov/", icon: "◆" },
  { cat: "Community Clinic", title: "AMA Doctor Finder",                     body: "American Medical Association database of licensed US physicians — filter by specialty, location and name.", link: "https://find-doctor.ama-assn.org/", icon: "◆" },
  { cat: "Community Clinic", title: "UHC Find a Doctor",                     body: "Search in-network doctors, specialists and facilities by location and plan type.", link: "https://www.uhc.com/find-a-doctor", icon: "◆" },
  { cat: "Nonprofit",        title: "Covered Traveler — Medical Providers",  body: "Directory of vetted medical providers with transparent pricing across the US.", link: "https://www.coveredtraveler.com/medical-providers", icon: "●" },
  { cat: "Nonprofit",        title: "Cigna Provider Directory",              body: "Find Cigna-contracted providers near you — primary care, specialists and behavioral health.", link: "https://www.cigna.com/", icon: "●" },
  { cat: "Government",       title: "NIMHD Health Data Portal — Insurance",  body: "NIH data on insurance coverage gaps by race, age and sex — understand disparities in your community.", link: "https://hdpulse.nimhd.nih.gov/data-portal/healthcare/table?age=174&age_options=age_6&demo=00030&demo_options=insurance_12&healthcaretopic=040&healthcaretopic_options=healthcare_3&race=00&race_options=race_1_all&sex=0&sex_options=sex_3&statefips=00&statefips_options=area_states", icon: "▲" },
  { cat: "Government",       title: "Census Bureau — Health Insurance Report", body: "Official 2024 US Census data on insurance coverage by demographics and state.", link: "https://www.census.gov/library/publications/2025/demo/p60-288.html", icon: "▲" },
  { cat: "Government",       title: "CDC — Health Insurance FastStats",       body: "CDC quick-reference statistics on insurance coverage, uninsured rates and access to care.", link: "https://www.cdc.gov/nchs/fastats/health-insurance.htm", icon: "▲" },
  { cat: "Nonprofit",        title: "KFF — Insurance Coverage by Gender",    body: "Kaiser Family Foundation data on insurance coverage disparities across genders and states.", link: "https://www.kff.org/state-category/health-coverage-uninsured/health-insurance-status-by-gender/", icon: "●" },
  { cat: "Nonprofit",        title: "US Health Group — Get a Quote",          body: "Compare private health insurance plans and get personalised quotes by coverage level.", link: "https://www.ushealthgroup.com/get-a-quote", icon: "●" },
  { cat: "Nonprofit",        title: "First Family Insurance",                 body: "Independent broker helping families find affordable insurance plans across the US market.", link: "https://www.firstfamilyinsurance.com/", icon: "●" },
];

// ---------- Learn tab data ----------
const LEARN_CATS = ["All", "First Aid", "Prevention", "Nutrition", "Mental Health", "Know When to Go"];

const LEARN_GUIDES = [
  // ── First Aid ──
  {
    cat: "First Aid", icon: "🩹", title: "Cuts & minor wounds",
    summary: "Clean, cover, monitor — most small cuts heal at home.",
    steps: [
      "Rinse the wound under cool running water for 1–2 minutes to flush debris.",
      "Apply gentle pressure with a clean cloth for 5–10 min to stop bleeding.",
      "Pat dry and apply a thin layer of antibiotic ointment (e.g. Neosporin).",
      "Cover with a sterile adhesive bandage; change daily or when wet.",
      "Watch for redness spreading beyond the wound edge, warmth, pus, or fever — those need a provider.",
    ],
    tip: "See a provider if the cut is deeper than ¼ inch, gaping, or from a rusty or dirty object.",
  },
  {
    cat: "First Aid", icon: "🔥", title: "Minor burns (1st degree)",
    summary: "Cool, protect, and soothe — never use ice or butter.",
    steps: [
      "Run cool (not cold) water over the burn for at least 10–20 minutes.",
      "Do NOT apply ice, butter, toothpaste, or any oil — these trap heat.",
      "Take ibuprofen or acetaminophen for pain if needed.",
      "Cover loosely with a non-stick sterile bandage or clean cling wrap.",
      "Keep clean and dry; apply aloe vera gel to soothe once cooled.",
    ],
    tip: "Go to emergency care for burns larger than 3 inches, burns on the face/hands/genitals, or any 3rd-degree burn (white or charred skin).",
  },
  {
    cat: "First Aid", icon: "🦷", title: "Knocked-out tooth",
    summary: "Act within 30 minutes — you can often save the tooth.",
    steps: [
      "Pick up the tooth by the crown (white part), not the root.",
      "Rinse gently with milk or saline — do NOT scrub or use tap water.",
      "Try to reinsert it into the socket; bite gently on a damp cloth to hold it.",
      "If you can't reinsert, keep it moist: submerge in milk or hold between cheek and gum.",
      "Get to a dentist or ER within 30 minutes for the best chance of saving it.",
    ],
    tip: "Time is critical — the sooner a dentist sees it, the higher the survival chance.",
  },
  {
    cat: "First Aid", icon: "🤧", title: "Nosebleed at home",
    summary: "Lean forward, pinch, wait — do NOT tilt back.",
    steps: [
      "Sit upright and lean slightly forward (leaning back causes blood to flow to throat).",
      "Pinch the soft part of your nose shut firmly with your thumb and index finger.",
      "Breathe through your mouth and hold for a full 10–15 minutes without peeking.",
      "Apply a cold pack to the bridge of the nose while pinching.",
      "Once stopped, avoid blowing your nose, bending over, or heavy activity for a few hours.",
    ],
    tip: "Seek care if it doesn't stop after 30 minutes, follows a head injury, or recurs frequently.",
  },
  {
    cat: "First Aid", icon: "🦟", title: "Insect sting reaction",
    summary: "Remove the stinger fast, watch for allergic signs.",
    steps: [
      "Scrape the stinger out sideways with a credit card edge — don't use tweezers (squeezes venom).",
      "Wash the area with soap and water.",
      "Apply ice wrapped in a cloth for 10 minutes on, 10 off, to reduce swelling.",
      "Take an oral antihistamine (e.g. Benadryl) for itching and swelling.",
      "Elevate the affected limb if possible.",
    ],
    tip: "Call 911 immediately if the person develops throat swelling, difficulty breathing, dizziness, or hives spreading — this is anaphylaxis.",
  },
  {
    cat: "First Aid", icon: "🥵", title: "Heat exhaustion",
    summary: "Move to shade, hydrate, cool the skin urgently.",
    steps: [
      "Move the person to a cool, shaded, or air-conditioned place immediately.",
      "Loosen or remove tight, heavy clothing.",
      "Apply cool, wet cloths to skin — especially neck, armpits, and groin.",
      "Give cool water or a sports drink to sip slowly if they are conscious.",
      "Fan them and continue cooling until help arrives or symptoms ease.",
    ],
    tip: "If confusion, loss of consciousness, or high fever (>104°F) develops — that is heat stroke. Call 911 immediately.",
  },
  {
    cat: "First Aid", icon: "🤢", title: "Choking — Heimlich manoeuvre",
    summary: "Hard abdominal thrusts can dislodge a blockage.",
    steps: [
      "Stand behind the person and wrap your arms around their waist.",
      "Make a fist with one hand, thumb side in, just above the belly button.",
      "Grasp your fist with the other hand.",
      "Give firm, upward inward thrusts — repeat up to 5 times.",
      "Alternate with 5 back blows between the shoulder blades if thrusts fail.",
    ],
    tip: "If the person becomes unconscious, lower them to the floor and call 911 — start CPR if trained.",
  },

  // ── Prevention ──
  {
    cat: "Prevention", icon: "🧼", title: "Handwashing that actually works",
    summary: "20 seconds with soap and water stops most common illnesses.",
    steps: [
      "Wet hands with clean running water (warm or cold).",
      "Apply soap and lather well — back of hands, between fingers, under nails.",
      "Scrub for at least 20 seconds (hum 'Happy Birthday' twice).",
      "Rinse thoroughly under running water.",
      "Dry with a clean towel or air-dry; use the towel to turn off the tap.",
    ],
    tip: "Wash before eating, after using the bathroom, after coughing/sneezing, and after touching animals or garbage.",
  },
  {
    cat: "Prevention", icon: "💧", title: "Staying hydrated",
    summary: "Most adults need 8–10 cups of water daily — more in heat or illness.",
    steps: [
      "Drink a glass of water first thing every morning before coffee or food.",
      "Carry a refillable bottle — sip consistently rather than drinking large amounts at once.",
      "Eat water-rich foods: cucumber, watermelon, oranges, lettuce.",
      "Check urine colour — pale yellow means well-hydrated; dark yellow means drink more.",
      "Increase intake when exercising, in hot weather, or when sick with fever.",
    ],
    tip: "Caffeinated drinks count but less efficiently — for every 2 cups of coffee, add an extra cup of water.",
  },
  {
    cat: "Prevention", icon: "😴", title: "Sleep hygiene basics",
    summary: "7–9 hours of quality sleep is your immune system's best friend.",
    steps: [
      "Go to bed and wake at the same time every day — including weekends.",
      "Keep the bedroom cool (65–68°F), dark, and quiet.",
      "Avoid screens for 30–60 min before bed — blue light suppresses melatonin.",
      "Avoid caffeine after 2 pm and heavy meals within 3 hours of sleep.",
      "If you can't sleep after 20 minutes, get up and do something calm until drowsy.",
    ],
    tip: "Chronic poor sleep raises the risk of heart disease, diabetes, obesity, and mental health conditions.",
  },
  {
    cat: "Prevention", icon: "🫁", title: "Prevent respiratory illness spread",
    summary: "Simple habits stop colds, flu, and COVID-like illnesses.",
    steps: [
      "Cover coughs and sneezes with the inside of your elbow — not your hand.",
      "Wear a mask in crowded enclosed spaces during high illness seasons.",
      "Ventilate rooms: open windows when possible, avoid recirculated air.",
      "Stay home when symptomatic — even a short absence cuts spread dramatically.",
      "Clean high-touch surfaces (phones, door handles, light switches) with disinfectant wipes daily.",
    ],
    tip: "Annual flu shots and staying up to date on vaccines are the highest-impact prevention steps.",
  },
  {
    cat: "Prevention", icon: "☀️", title: "Sun safety & skin care",
    summary: "Skin cancer is the most common US cancer — and mostly preventable.",
    steps: [
      "Apply SPF 30+ broad-spectrum sunscreen 15 min before going outside, every day.",
      "Reapply every 2 hours when outdoors, or after swimming/sweating.",
      "Wear protective clothing, a wide-brimmed hat, and UV-blocking sunglasses.",
      "Seek shade between 10am–4pm when UV rays are strongest.",
      "Examine your skin monthly — new moles, asymmetric shapes, or colour changes need a provider.",
    ],
    tip: "Even on cloudy days, 80% of UV rays reach the skin — make sunscreen a daily habit year-round.",
  },

  {
    cat: "Prevention", icon: "🦷", title: "Dental hygiene basics",
    summary: "Good dental habits prevent cavities, gum disease, and costly procedures.",
    steps: [
      "Brush twice daily for 2 minutes with a soft-bristle toothbrush and fluoride toothpaste.",
      "Replace your toothbrush every 3–4 months, or sooner if bristles are frayed — worn bristles clean far less effectively.",
      "Never share toothbrushes — they transfer bacteria and viruses between people.",
      "Store your toothbrush upright in open air, not in a closed container, so it dries between uses.",
      "Floss once daily — slide gently between each tooth in a C-shape, going below the gumline. Use a fresh section for each gap.",
    ],
    tip: "Not flossing leaves up to 40% of tooth surfaces uncleaned. Over time this leads to plaque buildup, gum inflammation (gingivitis), bone loss, and tooth loss — and has been linked to heart disease and diabetes.",
  },

  // ── Nutrition ──
  {
    cat: "Nutrition", icon: "🥦", title: "Eating for immunity",
    summary: "Specific foods measurably strengthen your immune response.",
    steps: [
      "Eat a rainbow: orange/red produce (bell peppers, carrots) is high in vitamin C and beta-carotene.",
      "Include zinc-rich foods weekly: beans, nuts, seeds, whole grains, lean meat.",
      "Add fermented foods for gut health: yoghurt, kefir, kimchi, sauerkraut.",
      "Limit ultra-processed foods — they trigger inflammation and weaken immune cells.",
      "Aim for 5 servings of fruits and vegetables daily — frozen counts and costs less.",
    ],
    tip: "Vitamin D deficiency is widespread and linked to poor immunity — ask your provider about a simple blood test.",
  },
  {
    cat: "Nutrition", icon: "🩸", title: "Managing blood sugar without medication",
    summary: "Small food and lifestyle changes have big effects on glucose.",
    steps: [
      "Choose whole grains over white bread/rice — they digest slower and spike blood sugar less.",
      "Pair carbs with protein or healthy fat at every meal to slow absorption.",
      "Eat smaller, more frequent meals rather than one or two large ones.",
      "Walk for 10–15 minutes after meals — movement uses glucose before it accumulates.",
      "Limit sugary drinks: one soda can raise blood sugar for 2+ hours.",
    ],
    tip: "If you have pre-diabetes, losing just 5–7% of body weight can reduce progression to diabetes by 58%.",
  },
  {
    cat: "Nutrition", icon: "❤️", title: "Heart-healthy eating habits",
    summary: "Most heart disease is preventable through consistent small choices.",
    steps: [
      "Replace saturated fats (butter, fatty meat) with unsaturated fats: olive oil, avocado, nuts.",
      "Eat fatty fish (salmon, sardines, mackerel) twice a week for omega-3s.",
      "Reduce sodium: cook at home, read labels, limit processed/canned foods.",
      "Increase fibre: oats, beans, flaxseed, and apples lower LDL cholesterol.",
      "Limit added sugar to under 25g/day for women and 36g/day for men.",
    ],
    tip: "The DASH and Mediterranean diets both have strong evidence behind heart health — neither requires expensive food.",
  },

  // ── Mental Health ──
  {
    cat: "Mental Health", icon: "🧘", title: "Breathing to calm anxiety",
    summary: "Controlled breathing activates your parasympathetic nervous system in minutes.",
    steps: [
      "Try box breathing: inhale 4 counts → hold 4 → exhale 4 → hold 4. Repeat 4 cycles.",
      "Or 4-7-8 breathing: inhale 4 → hold 7 → exhale slowly 8. Powerful for acute anxiety.",
      "Breathe from the belly, not the chest — place a hand on your stomach to check.",
      "Do this before a stressful event, during one, or to fall asleep.",
      "Pair with progressive muscle relaxation: tense then release muscle groups from toes to face.",
    ],
    tip: "Even 2 minutes of slow breathing lowers cortisol and heart rate — it works whether or not you believe it will.",
  },
  {
    cat: "Mental Health", icon: "🏃", title: "Exercise as medicine for mood",
    summary: "30 minutes of moderate activity is clinically comparable to antidepressants for mild–moderate depression.",
    steps: [
      "Start with 10-minute walks — even a short walk after meals lifts mood measurably.",
      "Choose movement you enjoy: dancing, gardening, cycling, swimming — adherence matters more than type.",
      "Exercise outside when possible — natural light boosts serotonin additionally.",
      "Aim for 150 min/week of moderate activity (brisk walk, cycling) or 75 min vigorous.",
      "Consistency over intensity: 5 days of 30 min beats 1 day of 2.5 hours.",
    ],
    tip: "Physical activity reduces risk of depression by 35%, anxiety by 48%, and dementia by up to 30% (WHO, 2023).",
  },
  {
    cat: "Mental Health", icon: "🗣️", title: "Talking about mental health",
    summary: "Naming what you feel is the first step to managing it.",
    steps: [
      "Name the emotion specifically — not just 'bad' but 'anxious', 'ashamed', 'lonely'. Specificity helps.",
      "Write it down: journaling for 15 min/day about thoughts and feelings reduces symptoms of depression.",
      "Talk to someone safe — a trusted friend, family member, or community leader.",
      "Use free or low-cost resources: Crisis Text Line (text HOME to 741741), NAMI Helpline 1-800-950-6264.",
      "If cost is a barrier, FQHCs (see No Insurance tab) offer behavioural health on sliding-scale fees.",
    ],
    tip: "Asking for help is not weakness — untreated mental health conditions worsen physical health outcomes and vice versa.",
  },
  {
    cat: "Mental Health", icon: "📵", title: "Digital detox & screen fatigue",
    summary: "Intentional screen breaks reduce stress, improve focus, and help sleep.",
    steps: [
      "Set a hard stop for social media: 30 min/day maximum has measurable mood benefits.",
      "Enable grayscale mode on your phone — colour is deliberately engaging; grey is not.",
      "Create 'phone-free' zones: the bedroom and dinner table.",
      "Take a 20-20-20 eye break: every 20 min, look at something 20 feet away for 20 seconds.",
      "Replace one 30-min scroll session per day with a walk, stretch, or 5-min breathing exercise.",
    ],
    tip: "Teens who use social media 5+ hours/day are 3× more likely to report depression (CDC, 2023). Limits apply to adults too.",
  },

  // ── Know When to Go ──
  {
    cat: "Know When to Go", icon: "🚨", title: "Call 911 immediately for these",
    summary: "Don't drive yourself — seconds matter.",
    steps: [
      "Chest pain, pressure, or tightening — especially with jaw, arm, or back pain.",
      "Sudden difficulty breathing or shortness of breath at rest.",
      "Signs of stroke: Face drooping, Arm weakness, Speech difficulty, Time to call (FAST).",
      "Severe allergic reaction: throat swelling, hives spreading rapidly, wheezing.",
      "Uncontrolled bleeding, unconsciousness, or seizure lasting more than 5 minutes.",
    ],
    tip: "When in doubt, call 911 — it is always better to be evaluated and sent home than to wait on a life-threatening emergency.",
  },
  {
    cat: "Know When to Go", icon: "🏥", title: "Urgent care vs. ER — which to choose",
    summary: "Urgent care is faster and cheaper for non-life-threatening issues.",
    steps: [
      "Urgent care: minor cuts needing stitches, UTIs, ear infections, sprains, mild fever, rashes.",
      "ER: chest pain, head injury, severe abdominal pain, broken bones, high fever in infants, strokes.",
      "Telehealth: prescription refills, mild colds, mental health check-ins, minor skin concerns.",
      "Primary care (next-day): ongoing conditions, routine prescriptions, annual physicals.",
      "Nurse hotlines (free): many insurers offer 24/7 nurse lines — check your plan.",
    ],
    tip: "Going to the ER for an urgent-care issue can cost 5–10× more. Use the No Insurance tab to find FQHCs that offer both walk-in and urgent care.",
  },
  {
    cat: "Know When to Go", icon: "🌡️", title: "Fever: when to treat and when to worry",
    summary: "Most fevers are your immune system working — but some need urgent attention.",
    steps: [
      "Adults: fever under 103°F — rest, fluids, acetaminophen or ibuprofen as directed.",
      "Adults: fever 103°F+ lasting more than 2 days or with stiff neck, rash, confusion → ER.",
      "Children under 3 months: any fever over 100.4°F → go to the ER immediately.",
      "Children 3 months–3 years: fever over 102.2°F lasting more than 2 days → provider.",
      "Never give aspirin to children — Reye's syndrome risk. Use children's acetaminophen or ibuprofen.",
    ],
    tip: "Fever itself isn't dangerous below 104°F in adults — but dehydration from fever is. Keep fluids going.",
  },
  {
    cat: "Know When to Go", icon: "📋", title: "Annual health checklist by age",
    summary: "Preventive screenings catch problems before they become expensive emergencies.",
    steps: [
      "All adults annually: blood pressure, weight/BMI, dental cleaning, vision check.",
      "Adults 18–39: STI screening if sexually active, mental health screen, skin check.",
      "Adults 40–64: cholesterol panel, blood glucose/diabetes screening, colorectal cancer screen (45+), mammogram (women 40+).",
      "Adults 65+: bone density scan, annual flu shot, pneumonia vaccine, hearing and vision.",
      "All ages: keep vaccinations current — flu annually, COVID boosters per CDC guidance, Tdap every 10 years.",
    ],
    tip: "Many FQHCs and community clinics provide all these screenings on a sliding scale — see the No Insurance tab.",
  },
];

export default function NovaHealth() {
  const [theme, setTheme] = useState("light");
  const [tab, setTab] = useState("home");
  const t = THEMES[theme];

  return (
    <div style={{ background: t.bg, color: "#000000", minHeight: "100vh", fontFamily: "system-ui, sans-serif", transition: "background 0.2s, color 0.2s" }}>
      <TopBar t={t} theme={theme} setTheme={setTheme} tab={tab} setTab={setTab} />
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "24px 20px 60px" }}>
        {tab === "home" && <HomeTab t={t} setTab={setTab} />}
        {tab === "insurance" && <InsuranceTab t={t} />}
        {tab === "noinsurance" && <NoInsuranceTab t={t} />}
        {tab === "urgent" && <UrgentTab t={t} />}
        {tab === "costs"  && <ManageCareCosts t={t} />}
        {tab === "learn"  && <LearnTab  t={t} />}
      </div>
    </div>
  );
}

// ---------- Top nav ----------
function TopBar({ t, theme, setTheme, tab, setTab }) {
  return (
    <div style={{ borderBottom: `1px solid ${t.border}`, position: "sticky", top: 0, background: t.bg, zIndex: 10 }}>
      <div style={{ maxWidth: 980, margin: "0 auto", padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontWeight: 700, fontSize: 16 }}>Nova Health</div>
        <div style={{ display: "flex", gap: 18, flexWrap: "wrap" }}>
          {TABS.map((tb) => (
            <button
              key={tb.id}
              onClick={() => setTab(tb.id)}
              style={{
                background: "none", border: "none", cursor: "pointer", fontSize: 13,
                color: tab === tb.id ? t.accent : t.sub,
                fontWeight: tab === tb.id ? 700 : 400,
                padding: "4px 0",
                borderBottom: tab === tb.id ? `2px solid ${t.accent}` : "2px solid transparent",
                transition: "border-color 150ms, color 150ms",
              }}
            >
              {tb.label}
            </button>
          ))}
        </div>
        <div style={{ display: "flex", gap: 6, border: `1px solid ${t.border}`, borderRadius: 8, padding: 3 }}>
          <ThemeBtn active={theme === "light"} onClick={() => setTheme("light")} icon={Sun} t={t} label="Light" />
          <ThemeBtn active={theme === "dark"} onClick={() => setTheme("dark")} icon={Moon} t={t} label="Dark" />
          <ThemeBtn active={theme === "colorblind"} onClick={() => setTheme("colorblind")} icon={Eye} t={t} label="Color-blind" />
        </div>
      </div>
    </div>
  );
}

function ThemeBtn({ active, onClick, icon: Icon, t, label }) {
  return (
    <button
      onClick={onClick}
      title={label}
      style={{
        display: "flex", alignItems: "center", gap: 4, fontSize: 11, padding: "5px 8px", borderRadius: 6,
        border: "none", cursor: "pointer", background: active ? t.accentBg : "transparent", color: active ? t.accent : t.sub,
      }}
    >
      <Icon size={13} />
    </button>
  );
}

// ---------- Home / chat tab (real AI call) ----------
const NAV_CARDS = [
  { id: "insurance",   label: "Insurance lens",  desc: "Find providers by specialty, language & accessibility.",  color: "teal"  },
  { id: "noinsurance", label: "No insurance",    desc: "Free clinics, Medicaid, and financial aid near you.",     color: "amber" },
  { id: "urgent",      label: "Urgent help",     desc: "Photo analysis and voice emergency summary tools.",       color: "coral" },
  { id: "costs",       label: "Manage costs",    desc: "Understand care costs and manage your payment plan.",     color: "pink"  },
  { id: "learn",       label: "Learn",           desc: "First aid guides, prevention tips, and when to seek care.", color: "accent" },
];

function HomeTab({ t, setTab }) {
  const [messages, setMessages] = useState([
    { role: "assistant", text: "Hi, I'm Nova. Tell me your symptoms or describe what's going on, and I'll help you understand it — not diagnose it, just help you figure out what questions to ask and where to go next." },
  ]);
  const [input,       setInput]       = useState("");
  const [loading,     setLoading]     = useState(false);
  const [listening,   setListening]   = useState(false);
  const [sttSupported, setSttSupported] = useState(true);
  const [sttError,    setSttError]    = useState("");
  const scrollRef      = useRef(null);
  const recognitionRef = useRef(null);

  // Set up SpeechRecognition once
  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSttSupported(false); return; }
    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = "en-US";
    rec.onresult = (e) => {
      let final = "", interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) final += chunk;
        else interim += chunk;
      }
      // Append committed text; show interim in-place via a temporary suffix
      setInput(prev => {
        const base = prev.replace(/\u200B.*$/, ""); // strip previous interim marker
        return base + final + (interim ? "\u200B" + interim : "");
      });
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed") setSttError("Microphone access denied.");
      else if (e.error !== "aborted") setSttError("Speech error — please try again.");
      setListening(false);
    };
    rec.onend = () => setListening(false);
    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, []);

  function toggleListening() {
    if (!recognitionRef.current) return;
    setSttError("");
    if (listening) {
      recognitionRef.current.stop();
      // Strip the zero-width-space interim marker on stop
      setInput(prev => prev.replace(/\u200B.*$/, ""));
      setListening(false);
    } else {
      recognitionRef.current.start();
      setListening(true);
    }
  }

  useEffect(() => { scrollRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  // async function send() {
  //   // Strip interim marker before sending
  //   const text = input.replace(/\u200B.*$/, "").trim();
  //   if (!text || loading) return;
  //   if (listening) { recognitionRef.current?.stop(); setListening(false); }
  //   const userMsg = { role: "user", text };
  //   const next = [...messages, userMsg];
  //   setMessages(next);
  //   setInput("");
  //   setLoading(true);
  //   try {
  //     const res = await fetch("http://localhost:5001/api/chat", {
  //     //fetch("https://api.anthropic.com/v1/messages", {
  //       method: "POST",
  //       headers: { "Content-Type": "application/json" },
  //       body: JSON.stringify({
  //         model: "claude-sonnet-4-6",
  //         max_tokens: 400,
  //         system:
  //           "You are Nova, a warm, plain-language health information companion inside an app for people who may not have insurance. " +
  //           "You are NOT a doctor and must never diagnose or prescribe. Help the person understand possible explanations for a symptom in general terms, " +
  //           "suggest what to watch for, and always end by suggesting whether this sounds like something to monitor, something for a routine visit, " +
  //           "or something urgent. Keep responses under 120 words, conversational, no medical jargon without explaining it.",
  //         messages: next.map((m) => ({ role: m.role, content: m.text })),
  //       }),
  //     });
  //     const data = await res.json();
  //     const text2 = data?.content?.find((c) => c.type === "text")?.text || "Sorry, I couldn't process that just now.";
  //     setMessages((cur) => [...cur, { role: "assistant", text: text2 }]);
  //   } catch {
  //     setMessages((cur) => [...cur, { role: "assistant", text: "Something went wrong reaching Nova. Please try again." }]);
  //   } finally {
  //     setLoading(false);
  //   }
  // }
  async function send() {
  const text = input.replace(/\u200B.*$/, "").trim();

  if (!text || loading) return;

  if (listening) {
    recognitionRef.current?.stop();
    setListening(false);
  }

  const userMsg = {
    role: "user",
    text,
  };

  const next = [...messages, userMsg];

  setMessages(next);
  setInput("");
  setLoading(true);

  try {
    const response = await fetch("http://localhost:5001/api/chat", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        mode: "symptoms",
        messages: next.map((message) => ({
          role: message.role,
          content: message.text,
        })),
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Nova could not respond.");
    }

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "assistant",
        text: data.message,
      },
    ]);
  } catch (error) {
    console.error("Nova frontend error:", error);

    setMessages((currentMessages) => [
      ...currentMessages,
      {
        role: "assistant",
        text:
          error.message ||
          "Something went wrong reaching Nova. Please try again.",
      },
    ]);
  } finally {
    setLoading(false);
  }
}

  // Displayed value: render interim portion (after \u200B) in muted italic via a layered approach.
  // Since <input> can't style substrings, we split into committed + interim for the placeholder hint.
  const zeroWidthIdx = input.indexOf("\u200B");
  const committedText = zeroWidthIdx >= 0 ? input.slice(0, zeroWidthIdx) : input;
  const interimHint   = zeroWidthIdx >= 0 ? input.slice(zeroWidthIdx + 1) : "";

  return (
    <div>
      {/* Nav cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 10, marginBottom: 20 }}>
        {NAV_CARDS.map(({ id, label, desc, color }) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            style={{
              textAlign: "left", cursor: "pointer", border: `1px solid ${t.border}`,
              borderRadius: 12, padding: "14px 14px 12px",
              background: t[color + "Bg"] || t.panel,
              transition: "opacity 150ms",
            }}
            onMouseEnter={e => e.currentTarget.style.opacity = "0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity = "1"}
          >
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "#000000", marginBottom: 4 }}>{label}</div>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.4 }}>{desc}</div>
            <div style={{ fontSize: 13, color: t.sub, marginTop: 8 }}>→</div>
          </button>
        ))}
      </div>

      <div style={{ background: t.amberBg, borderRadius: 12, padding: "10px 16px", marginBottom: 16, fontSize: 13, color: t.amber, display: "flex", alignItems: "center", gap: 8 }}>
        <strong>26.7 million</strong>&nbsp;people are uninsured in the US — the No Insurance tab has clinics, Medicaid, and financial aid resources near you.
      </div>
      <div style={{ border: `1px solid ${t.border}`, borderRadius: 14, padding: 18, minHeight: 380, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 10, marginBottom: 12, maxHeight: 420, overflowY: "auto" }}>
          {messages.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === "user" ? "flex-end" : "flex-start",
              maxWidth: "78%", background: m.role === "user" ? t.accentBg : t.panel,
              color: m.role === "user" ? t.accent : t.ink, padding: "10px 14px", borderRadius: 14,
              borderBottomRightRadius: m.role === "user" ? 4 : 14, borderBottomLeftRadius: m.role === "user" ? 14 : 4,
              fontSize: 13.5, lineHeight: 1.5,
            }}>
              {m.text}
            </div>
          ))}
          {loading && <div style={{ fontSize: 12, color: t.mute, display: "flex", alignItems: "center", gap: 6 }}><Loader2 size={13} style={{ animation: "spin 1s linear infinite" }} /> Nova is thinking…</div>}
          <div ref={scrollRef} />
        </div>

        {/* Input row */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {/* Listening indicator + interim preview */}
          {listening && (
            <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 12, color: t.coral }}>
              <span style={{ width: 7, height: 7, borderRadius: "50%", background: t.coral, display: "inline-block", animation: "homePulse 900ms ease-in-out infinite" }} aria-hidden="true" />
              {interimHint
                ? <span>Hearing: <em style={{ color: t.mute }}>{interimHint}</em></span>
                : <span>Listening… speak now</span>}
            </div>
          )}
          {sttError && (
            <div role="alert" style={{ fontSize: 12, color: t.coral }}>{sttError}</div>
          )}

          <div style={{ display: "flex", gap: 8 }}>
            {/* Text input — shows committed text only; interim shown above */}
            <input
              value={committedText}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder={listening ? "Speak — or type here…" : "Describe what's going on..."}
              aria-label="Message to Nova"
              style={{
                flex: 1, padding: "10px 14px", borderRadius: 10, fontSize: 13,
                border: `1px solid ${listening ? t.coral : t.border}`,
                background: t.bg, color: t.ink,
                outline: "none",
                transition: "border-color 200ms ease-out",
              }}
            />

            {/* Mic button — only rendered if STT is supported */}
            {sttSupported && (
              <button
                onClick={toggleListening}
                aria-label={listening ? "Stop dictation" : "Dictate message"}
                aria-pressed={listening}
                title={listening ? "Stop dictation" : "Dictate message"}
                style={{
                  width: 42, height: 42, borderRadius: 10, border: "none", cursor: "pointer", flexShrink: 0,
                  background: listening ? t.coral : t.panel,
                  color: listening ? "#fff" : t.sub,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  boxShadow: listening ? `0 0 0 3px ${t.coral}40` : "none",
                  transition: "background 180ms ease-out, box-shadow 180ms ease-out",
                }}
              >
                {listening ? <MicOff size={17} /> : <Mic size={17} />}
              </button>
            )}

            <button
              onClick={send}
              disabled={loading}
              style={{ background: t.accent, color: "#fff", border: "none", borderRadius: 10, padding: "0 16px", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600 }}
            >
              <Send size={14} /> Send
            </button>
          </div>
        </div>
      </div>
      <p style={{ fontSize: 11, color: t.mute, marginTop: 10 }}>
        Nova gives general information, not a diagnosis. In an emergency, use the Urgent tab or call emergency services directly.
      </p>
      <style>{`@keyframes homePulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.4;transform:scale(0.7)} }`}</style>
    </div>
  );
}

// ─── Insurance lens animation styles ─────────────────────────────────────────
const IL_STYLES = `
  @keyframes il-fadein  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
  @keyframes il-slidein { from { opacity:0; transform:translateX(-10px);} to { opacity:1; transform:translateX(0); } }
  @keyframes il-pop     { 0%{transform:scale(0.94);opacity:0} 60%{transform:scale(1.03)} 100%{transform:scale(1);opacity:1} }
  @keyframes il-shimmer { 0%{background-position:200% center} 100%{background-position:-200% center} }

  .il-fadein  { animation: il-fadein  240ms ease-out both; }
  .il-slidein { animation: il-slidein 200ms ease-out both; }
  .il-pop     { animation: il-pop     260ms ease-out both; }

  /* Stagger delays — up to 12 items */
  .il-d0{animation-delay:0ms}   .il-d1{animation-delay:50ms}
  .il-d2{animation-delay:100ms} .il-d3{animation-delay:150ms}
  .il-d4{animation-delay:200ms} .il-d5{animation-delay:250ms}
  .il-d6{animation-delay:300ms} .il-d7{animation-delay:350ms}
  .il-d8{animation-delay:400ms} .il-d9{animation-delay:450ms}
  .il-d10{animation-delay:500ms}.il-d11{animation-delay:550ms}

  /* Provider cards — lift on hover */
  .il-card {
    transition: transform 200ms ease-out, box-shadow 200ms ease-out;
  }
  .il-card:hover { transform: translateY(-3px); box-shadow: 0 6px 20px rgba(0,0,0,0.10); }
  .il-card:focus-within { outline: 3px solid; outline-offset: 3px; }

  /* Filter pills + toggles */
  .il-pill {
    transition: background 160ms ease-out, border-color 160ms ease-out,
                color 160ms ease-out, transform 140ms ease-out;
  }
  .il-pill:hover  { transform: scale(1.05); }
  .il-pill:active { transform: scale(0.97); }
  .il-pill:focus  { outline: 3px solid; outline-offset: 2px; }

  /* Star rating buttons */
  .il-star {
    transition: transform 150ms ease-out;
  }
  .il-star:hover { transform: scale(1.3); }

  /* Accordion body */
  .il-accordion { animation: il-fadein 200ms ease-out both; }

  /* Age gate card */
  .il-agegate { animation: il-pop 300ms ease-out both; }

  /* Rated confirmation pulse */
  @keyframes il-rated { 0%{transform:scale(1)} 40%{transform:scale(1.18)} 100%{transform:scale(1)} }
  .il-rated { animation: il-rated 300ms ease-out; }

  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .il-fadein,.il-slidein,.il-pop,.il-card,.il-pill,.il-star,
    .il-accordion,.il-agegate,.il-rated {
      animation: none !important;
      transition: none !important;
    }
  }
`;

// ---------- Insurance lens tab ----------
function InsuranceTab({ t }) {
  // Age gate
  const [ageConfirmed, setAgeConfirmed] = useState(null); // null | true | false

  // Filters
  const [zip,          setZip]          = useState("");
  const [zipError,     setZipError]     = useState(false);
  const [cityType,     setCityType]     = useState("all");    // all | downtown | rural
  const [specialty,    setSpecialty]    = useState("All");
  const [diversity,    setDiversity]    = useState("all");
  const [gender,       setGender]       = useState("all");
  const [language,     setLanguage]     = useState("all");
  const [insurance,    setInsurance]    = useState("all");    // all | low | medium | high
  const [aslOnly,      setAslOnly]      = useState(false);
  const [phoneOnly,    setPhoneOnly]    = useState(false);
  const [elevator,     setElevator]     = useState(false);
  const [ramp,         setRamp]         = useState(false);
  const [transport,    setTransport]    = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  const [nonprofit,    setNonprofit]    = useState(false);
  const [ratings,      setRatings]      = useState({});       // providerId -> 1-5
  const [showResources, setShowResources] = useState(false);
  const [resCat,       setResCat]       = useState("All");
  const [filterKey,    setFilterKey]    = useState(0);        // bumped to re-trigger card stagger
  const [ratedName,    setRatedName]    = useState("");       // triggers rated pulse

  // ── Age gate screen ──
  if (ageConfirmed === null) {
    return (
      <>
        <style>{IL_STYLES}</style>
        <div className="il-agegate" style={{ maxWidth: 460, margin: "60px auto", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>🛡️</div>
          <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 10 }}>Insurance Lens</h2>
          <p style={{ fontSize: 14, color: t.sub, lineHeight: 1.7, marginBottom: 28 }}>
            This section contains health insurance and provider information intended for adults.<br />
            Are you 18 or older?
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center" }}>
            <button onClick={() => setAgeConfirmed(true)}
              className="il-pill"
              style={{ padding: "11px 32px", borderRadius: 10, background: t.accent, color: "#fff", border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer" }}>
              Yes, I'm 18+
            </button>
            <button onClick={() => setAgeConfirmed(false)}
              className="il-pill"
              style={{ padding: "11px 32px", borderRadius: 10, background: t.panel, color: t.sub, border: `1px solid ${t.border}`, fontSize: 14, cursor: "pointer" }}>
              No, I'm under 18
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Under-18 redirect ──
  if (ageConfirmed === false) {
    return (
      <>
        <style>{IL_STYLES}</style>
        <div className="il-agegate" style={{ maxWidth: 460, margin: "60px auto", textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 16 }}>👋</div>
          <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 10 }}>Resources for you</h2>
          <p style={{ fontSize: 13, color: t.sub, lineHeight: 1.7, marginBottom: 20 }}>
            If you're under 18, CHIP and Medicaid cover most children at no or low cost.<br />
            Check the <strong>No Insurance</strong> tab for the Children (0–18) age group — it has the right resources for you.
          </p>
          <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
            <a href="https://www.healthcare.gov/medicaid-chip/childrens-health-insurance-program/" target="_blank" rel="noopener noreferrer"
              className="il-pill"
              style={{ padding: "10px 22px", borderRadius: 10, background: t.tealBg, color: t.teal, border: `1px solid ${t.teal}`, fontSize: 13, fontWeight: 600, textDecoration: "none" }}>
              CHIP — Children's Insurance →
            </a>
            <button onClick={() => setAgeConfirmed(null)}
              className="il-pill"
              style={{ padding: "10px 22px", borderRadius: 10, background: "none", border: `1px solid ${t.border}`, color: t.sub, fontSize: 13, cursor: "pointer" }}>
              Back
            </button>
          </div>
        </div>
      </>
    );
  }

  // ── Filter logic ──
  function handleZip(e) {
    const v = e.target.value.replace(/\D/g, "").slice(0, 5);
    setZip(v);
    setZipError(v.length > 0 && v.length < 5);
  }

  function applyFilter(setter, value) {
    setter(value);
    setFilterKey(k => k + 1);
  }

  const filtered = IL_PROVIDERS.filter(p => {
    if (specialty !== "All" && p.specialty !== specialty) return false;
    if (insurance !== "all" && p.insurance !== insurance) return false;
    if (gender !== "all" && p.gender !== gender && p.gender !== "Mixed") return false;
    if (language !== "all" && !p.languages.includes(language)) return false;
    if (aslOnly && !p.asl) return false;
    if (phoneOnly && !p.phone) return false;
    if (elevator && !p.accessibility.includes("elevator")) return false;
    if (ramp && !p.accessibility.includes("ramp")) return false;
    if (transport && !p.accessibility.includes("transportation")) return false;
    if (verifiedOnly && !p.verified) return false;
    if (nonprofit && !p.nonprofit) return false;
    if (cityType === "rural" && !p.tags.includes("Rural")) return false;
    if (cityType === "downtown" && p.tags.includes("Rural")) return false;
    return true;
  });

  const resCats = ["All", "Government", "Community Clinic", "Nonprofit"];
  const filteredRes = IL_RESOURCES.filter(r => resCat === "All" || r.cat === resCat);

  const resCatStyle = {
    "Government":       { bg: "tealBg",   fg: "teal" },
    "Community Clinic": { bg: "accentBg", fg: "accent" },
    "Nonprofit":        { bg: "amberBg",  fg: "amber" },
  };

  const pill = (label, active, onClick) => (
    <button key={label} onClick={onClick} aria-pressed={active}
      className="il-pill"
      style={{
        borderRadius: 16, padding: "5px 13px", fontSize: 12, cursor: "pointer",
        background: active ? t.accentBg : t.panel,
        color: active ? t.accent : t.sub,
        fontWeight: active ? 700 : 400,
        border: `${active ? "2px" : "1px"} solid ${active ? t.accent : t.border}`,
      }}>{label}</button>
  );

  const toggle = (label, value, setValue, icon) => (
    <button key={label} onClick={() => { setValue(v => !v); setFilterKey(k => k + 1); }} aria-pressed={value}
      className="il-pill"
      style={{
        borderRadius: 8, padding: "6px 12px", fontSize: 12, cursor: "pointer", display: "flex", alignItems: "center", gap: 5,
        background: value ? t.tealBg : t.panel,
        color: value ? t.teal : t.sub,
        border: `${value ? "2px" : "1px"} solid ${value ? t.teal : t.border}`,
        fontWeight: value ? 700 : 400,
      }}>
      <span aria-hidden="true">{icon}</span> {label}
    </button>
  );

  return (
    <div>
      <style>{IL_STYLES}</style>

      {/* Back to age gate */}
      <div className="il-fadein il-d0" style={{ marginBottom: 12 }}>
        <button onClick={() => setAgeConfirmed(null)} className="il-pill"
          style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 8, padding: "5px 12px", fontSize: 12, color: t.sub, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 5 }}>
          ← Back
        </button>
      </div>

      <h2 className="il-fadein il-d1" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Insurance Lens</h2>
      <p className="il-fadein il-d2" style={{ fontSize: 13, color: t.sub, marginBottom: 18 }}>
        Find providers and resources that match your location, coverage, and accessibility needs — across the entire US market.
      </p>

      {/* ── Filter panel ── */}
      <div className="il-fadein il-d3" style={{ background: t.panel, borderRadius: 12, padding: "14px 16px", marginBottom: 20, border: `1px solid ${t.border}` }}>

        {/* Row 1: Location */}
        <div style={{ marginBottom: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Location</div>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-start" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, color: t.mute }}>ZIP code</label>
              <input type="text" inputMode="numeric" placeholder="e.g. 90210" value={zip} onChange={handleZip} maxLength={5}
                style={{ padding: "7px 10px", borderRadius: 8, border: `1px solid ${zipError ? t.coral : t.border}`, background: t.bg, color: t.ink, fontSize: 13, width: 110 }} />
              {zipError && <span role="alert" style={{ fontSize: 11, color: t.coral }}>⚠ 5 digits needed</span>}
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              <label style={{ fontSize: 11, color: t.mute }}>Community type</label>
              <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                {[["all","All areas"],["downtown","Downtown / Urban"],["rural","Rural"]].map(([id, lbl]) =>
                  pill(lbl, cityType === id, () => applyFilter(setCityType, id))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Row 2: Specialty + Insurance level */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ flex: "1 1 180px", display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>Specialty</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {IL_SPECIALTIES.map(s => pill(s, specialty === s, () => applyFilter(setSpecialty, s)))}
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>Insurance level</label>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
              {[["all","Any"],["low","Low cost"],["medium","Medium"],["high","Full coverage"]].map(([id, lbl]) =>
                pill(lbl, insurance === id, () => applyFilter(setInsurance, id))
              )}
            </div>
          </div>
        </div>

        {/* Row 3: Diversity / Gender / Language */}
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 14 }}>
          <div style={{ flex: "1 1 140px", display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>Diversity</label>
            <select value={diversity} onChange={e => applyFilter(setDiversity, e.target.value)}
              style={{ padding: "7px 9px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 12, cursor: "pointer" }}>
              {[["all","Everyone"],["Black","Black / African American"],["Latino","Hispanic / Latino"],["Indigenous","Indigenous / Native American"],["Asian","Asian / Pacific Islander"],["LGBTQ+","LGBTQ+"]].map(([id, lbl]) =>
                <option key={id} value={id}>{lbl}</option>
              )}
            </select>
          </div>
          <div style={{ flex: "1 1 120px", display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>Gender</label>
            <select value={gender} onChange={e => applyFilter(setGender, e.target.value)}
              style={{ padding: "7px 9px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 12, cursor: "pointer" }}>
              {[["all","Everyone"],["Female","Female"],["Male","Male"],["Mixed","Non-binary / Mixed"]].map(([id, lbl]) =>
                <option key={id} value={id}>{lbl}</option>
              )}
            </select>
          </div>
          <div style={{ flex: "1 1 140px", display: "flex", flexDirection: "column", gap: 4 }}>
            <label style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>Language</label>
            <select value={language} onChange={e => applyFilter(setLanguage, e.target.value)}
              style={{ padding: "7px 9px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 12, cursor: "pointer" }}>
              {[["all","All languages"],["English","English"],["Spanish","Spanish / Español"],["Mandarin","Mandarin"],["Hindi","Hindi"],["French","French"],["Twi","Twi"],["Yoruba","Yoruba"]].map(([id, lbl]) =>
                <option key={id} value={id}>{lbl}</option>
              )}
            </select>
          </div>
        </div>

        {/* Row 4: Accessibility + Provider toggles */}
        <div>
          <div style={{ fontSize: 11, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Accessibility &amp; Provider</div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {toggle("Elevator", elevator, setElevator, "🛗")}
            {toggle("Ramp / Step-free", ramp, setRamp, "♿")}
            {toggle("Transportation help", transport, setTransport, "🚌")}
            {toggle("ASL interpreter", aslOnly, setAslOnly, "🤟")}
            {toggle("Phone consult", phoneOnly, setPhoneOnly, "📞")}
            {toggle("Verified provider", verifiedOnly, setVerifiedOnly, "✓")}
            {toggle("Nonprofit only", nonprofit, setNonprofit, "●")}
          </div>
        </div>
      </div>

      {/* ── Provider results ── */}
      <div className="il-slidein il-d3" style={{ fontSize: 12, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>Providers {zip && /^\d{5}$/.test(zip) ? `near ${zip}` : ""}</span>
        <span style={{ fontWeight: 400, fontSize: 11, color: t.mute }}>{filtered.length} result{filtered.length !== 1 ? "s" : ""}</span>
      </div>

      <div key={`providers-${filterKey}`} style={{ display: "grid", gap: 10, marginBottom: 28 }}>
        {filtered.map((p, i) => {
          const userRating = ratings[p.name];
          return (
            <div key={p.name}
              className={`il-card il-fadein il-d${Math.min(i, 11)}`}
              style={{ background: t.panel, borderRadius: 12, padding: "14px 16px", border: `1px solid ${t.border}` }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                {/* Left: name, specialty, meta */}
                <div style={{ flex: 1, minWidth: 180 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 7, flexWrap: "wrap" }}>
                    <span style={{ fontWeight: 700, fontSize: 14 }}>{p.name}</span>
                    {p.verified && (
                      <span title="Verified provider" style={{ fontSize: 10, background: t.tealBg, color: t.teal, borderRadius: 4, padding: "2px 7px", fontWeight: 700, border: `1px solid ${t.teal}` }}>✓ Verified</span>
                    )}
                    {p.nonprofit && (
                      <span style={{ fontSize: 10, background: t.amberBg, color: t.amber, borderRadius: 4, padding: "2px 7px", fontWeight: 700, border: `1px solid ${t.amber}` }}>● Nonprofit</span>
                    )}
                  </div>
                  <div style={{ fontSize: 12, color: t.sub, marginTop: 3 }}>
                    {p.specialty} · {p.distance}
                    {p.years && <span style={{ color: t.mute }}> · {p.years} yrs exp.</span>}
                    {p.gender !== "Mixed" && <span style={{ color: t.mute }}> · {p.gender}</span>}
                  </div>
                  {p.awards.length > 0 && (
                    <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 5 }}>
                      {p.awards.map(a => (
                        <span key={a} style={{ fontSize: 10, background: t.pinkBg, color: t.pink, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.pink}` }}>🏆 {a}</span>
                      ))}
                    </div>
                  )}
                  {/* Languages + accessibility chips */}
                  <div style={{ display: "flex", gap: 5, flexWrap: "wrap", marginTop: 6 }}>
                    {p.asl && <span style={{ fontSize: 10, background: t.accentBg, color: t.accent, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.accent}` }}>🤟 ASL</span>}
                    {p.phone && <span style={{ fontSize: 10, background: t.accentBg, color: t.accent, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.accent}` }}>📞 Phone</span>}
                    {p.accessibility.includes("elevator") && <span style={{ fontSize: 10, background: t.panel, color: t.sub, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>🛗 Elevator</span>}
                    {p.accessibility.includes("ramp") && <span style={{ fontSize: 10, background: t.panel, color: t.sub, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>♿ Ramp</span>}
                    {p.accessibility.includes("transportation") && <span style={{ fontSize: 10, background: t.panel, color: t.sub, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>🚌 Transport</span>}
                    {p.languages.filter(l => l !== "English").map(l => (
                      <span key={l} style={{ fontSize: 10, background: t.panel, color: t.mute, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>{l}</span>
                    ))}
                  </div>
                </div>

                {/* Right: rating + insurance level */}
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 8, flexShrink: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, color: t.amber, fontSize: 13, fontWeight: 700 }}>
                    <Star size={13} fill={t.amber} stroke="none" /> {p.rating}
                  </div>
                  <div style={{ fontSize: 10, padding: "3px 8px", borderRadius: 6, fontWeight: 600,
                    background: p.insurance === "low" ? t.tealBg : p.insurance === "medium" ? t.amberBg : t.pinkBg,
                    color:      p.insurance === "low" ? t.teal   : p.insurance === "medium" ? t.amber   : t.pink,
                    border: `1px solid ${p.insurance === "low" ? t.teal : p.insurance === "medium" ? t.amber : t.pink}`,
                  }}>
                    {p.insurance === "low" ? "Low cost" : p.insurance === "medium" ? "Mid coverage" : "Full coverage"}
                  </div>
                </div>
              </div>

              {/* Rate my provider */}
              <div style={{ marginTop: 10, paddingTop: 10, borderTop: `1px solid ${t.border}`, display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 11, color: t.mute }}>Rate this provider:</span>
                <div style={{ display: "flex", gap: 3 }}>
                  {[1,2,3,4,5].map(star => (
                    <button key={star}
                      onClick={() => { setRatings(r => ({ ...r, [p.name]: star })); setRatedName(p.name); setTimeout(() => setRatedName(""), 350); }}
                      aria-label={`Rate ${p.name} ${star} star${star !== 1 ? "s" : ""}`}
                      className="il-star"
                      style={{ background: "none", border: "none", cursor: "pointer", padding: 0, lineHeight: 1 }}>
                      <Star size={15}
                        fill={userRating && star <= userRating ? t.amber : "none"}
                        stroke={userRating && star <= userRating ? t.amber : t.border} />
                    </button>
                  ))}
                </div>
                {userRating && (
                  <span className={ratedName === p.name ? "il-rated" : ""} style={{ fontSize: 11, color: t.teal }}>✓ Rated {userRating}/5</span>
                )}
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div style={{ background: t.panel, borderRadius: 12, padding: "20px 16px", textAlign: "center", color: t.mute, fontSize: 13 }}>
            No providers match your current filters. Try broadening your search.
          </div>
        )}
      </div>

      {/* ── Resources directory ── */}
      <div style={{ background: t.panel, borderRadius: 12, border: `1px solid ${t.border}`, overflow: "hidden", marginBottom: 16 }}>
        <button onClick={() => setShowResources(v => !v)} aria-expanded={showResources}
          style={{ width: "100%", background: "none", border: "none", padding: "13px 16px", display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: t.ink, display: "flex", alignItems: "center", gap: 7 }}>
            <span aria-hidden="true" style={{ color: t.accent }}>◈</span>
            Insurance &amp; Provider Resource Directory
          </span>
          <span style={{ color: t.mute, fontSize: 12, transition: "transform 200ms ease-out", transform: showResources ? "rotate(180deg)" : "rotate(0deg)", display: "inline-block" }}>▼</span>
        </button>

        {showResources && (
          <div className="il-accordion" style={{ padding: "0 16px 16px" }}>
            <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 14 }}>
              {resCats.map(c => pill(c, resCat === c, () => setResCat(c)))}
            </div>
            <div key={`res-${resCat}`} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              {filteredRes.map((r, ri) => {
                const cs = resCatStyle[r.cat] || { bg: "panel", fg: "sub" };
                return (
                  <div key={r.link}
                    className={`il-card il-fadein il-d${Math.min(ri, 11)}`}
                    style={{ background: t[cs.bg], borderRadius: 10, padding: 14, display: "flex", flexDirection: "column", gap: 6, borderLeft: `3px solid ${t[cs.fg]}` }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                      <span aria-hidden="true" style={{ fontSize: 9, color: t[cs.fg] }}>{r.icon}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: t[cs.fg], textTransform: "uppercase", letterSpacing: "0.04em" }}>{r.cat}</span>
                    </div>
                    <div style={{ fontWeight: 700, fontSize: 13, color: t.ink }}>{r.title}</div>
                    <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.6, flex: 1 }}>{r.body}</div>
                    <a href={r.link} target="_blank" rel="noopener noreferrer"
                      style={{ fontSize: 12, fontWeight: 600, color: t[cs.fg], textDecoration: "none", marginTop: 2 }}>
                      Open →
                    </a>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* ── Data sources ── */}
      <div style={{ fontSize: 11, color: t.mute, lineHeight: 1.7, paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
        Data &amp; references: KFF Health Coverage by Gender · NIH/NIMHD Health Data Portal · US Census Bureau P60-288 (2025) ·
        CDC NCHS FastStats · SHADAC State Health Compare · HRSA Find a Health Center · AMA Physician Finder · CMS Medicare Care Compare.
        Provider details are illustrative — connect to a live directory API (Google Places, UHC, Cigna) for production use.
      </div>
    </div>
  );
}

// ---------- No insurance tab ----------
// Sources: census.gov/SAHIE, KFF uninsured brief (2024), healthcare.gov,
//          medicaid.gov, unitedway.org, aspe.hhs.gov, dollarfor.org,
//          healthwellfoundation.org, USA.gov, hospital network financial-assistance pages

// All 48 contiguous states + DC (continental US)
const US_STATES = [
  { code: "AL", name: "Alabama" }, { code: "AZ", name: "Arizona" },
  { code: "AR", name: "Arkansas" }, { code: "CA", name: "California" },
  { code: "CO", name: "Colorado" }, { code: "CT", name: "Connecticut" },
  { code: "DE", name: "Delaware" }, { code: "DC", name: "Washington DC" },
  { code: "FL", name: "Florida" }, { code: "GA", name: "Georgia" },
  { code: "ID", name: "Idaho" }, { code: "IL", name: "Illinois" },
  { code: "IN", name: "Indiana" }, { code: "IA", name: "Iowa" },
  { code: "KS", name: "Kansas" }, { code: "KY", name: "Kentucky" },
  { code: "LA", name: "Louisiana" }, { code: "ME", name: "Maine" },
  { code: "MD", name: "Maryland" }, { code: "MA", name: "Massachusetts" },
  { code: "MI", name: "Michigan" }, { code: "MN", name: "Minnesota" },
  { code: "MS", name: "Mississippi" }, { code: "MO", name: "Missouri" },
  { code: "MT", name: "Montana" }, { code: "NE", name: "Nebraska" },
  { code: "NV", name: "Nevada" }, { code: "NH", name: "New Hampshire" },
  { code: "NJ", name: "New Jersey" }, { code: "NM", name: "New Mexico" },
  { code: "NY", name: "New York" }, { code: "NC", name: "North Carolina" },
  { code: "ND", name: "North Dakota" }, { code: "OH", name: "Ohio" },
  { code: "OK", name: "Oklahoma" }, { code: "OR", name: "Oregon" },
  { code: "PA", name: "Pennsylvania" }, { code: "RI", name: "Rhode Island" },
  { code: "SC", name: "South Carolina" }, { code: "SD", name: "South Dakota" },
  { code: "TN", name: "Tennessee" }, { code: "TX", name: "Texas" },
  { code: "UT", name: "Utah" }, { code: "VT", name: "Vermont" },
  { code: "VA", name: "Virginia" }, { code: "WA", name: "Washington" },
  { code: "WV", name: "West Virginia" }, { code: "WI", name: "Wisconsin" },
  { code: "WY", name: "Wyoming" },
];

// Community types: drives HRSA search radius and context messaging
const COMMUNITY_TYPES = [
  { id: "any",      label: "Any community",  radius: 25, note: "" },
  { id: "downtown", label: "Downtown / Urban", radius: 5,  note: "Search radius: 5 miles — dense city center" },
  { id: "suburban", label: "Suburban",         radius: 15, note: "Search radius: 15 miles — suburban areas" },
  { id: "rural",    label: "Rural",            radius: 40, note: "Search radius: 40 miles — rural & frontier communities" },
];

// Build a location-aware HRSA Find a Health Center URL
function buildHrsaUrl({ zip, state, radius }) {
  const base = "https://findahealthcenter.hrsa.gov/";
  const params = new URLSearchParams();
  if (zip && /^\d{5}$/.test(zip.trim())) {
    params.set("zip", zip.trim());
    params.set("radius", String(radius));
  } else if (state) {
    params.set("state", state);
  }
  const qs = params.toString();
  return qs ? `${base}?${qs}` : base;
}

// Build 211 URL (county/state aware)
function build211Url({ zip, state }) {
  if (zip && /^\d{5}$/.test(zip.trim())) return `https://www.211.org/search?zip=${zip.trim()}`;
  if (state) return `https://www.211.org/about-us/your-local-211?state=${state}`;
  return "https://www.211.org/";
}

// Build Medicaid eligibility URL by state
function buildMedicaidUrl(state) {
  if (!state) return "https://www.healthcare.gov/medicaid-chip/";
  return `https://www.healthcare.gov/medicaid-chip/getting-medicaid-chip/?state=${state}`;
}

const UNINSURED_STATS = {
  national: "9.8%",
  year: "2024",
  totalUninsured: "26.7 million",
  lowIncomeShare: "80%",
  workingFamiliesShare: "85%",
  colorShare: "64%",
  nonExpansionRate: "14.5%",
  expansionRate: "8.0%",
  source: "KFF / ACS 2024",
  sourceUrl: "https://www.kff.org/uninsured/key-facts-about-the-uninsured-population/",
};

// ── Age groups — uninsured rate + per-age resource catalogue ──────────────────
const AGE_GROUPS = [
  {
    id: "all",   label: "All ages",         rate: "9.8%",
    note: "National average across all ages 0–64 (KFF / ACS 2024)",
    resources: [],  // falls through to buildResourceCards() alone
  },
  {
    id: "0-18",  label: "Children (0–18)",  rate: "5.9%",
    note: "Lower rate due to broader Medicaid & CHIP eligibility for children.",
    resources: [
      { cat: "Government",      title: "CHIP — Children's Health Insurance Program",      body: "Free or low-cost health coverage for children in families that earn too much for Medicaid. Covers doctor visits, immunisations, dental, and vision.", link: "https://www.healthcare.gov/medicaid-chip/childrens-health-insurance-program/", linkLabel: "Apply for CHIP →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Medicaid for Children",                           body: "Children in families at or below 138–300% FPL (varies by state) can enroll in Medicaid any time. No waiting period, no open-enrollment window.", link: "https://www.medicaid.gov/medicaid/eligibility/index.html", linkLabel: "Check eligibility →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Title V Maternal & Child Health Block Grant",     body: "State health departments fund preventive care, dental, developmental screenings and referrals for children with special needs through Title V.", link: "https://mchb.hrsa.gov/programs-impact/title-v-maternal-child-health-services-block-grant", linkLabel: "Find your state program →", diversity: [], gender: [], lang: [] },
      { cat: "Community Clinic", title: "HRSA Community Health Centers — Pediatrics",    body: "FQHCs provide well-child visits, vaccinations, dental, and vision on a sliding-scale fee. No child turned away regardless of ability to pay.", link: "https://findahealthcenter.hrsa.gov/", linkLabel: "Find a pediatric center →", diversity: [], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "Children's Defense Fund",                         body: "National advocacy and direct-service org focused on child health, education, and poverty. Connects families to local coverage programs.", link: "https://www.childrensdefense.org/", linkLabel: "Find resources →", diversity: ["Black", "Latino", "Indigenous"], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "National Alliance for Mental Illness (NAMI) — Youth", body: "Free mental health resources, peer support, and helpline for children and teens. Available in multiple languages.", link: "https://www.nami.org/Support-Education/Teens-Young-Adults", linkLabel: "Youth mental health help →", diversity: [], gender: [], lang: ["Spanish", "Other"] },
      { cat: "Nonprofit",       title: "First Focus on Children",                         body: "Policy org connecting low-income families to federal programs including SNAP, WIC, and children's health coverage.", link: "https://firstfocus.org/", linkLabel: "Learn more →", diversity: [], gender: [], lang: [] },
      { cat: "Other",           title: "WIC — Women, Infants & Children",                 body: "Nutrition, breastfeeding support, and health referrals for children under 5 and pregnant/postpartum women.", link: "https://www.fns.usda.gov/wic", linkLabel: "Find WIC near you →", diversity: [], gender: ["Female"], lang: ["Spanish", "English", "Other"] },
    ],
  },
  {
    id: "19-25", label: "Young adults (19–25)", rate: "14.5%",
    note: "Highest uninsured rate of any group — often aged out of parents' plans and not yet employer-insured.",
    resources: [
      { cat: "Government",      title: "ACA Marketplace — Young Adult Plans",            body: "Catastrophic plans available under 30 with low premiums. Subsidies based on income. You can stay on a parent's plan until age 26.", link: "https://www.healthcare.gov/young-adults/", linkLabel: "Explore young adult coverage →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Medicaid Expansion (19–25)",                     body: "In expansion states, adults up to 138% FPL qualify for Medicaid. Apply year-round — no open-enrollment wait.", link: "https://www.healthcare.gov/medicaid-chip/adult-medicaid-eligibility/", linkLabel: "Check your state →", diversity: [], gender: [], lang: [] },
      { cat: "Community Clinic", title: "HRSA Health Centers — Young Adult Services",    body: "FQHCs offer primary care, reproductive health, mental health, and substance use services on sliding-scale fees.", link: "https://findahealthcenter.hrsa.gov/", linkLabel: "Find a clinic →", diversity: [], gender: [], lang: [] },
      { cat: "Community Clinic", title: "Planned Parenthood",                            body: "Reproductive and sexual health care on a sliding scale. Services include STI testing, birth control, and annual exams for all genders.", link: "https://www.plannedparenthood.org/get-care", linkLabel: "Find a health center →", diversity: [], gender: ["Female", "LGBTQ+"], lang: ["Spanish", "English"] },
      { cat: "Nonprofit",       title: "NAMI Helpline — Young Adults",                   body: "Free, peer-led mental health support lines and text crisis services for young adults 18–25.", link: "https://www.nami.org/Support-Education/Teens-Young-Adults", linkLabel: "Get support →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Nonprofit",       title: "National LGBTQ Task Force",                      body: "Connects LGBTQ+ young adults to affirming healthcare, housing, and mental health resources nationwide.", link: "https://www.thetaskforce.org/", linkLabel: "Find affirming care →", diversity: [], gender: ["LGBTQ+"], lang: [] },
      { cat: "Rehab",           title: "SAMHSA — Substance Abuse Treatment Locator",     body: "Free and low-cost substance abuse treatment programs for young adults. Includes residential and outpatient options with sliding-scale fees.", link: "https://findtreatment.gov/", linkLabel: "Find treatment near you →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Other",           title: "Dollar For — Young Adult Medical Bills",          body: "Helps young adults apply for hospital charity care. 100% bill forgiveness for qualifying patients.", link: "https://dollarfor.org/", linkLabel: "Get help with your bill →", diversity: [], gender: [], lang: [] },
    ],
  },
  {
    id: "26-34", label: "Adults (26–34)",    rate: "14.1%",
    note: "High rate driven by loss of parental coverage at 26 and gap in employer-sponsored insurance.",
    resources: [
      { cat: "Government",      title: "ACA Marketplace — Adult Coverage",               body: "Compare subsidised plans at HealthCare.gov. Many adults at 100–400% FPL qualify for premium tax credits that significantly reduce monthly costs.", link: "https://www.healthcare.gov/see-plans/", linkLabel: "Compare plans →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Medicaid (Adults 26–34)",                        body: "Medicaid expansion covers adults up to 138% FPL in 41 states. Apply any time — no open-enrollment restrictions.", link: "https://www.medicaid.gov/medicaid/eligibility/index.html", linkLabel: "Check Medicaid eligibility →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Title X Family Planning",                        body: "Federally funded family planning clinics offer reproductive health care at low or no cost regardless of insurance status.", link: "https://opa.hhs.gov/grant-programs/title-x-service-grants/title-x-services-grantees", linkLabel: "Find a Title X clinic →", diversity: [], gender: ["Female", "LGBTQ+"], lang: [] },
      { cat: "Community Clinic", title: "HRSA Health Centers — Adult Primary Care",      body: "FQHCs provide comprehensive primary care on a sliding-scale fee schedule. Includes chronic disease management, dental, and behavioral health.", link: "https://findahealthcenter.hrsa.gov/", linkLabel: "Find a health center →", diversity: [], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "National Women's Law Center Health Resources",   body: "Resources on reproductive rights, insurance access, and poverty programs affecting women ages 26–34.", link: "https://nwlc.org/resource/nwlc-resources-on-poverty-income-and-health-insurance/", linkLabel: "Read resources →", diversity: [], gender: ["Female"], lang: [] },
      { cat: "Nonprofit",       title: "Families USA",                                   body: "Advocacy org with state-by-state guides to ACA enrollment, Medicaid, and free clinic access for working-age adults.", link: "https://familiesusa.org/", linkLabel: "Find coverage help →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Rehab",           title: "SAMHSA Behavioral Health Treatment Finder",      body: "Locator for free and low-cost mental health and substance use treatment programs. Filter by state, ZIP, and services offered.", link: "https://findtreatment.gov/", linkLabel: "Find a program →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Other",           title: "National Alliance for Mental Illness (NAMI)",    body: "Free mental health education, support groups, and a helpline (1-800-950-6264). Multilingual resources available.", link: "https://www.nami.org/help", linkLabel: "Get help →", diversity: [], gender: [], lang: ["Spanish", "English", "Other"] },
    ],
  },
  {
    id: "35-54", label: "Adults (35–54)",    rate: "~10%",
    note: "Mid-career adults — often self-employed or working part-time without employer-sponsored coverage.",
    resources: [
      { cat: "Government",      title: "ACA Marketplace — Mid-Life Adult Plans",         body: "Premiums rise with age but so do available subsidies. Adults 35–54 at 100–400% FPL often qualify for significant tax credits.", link: "https://www.healthcare.gov/see-plans/", linkLabel: "Shop plans →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Medicaid — Adults 35–54",                        body: "In expansion states, adults up to 138% FPL qualify regardless of employment status. Covers primary care, mental health, and chronic condition management.", link: "https://www.medicaid.gov/medicaid/eligibility/index.html", linkLabel: "Apply for Medicaid →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "ASPE State Uninsured Estimates — County-Level",  body: "HHS county-level tool to identify local coverage programs, outreach workers, and enrollment assistance near you.", link: "https://aspe.hhs.gov/reports/state-local-estimates-uninsured-population-2023", linkLabel: "View your county →", diversity: [], gender: [], lang: [] },
      { cat: "Community Clinic", title: "HRSA Health Centers — Chronic Care",            body: "FQHCs manage diabetes, hypertension, and other chronic conditions on sliding-scale fees. Same-day and telehealth appointments available.", link: "https://findahealthcenter.hrsa.gov/", linkLabel: "Find a center near you →", diversity: [], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "HealthWell Foundation",                          body: "Grants for premiums, deductibles, and co-pays for adults with chronic or life-threatening illnesses.", link: "https://www.healthwellfoundation.org/", linkLabel: "Apply for a grant →", diversity: [], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "National Council on Aging — Benefits Finder",    body: "Tool connecting adults 35–54 to federal and state benefit programs they may be missing: food, housing, utilities, and health.", link: "https://www.ncoa.org/public-policy-action/economic-security/benefits-access/benefits-checkup/", linkLabel: "Find your benefits →", diversity: [], gender: [], lang: [] },
      { cat: "Rehab",           title: "SAMHSA Mental Health & Addiction Treatment",     body: "Free and low-cost mental health and addiction programs. Midlife adults face elevated rates of depression and opioid use disorder.", link: "https://findtreatment.gov/", linkLabel: "Find a program →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Nonprofit",       title: "Black Women's Health Imperative",                body: "Programs and resources targeting health equity for Black women across chronic disease, mental health, and reproductive care.", link: "https://bwhi.org/", linkLabel: "Find resources →", diversity: ["Black"], gender: ["Female"], lang: [] },
      { cat: "Nonprofit",       title: "National Hispanic Medical Association",          body: "Connects Latino adults to bilingual primary care providers, community health workers, and coverage enrollment help.", link: "https://www.nhmamd.org/", linkLabel: "Find a provider →", diversity: ["Latino"], gender: [], lang: ["Spanish"] },
      { cat: "Other",           title: "Dollar For — Charity Care Navigator",            body: "Nonprofit that handles hospital charity care applications for mid-life adults facing large medical bills.", link: "https://dollarfor.org/", linkLabel: "Apply for bill forgiveness →", diversity: [], gender: [], lang: [] },
    ],
  },
  {
    id: "55-64", label: "Adults (55–64)",    rate: "7.4%",
    note: "Pre-Medicare gap — significant chronic disease burden; bridge programs available until Medicare eligibility at 65.",
    resources: [
      { cat: "Government",      title: "ACA Marketplace — Pre-Medicare Coverage",        body: "Adults 55–64 may qualify for Enhanced Silver plans with very low out-of-pocket costs. Subsidies are most generous at this age. Compare at HealthCare.gov.", link: "https://www.healthcare.gov/see-plans/", linkLabel: "Find a pre-Medicare plan →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "Medicare Extra Help (Low-Income Subsidy)",        body: "If you're near Medicare age, Extra Help covers prescription drug costs. Full subsidy available below 135% FPL.", link: "https://www.medicare.gov/basics/costs/help/lower-costs", linkLabel: "Apply for Extra Help →", diversity: [], gender: [], lang: [] },
      { cat: "Government",      title: "State Pharmaceutical Assistance Programs",        body: "Many states provide prescription drug assistance to low-income adults 55–64 who are not yet on Medicare.", link: "https://www.medicare.gov/pharmaceutical-assistance-program/", linkLabel: "Find your state program →", diversity: [], gender: [], lang: [] },
      { cat: "Community Clinic", title: "HRSA Health Centers — Older Adult Care",        body: "FQHCs provide chronic disease management, behavioral health, and dental services on sliding-scale fees for pre-Medicare adults.", link: "https://findahealthcenter.hrsa.gov/", linkLabel: "Find a center →", diversity: [], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "National Council on Aging — BenefitsCheckUp",    body: "Screen for 2,500+ federal and state benefit programs in minutes. Find health, utility, food, and housing help by ZIP code.", link: "https://www.benefitscheckup.org/", linkLabel: "Check your benefits →", diversity: [], gender: [], lang: [] },
      { cat: "Nonprofit",       title: "AARP Foundation",                                body: "Free legal aid, benefit enrollment assistance, and health coverage navigation for adults 50+. Includes AARP Foundation Tax-Aide.", link: "https://www.aarpfoundation.org/", linkLabel: "Get help →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Nonprofit",       title: "National Black Nurses Association",              body: "Community health programs, health fairs, and free screenings for Black adults 55+ across the US.", link: "https://www.nbna.org/", linkLabel: "Find a program →", diversity: ["Black"], gender: [], lang: [] },
      { cat: "Rehab",           title: "SAMHSA Older Adult Behavioral Health",           body: "Behavioral health and substance use resources specifically for adults 55+. Includes in-home services and telehealth options.", link: "https://www.samhsa.gov/older-adults", linkLabel: "Find services →", diversity: [], gender: [], lang: ["Spanish", "English"] },
      { cat: "Other",           title: "HealthWell Foundation — Chronic Conditions",     body: "Financial grants for adults with chronic illnesses covering premiums, deductibles, and co-pays.", link: "https://www.healthwellfoundation.org/", linkLabel: "Apply for a grant →", diversity: [], gender: [], lang: [] },
      { cat: "Other",           title: "Elder Care Locator (AOA)",                       body: "US Administration on Aging hotline (1-800-677-1116) connects adults 60+ and their families to local health, transportation, and support services.", link: "https://eldercare.acl.gov/", linkLabel: "Find local services →", diversity: [], gender: [], lang: ["Spanish", "English", "Other"] },
    ],
  },
];

const DIVERSITY_OPTS = [
  { id: "all",       label: "All" },
  { id: "Black",     label: "Black / African American" },
  { id: "Latino",    label: "Hispanic / Latino" },
  { id: "Indigenous",label: "Indigenous / Native American" },
  { id: "Asian",     label: "Asian / Pacific Islander" },
  { id: "LGBTQ+",    label: "LGBTQ+" },
  { id: "Women",     label: "Women" },
];

const GENDER_OPTS = [
  { id: "all",    label: "All genders" },
  { id: "Female", label: "Female" },
  { id: "Male",   label: "Male" },
  { id: "LGBTQ+", label: "LGBTQ+ / Non-binary" },
];

const LANGUAGE_OPTS = [
  { id: "all",    label: "All languages" },
  { id: "English",label: "English" },
  { id: "Spanish",label: "Spanish / Español" },
  { id: "Other",  label: "Other languages" },
];

// Category badge colours (keyed to theme tokens)
const CAT_STYLE = {
  "Government":      { bg: "tealBg",  fg: "teal" },
  "Community Clinic":{ bg: "accentBg",fg: "accent" },
  "Nonprofit":       { bg: "amberBg", fg: "amber" },
  "Rehab":           { bg: "pinkBg",  fg: "pink" },
  "Other":           { bg: "panel",   fg: "sub" },
};

// Returns the subset of a given age-group's resources that match the active
// diversity / gender / language filters. An empty array on a filter field
// means "applies to everyone" and is never excluded.
function buildAgeResources({ ageId, diversity, gender, language }) {
  const grp = AGE_GROUPS.find(g => g.id === ageId);
  if (!grp || grp.resources.length === 0) return [];

  return grp.resources.filter(r => {
    const divMatch  = diversity === "all"  || r.diversity.length === 0 || r.diversity.includes(diversity)  || (diversity === "Women" && r.gender.includes("Female"));
    const genMatch  = gender   === "all"   || r.gender.length    === 0 || r.gender.includes(gender);
    const langMatch = language === "all"   || r.lang.length      === 0 || r.lang.includes(language);
    return divMatch && genMatch && langMatch;
  });
}

// Resource cards are now built dynamically from location context — see buildResourceCards()
function buildResourceCards({ zip, state, radius }) {
  const hrsaUrl = buildHrsaUrl({ zip, state, radius });
  const medicaidUrl = buildMedicaidUrl(state);
  const url211 = build211Url({ zip, state });
  const stateLabel = state ? ` in ${US_STATES.find(s => s.code === state)?.name || state}` : "";
  const zipLabel = zip && /^\d{5}$/.test(zip.trim()) ? ` near ${zip.trim()}` : "";
  const locationLabel = zipLabel || stateLabel;

  return [
    {
      title: "Community Health Centers",
      body: `Federally Qualified Health Centers (FQHCs) offer sliding-scale fees based on income — no one is turned away${locationLabel}. Search covers a ${radius}-mile radius.`,
      link: hrsaUrl,
      linkLabel: "Find a health center →",
    },
    {
      title: "Medicaid & CHIP",
      body: `If your income is at or below 138% FPL you likely qualify for Medicaid${stateLabel}. Children and pregnant women may qualify up to 200–300% FPL. No enrollment period.`,
      link: medicaidUrl,
      linkLabel: `Check eligibility${stateLabel} →`,
    },
    {
      title: "ACA Marketplace",
      body: `Even without a job you may qualify for subsidised coverage${stateLabel}. About 52% of uninsured people are eligible but haven't enrolled. Savings are based on income, not employment status.`,
      link: state
        ? `https://www.healthcare.gov/see-plans/#/plan/results?state=${state}`
        : "https://www.healthcare.gov/unemployed/",
      linkLabel: `Browse plans${stateLabel} →`,
    },
    {
      title: "Basic Health Program",
      body: `Some states run a Basic Health Program for adults at 133–200% FPL who don't qualify for Medicaid${stateLabel}. Check if your state participates.`,
      link: "https://www.medicaid.gov/basic-health-program",
      linkLabel: "Learn more →",
    },
    {
      title: "Hospital Financial Assistance",
      body: `Most nonprofit hospitals must offer charity care — many cover 100% of costs up to 200–300% FPL${locationLabel}. Ask for a financial counselor before or after any visit.`,
      link: state
        ? `https://www.usa.gov/health-insurance?state=${state}`
        : "https://www.usa.gov/health-insurance",
      linkLabel: "Find assistance programs →",
    },
    {
      title: "Dollar For — Medical Bill Aid",
      body: "Nonprofit that navigates hospital charity-care paperwork nationwide. Patients who qualify receive 100% forgiveness of qualifying medical bills.",
      link: "https://dollarfor.org/",
      linkLabel: "Get help with your bill →",
    },
    {
      title: "HealthWell Foundation",
      body: "Grants for insurance premiums, deductibles, and co-pays for people with chronic or life-threatening illnesses who can't afford treatment.",
      link: "https://www.healthwellfoundation.org/",
      linkLabel: "See if you qualify →",
    },
    {
      title: "211 — Find Local Help",
      body: `Dial 2-1-1 or search online to reach a navigator${locationLabel} who can connect you with free clinics, mental health services, and prescription assistance.`,
      link: url211,
      linkLabel: `Find local resources${locationLabel} →`,
    },
  ];
}

const FLORIDA_HOSPITALS = [
  { name: "HCA Florida Healthcare", free: "≤ 200% FPL", discount: "Up to 400% FPL", link: "https://www.hcafloridahealthcare.com/patient-resources/patient-financial-resources/financial-assistance" },
  { name: "Orlando Health", free: "≤ 225% FPL", discount: "Case-by-case", link: "https://www.orlandohealth.com/patients-and-visitors/patient-financial-resources/pay-your-bill/financial-assistance" },
  { name: "Baptist Health South Florida", free: "≤ 300% FPL", discount: "Sliding-scale", link: "https://baptisthealth.net/patient-resources/billing-and-financial-assistance/financial-assistance-program" },
  { name: "UHealth (Univ. of Miami)", free: "Medically necessary", discount: "Up to 400% FPL", link: "https://umiamihealth.org/en/billing-,-a-,-financial-information/financial-assistance" },
  { name: "Broward Health", free: "Sliding fee", discount: "Medicaid screening first", link: "https://www.browardhealth.org/patients-and-visitors/billing-and-insurance/financial-assistance-program" },
];

// ─── Animation keyframes injected once ────────────────────────────────────────
const NI_STYLES = `
  @keyframes ni-fadein  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes ni-slidein { from { opacity:0; transform:translateX(-8px);} to { opacity:1; transform:translateX(0); } }
  @keyframes ni-pop     { 0%{transform:scale(0.96);opacity:0} 60%{transform:scale(1.02)} 100%{transform:scale(1);opacity:1} }
  @keyframes ni-bar     { from { width:0; } to { width: var(--bar-w); } }

  .ni-fadein  { animation: ni-fadein  220ms ease-out both; }
  .ni-slidein { animation: ni-slidein 180ms ease-out both; }
  .ni-pop     { animation: ni-pop     250ms ease-out both; }

  /* Stagger helpers — up to 12 items */
  .ni-d0{animation-delay:0ms}   .ni-d1{animation-delay:40ms}
  .ni-d2{animation-delay:80ms}  .ni-d3{animation-delay:120ms}
  .ni-d4{animation-delay:160ms} .ni-d5{animation-delay:200ms}
  .ni-d6{animation-delay:240ms} .ni-d7{animation-delay:280ms}
  .ni-d8{animation-delay:320ms} .ni-d9{animation-delay:360ms}
  .ni-d10{animation-delay:400ms}.ni-d11{animation-delay:440ms}

  /* Interactive elements */
  .ni-card {
    transition: transform 200ms ease-out, box-shadow 200ms ease-out;
    cursor: pointer;
  }
  .ni-card:hover  { transform: translateY(-2px); box-shadow: 0 4px 16px rgba(0,0,0,0.10); }
  .ni-card:focus-within { outline: 3px solid currentColor; outline-offset: 2px; }

  .ni-agetile {
    transition: background 180ms ease-out, border-color 180ms ease-out,
                transform 180ms ease-out, box-shadow 180ms ease-out;
    cursor: pointer;
  }
  .ni-agetile:hover  { transform: translateY(-2px); box-shadow: 0 3px 10px rgba(0,0,0,0.09); }
  .ni-agetile:focus  { outline: 3px solid; outline-offset: 3px; }

  .ni-pill {
    transition: background 160ms ease-out, border-color 160ms ease-out,
                color 160ms ease-out, transform 140ms ease-out;
    cursor: pointer;
  }
  .ni-pill:hover  { transform: scale(1.04); }
  .ni-pill:focus  { outline: 3px solid; outline-offset: 2px; }

  .ni-link {
    transition: opacity 160ms ease-out, text-decoration-color 160ms ease-out;
    text-decoration: underline transparent;
  }
  .ni-link:hover  { opacity: 0.82; text-decoration-color: currentColor; }
  .ni-link:focus  { outline: 3px solid; outline-offset: 2px; border-radius: 2px; }

  .ni-accordion-btn {
    transition: background 160ms ease-out;
    cursor: pointer;
  }
  .ni-accordion-btn:hover  { background: rgba(0,0,0,0.04); }
  .ni-accordion-btn:focus  { outline: 3px solid; outline-offset: -3px; }

  .ni-select {
    transition: border-color 160ms ease-out, box-shadow 160ms ease-out;
  }
  .ni-select:focus { outline: 3px solid; outline-offset: 1px; box-shadow: 0 0 0 3px rgba(83,74,183,0.18); }

  .ni-input {
    transition: border-color 160ms ease-out, box-shadow 160ms ease-out;
  }
  .ni-input:focus { outline: 3px solid; outline-offset: 1px; }

  /* Bar chart animation */
  .ni-bar-fill { animation: ni-bar 600ms ease-out both; }

  /* Accordion body smooth expand */
  .ni-accordion-body {
    animation: ni-fadein 200ms ease-out both;
    overflow: hidden;
  }

  /* Colorblind: shape + pattern labels — never color alone */
  .ni-cat-badge { display: inline-flex; align-items: center; gap: 4px; }
  .ni-cat-badge::before {
    content: '';
    display: inline-block;
    width: 8px; height: 8px;
    border-radius: 2px;
    background: currentColor;
    opacity: 0.7;
    flex-shrink: 0;
  }

  /* Respect prefers-reduced-motion */
  @media (prefers-reduced-motion: reduce) {
    .ni-fadein, .ni-slidein, .ni-pop, .ni-bar-fill, .ni-accordion-body,
    .ni-card, .ni-agetile, .ni-pill, .ni-link, .ni-accordion-btn, .ni-select, .ni-input {
      animation: none !important;
      transition: none !important;
    }
  }
`;

// Category icon chars — colorblind-safe shape identifiers (used alongside colour)
const CAT_ICON = {
  "Government":       "▲",   // triangle = authoritative
  "Community Clinic": "◆",   // diamond  = community
  "Nonprofit":        "●",   // circle   = support
  "Rehab":            "■",   // square   = structured
  "Other":            "◇",   // open diamond = general
};

// Bar chart data for stats panel
const STAT_BARS = [
  { label: "Low-income families",        pct: 80, abbr: "80%" },
  { label: "Working families",           pct: 85, abbr: "85%" },
  { label: "People of color",            pct: 64, abbr: "64%" },
  { label: "Non-expansion states",       pct: 14.5, abbr: "14.5%", max: 20 },
  { label: "Expansion states",           pct: 8,   abbr: "8.0%",  max: 20 },
];

function NoInsuranceTab({ t }) {
  // Location filter state
  const [state,     setState]     = React.useState("");
  const [zip,       setZip]       = React.useState("");
  const [community, setCommunity] = React.useState("any");
  const [zipError,  setZipError]  = React.useState(false);
  // Age / diversity / gender / language filter state
  const [ageGroup,  setAgeGroup]  = React.useState("all");
  const [diversity, setDiversity] = React.useState("all");
  const [gender,    setGender]    = React.useState("all");
  const [language,  setLanguage]  = React.useState("all");
  // UI state
  const [showHospitals, setShowHospitals] = React.useState(false);
  const [ageKey,    setAgeKey]    = React.useState(0);  // bumped to re-trigger stagger

  const communityType  = COMMUNITY_TYPES.find(c => c.id === community) || COMMUNITY_TYPES[0];
  const hasLocation    = (zip && /^\d{5}$/.test(zip.trim())) || state !== "";
  const cards          = buildResourceCards({ zip, state, radius: communityType.radius });
  const activeAgeGroup = AGE_GROUPS.find(g => g.id === ageGroup) || AGE_GROUPS[0];
  const ageResources   = buildAgeResources({ ageId: ageGroup, diversity, gender, language });

  const stateObj     = US_STATES.find(s => s.code === state);
  const locationHeading = zip && /^\d{5}$/.test(zip.trim())
    ? `ZIP ${zip.trim()}${stateObj ? `, ${stateObj.name}` : ""}`
    : stateObj ? stateObj.name : null;

  function handleZipChange(e) {
    const v = e.target.value.replace(/\D/g, "").slice(0, 5);
    setZip(v);
    setZipError(v.length > 0 && v.length < 5);
  }

  function handleAgeChange(id) {
    setAgeGroup(id);
    setAgeKey(k => k + 1); // re-trigger card stagger
  }

  return (
    <div>
      {/* Inject animation styles once */}
      <style>{NI_STYLES}</style>

      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }} className="ni-fadein ni-d0">No insurance</h2>
      <p style={{ fontSize: 13, color: t.sub, marginBottom: 20 }} className="ni-fadein ni-d1">
        Resources for community clinics, public programs, financial assistance, and government coverage — wherever you are in the US.
      </p>

      {/* ── National stats banner ── */}
      <div className="ni-fadein ni-d2" style={{ background: t.amberBg, borderRadius: 12, padding: "14px 18px", marginBottom: 20, border: `1px solid ${t.border}` }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 20 }}>
          {/* Big rate number */}
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.amber, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>
              National uninsured rate ({UNINSURED_STATS.year})
            </div>
            <div style={{ fontSize: 32, fontWeight: 800, color: t.amber, lineHeight: 1 }}>{UNINSURED_STATS.national}</div>
            <div style={{ fontSize: 11.5, color: t.sub, marginTop: 4 }}>{UNINSURED_STATS.totalUninsured} people ages 0–64</div>
          </div>

          {/* Horizontal bar chart — colorblind-safe (value labels + bars + patterns) */}
          <div style={{ flex: 1, minWidth: 220, display: "flex", flexDirection: "column", gap: 6, justifyContent: "center" }}>
            {STAT_BARS.map((b, i) => {
              const max   = b.max || 100;
              const barW  = `${(b.pct / max) * 100}%`;
              return (
                <div key={b.label} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <div style={{ fontSize: 10.5, color: t.sub, width: 160, flexShrink: 0, lineHeight: 1.3 }}>{b.label}</div>
                  <div style={{ flex: 1, background: t.border, borderRadius: 4, height: 10, overflow: "hidden", position: "relative" }}
                       role="img" aria-label={`${b.label}: ${b.abbr}`}>
                    <div
                      className="ni-bar-fill"
                      style={{
                        height: "100%", borderRadius: 4,
                        background: t.amber,
                        "--bar-w": barW,
                        width: barW,
                        animationDelay: `${i * 80 + 300}ms`,
                      }}
                    />
                  </div>
                  <div style={{ fontSize: 11, fontWeight: 700, color: t.amber, width: 36, textAlign: "right", flexShrink: 0 }}>{b.abbr}</div>
                </div>
              );
            })}
          </div>

          <div style={{ marginLeft: "auto", alignSelf: "flex-end" }}>
            <a href={UNINSURED_STATS.sourceUrl} target="_blank" rel="noopener noreferrer"
              className="ni-link" style={{ fontSize: 11, color: t.mute, textDecoration: "none" }}>
              Source: {UNINSURED_STATS.source} ↗
            </a>
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          AGE GROUP FILTER
          ══════════════════════════════════════════════════════ */}
      <div className="ni-fadein ni-d3" style={{ background: t.panel, borderRadius: 12, padding: "14px 16px", marginBottom: 20, border: `1px solid ${t.border}` }}>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8, marginBottom: 12 }}>
          <div style={{ fontSize: 12, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Uninsured rate by age group (2024)
          </div>
          <div style={{ fontSize: 11, color: t.mute }}>KFF / ACS 2024 — click a group to filter resources</div>
        </div>

        {/* Age-group tiles */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }} role="group" aria-label="Age group filter">
          {AGE_GROUPS.map(a => {
            const active = ageGroup === a.id;
            return (
              <button
                key={a.id}
                className="ni-agetile"
                onClick={() => handleAgeChange(a.id)}
                aria-pressed={active}
                style={{
                  background: active ? t.accentBg : t.bg,
                  border: `2px solid ${active ? t.accent : t.border}`,
                  borderRadius: 10, padding: "8px 13px", textAlign: "left",
                  // Colorblind: active state also shown via border-width (2px vs 1px) + bold
                }}
              >
                <div style={{ fontSize: 15, fontWeight: 700, color: active ? t.accent : t.ink }}>{a.rate}</div>
                <div style={{ fontSize: 11, fontWeight: active ? 700 : 400, color: active ? t.accent : t.sub }}>{a.label}</div>
                {/* Colorblind indicator: underline on active */}
                {active && <div style={{ height: 2, borderRadius: 1, background: t.accent, marginTop: 4 }} aria-hidden="true" />}
              </button>
            );
          })}
        </div>

        {/* Note — animates when age changes */}
        {activeAgeGroup.note && (
          <div key={`note-${ageGroup}`} className="ni-slidein" style={{ fontSize: 12, color: t.sub, marginBottom: 12, lineHeight: 1.5, paddingLeft: 10, borderLeft: `2px solid ${t.border}` }}>
            {activeAgeGroup.note}
          </div>
        )}

        {/* Diversity / Gender / Language — slides in when age ≠ all */}
        {ageGroup !== "all" && (
          <div className="ni-fadein" style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 150px" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.sub }}>Diversity / community</label>
              <select className="ni-select" value={diversity} onChange={e => setDiversity(e.target.value)}
                style={{ padding: "7px 9px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 12, cursor: "pointer" }}>
                {DIVERSITY_OPTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 130px" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.sub }}>Gender</label>
              <select className="ni-select" value={gender} onChange={e => setGender(e.target.value)}
                style={{ padding: "7px 9px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 12, cursor: "pointer" }}>
                {GENDER_OPTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 130px" }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: t.sub }}>Language</label>
              <select className="ni-select" value={language} onChange={e => setLanguage(e.target.value)}
                style={{ padding: "7px 9px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 12, cursor: "pointer" }}>
                {LANGUAGE_OPTS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
              </select>
            </div>
          </div>
        )}
      </div>

      {/* ── Age-group resource cards — staggered on group change ── */}
      {ageResources.length > 0 && (
        <div style={{ marginBottom: 20 }} key={`agecards-${ageKey}`}>
          <div className="ni-fadein ni-d0" style={{ fontSize: 12, fontWeight: 700, color: t.sub, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
            Resources for {activeAgeGroup.label}
            {locationHeading && <span style={{ fontWeight: 400, textTransform: "none", color: t.teal, marginLeft: 6 }}>— {locationHeading}</span>}
            <span style={{ fontWeight: 400, textTransform: "none", color: t.mute, fontSize: 11, marginLeft: 8 }}>
              {ageResources.length} result{ageResources.length !== 1 ? "s" : ""}
            </span>
          </div>

          {["Government", "Community Clinic", "Nonprofit", "Rehab", "Other"].map(cat => {
            const catCards = ageResources.filter(r => r.cat === cat);
            if (catCards.length === 0) return null;
            const cs = CAT_STYLE[cat];
            return (
              <div key={cat} style={{ marginBottom: 18 }}>
                {/* Category label with shape icon (colorblind-safe) */}
                <div className="ni-cat-badge" style={{
                  display: "inline-flex", alignItems: "center", gap: 5,
                  fontSize: 11, fontWeight: 700, borderRadius: 6,
                  padding: "3px 10px", marginBottom: 8,
                  background: t[cs.bg], color: t[cs.fg],
                }}>
                  <span aria-hidden="true" style={{ fontSize: 9 }}>{CAT_ICON[cat]}</span>
                  {cat}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
                  {catCards.map((c, ci) => (
                    <div key={c.title}
                      className={`ni-card ni-fadein ni-d${Math.min(ci, 11)}`}
                      style={{
                        background: t[cs.bg], borderRadius: 12, padding: 14,
                        display: "flex", flexDirection: "column", gap: 6,
                        borderLeft: `3px solid ${t[cs.fg]}`,
                      }}>
                      <div style={{ fontWeight: 700, fontSize: 13, color: t[cs.fg] }}>{c.title}</div>
                      <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.6, flex: 1 }}>{c.body}</div>
                      {(c.diversity.length > 0 || c.lang.length > 0 || c.gender.length > 0) && (
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap", marginTop: 2 }}>
                          {c.diversity.map(d => <span key={d} style={{ fontSize: 10, background: t.panel, color: t.sub, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>{d}</span>)}
                          {c.gender.map(g => <span key={g} style={{ fontSize: 10, background: t.panel, color: t.sub, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>{g}</span>)}
                          {c.lang.map(l => <span key={l} style={{ fontSize: 10, background: t.panel, color: t.mute, borderRadius: 4, padding: "2px 7px", border: `1px solid ${t.border}` }}>{l}</span>)}
                        </div>
                      )}
                      <a
                        href={c.link.includes("findahealthcenter.hrsa.gov") ? buildHrsaUrl({ zip, state, radius: communityType.radius }) : c.link.includes("211.org") ? build211Url({ zip, state }) : c.link}
                        target="_blank" rel="noopener noreferrer"
                        className="ni-link"
                        style={{ fontSize: 12, fontWeight: 600, color: t[cs.fg], textDecoration: "none", marginTop: 2 }}>
                        {c.linkLabel}
                      </a>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Key insight callout ── */}
      <div className="ni-fadein ni-d4" style={{ background: t.accentBg, borderRadius: 10, padding: "12px 16px", marginBottom: 20, fontSize: 12.5, color: t.accent, borderLeft: `4px solid ${t.accent}`, display: "flex", gap: 10, alignItems: "flex-start" }}>
        {/* Shape icon alongside color — colorblind safe */}
        <span aria-hidden="true" style={{ fontSize: 18, lineHeight: 1, flexShrink: 0, marginTop: 1 }}>◉</span>
        <div>
          <strong>About 52% of uninsured people</strong> may be eligible for Medicaid or subsidised Marketplace coverage but haven't enrolled. The main barrier is cost of private insurance — cited by 62% of uninsured adults.
          <span style={{ color: t.mute, fontSize: 11, marginLeft: 8 }}>— KFF 2024</span>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          LOCATION FILTER
          ══════════════════════════════════════════════════════ */}
      <div className="ni-fadein ni-d5" style={{ background: t.panel, borderRadius: 12, padding: "14px 16px", marginBottom: 20, border: `1px solid ${t.border}` }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: t.sub, textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
          Find resources near you
        </div>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginBottom: 10 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 160px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: t.sub }}>State</label>
            <select className="ni-select" value={state} onChange={e => setState(e.target.value)}
              style={{ padding: "8px 10px", borderRadius: 8, border: `1px solid ${t.border}`, background: t.bg, color: t.ink, fontSize: 13, cursor: "pointer" }}>
              <option value="">All states (continental US)</option>
              {US_STATES.map(s => <option key={s.code} value={s.code}>{s.name}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 4, flex: "1 1 120px" }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: t.sub }}>ZIP code</label>
            <input className="ni-input" type="text" inputMode="numeric" placeholder="e.g. 33101"
              value={zip} onChange={handleZipChange} maxLength={5}
              style={{ padding: "8px 10px", borderRadius: 8, fontSize: 13, border: `1px solid ${zipError ? t.coral : t.border}`, background: t.bg, color: t.ink }} />
            {zipError && <span role="alert" style={{ fontSize: 11, color: t.coral, display: "flex", alignItems: "center", gap: 4 }}><span aria-hidden="true">⚠</span> Enter a 5-digit ZIP</span>}
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          <label style={{ fontSize: 11, fontWeight: 600, color: t.sub }}>Community type</label>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }} role="group" aria-label="Community type filter">
            {COMMUNITY_TYPES.map(ct => {
              const active = community === ct.id;
              return (
                <button key={ct.id} className="ni-pill" onClick={() => setCommunity(ct.id)} aria-pressed={active}
                  style={{
                    borderRadius: 16, padding: "6px 14px", fontSize: 12,
                    background: active ? t.accentBg : t.bg,
                    color:      active ? t.accent   : t.sub,
                    fontWeight: active ? 700 : 400,
                    border: `${active ? "2px" : "1px"} solid ${active ? t.accent : t.border}`,
                    // Colorblind: active = bold + thicker border, not just colour
                  }}>
                  {ct.label}
                </button>
              );
            })}
          </div>
          {communityType.note && (
            <div key={community} className="ni-slidein" style={{ fontSize: 11, color: t.mute }}>{communityType.note}</div>
          )}
        </div>

        {hasLocation && (
          <div key={`loc-${state}-${zip}`} className="ni-slidein" style={{ marginTop: 10, fontSize: 12, color: t.teal, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden="true">✓</span>
            Showing resources for: {locationHeading || "selected state"} · {communityType.label}
            {" · "}
            <button onClick={() => { setState(""); setZip(""); setCommunity("any"); setZipError(false); }}
              style={{ background: "none", border: "none", cursor: "pointer", color: t.mute, fontSize: 11, textDecoration: "underline", padding: 0 }}>
              Clear
            </button>
          </div>
        )}
      </div>

      {/* ── Resource cards grid ── */}
      <div style={{ fontSize: 12, fontWeight: 700, color: t.sub, marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.04em" }}>
        Where to get care &amp; financial help
        {locationHeading && <span style={{ fontWeight: 400, textTransform: "none", marginLeft: 6, color: t.teal }}>— {locationHeading}</span>}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12, marginBottom: 20 }}>
        {cards.map((c, i) => (
          <div key={c.title} className={`ni-card ni-fadein ni-d${Math.min(i, 11)}`}
            style={{ background: t.amberBg, borderRadius: 12, padding: 16, display: "flex", flexDirection: "column", gap: 8, border: `1px solid ${t.border}` }}>
            <div style={{ fontWeight: 700, fontSize: 13.5, color: t.amber }}>{c.title}</div>
            <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.6, flex: 1 }}>{c.body}</div>
            <a href={c.link} target="_blank" rel="noopener noreferrer" className="ni-link"
              style={{ fontSize: 12, fontWeight: 600, color: t.amber, textDecoration: "none", marginTop: 2 }}>
              {c.linkLabel}
            </a>
          </div>
        ))}
      </div>

      {/* ── Florida hospital accordion ── */}
      <div style={{ background: t.panel, borderRadius: 10, marginBottom: 16, border: `1px solid ${t.border}`, overflow: "hidden" }}>
        <button className="ni-accordion-btn" onClick={() => setShowHospitals(v => !v)}
          aria-expanded={showHospitals}
          style={{ width: "100%", background: "none", border: "none", padding: "12px 16px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontWeight: 700, fontSize: 13, color: t.ink, display: "flex", alignItems: "center", gap: 6 }}>
            <span aria-hidden="true" style={{ fontSize: 11, color: t.teal }}>{CAT_ICON["Community Clinic"]}</span>
            Florida hospital charity care thresholds
          </span>
          {/* Colorblind-safe: rotate icon + text label change */}
          <span style={{ fontSize: 12, color: t.mute, display: "flex", alignItems: "center", gap: 4, transition: "transform 200ms ease-out", transform: showHospitals ? "rotate(180deg)" : "rotate(0deg)" }}>
            ▼
          </span>
        </button>
        {showHospitals && (
          <div className="ni-accordion-body" style={{ padding: "0 16px 14px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr>
                  {["Hospital network", "100% free care", "Discount range", "Apply"].map(h => (
                    <th key={h} style={{ textAlign: "left", padding: "6px 8px", color: t.mute, fontWeight: 600, borderBottom: `1px solid ${t.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {FLORIDA_HOSPITALS.map((h, i) => (
                  <tr key={h.name} className={`ni-fadein ni-d${i}`}
                    style={{ borderBottom: `1px solid ${t.border}` }}>
                    <td style={{ padding: "8px 8px", color: t.ink, fontSize: 12, fontWeight: 500 }}>{h.name}</td>
                    <td style={{ padding: "8px 8px", color: t.teal, fontSize: 12, fontWeight: 600 }}>{h.free}</td>
                    <td style={{ padding: "8px 8px", color: t.sub, fontSize: 12 }}>{h.discount}</td>
                    <td style={{ padding: "8px 8px" }}>
                      <a href={h.link} target="_blank" rel="noopener noreferrer" className="ni-link"
                        style={{ fontSize: 11, color: t.accent, textDecoration: "none", fontWeight: 600 }}>Apply →</a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Cost tools ── */}
      <div style={{ background: t.panel, borderRadius: 10, padding: "14px 16px", marginBottom: 16, border: `1px solid ${t.border}` }}>
        <div style={{ fontWeight: 700, fontSize: 13, color: t.ink, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}>
          <span aria-hidden="true" style={{ color: t.accent, fontSize: 14 }}>◈</span>
          Understand &amp; manage costs
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {[
            { href: "https://price.healthfinder.fl.gov/#!care-bundles", label: "Florida care cost estimator", sub: "Compare costs for common procedures" },
            { href: state ? `https://www.healthcare.gov/see-plans/#/plan/results?state=${state}` : "https://www.healthcare.gov/see-plans/#/plan/results", label: "See what insurance would cover", sub: "Compare ACA Marketplace plans" },
            { href: "https://dollarfor.org/", label: "Dollar For — charity care assistance", sub: "Nonprofit that handles hospital bill forgiveness paperwork" },
            { href: "https://www.healthwellfoundation.org/", label: "HealthWell Foundation grants", sub: "Premiums, deductibles, and co-pays for chronic conditions" },
            { href: "https://www.usa.gov/health-insurance", label: "USA.gov — government health insurance guide", sub: "Medicaid, CHIP, marketplace, and more" },
          ].map((item, i) => (
            <a key={item.href} href={item.href} target="_blank" rel="noopener noreferrer" className="ni-link"
              style={{
                textDecoration: "none", display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "9px 0", borderBottom: i < 4 ? `1px solid ${t.border}` : "none",
                gap: 8,
              }}>
              <div>
                <div style={{ fontSize: 12.5, fontWeight: 600, color: t.accent }}>{item.label}</div>
                <div style={{ fontSize: 11, color: t.mute }}>{item.sub}</div>
              </div>
              <span aria-hidden="true" style={{ color: t.mute, fontSize: 13, flexShrink: 0 }}>→</span>
            </a>
          ))}
        </div>
      </div>

      {/* ── Source attribution ── */}
      <div style={{ fontSize: 11, color: t.mute, lineHeight: 1.6, paddingTop: 8, borderTop: `1px solid ${t.border}` }}>
        Statistics: KFF analysis of 2024 American Community Survey · U.S. Census Bureau SAHIE program (county estimates 2008–2024) ·
        ASPE State &amp; Local Uninsured Estimates (2023 ACS) · WHO/World Bank UHC data.
        Hospital charity care thresholds reflect publicly stated policies as of 2025 and may change — verify directly with each facility.
        In an emergency, use the Urgent tab or call emergency services.
      </div>
    </div>
  );
}

function StatPill({ label, value, t, highlight }) {
  return (
    <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
      <span style={{ fontSize: 13, fontWeight: 700, color: highlight ? t.coral : t.amber }}>{value}</span>
      <span style={{ fontSize: 11, color: t.sub }}>{label}</span>
    </div>
  );
}

function CostLink({ href, label, sub, t }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", display: "block" }}>
      <span style={{ fontSize: 12.5, fontWeight: 600, color: t.accent }}>{label}</span>
      <span style={{ fontSize: 11, color: t.mute, marginLeft: 6 }}>{sub}</span>
    </a>
  );
}

// ---------- Urgent tab — photo + voice report ----------
function UrgentTab({ t }) {
  // ── Photo section state ──
  const [file,         setFile]         = useState(null);
  const [preview,      setPreview]      = useState(null);
  const [photoSummary, setPhotoSummary] = useState(null);
  const [photoLoading, setPhotoLoading] = useState(false);
  const [photoCopied,  setPhotoCopied]  = useState(false);

  function onFile(e) {
    const f = e.target.files?.[0];
    if (!f) return;
    setFile(f);
    setPhotoSummary(null);
    setPhotoCopied(false);
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result);
    reader.readAsDataURL(f);
  }

  function clearPhoto() {
    setFile(null);
    setPreview(null);
    setPhotoSummary(null);
    setPhotoCopied(false);
  }

  async function analyzePhoto() {
    if (!preview) return;
    setPhotoLoading(true);
    try {
      const [, mediaType, base64Data] = preview.match(/^data:(.+);base64,(.+)$/);
      const res = await fetch("http://localhost:5001/api/analyze-photo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mediaType, base64Data }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Request failed.");
      setPhotoSummary(data?.summary || "Could not generate a summary.");
    } catch {
      setPhotoSummary("Something went wrong analyzing the photo. Please try again.");
    } finally {
      setPhotoLoading(false);
    }
  }

  function copyPhotoSummary() {
    if (!photoSummary) return;
    navigator.clipboard.writeText(photoSummary).then(() => {
      setPhotoCopied(true);
      setTimeout(() => setPhotoCopied(false), 2000);
    });
  }

  // ── Voice section state ──
  const [recording,    setRecording]    = useState(false);
  const [transcript,   setTranscript]   = useState("");
  const [interimText,  setInterimText]  = useState("");
  const [voiceSummary, setVoiceSummary] = useState(null);
  const [voiceLoading, setVoiceLoading] = useState(false);
  const [voiceCopied,  setVoiceCopied]  = useState(false);
  const [supported,    setSupported]    = useState(true);
  const [micError,     setMicError]     = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setSupported(false); return; }

    const rec = new SR();
    rec.continuous     = true;
    rec.interimResults = true;
    rec.lang           = "en-US";

    rec.onresult = (e) => {
      let finalText = "";
      let interim   = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const chunk = e.results[i][0].transcript;
        if (e.results[i].isFinal) finalText += chunk + " ";
        else interim += chunk;
      }
      if (finalText) setTranscript(prev => prev + finalText);
      setInterimText(interim);
    };

    rec.onerror = (e) => {
      if (e.error === "not-allowed") setMicError("Microphone access denied. Please allow microphone access in your browser and try again.");
      else if (e.error !== "aborted") setMicError(`Speech error: ${e.error}. Please try again.`);
      setRecording(false);
    };

    rec.onend = () => {
      setRecording(false);
      setInterimText("");
    };

    recognitionRef.current = rec;
    return () => { try { rec.stop(); } catch {} };
  }, []);

  function toggleRecording() {
    if (!recognitionRef.current) return;
    setMicError("");
    if (recording) {
      recognitionRef.current.stop();
      setRecording(false);
    } else {
      setTranscript("");
      setInterimText("");
      setVoiceSummary(null);
      setVoiceCopied(false);
      recognitionRef.current.start();
      setRecording(true);
    }
  }

  function clearVoice() {
    if (recording) { try { recognitionRef.current?.stop(); } catch {} }
    setRecording(false);
    setTranscript("");
    setInterimText("");
    setVoiceSummary(null);
    setVoiceCopied(false);
    setMicError("");
  }

  async function buildVoiceSummary() {
    const text = (transcript + " " + interimText).trim();
    if (!text) return;
    setVoiceLoading(true);
    try {
      const res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-6",
          max_tokens: 320,
          system:
            "You are a medical documentation assistant. The user will give you a voice description of an emergency or medical event. " +
            "Extract and reformat it as a concise, clear emergency summary a paramedic or ER provider can read in seconds. " +
            "Use this structure: PATIENT / WHAT HAPPENED / SYMPTOMS / TIME / LOCATION (if mentioned). " +
            "Keep it under 120 words. Do not diagnose. Use plain language. If information is missing, omit that field.",
          messages: [{ role: "user", content: text }],
        }),
      });
      const data = await res.json();
      setVoiceSummary(data?.content?.find(c => c.type === "text")?.text || "Could not generate a summary. Please try again.");
    } catch {
      setVoiceSummary("Something went wrong. Please check your connection and try again.");
    } finally {
      setVoiceLoading(false);
    }
  }

  function copyVoiceSummary() {
    navigator.clipboard.writeText(voiceSummary || "").then(() => {
      setVoiceCopied(true);
      setTimeout(() => setVoiceCopied(false), 2000);
    });
  }

  const fullTranscript = transcript + (interimText || "");
  const hasVoiceContent = fullTranscript.trim().length > 0;

  return (
    <div>
      {/* Emergency banner */}
      <div style={{ background: t.coralBg, border: `1px solid ${t.coral}`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10, fontSize: 13 }}>
        <AlertTriangle size={16} color={t.coral} style={{ flexShrink: 0 }} />
        <span style={{ color: t.coral, fontWeight: 600 }}>Life-threatening emergency? Call 911 now.</span>
        <span style={{ color: t.sub, fontSize: 12, marginLeft: 4 }}>This tool does not contact emergency services.</span>
      </div>

      {/* ── Section 1: Photo ── */}
      <h2 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Urgent</h2>
      <p style={{ fontSize: 13, color: t.sub, marginBottom: 16 }}>
        Take or upload a photo to get a plain-language description to share with a provider.
      </p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 32 }}>
        {/* Left: photo drop zone */}
        <div style={{ background: t.pinkBg, borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 12 }}>
          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
            border: `2px dashed ${preview ? t.pink : t.border}`, borderRadius: 10,
            padding: "24px 12px", cursor: "pointer", background: t.bg,
            transition: "border-color 200ms ease-out",
            minHeight: 160,
          }}>
            {preview
              ? <img src={preview} alt="Selected photo" style={{ maxHeight: 150, maxWidth: "100%", borderRadius: 8, objectFit: "contain" }} />
              : (
                <>
                  <div style={{ display: "flex", gap: 10 }}>
                    <Upload size={24} color={t.pink} />
                    <Camera size={24} color={t.pink} />
                  </div>
                  <span style={{ fontSize: 13, fontWeight: 600, color: t.sub, textAlign: "center" }}>
                    Tap to upload or take a photo
                  </span>
                  <span style={{ fontSize: 11, color: t.mute }}>JPG, PNG, HEIC supported</span>
                </>
              )
            }
            <input
              type="file"
              accept="image/*"
              onChange={onFile}
              style={{ display: "none" }}
            />
          </label>

          {preview && (
            <button onClick={clearPhoto}
              style={{ background: "none", border: `1px solid ${t.border}`, borderRadius: 6, padding: "5px 0", fontSize: 12, color: t.mute, cursor: "pointer" }}>
              ✕ Remove photo
            </button>
          )}

          <button onClick={analyzePhoto} disabled={!preview || photoLoading}
            style={{
              width: "100%", background: preview ? t.pink : t.border,
              color: preview ? "#fff" : t.mute, border: "none", borderRadius: 8,
              padding: "10px 0", fontSize: 13, fontWeight: 700,
              cursor: preview && !photoLoading ? "pointer" : "not-allowed",
              transition: "background 200ms ease-out",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}>
            {photoLoading ? <><Loader2 size={15} style={{ animation: "spin 1s linear infinite" }} /> Analyzing…</> : "Analyze photo"}
          </button>
        </div>

        {/* Right: photo summary output */}
        <div style={{ background: t.panel, borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Summary for your provider</div>
            {photoSummary && (
              <button onClick={copyPhotoSummary}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${t.border}`, borderRadius: 6, padding: "4px 9px", fontSize: 11, fontWeight: 600, color: photoCopied ? t.teal : t.accent, cursor: "pointer", transition: "color 200ms ease-out" }}>
                {photoCopied ? <Check size={12} /> : <Copy size={12} />}
                {photoCopied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          {!photoSummary && (
            <div style={{ fontSize: 12.5, color: t.mute, lineHeight: 1.6 }}>
              {photoLoading
                ? "Analyzing your photo…"
                : "Take or upload a photo then tap Analyze to see a shareable plain-language description."}
            </div>
          )}
          {photoSummary && (
            <div style={{ fontSize: 12.5, color: t.sub, whiteSpace: "pre-wrap", lineHeight: 1.7, flex: 1 }}>
              {photoSummary}
            </div>
          )}
          <div style={{ fontSize: 11, color: t.mute, borderTop: `1px solid ${t.border}`, paddingTop: 8, lineHeight: 1.5 }}>
            This describes visible characteristics only — not a diagnosis. Share with your provider or paste into a message.
          </div>
        </div>
      </div>

      {/* ── Divider ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, margin: "8px 0 24px" }}>
        <div style={{ flex: 1, height: 1, background: t.border }} />
        <div style={{ display: "flex", alignItems: "center", gap: 7, color: t.sub, fontSize: 13, fontWeight: 600 }}>
          <Mic size={14} />
          Voice report
        </div>
        <div style={{ flex: 1, height: 1, background: t.border }} />
      </div>

      {/* ── Section 2: Voice ── */}
      <p style={{ fontSize: 13, color: t.sub, marginBottom: 16 }}>
        Speak a brief description of what happened. The summary can be shared with a provider or read aloud to a dispatcher.
      </p>

      {!supported && (
        <div style={{ background: t.amberBg, border: `1px solid ${t.amber}`, borderRadius: 10, padding: "12px 16px", fontSize: 13, color: t.amber, marginBottom: 16, display: "flex", gap: 10, alignItems: "flex-start" }}>
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 1 }} />
          <div>
            <strong>Speech recognition not supported in this browser.</strong><br />
            <span style={{ fontSize: 12, color: t.sub }}>Use Chrome, Edge, or Safari on iOS 15+. You can still type your description in the text area below.</span>
          </div>
        </div>
      )}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 16 }}>
        {/* Left: recording panel */}
        <div style={{ background: t.pinkBg, borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 14 }}>
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <button
              onClick={toggleRecording}
              aria-label={recording ? "Stop recording" : "Start recording"}
              aria-pressed={recording}
              disabled={!supported && transcript.length === 0}
              style={{
                width: 72, height: 72, borderRadius: "50%", border: "none", cursor: "pointer",
                background: recording ? t.coral : t.pink,
                color: "#fff",
                display: "flex", alignItems: "center", justifyContent: "center",
                boxShadow: recording
                  ? `0 0 0 6px ${t.coralBg}, 0 0 0 8px ${t.coral}40`
                  : `0 2px 12px ${t.pink}60`,
                transition: "background 200ms ease-out, box-shadow 200ms ease-out, transform 150ms ease-out",
                transform: recording ? "scale(1.06)" : "scale(1)",
              }}
            >
              {recording ? <MicOff size={28} /> : <Mic size={28} />}
            </button>

            <div style={{ fontSize: 13, fontWeight: 700, color: recording ? t.coral : t.sub, display: "flex", alignItems: "center", gap: 6 }}>
              {recording && (
                <span style={{
                  width: 8, height: 8, borderRadius: "50%", background: t.coral, display: "inline-block",
                  animation: "vrPulse 900ms ease-in-out infinite",
                }} aria-hidden="true" />
              )}
              {recording ? "Recording… tap to stop" : "Tap to start speaking"}
            </div>

            {micError && (
              <div role="alert" style={{ fontSize: 12, color: t.coral, textAlign: "center", maxWidth: 240, lineHeight: 1.5 }}>
                {micError}
              </div>
            )}
          </div>

          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: t.sub, marginBottom: 6, textTransform: "uppercase", letterSpacing: "0.04em" }}>
              What you said
            </div>
            <textarea
              value={fullTranscript}
              onChange={e => setTranscript(e.target.value)}
              placeholder="Your spoken words will appear here… or type directly."
              rows={5}
              style={{
                width: "100%", padding: "10px 12px", borderRadius: 8, fontSize: 13,
                border: `1px solid ${recording ? t.coral : t.border}`,
                background: t.bg, color: t.ink, lineHeight: 1.6, resize: "vertical",
                outline: "none", boxSizing: "border-box",
                transition: "border-color 200ms ease-out",
              }}
            />
            {interimText && (
              <div style={{ fontSize: 11.5, color: t.mute, fontStyle: "italic", marginTop: 4 }}>
                Hearing: "{interimText}"
              </div>
            )}
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={buildVoiceSummary} disabled={!hasVoiceContent || voiceLoading}
              style={{
                flex: 1, padding: "9px 0", borderRadius: 8, border: "none",
                background: hasVoiceContent && !voiceLoading ? t.pink : t.border,
                color: hasVoiceContent && !voiceLoading ? "#fff" : t.mute,
                fontSize: 13, fontWeight: 700, cursor: hasVoiceContent && !voiceLoading ? "pointer" : "not-allowed",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
                transition: "background 200ms ease-out",
              }}>
              {voiceLoading ? <><Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} /> Generating…</> : "Generate summary"}
            </button>
            {hasVoiceContent && (
              <button onClick={clearVoice}
                style={{ padding: "9px 14px", borderRadius: 8, border: `1px solid ${t.border}`, background: "none", color: t.mute, fontSize: 12, cursor: "pointer" }}>
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Right: voice summary */}
        <div style={{ background: t.panel, borderRadius: 12, padding: 18, display: "flex", flexDirection: "column", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <div style={{ fontWeight: 700, fontSize: 13 }}>Emergency summary</div>
            {voiceSummary && (
              <button onClick={copyVoiceSummary}
                style={{ display: "flex", alignItems: "center", gap: 5, background: "none", border: `1px solid ${t.border}`, borderRadius: 6, padding: "4px 9px", fontSize: 11, fontWeight: 600, color: voiceCopied ? t.teal : t.accent, cursor: "pointer", transition: "color 200ms ease-out" }}>
                {voiceCopied ? <Check size={12} /> : <Copy size={12} />}
                {voiceCopied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>

          {!voiceSummary && !voiceLoading && (
            <div style={{ fontSize: 12.5, color: t.mute, lineHeight: 1.6, flex: 1 }}>
              Speak or type what happened, then tap <strong>Generate summary</strong> to produce a structured description you can share with a provider or read to a dispatcher.
            </div>
          )}
          {voiceLoading && (
            <div style={{ fontSize: 12.5, color: t.mute, display: "flex", alignItems: "center", gap: 8 }}>
              <Loader2 size={14} style={{ animation: "spin 1s linear infinite" }} />
              Generating emergency summary…
            </div>
          )}
          {voiceSummary && (
            <div style={{ fontSize: 13, color: t.sub, whiteSpace: "pre-wrap", lineHeight: 1.75, flex: 1 }}>
              {voiceSummary}
            </div>
          )}

          {voiceSummary && (
            <div style={{ background: t.accentBg, borderRadius: 8, padding: "8px 12px", fontSize: 11.5, color: t.accent, lineHeight: 1.5 }}>
              Tap <strong>Copy</strong> above to paste into a text message, share with a dispatcher, or hand your phone to a first responder.
            </div>
          )}

          <div style={{ fontSize: 11, color: t.mute, borderTop: `1px solid ${t.border}`, paddingTop: 8, lineHeight: 1.5 }}>
            AI-generated summary — for provider communication only. Not a substitute for emergency services.
          </div>
        </div>
      </div>

      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes vrPulse { 0%,100% { opacity:1; transform:scale(1); } 50% { opacity:0.4; transform:scale(0.7); } }
      `}</style>
    </div>
  );
}

// ---------- Learn tab ----------
// ─── Learn tab animation styles ───────────────────────────────────────────────
const LT_STYLES = `
  @keyframes lt-fadein  { from { opacity:0; transform:translateY(10px); } to { opacity:1; transform:translateY(0); } }
  @keyframes lt-slidein { from { opacity:0; transform:translateX(-8px);  } to { opacity:1; transform:translateX(0); } }
  @keyframes lt-pop     { 0%{transform:scale(0.95);opacity:0} 60%{transform:scale(1.02)} 100%{transform:scale(1);opacity:1} }
  @keyframes lt-expand  { from { opacity:0; transform:translateY(-6px); } to { opacity:1; transform:translateY(0); } }

  .lt-fadein  { animation: lt-fadein  220ms ease-out both; }
  .lt-slidein { animation: lt-slidein 180ms ease-out both; }
  .lt-pop     { animation: lt-pop     250ms ease-out both; }
  .lt-expand  { animation: lt-expand  200ms ease-out both; }

  .lt-d0{animation-delay:0ms}    .lt-d1{animation-delay:40ms}
  .lt-d2{animation-delay:80ms}   .lt-d3{animation-delay:120ms}
  .lt-d4{animation-delay:160ms}  .lt-d5{animation-delay:200ms}
  .lt-d6{animation-delay:240ms}  .lt-d7{animation-delay:280ms}
  .lt-d8{animation-delay:320ms}  .lt-d9{animation-delay:360ms}
  .lt-d10{animation-delay:400ms} .lt-d11{animation-delay:440ms}

  .lt-card {
    transition: transform 190ms ease-out, box-shadow 190ms ease-out, border-color 190ms ease-out;
    cursor: pointer;
  }
  .lt-card:hover  { transform: translateY(-3px); box-shadow: 0 6px 18px rgba(0,0,0,0.09); }
  .lt-card:focus  { outline: 3px solid; outline-offset: 2px; }

  .lt-pill {
    transition: background 150ms ease-out, border-color 150ms ease-out,
                color 150ms ease-out, transform 130ms ease-out;
    cursor: pointer;
  }
  .lt-pill:hover  { transform: scale(1.05); }
  .lt-pill:active { transform: scale(0.97); }
  .lt-pill:focus  { outline: 3px solid; outline-offset: 2px; }

  .lt-step-item {
    animation: lt-slidein 180ms ease-out both;
  }

  @media (prefers-reduced-motion: reduce) {
    .lt-fadein,.lt-slidein,.lt-pop,.lt-expand,
    .lt-card,.lt-pill,.lt-step-item {
      animation: none !important;
      transition: none !important;
    }
  }
`;

const LT_CAT_STYLE = {
  "First Aid":        { bg: "coralBg",   fg: "coral",  icon: "🩹" },
  "Prevention":       { bg: "tealBg",    fg: "teal",   icon: "🛡️" },
  "Nutrition":        { bg: "amberBg",   fg: "amber",  icon: "🥗" },
  "Mental Health":    { bg: "pinkBg",    fg: "pink",   icon: "🧠" },
  "Know When to Go":  { bg: "accentBg",  fg: "accent", icon: "🚦" },
};

function LearnTab({ t }) {
  const [activeCat,  setActiveCat]  = useState("All");
  const [openIdx,    setOpenIdx]    = useState(null);
  const [catKey,     setCatKey]     = useState(0);   // re-triggers stagger on category change

  function handleCat(cat) {
    setActiveCat(cat);
    setOpenIdx(null);
    setCatKey(k => k + 1);
  }

  const visible = activeCat === "All"
    ? LEARN_GUIDES
    : LEARN_GUIDES.filter(g => g.cat === activeCat);

  return (
    <div>
      <style>{LT_STYLES}</style>

      {/* Header */}
      <h2 className="lt-fadein lt-d0" style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>Learn</h2>
      <p className="lt-fadein lt-d1" style={{ fontSize: 13, color: t.sub, marginBottom: 18, lineHeight: 1.6 }}>
        First-aid steps you can do at home, prevention habits, nutrition tips, mental health tools, and how to know when to seek care.
      </p>

      {/* Stats banner */}
      <div className="lt-fadein lt-d2" style={{ background: t.amberBg, borderRadius: 12, padding: "12px 16px", marginBottom: 20, border: `1px solid ${t.border}`, display: "flex", flexWrap: "wrap", gap: 20, alignItems: "center" }}>
        {[
          { val: "30+", label: "home-care guides" },
          { val: "7", label: "first-aid topics" },
          { val: "5", label: "categories" },
          { val: "CDC / WHO", label: "evidence-based sources" },
        ].map(s => (
          <div key={s.label} style={{ textAlign: "center" }}>
            <div style={{ fontSize: 20, fontWeight: 800, color: t.amber, lineHeight: 1 }}>{s.val}</div>
            <div style={{ fontSize: 11, color: t.sub, marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
        <div style={{ marginLeft: "auto", fontSize: 11, color: t.mute, alignSelf: "flex-end" }}>
          Not a substitute for professional medical advice.
        </div>
      </div>

      {/* Category filter pills */}
      <div className="lt-fadein lt-d3" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 20 }} role="group" aria-label="Filter by category">
        {LEARN_CATS.map(cat => {
          const active = activeCat === cat;
          const cs = LT_CAT_STYLE[cat];
          return (
            <button key={cat} onClick={() => handleCat(cat)} aria-pressed={active}
              className="lt-pill"
              style={{
                borderRadius: 20, padding: "6px 15px", fontSize: 12,
                background: active ? (cs ? t[cs.bg] : t.accentBg) : t.panel,
                color:      active ? (cs ? t[cs.fg] : t.accent)   : t.sub,
                fontWeight: active ? 700 : 400,
                border: `${active ? "2px" : "1px"} solid ${active ? (cs ? t[cs.fg] : t.accent) : t.border}`,
                display: "flex", alignItems: "center", gap: 5,
              }}>
              {cs && <span aria-hidden="true">{cs.icon}</span>}
              {cat}
            </button>
          );
        })}
      </div>

      {/* Guide cards grid — re-keys on category change to replay stagger */}
      <div key={`guides-${catKey}`} style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 14 }}>
        {visible.map((g, i) => {
          const cs  = LT_CAT_STYLE[g.cat] || { bg: "panel", fg: "sub" };
          const isOpen = openIdx === i;
          return (
            <div key={g.title}
              className={`lt-card lt-fadein lt-d${Math.min(i, 11)}`}
              style={{
                background: t[cs.bg], borderRadius: 14,
                border: `${isOpen ? "2px" : "1px"} solid ${isOpen ? t[cs.fg] : t.border}`,
                overflow: "hidden",
              }}>

              {/* Card header — tap to open/close */}
              <button
                onClick={() => setOpenIdx(isOpen ? null : i)}
                aria-expanded={isOpen}
                style={{
                  width: "100%", background: "none", border: "none", cursor: "pointer",
                  padding: "14px 16px", textAlign: "left",
                  display: "flex", alignItems: "flex-start", gap: 12,
                }}>
                <span style={{ fontSize: 22, lineHeight: 1, flexShrink: 0 }} aria-hidden="true">{g.icon}</span>
                <div style={{ flex: 1 }}>
                  {/* Category badge */}
                  <div style={{ fontSize: 10, fontWeight: 700, color: t[cs.fg], textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 4 }}>
                    {g.cat}
                  </div>
                  <div style={{ fontWeight: 700, fontSize: 13.5, color: t.ink, marginBottom: 4 }}>{g.title}</div>
                  <div style={{ fontSize: 12, color: t.sub, lineHeight: 1.5 }}>{g.summary}</div>
                </div>
                {/* Chevron — rotates when open */}
                <span aria-hidden="true" style={{
                  fontSize: 11, color: t.mute, flexShrink: 0, marginTop: 4,
                  display: "inline-block",
                  transition: "transform 200ms ease-out",
                  transform: isOpen ? "rotate(180deg)" : "rotate(0deg)",
                }}>▼</span>
              </button>

              {/* Expanded steps */}
              {isOpen && (
                <div className="lt-expand" style={{ padding: "0 16px 16px" }}>
                  <ol style={{ margin: 0, paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                    {g.steps.map((step, si) => (
                      <li key={si}
                        className={`lt-step-item lt-d${Math.min(si, 11)}`}
                        style={{ fontSize: 12.5, color: t.sub, lineHeight: 1.6 }}>
                        {step}
                      </li>
                    ))}
                  </ol>
                  {g.tip && (
                    <div className="lt-expand" style={{
                      marginTop: 12, padding: "9px 12px", borderRadius: 8,
                      background: t.bg, border: `1px solid ${t[cs.fg]}`,
                      fontSize: 12, color: t[cs.fg], lineHeight: 1.5,
                    }}>
                      <strong>💡 Tip: </strong>{g.tip}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Footer note */}
      <div className="lt-fadein" style={{ marginTop: 28, fontSize: 11, color: t.mute, lineHeight: 1.7, paddingTop: 10, borderTop: `1px solid ${t.border}` }}>
        Information sourced from CDC, WHO, American Red Cross, NIH MedlinePlus, and Mayo Clinic guidelines.
        These guides cover minor home-treatable situations only. When in doubt, use the <strong>Urgent</strong> tab or call your provider.
      </div>
    </div>
  );
}

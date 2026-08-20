import "dotenv/config";
import { hash } from "bcryptjs";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {
  BookingStatus,
  PrismaClient,
  ServiceCategory,
} from "../generated/client";

const adapter = new PrismaMariaDb({
  host: process.env.DB_HOST ?? "localhost",
  port: Number(process.env.DB_PORT ?? 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
});

const prisma = new PrismaClient({ adapter });

const SERVICES: {
  name: string;
  slug: string;
  category: ServiceCategory;
  description: string;
  durationMin: number;
  price: number;
}[] = [
  {
    name: "Women's Haircut",
    slug: "womens-haircut",
    category: "HAIR",
    description: "Consultation, cut, and finish tailored to your face shape.",
    durationMin: 60,
    price: 45000,
  },
  {
    name: "Men's Haircut",
    slug: "mens-haircut",
    category: "HAIR",
    description: "Precision cut with wash and style.",
    durationMin: 45,
    price: 25000,
  },
  {
    name: "Children's Haircut",
    slug: "childrens-haircut",
    category: "HAIR",
    description: "Gentle cut for kids 12 and under.",
    durationMin: 30,
    price: 18000,
  },
  {
    name: "Blow Dry & Style",
    slug: "blow-dry-style",
    category: "HAIR",
    description: "Smooth blowout with volume and movement.",
    durationMin: 45,
    price: 35000,
  },
  {
    name: "Wash & Set",
    slug: "wash-and-set",
    category: "HAIR",
    description: "Shampoo, conditioner, and roller or wrap set.",
    durationMin: 60,
    price: 40000,
  },
  {
    name: "Deep Conditioning Treatment",
    slug: "deep-conditioning",
    category: "HAIR",
    description: "Intensive moisture treatment for dry or damaged hair.",
    durationMin: 45,
    price: 40000,
  },
  {
    name: "Keratin Treatment",
    slug: "keratin-treatment",
    category: "HAIR",
    description: "Smoothing treatment that tames frizz for weeks.",
    durationMin: 150,
    price: 180000,
  },
  {
    name: "Hair Relaxer",
    slug: "hair-relaxer",
    category: "HAIR",
    description: "Chemical relaxer with neutralizing wash and style.",
    durationMin: 120,
    price: 90000,
  },
  {
    name: "Hot Oil Treatment",
    slug: "hot-oil-treatment",
    category: "HAIR",
    description: "Warm oil massage to restore shine and softness.",
    durationMin: 40,
    price: 30000,
  },
  {
    name: "Silk Press",
    slug: "silk-press",
    category: "HAIR",
    description: "Bone-straight press with silk-smooth finish.",
    durationMin: 90,
    price: 70000,
  },
  {
    name: "Trim & Shape",
    slug: "trim-and-shape",
    category: "HAIR",
    description: "Dusting and reshape to keep ends healthy.",
    durationMin: 30,
    price: 20000,
  },
  {
    name: "Single Process Color",
    slug: "single-process-color",
    category: "COLOR",
    description: "All-over permanent or demi color.",
    durationMin: 90,
    price: 85000,
  },
  {
    name: "Root Touch-Up",
    slug: "root-touch-up",
    category: "COLOR",
    description: "Refresh grown-out roots with matching tone.",
    durationMin: 60,
    price: 55000,
  },
  {
    name: "Highlights",
    slug: "highlights",
    category: "COLOR",
    description: "Foil highlights for dimension and lift.",
    durationMin: 120,
    price: 140000,
  },
  {
    name: "Lowlights",
    slug: "lowlights",
    category: "COLOR",
    description: "Deeper tones woven through for richness.",
    durationMin: 120,
    price: 130000,
  },
  {
    name: "Balayage",
    slug: "balayage",
    category: "COLOR",
    description: "Hand-painted sun-kissed color with a soft grow-out.",
    durationMin: 150,
    price: 180000,
  },
  {
    name: "Ombre",
    slug: "ombre",
    category: "COLOR",
    description: "Gradual dark-to-light blend from roots to ends.",
    durationMin: 150,
    price: 170000,
  },
  {
    name: "Color Correction",
    slug: "color-correction",
    category: "COLOR",
    description: "Corrective color to fix banding, brass, or uneven tone.",
    durationMin: 180,
    price: 220000,
  },
  {
    name: "Gloss / Toner",
    slug: "gloss-toner",
    category: "COLOR",
    description: "Shine-boosting toner to refine color.",
    durationMin: 45,
    price: 45000,
  },
  {
    name: "Fashion Color",
    slug: "fashion-color",
    category: "COLOR",
    description: "Vivid or pastel fashion shades with consultation.",
    durationMin: 150,
    price: 200000,
  },
  {
    name: "Box Braids",
    slug: "box-braids",
    category: "BRAIDS",
    description: "Classic box braids in your preferred length and size.",
    durationMin: 240,
    price: 150000,
  },
  {
    name: "Knotless Braids",
    slug: "knotless-braids",
    category: "BRAIDS",
    description: "Lightweight knotless braids with a natural start.",
    durationMin: 270,
    price: 180000,
  },
  {
    name: "Cornrows",
    slug: "cornrows",
    category: "BRAIDS",
    description: "Straight-back or patterned cornrows.",
    durationMin: 90,
    price: 50000,
  },
  {
    name: "Goddess Braids",
    slug: "goddess-braids",
    category: "BRAIDS",
    description: "Sculpted goddess braids with feed-in technique.",
    durationMin: 180,
    price: 120000,
  },
  {
    name: "Senegalese Twists",
    slug: "senegalese-twists",
    category: "BRAIDS",
    description: "Rope twists with a polished, lasting finish.",
    durationMin: 240,
    price: 160000,
  },
  {
    name: "Passion Twists",
    slug: "passion-twists",
    category: "BRAIDS",
    description: "Bohemian passion twists with soft texture.",
    durationMin: 210,
    price: 150000,
  },
  {
    name: "Faux Locs",
    slug: "faux-locs",
    category: "BRAIDS",
    description: "Protective faux locs, butterfly or goddess style.",
    durationMin: 270,
    price: 190000,
  },
  {
    name: "Crochet Braids",
    slug: "crochet-braids",
    category: "BRAIDS",
    description: "Crochet install on a cornrow base.",
    durationMin: 150,
    price: 100000,
  },
  {
    name: "Weave / Sew-in",
    slug: "weave-sew-in",
    category: "BRAIDS",
    description: "Leave-out or closed sew-in weave.",
    durationMin: 180,
    price: 130000,
  },
  {
    name: "Closure / Frontal Install",
    slug: "closure-frontal-install",
    category: "BRAIDS",
    description: "Closure or frontal sew-in with melt and style.",
    durationMin: 210,
    price: 160000,
  },
  {
    name: "Loc Retwist",
    slug: "loc-retwist",
    category: "BRAIDS",
    description: "Retwist, palm roll, and style for established locs.",
    durationMin: 120,
    price: 70000,
  },
  {
    name: "Loc Styling",
    slug: "loc-styling",
    category: "BRAIDS",
    description: "Updo, barrel rolls, or two-strand loc styles.",
    durationMin: 60,
    price: 40000,
  },
  {
    name: "Classic Fade",
    slug: "classic-fade",
    category: "BARBER",
    description: "Low, mid, or high fade with scissor work on top.",
    durationMin: 45,
    price: 25000,
  },
  {
    name: "Skin Fade",
    slug: "skin-fade",
    category: "BARBER",
    description: "Bald fade blended to skin with a sharp finish.",
    durationMin: 50,
    price: 30000,
  },
  {
    name: "Beard Trim",
    slug: "beard-trim",
    category: "BARBER",
    description: "Shape, line, and oil for a clean beard.",
    durationMin: 25,
    price: 15000,
  },
  {
    name: "Hot Towel Shave",
    slug: "hot-towel-shave",
    category: "BARBER",
    description: "Traditional straight-razor shave with hot towels.",
    durationMin: 40,
    price: 28000,
  },
  {
    name: "Line Up",
    slug: "line-up",
    category: "BARBER",
    description: "Crisp hairline, beard, and edge lineup.",
    durationMin: 20,
    price: 12000,
  },
  {
    name: "Kids Cut",
    slug: "kids-cut",
    category: "BARBER",
    description: "Barber cut for children, patient and precise.",
    durationMin: 30,
    price: 18000,
  },
  {
    name: "Classic Manicure",
    slug: "classic-manicure",
    category: "NAILS",
    description: "Shape, cuticle care, massage, and polish.",
    durationMin: 45,
    price: 25000,
  },
  {
    name: "Gel Manicure",
    slug: "gel-manicure",
    category: "NAILS",
    description: "Long-wear gel color with high-shine cure.",
    durationMin: 60,
    price: 40000,
  },
  {
    name: "Acrylic Full Set",
    slug: "acrylic-full-set",
    category: "NAILS",
    description: "Full acrylic set with shape and color of choice.",
    durationMin: 90,
    price: 70000,
  },
  {
    name: "Acrylic Fill",
    slug: "acrylic-fill",
    category: "NAILS",
    description: "Fill and reshape an existing acrylic set.",
    durationMin: 60,
    price: 45000,
  },
  {
    name: "Classic Pedicure",
    slug: "classic-pedicure",
    category: "NAILS",
    description: "Soak, exfoliation, cuticle care, and polish.",
    durationMin: 50,
    price: 30000,
  },
  {
    name: "Gel Pedicure",
    slug: "gel-pedicure",
    category: "NAILS",
    description: "Pedicure finished with long-wear gel color.",
    durationMin: 65,
    price: 45000,
  },
  {
    name: "Spa Pedicure",
    slug: "spa-pedicure",
    category: "NAILS",
    description: "Extended soak, mask, massage, and polish.",
    durationMin: 75,
    price: 55000,
  },
  {
    name: "Nail Art",
    slug: "nail-art",
    category: "NAILS",
    description: "Custom art add-on per nail or full set.",
    durationMin: 30,
    price: 20000,
  },
  {
    name: "Nail Repair",
    slug: "nail-repair",
    category: "NAILS",
    description: "Fix a cracked or lifted nail.",
    durationMin: 20,
    price: 10000,
  },
  {
    name: "Soak Off",
    slug: "soak-off",
    category: "NAILS",
    description: "Gentle gel or acrylic removal and nail care.",
    durationMin: 30,
    price: 15000,
  },
  {
    name: "Natural Makeup",
    slug: "natural-makeup",
    category: "MAKEUP",
    description: "Soft everyday glam that still looks like you.",
    durationMin: 45,
    price: 50000,
  },
  {
    name: "Evening Glam",
    slug: "evening-glam",
    category: "MAKEUP",
    description: "Full glam for nights out, events, and parties.",
    durationMin: 60,
    price: 80000,
  },
  {
    name: "Bridal Makeup",
    slug: "bridal-makeup",
    category: "MAKEUP",
    description: "Wedding-day makeup with optional trial.",
    durationMin: 90,
    price: 150000,
  },
  {
    name: "Photoshoot Makeup",
    slug: "photoshoot-makeup",
    category: "MAKEUP",
    description: "Camera-ready makeup for studio or outdoor shoots.",
    durationMin: 60,
    price: 90000,
  },
  {
    name: "Makeup Lesson",
    slug: "makeup-lesson",
    category: "MAKEUP",
    description: "One-on-one lesson covering your everyday routine.",
    durationMin: 75,
    price: 100000,
  },
  {
    name: "Classic Lash Extensions",
    slug: "classic-lash-extensions",
    category: "LASHES_BROWS",
    description: "One-to-one classic lash extensions.",
    durationMin: 120,
    price: 90000,
  },
  {
    name: "Hybrid Lashes",
    slug: "hybrid-lashes",
    category: "LASHES_BROWS",
    description: "Mix of classic and volume for a fuller look.",
    durationMin: 135,
    price: 110000,
  },
  {
    name: "Volume Lashes",
    slug: "volume-lashes",
    category: "LASHES_BROWS",
    description: "Handmade fans for dramatic density.",
    durationMin: 150,
    price: 130000,
  },
  {
    name: "Lash Lift & Tint",
    slug: "lash-lift-tint",
    category: "LASHES_BROWS",
    description: "Lift natural lashes and tint for an open eye.",
    durationMin: 60,
    price: 55000,
  },
  {
    name: "Brow Shape",
    slug: "brow-shape",
    category: "LASHES_BROWS",
    description: "Wax or tweeze to a clean, flattering arch.",
    durationMin: 20,
    price: 15000,
  },
  {
    name: "Brow Tint",
    slug: "brow-tint",
    category: "LASHES_BROWS",
    description: "Tint to deepen and define the brow.",
    durationMin: 20,
    price: 18000,
  },
  {
    name: "Brow Lamination",
    slug: "brow-lamination",
    category: "LASHES_BROWS",
    description: "Brushed-up laminated brows with optional tint.",
    durationMin: 50,
    price: 50000,
  },
  {
    name: "Henna Brows",
    slug: "henna-brows",
    category: "LASHES_BROWS",
    description: "Henna stain for fuller-looking brows that last.",
    durationMin: 45,
    price: 45000,
  },
  {
    name: "Express Facial",
    slug: "express-facial",
    category: "SKIN_SPA",
    description: "Quick cleanse, exfoliation, and hydration.",
    durationMin: 30,
    price: 40000,
  },
  {
    name: "Deep Cleansing Facial",
    slug: "deep-cleansing-facial",
    category: "SKIN_SPA",
    description: "Extraction facial for congested or oily skin.",
    durationMin: 60,
    price: 70000,
  },
  {
    name: "Hydrating Facial",
    slug: "hydrating-facial",
    category: "SKIN_SPA",
    description: "Moisture-rich facial for dry or dull skin.",
    durationMin: 60,
    price: 75000,
  },
  {
    name: "Anti-Aging Facial",
    slug: "anti-aging-facial",
    category: "SKIN_SPA",
    description: "Firming treatment with massage and mask.",
    durationMin: 75,
    price: 95000,
  },
  {
    name: "Back Facial",
    slug: "back-facial",
    category: "SKIN_SPA",
    description: "Deep cleanse and treatment for the back.",
    durationMin: 50,
    price: 60000,
  },
  {
    name: "Head & Shoulder Massage",
    slug: "head-shoulder-massage",
    category: "SKIN_SPA",
    description: "Tension-release massage for neck, scalp, and shoulders.",
    durationMin: 30,
    price: 35000,
  },
  {
    name: "Full Body Massage",
    slug: "full-body-massage",
    category: "SKIN_SPA",
    description: "Full-body relaxation massage with oils.",
    durationMin: 60,
    price: 80000,
  },
  {
    name: "Scalp Massage",
    slug: "scalp-massage",
    category: "SKIN_SPA",
    description: "Stimulating scalp massage with nourishing oil.",
    durationMin: 25,
    price: 25000,
  },
  {
    name: "Eyebrow Wax",
    slug: "eyebrow-wax",
    category: "WAXING",
    description: "Clean brow wax and tidy stray hairs.",
    durationMin: 15,
    price: 12000,
  },
  {
    name: "Upper Lip Wax",
    slug: "upper-lip-wax",
    category: "WAXING",
    description: "Quick, precise upper lip wax.",
    durationMin: 10,
    price: 8000,
  },
  {
    name: "Full Face Wax",
    slug: "full-face-wax",
    category: "WAXING",
    description: "Brows, lip, chin, and cheeks.",
    durationMin: 30,
    price: 28000,
  },
  {
    name: "Underarm Wax",
    slug: "underarm-wax",
    category: "WAXING",
    description: "Smooth underarm wax with aftercare.",
    durationMin: 15,
    price: 18000,
  },
  {
    name: "Half Leg Wax",
    slug: "half-leg-wax",
    category: "WAXING",
    description: "Lower or upper half-leg wax.",
    durationMin: 30,
    price: 35000,
  },
  {
    name: "Full Leg Wax",
    slug: "full-leg-wax",
    category: "WAXING",
    description: "Full-leg wax including knees.",
    durationMin: 45,
    price: 55000,
  },
  {
    name: "Bikini Wax",
    slug: "bikini-wax",
    category: "WAXING",
    description: "Standard bikini line wax.",
    durationMin: 25,
    price: 30000,
  },
  {
    name: "Brazilian Wax",
    slug: "brazilian-wax",
    category: "WAXING",
    description: "Full Brazilian with soothing aftercare.",
    durationMin: 40,
    price: 50000,
  },
];

type ProSeed = {
  email: string;
  name: string;
  phone: string;
  title: string;
  bio: string;
  categories: ServiceCategory[];
};

const PROFESSIONALS: ProSeed[] = [
  {
    email: "amina@enzamalooks.com",
    name: "Amina Nalwoga",
    phone: "+256 700 111 001",
    title: "Senior Stylist",
    bio: "Amina leads the floor with fifteen years of precision cutting and color. She is known for silk presses, healthy relaxers, and color that still looks like you.",
    categories: ["HAIR", "COLOR"],
  },
  {
    email: "david@enzamalooks.com",
    name: "David Okello",
    phone: "+256 700 111 002",
    title: "Master Barber",
    bio: "David's fades are sharp and his shaves are old-school. He handles men's grooming, kids' cuts, and clean lineups.",
    categories: ["BARBER", "HAIR"],
  },
  {
    email: "grace@enzamalooks.com",
    name: "Grace Atim",
    phone: "+256 700 111 003",
    title: "Nail Artist",
    bio: "Grace builds durable sets and quiet, beautiful art. Gel, acrylic, and spa pedicures are her everyday.",
    categories: ["NAILS"],
  },
  {
    email: "sarah@enzamalooks.com",
    name: "Sarah Namukasa",
    phone: "+256 700 111 004",
    title: "Makeup & Brow Artist",
    bio: "Sarah paints for weddings, evenings, and camera days, then finishes with lashes and laminated brows.",
    categories: ["MAKEUP", "LASHES_BROWS"],
  },
  {
    email: "patricia@enzamalooks.com",
    name: "Patricia Akello",
    phone: "+256 700 111 005",
    title: "Spa Therapist",
    bio: "Patricia runs the treatment room — facials, massage, and waxing with a calm, unhurried hand.",
    categories: ["SKIN_SPA", "WAXING"],
  },
  {
    email: "joan@enzamalooks.com",
    name: "Joan Nakato",
    phone: "+256 700 111 006",
    title: "Braids Specialist",
    bio: "Joan is the protective-style lead. Knotless, goddess, locs, and sew-ins that last without tension.",
    categories: ["BRAIDS", "HAIR"],
  },
];

function kampala(date: string, time: string) {
  return new Date(`${date}T${time}:00+03:00`);
}

function addDays(isoDate: string, days: number) {
  const d = new Date(`${isoDate}T12:00:00+03:00`);
  d.setUTCDate(d.getUTCDate() + days);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

async function main() {
  const staffPassword = await hash("EnzamaStaff123", 10);
  const adminPassword = await hash("EnzamaAdmin123", 10);

  await prisma.salonSettings.upsert({
    where: { id: 1 },
    update: {},
    create: {
      id: 1,
      businessName: "Enzama Looks",
      location: "Plot 12, Kampala Road, Entebbe, Uganda",
      phone: "+256 700 000 000",
      whatsapp: "+256 700 000 000",
      email: "hello@enzamalooks.com",
      defaultOpenTime: "09:00",
      defaultCloseTime: "18:00",
      slotIntervalMin: 30,
      timezone: "Africa/Kampala",
    },
  });

  await prisma.user.upsert({
    where: { email: "admin@enzamalooks.com" },
    update: {},
    create: {
      email: "admin@enzamalooks.com",
      passwordHash: adminPassword,
      name: "Enzama Admin",
      phone: "+256 700 000 000",
      role: "ADMIN",
    },
  });

  const serviceRecords = [];
  for (const service of SERVICES) {
    const record = await prisma.service.upsert({
      where: { slug: service.slug },
      update: {
        name: service.name,
        category: service.category,
        description: service.description,
        durationMin: service.durationMin,
        price: service.price,
        isActive: true,
      },
      create: service,
    });
    serviceRecords.push(record);
  }

  const professionals = [];
  for (const pro of PROFESSIONALS) {
    const user = await prisma.user.upsert({
      where: { email: pro.email },
      update: { name: pro.name, phone: pro.phone, isActive: true },
      create: {
        email: pro.email,
        passwordHash: staffPassword,
        name: pro.name,
        phone: pro.phone,
        role: "PROFESSIONAL",
      },
    });

    const professional = await prisma.professional.upsert({
      where: { userId: user.id },
      update: { title: pro.title, bio: pro.bio, isActive: true },
      create: {
        userId: user.id,
        title: pro.title,
        bio: pro.bio,
      },
    });

    const matching = serviceRecords.filter((s) =>
      pro.categories.includes(s.category),
    );

    await prisma.professionalService.deleteMany({
      where: { professionalId: professional.id },
    });
    await prisma.professionalService.createMany({
      data: matching.map((s) => ({
        professionalId: professional.id,
        serviceId: s.id,
      })),
    });

    await prisma.workingHour.deleteMany({
      where: { professionalId: professional.id },
    });
    await prisma.workingHour.createMany({
      data: [0, 1, 2, 3, 4, 5, 6].map((dayOfWeek) => {
        if (dayOfWeek === 1) {
          return {
            professionalId: professional.id,
            dayOfWeek,
            startTime: "09:00",
            endTime: "18:00",
            isOff: true,
          };
        }
        if (dayOfWeek === 0) {
          return {
            professionalId: professional.id,
            dayOfWeek,
            startTime: "10:00",
            endTime: "16:00",
            isOff: false,
          };
        }
        return {
          professionalId: professional.id,
          dayOfWeek,
          startTime: "09:00",
          endTime: "18:00",
          isOff: false,
        };
      }),
    });

    professionals.push(professional);
  }

  const existingBookings = await prisma.booking.count();
  if (existingBookings === 0) {
    const today = new Date().toLocaleDateString("en-CA", {
      timeZone: "Africa/Kampala",
    });
    const amina = professionals[0];
    const david = professionals[1];
    const grace = professionals[2];
    const sarah = professionals[3];
    const joan = professionals[5];

    const cut = serviceRecords.find((s) => s.slug === "womens-haircut")!;
    const fade = serviceRecords.find((s) => s.slug === "classic-fade")!;
    const gel = serviceRecords.find((s) => s.slug === "gel-manicure")!;
    const bridal = serviceRecords.find((s) => s.slug === "bridal-makeup")!;
    const knotless = serviceRecords.find((s) => s.slug === "knotless-braids")!;
    const blow = serviceRecords.find((s) => s.slug === "blow-dry-style")!;

    const samples: {
      professionalId: string;
      status: BookingStatus;
      date: string;
      start: string;
      duration: number;
      services: typeof serviceRecords;
      customer: {
        name: string;
        phone: string;
        email: string;
        location: string;
      };
    }[] = [
      {
        professionalId: amina.id,
        status: "CONFIRMED",
        date: today,
        start: "10:00",
        duration: 60,
        services: [cut],
        customer: {
          name: "Rebecca Kintu",
          phone: "+256 772 111 222",
          email: "rebecca@example.com",
          location: "Entebbe Town",
        },
      },
      {
        professionalId: david.id,
        status: "PENDING",
        date: today,
        start: "11:30",
        duration: 45,
        services: [fade],
        customer: {
          name: "Joseph Mutebi",
          phone: "+256 701 333 444",
          email: "joseph@example.com",
          location: "Abayita Ababiri",
        },
      },
      {
        professionalId: grace.id,
        status: "CONFIRMED",
        date: addDays(today, 1),
        start: "14:00",
        duration: 60,
        services: [gel],
        customer: {
          name: "Linda Nambi",
          phone: "+256 753 555 666",
          email: "linda@example.com",
          location: "Kitoro",
        },
      },
      {
        professionalId: sarah.id,
        status: "PENDING",
        date: addDays(today, 2),
        start: "09:30",
        duration: 90,
        services: [bridal],
        customer: {
          name: "Faith Namutebi",
          phone: "+256 780 777 888",
          email: "faith@example.com",
          location: "Kampala",
        },
      },
      {
        professionalId: joan.id,
        status: "CONFIRMED",
        date: addDays(today, 3),
        start: "09:00",
        duration: 270,
        services: [knotless],
        customer: {
          name: "Mercy Achieng",
          phone: "+256 704 999 000",
          email: "mercy@example.com",
          location: "Entebbe",
        },
      },
      {
        professionalId: amina.id,
        status: "COMPLETED",
        date: addDays(today, -2),
        start: "13:00",
        duration: 45,
        services: [blow],
        customer: {
          name: "Helen Waiswa",
          phone: "+256 772 000 111",
          email: "helen@example.com",
          location: "Namasuba",
        },
      },
    ];

    for (const sample of samples) {
      const startAt = kampala(sample.date, sample.start);
      const endAt = new Date(startAt.getTime() + sample.duration * 60_000);
      await prisma.booking.create({
        data: {
          status: sample.status,
          startAt,
          endAt,
          professionalId: sample.professionalId,
          customerName: sample.customer.name,
          customerPhone: sample.customer.phone,
          customerEmail: sample.customer.email,
          customerLocation: sample.customer.location,
          services: {
            create: sample.services.map((s) => ({
              serviceId: s.id,
              priceSnapshot: s.price,
              durationSnapshot: s.durationMin,
            })),
          },
        },
      });
    }
  }

  console.log("Seed complete.");
  console.log("Admin: admin@enzamalooks.com / EnzamaAdmin123");
  console.log("Staff: amina@enzamalooks.com / EnzamaStaff123");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });

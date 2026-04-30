import { prisma } from "../src/lib/prisma";
import bcrypt from "bcryptjs";

const products = [
  // Electronics
  {
    id: "prod-elec-001",
    name: "Wireless Noise-Cancelling Headphones",
    description:
      "Over-ear headphones with active noise cancellation, 30-hour battery life, and premium sound quality.",
    price: 24999,
    image: "https://placehold.co/600x400?text=Headphones",
    category: "electronics",
    stock: 45,
  },
  {
    id: "prod-elec-002",
    name: "Mechanical Keyboard",
    description:
      "Compact TKL mechanical keyboard with Cherry MX Brown switches, RGB backlight, and USB-C connectivity.",
    price: 12999,
    image: "https://placehold.co/600x400?text=Keyboard",
    category: "electronics",
    stock: 30,
  },
  {
    id: "prod-elec-003",
    name: "4K Webcam",
    description:
      "Ultra-HD webcam with built-in microphone, auto-focus, and low-light correction — perfect for remote work.",
    price: 8999,
    image: "https://placehold.co/600x400?text=Webcam",
    category: "electronics",
    stock: 60,
  },
  {
    id: "prod-elec-004",
    name: "Portable Bluetooth Speaker",
    description:
      "Waterproof IPX7 speaker with 360° sound, 24-hour battery, and USB-C fast charging.",
    price: 5999,
    image: "https://placehold.co/600x400?text=Speaker",
    category: "electronics",
    stock: 80,
  },
  // Clothing
  {
    id: "prod-clth-001",
    name: "Classic Crew-Neck Sweatshirt",
    description:
      "Heavyweight 400gsm cotton-fleece sweatshirt in a relaxed fit. Pre-shrunk and garment-dyed.",
    price: 5499,
    image: "https://placehold.co/600x400?text=Sweatshirt",
    category: "clothing",
    stock: 120,
  },
  {
    id: "prod-clth-002",
    name: "Slim-Fit Chino Trousers",
    description:
      "Stretch-cotton chinos with a slim taper. Available in navy, khaki, and olive.",
    price: 4999,
    image: "https://placehold.co/600x400?text=Chinos",
    category: "clothing",
    stock: 95,
  },
  {
    id: "prod-clth-003",
    name: "Merino Wool Turtleneck",
    description:
      "Fine-gauge 100% merino wool turtleneck. Naturally moisture-wicking, odour-resistant, and temperature-regulating.",
    price: 8999,
    image: "https://placehold.co/600x400?text=Turtleneck",
    category: "clothing",
    stock: 50,
  },
  {
    id: "prod-clth-004",
    name: "Lightweight Running Jacket",
    description:
      "Wind and water-resistant running jacket with reflective details and a packable hood.",
    price: 7499,
    image: "https://placehold.co/600x400?text=Jacket",
    category: "clothing",
    stock: 40,
  },
  // Home
  {
    id: "prod-home-001",
    name: "Ceramic Pour-Over Coffee Set",
    description:
      "Hand-thrown ceramic dripper and server set for a clean, flavourful pour-over brew. Holds 600 ml.",
    price: 3999,
    image: "https://placehold.co/600x400?text=Coffee+Set",
    category: "home",
    stock: 35,
  },
  {
    id: "prod-home-002",
    name: "Bamboo Cutting Board Set",
    description:
      "Set of three sustainably sourced bamboo cutting boards with juice grooves and non-slip feet.",
    price: 2999,
    image: "https://placehold.co/600x400?text=Cutting+Board",
    category: "home",
    stock: 70,
  },
  {
    id: "prod-home-003",
    name: "Linen Duvet Cover",
    description:
      "100% stonewashed French linen duvet cover. Breathable, durable, and softens with every wash. King size.",
    price: 11999,
    image: "https://placehold.co/600x400?text=Duvet+Cover",
    category: "home",
    stock: 25,
  },
  {
    id: "prod-home-004",
    name: "Scented Soy Candle",
    description:
      "Hand-poured soy wax candle with a 50-hour burn time. Available in cedarwood, vanilla, and eucalyptus.",
    price: 1999,
    image: "https://placehold.co/600x400?text=Candle",
    category: "home",
    stock: 150,
  },
];

async function seed() {
  const hashed = await bcrypt.hash("password123", 10);
  await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      email: "test@example.com",
      name: "Test User",
      password: hashed,
    },
  });
  console.log("Seed complete: test@example.com / password123");

  for (const product of products) {
    await prisma.product.upsert({
      where: { id: product.id },
      update: {
        name: product.name,
        description: product.description,
        price: product.price,
        image: product.image,
        category: product.category,
        stock: product.stock,
      },
      create: product,
    });
  }
  console.log(
    `Seed complete: ${products.length} products upserted across ${[...new Set(products.map((p) => p.category))].join(", ")}`,
  );
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());

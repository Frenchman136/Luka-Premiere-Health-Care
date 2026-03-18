require("dotenv").config();
const bcrypt = require("bcryptjs");
const prisma = require("../src/db");

const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || "feselchirumban@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || "Fesel@12140";

async function main() {
  if (!process.env.JWT_SECRET) {
    throw new Error("Missing JWT_SECRET in environment.");
  }

  const passwordHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

  const user = await prisma.user.upsert({
    where: { email: ADMIN_EMAIL },
    update: {
      role: "ADMIN",
      passwordHash,
      name: "Admin",
    },
    create: {
      email: ADMIN_EMAIL,
      passwordHash,
      role: "ADMIN",
      name: "Admin",
    },
  });

  console.log(`Seeded admin: ${user.email} (${user.id})`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

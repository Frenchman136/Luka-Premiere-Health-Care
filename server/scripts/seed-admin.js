require("dotenv").config();
const db = require("../src/db");

const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || "feselchirumban@gmail.com";
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD || "Fesel@12140";

async function ensureAuthUser() {
  try {
    return await db._admin.auth().getUserByEmail(ADMIN_EMAIL);
  } catch (error) {
    if (error.code !== "auth/user-not-found") {
      throw error;
    }

    return db._admin.auth().createUser({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      displayName: "Admin",
    });
  }
}

async function main() {
  const authUser = await ensureAuthUser();

  await db._admin.auth().setCustomUserClaims(authUser.uid, {
    role: "ADMIN",
  });

  const user = await db.user.upsert({
    where: { id: authUser.uid },
    update: {
      email: ADMIN_EMAIL,
      name: "Admin",
      role: "ADMIN",
    },
    create: {
      id: authUser.uid,
      email: ADMIN_EMAIL,
      name: "Admin",
      role: "ADMIN",
    },
  });

  console.log(`Seeded admin: ${user.email} (${user.id})`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

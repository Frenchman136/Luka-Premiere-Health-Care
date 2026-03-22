require("dotenv").config();
const db = require("../src/db");

const identifier = process.argv[2];

if (!identifier) {
  console.error("Usage: node scripts/promote-admin.js <email-or-uid>");
  process.exit(1);
}

async function getUserRecord(value) {
  if (value.includes("@")) {
    return db._admin.auth().getUserByEmail(value);
  }
  return db._admin.auth().getUser(value);
}

async function main() {
  const userRecord = await getUserRecord(identifier);

  await db._admin.auth().setCustomUserClaims(userRecord.uid, {
    role: "ADMIN",
  });

  const updated = await db.user.upsert({
    where: { id: userRecord.uid },
    update: {
      email: userRecord.email || null,
      name: userRecord.displayName || null,
      role: "ADMIN",
    },
    create: {
      id: userRecord.uid,
      email: userRecord.email || null,
      name: userRecord.displayName || null,
      role: "ADMIN",
    },
  });

  console.log(
    `Promoted ${updated.email || updated.id} to ADMIN (${updated.id})`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

const admin = require("firebase-admin");

function loadServiceAccount() {
  const json = process.env.SERVICE_ACCOUNT_JSON || process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (json) {
    try {
      return JSON.parse(json);
    } catch (error) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_JSON must be valid JSON (stringified)."
      );
    }
  }

  const base64 =
    process.env.SERVICE_ACCOUNT_BASE64 || process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
  if (base64) {
    try {
      return JSON.parse(Buffer.from(base64, "base64").toString("utf8"));
    } catch (error) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_BASE64 must be base64-encoded JSON."
      );
    }
  }

  const path =
    process.env.SERVICE_ACCOUNT_PATH || process.env.FIREBASE_SERVICE_ACCOUNT_PATH;
  if (path) {
    try {
      // eslint-disable-next-line global-require, import/no-dynamic-require
      return require(path);
    } catch (error) {
      throw new Error(
        "FIREBASE_SERVICE_ACCOUNT_PATH must point to a valid JSON file."
      );
    }
  }

  return null;
}

function initFirestore() {
  if (!admin.apps.length) {
    const serviceAccount = loadServiceAccount();
    const credential = serviceAccount
      ? admin.credential.cert(serviceAccount)
      : admin.credential.applicationDefault();

    admin.initializeApp({
      credential,
      projectId:
        process.env.PROJECT_ID ||
        process.env.FIREBASE_PROJECT_ID ||
        serviceAccount?.project_id,
    });
  }

  const firestore = admin.firestore();
  firestore.settings({ ignoreUndefinedProperties: true });
  return firestore;
}

const db = initFirestore();

function isTimestamp(value) {
  return value && typeof value.toDate === "function";
}

function normalizeData(data) {
  if (!data || typeof data !== "object") {
    return data;
  }

  const normalized = Array.isArray(data) ? [] : {};
  Object.entries(data).forEach(([key, value]) => {
    if (isTimestamp(value)) {
      normalized[key] = value.toDate();
    } else {
      normalized[key] = value;
    }
  });

  return normalized;
}

function applyDefaults(collectionName, data) {
  const now = new Date();
  const withTimestamps = {
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now,
    ...data,
  };

  if (collectionName === "users") {
    return {
      role: "USER",
      ...withTimestamps,
    };
  }

  if (collectionName === "appointments") {
    return {
      status: "REQUESTED",
      ...withTimestamps,
    };
  }

  if (collectionName === "messages") {
    return {
      status: "NEW",
      ...withTimestamps,
    };
  }

  if (collectionName === "payments") {
    return {
      provider: "STRIPE",
      status: "PENDING",
      currency: "usd",
      ...withTimestamps,
    };
  }

  return withTimestamps;
}

function docToObject(doc) {
  if (!doc || !doc.exists) {
    return null;
  }
  return {
    id: doc.id,
    ...normalizeData(doc.data()),
  };
}

function buildQuery(collectionRef, options = {}) {
  let query = collectionRef;
  if (options.where) {
    Object.entries(options.where).forEach(([field, value]) => {
      query = query.where(field, "==", value);
    });
  }

  if (options.orderBy) {
    const [field, direction] = Object.entries(options.orderBy)[0];
    query = query.orderBy(field, direction);
  }

  if (Number.isInteger(options.skip) && options.skip > 0) {
    query = query.offset(options.skip);
  }

  if (Number.isInteger(options.take) && options.take > 0) {
    query = query.limit(options.take);
  }

  return query;
}

function createCollectionClient(collectionName) {
  const collectionRef = db.collection(collectionName);

  async function findUnique({ where }) {
    if (!where || !Object.keys(where).length) {
      return null;
    }

    if (where.id) {
      const doc = await collectionRef.doc(where.id).get();
      return docToObject(doc);
    }

    const query = buildQuery(collectionRef, { where }).limit(1);
    const snapshot = await query.get();
    if (snapshot.empty) {
      return null;
    }
    return docToObject(snapshot.docs[0]);
  }

  async function findMany(options = {}) {
    const query = buildQuery(collectionRef, options);
    const snapshot = await query.get();
    return snapshot.docs.map(docToObject);
  }

  async function create({ data }) {
    const { id, ...rest } = data || {};
    const docRef = id ? collectionRef.doc(id) : collectionRef.doc();
    const payload = applyDefaults(collectionName, rest);
    await docRef.set(payload);
    return { id: docRef.id, ...normalizeData(payload) };
  }

  async function update({ where, data }) {
    if (!where || !where.id) {
      throw new Error("update requires where.id");
    }
    const docRef = collectionRef.doc(where.id);
    const payload = {
      ...data,
      updatedAt: data.updatedAt || new Date(),
    };
    await docRef.set(payload, { merge: true });
    const updated = await docRef.get();
    return docToObject(updated);
  }

  async function count(options = {}) {
    const query = buildQuery(collectionRef, options);
    if (typeof query.count === "function") {
      const snapshot = await query.count().get();
      return snapshot.data().count;
    }
    const snapshot = await query.get();
    return snapshot.size;
  }

  async function upsert({ where, update: updateData, create: createData }) {
    const existing = await findUnique({ where });
    if (existing) {
      return update({ where: { id: existing.id }, data: updateData });
    }
    const created = await create({ data: createData });
    return created;
  }

  return {
    findUnique,
    findMany,
    create,
    update,
    count,
    upsert,
  };
}

module.exports = {
  user: createCollectionClient("users"),
  appointment: createCollectionClient("appointments"),
  message: createCollectionClient("messages"),
  payment: createCollectionClient("payments"),
  $disconnect: async () => {},
  _db: db,
  _admin: admin,
};

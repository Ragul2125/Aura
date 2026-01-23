import admin from "firebase-admin";
import { createRequire } from "module";

const require = createRequire(import.meta.url);

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
  // Production: Decode Base64 string from environment variable
  const buffer = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64');
  serviceAccount = JSON.parse(buffer.toString('utf-8'));
} else {
  // Development: Load from local file
  try {
    serviceAccount = require("./serviceAccountKey.json");
  } catch (error) {
    console.warn("Warning: serviceAccountKey.json not found and FIREBASE_SERVICE_ACCOUNT_BASE64 not set.");
  }
}

if (serviceAccount) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

export default admin;

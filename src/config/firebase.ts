import fs from "fs";
import path from "path";
import { cert, initializeApp, ServiceAccount } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

const keyPath = path.resolve(process.env.FIREBASE_KEY_PATH || "src/firebase/serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(keyPath, "utf8")) as ServiceAccount;

initializeApp({ credential: cert(serviceAccount) });

const firestore = getFirestore();

export default firestore;

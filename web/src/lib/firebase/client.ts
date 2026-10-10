import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getAuth, connectAuthEmulator, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const requiredConfigKeys = [
  "apiKey",
  "authDomain",
  "projectId",
  "storageBucket",
  "messagingSenderId",
  "appId",
] as const;

function createFirebaseApp(): FirebaseApp {
  const missingKeys = requiredConfigKeys.filter((key) => !firebaseConfig[key]);
  if (missingKeys.length > 0) {
    throw new Error(
      `Firebase web configuration is missing: ${missingKeys.join(", ")}. ` +
        "Configure NEXT_PUBLIC_FIREBASE_* before using authenticated routes."
    );
  }

  return getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
}

const missingFirebaseConfigKeys = requiredConfigKeys.filter((key) => !firebaseConfig[key]);
export const firebaseConfigError = missingFirebaseConfigKeys.length > 0
  ? `Faltan variables públicas de Firebase: ${missingFirebaseConfigKeys.map((key) => `NEXT_PUBLIC_FIREBASE_${key.replace(/[A-Z]/g, (letter) => `_${letter}`).toUpperCase()}`).join(", ")}. Configúralas para usar las rutas autenticadas.`
  : null;

// Server/build evaluation must not initialize Firebase. Protected client routes
// still initialize it in the browser, where the configured public values are used.
const app = typeof window === "undefined" || process.env.NODE_ENV === "test" || firebaseConfigError ? undefined : createFirebaseApp();

export { app };
export const auth: Auth | undefined = app ? getAuth(app) : undefined;

// Only set for local smoke-test walkthroughs against api/'s Firebase Auth Emulator
// (see api/scripts/smoke-test.sh) — never set in demo/beta/production configs.
const authEmulatorHost = process.env.NEXT_PUBLIC_FIREBASE_AUTH_EMULATOR_HOST;
if (auth && authEmulatorHost) {
  connectAuthEmulator(auth, `http://${authEmulatorHost}`, { disableWarnings: true });
}

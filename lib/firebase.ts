import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, collection, addDoc } from 'firebase/firestore'

export type FirebaseCtx = { app: FirebaseApp }

export async function getFirebase(): Promise<FirebaseCtx | null> {
  try {
    if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) return null
    const cfg = {
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
      authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
      storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
    }
    const app = getApps().length ? getApps()[0] : initializeApp(cfg)
    return { app }
  } catch (e) {
    console.warn('Firebase no inicializado:', e)
    return null
  }
}

export async function maybeSaveScenario(ctx: FirebaseCtx, rut: string, scenario: any) {
  const db = getFirestore(ctx.app)
  const ref = collection(db, 'ruts', rut, 'scenarios')
  await addDoc(ref, scenario)
} 
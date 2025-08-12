import { initializeApp, getApps, FirebaseApp } from 'firebase/app'
import { getFirestore, collection, addDoc, doc, setDoc, getDoc, getDocs, query, where, collectionGroup, deleteDoc, orderBy, limit } from 'firebase/firestore'

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

export type ScenarioDoc = {
  id?: string
  name: string
  region: string
  entries: any[]
  totals: { kwh: number; cost: number; co2: number }
  createdAt: string
}

export async function maybeSaveScenario(ctx: FirebaseCtx, rut: string, scenario: ScenarioDoc) {
  const db = getFirestore(ctx.app)
  // Guardar bajo ruts/{rut}/scenarios (compatibilidad)
  const ref1 = collection(db, 'ruts', rut, 'scenarios')
  await addDoc(ref1, scenario)
  // Guardar bajo users/{rut}/scenarios (nuevo)
  const ref2 = collection(db, 'users', rut, 'scenarios')
  await addDoc(ref2, scenario)
}

export type UserProfile = {
  rut: string
  region: string
  createdAt: string
  updatedAt: string
}

export async function upsertUserByRut(ctx: FirebaseCtx, rut: string, region: string): Promise<UserProfile> {
  const db = getFirestore(ctx.app)
  const ref = doc(db, 'users', rut)
  const now = new Date().toISOString()
  const snap = await getDoc(ref)
  const data: UserProfile = {
    rut,
    region,
    createdAt: snap.exists() ? (snap.data() as any).createdAt ?? now : now,
    updatedAt: now,
  }
  await setDoc(ref, data, { merge: true })
  return data
}

export async function listScenariosByRut(ctx: FirebaseCtx, rut: string, limitN = 20): Promise<ScenarioDoc[]> {
  const db = getFirestore(ctx.app)
  const ref = collection(db, 'users', rut, 'scenarios')
  const q = query(ref, orderBy('createdAt', 'desc'), limit(limitN))
  const snap = await getDocs(q)
  return snap.docs.map(d => ({ id: d.id, ...(d.data() as Omit<ScenarioDoc, 'id'>) }))
}

export async function deleteScenarioById(ctx: FirebaseCtx, rut: string, id: string): Promise<void> {
  const db = getFirestore(ctx.app)
  const ref = doc(db, 'users', rut, 'scenarios', id)
  await deleteDoc(ref)
}

export async function maybeGetRegionAverage(ctx: FirebaseCtx, region: string): Promise<{ avgKwh: number; count: number } | null> {
  try {
    const db = getFirestore(ctx.app)
    const cg = collectionGroup(db, 'scenarios')
    const q = query(cg, where('region', '==', region), orderBy('createdAt', 'desc'), limit(100))
    const snap = await getDocs(q)
    const values: number[] = []
    snap.forEach(d => {
      const data = d.data() as any
      if (data?.totals?.kwh) values.push(Number(data.totals.kwh))
    })
    if (values.length === 0) return { avgKwh: 0, count: 0 }
    const sum = values.reduce((a, b) => a + b, 0)
    return { avgKwh: sum / values.length, count: values.length }
  } catch (e) {
    console.warn('No se pudo obtener promedio regional:', e)
    return null
  }
} 
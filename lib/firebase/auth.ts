import {
  GoogleAuthProvider,
  type User,
  onAuthStateChanged,
  signInWithPopup,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { getFirebaseClients } from "./config";

export interface AppUserProfile {
  uid: string;
  displayName: string;
  color: string;
  photoURL: string | null;
  createdAt: Date;
}

export type AuthStateListener = (user: User | null) => void;

const IDENTITY_COLORS: readonly string[] = [
  "#4F8EF7",
  "#7C3AED",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#22D3EE",
  "#A855F7",
  "#F97316",
  "#14B8A6",
  "#6366F1",
  "#EC4899",
  "#84CC16",
] as const;

function assignIdentityColor(uid: string): string {
  // Deterministic color based on uid hash
  let hash = 0;
  for (let index = 0; index < uid.length; index += 1) {
    // eslint-disable-next-line no-bitwise
    hash = (hash << 5) - hash + uid.charCodeAt(index);
    // eslint-disable-next-line no-bitwise
    hash |= 0;
  }
  const colorIndex = Math.abs(hash) % IDENTITY_COLORS.length;
  return IDENTITY_COLORS[colorIndex]!;
}

export async function signInWithGoogle(): Promise<User> {
  const { auth } = getFirebaseClients();
  const provider = new GoogleAuthProvider();

  const result = await signInWithPopup(auth, provider);
  if (!result.user) {
    throw new Error("Google sign-in failed — no user in result.");
  }
  return result.user;
}

export async function ensureUserProfile(
  user: User,
  displayName: string,
): Promise<AppUserProfile> {
  const { firestore } = getFirebaseClients();
  const usersCollection = collection(firestore, "users");
  const userRef = doc(usersCollection, user.uid);
  const color = assignIdentityColor(user.uid);

  try {
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      await setDoc(userRef, {
        uid: user.uid,
        displayName,
        color,
        photoURL: user.photoURL ?? null,
        createdAt: serverTimestamp(),
      });

      if (!user.displayName) {
        await updateProfile(user, { displayName });
      }

      return {
        uid: user.uid,
        displayName,
        color,
        photoURL: user.photoURL ?? null,
        createdAt: new Date(),
      };
    }

    const data = snapshot.data();

    return {
      uid: data.uid as string,
      displayName: (data.displayName as string) ?? displayName,
      color: (data.color as string) ?? color,
      photoURL: (data.photoURL as string | null) ?? null,
      createdAt: (data.createdAt?.toDate?.() as Date | undefined) ?? new Date(),
    };
  } catch (error) {
    // In very restricted networks Firestore may be offline; fall back to a
    // purely auth-derived profile so that sign-in can still succeed locally.
    // Writes will be queued by the SDK and flushed when connectivity returns.
    console.error("Failed to load or create user profile; continuing offline", error);
    return {
      uid: user.uid,
      displayName,
      color,
      photoURL: user.photoURL ?? null,
      createdAt: new Date(),
    };
  }
}

export function listenToAuthState(listener: AuthStateListener): () => void {
  const { auth } = getFirebaseClients();
  return onAuthStateChanged(auth, listener);
}

export async function signOut(): Promise<void> {
  const { auth } = getFirebaseClients();
  await firebaseSignOut(auth);
}


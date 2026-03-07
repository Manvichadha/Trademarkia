import {
  type CollectionReference,
  type DocumentData,
  type Firestore,
  collection,
} from "firebase/firestore";
import { getFirebaseClients } from "./config";

export function getFirestoreClient(): Firestore {
  const { firestore } = getFirebaseClients();
  return firestore;
}

export function getCollection<T extends DocumentData>(
  path: string,
): CollectionReference<T> {
  const firestore = getFirestoreClient();
  return collection(firestore, path) as CollectionReference<T>;
}


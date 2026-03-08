import {
  type CollectionReference,
  type DocumentData,
  type Firestore,
  collection,
  serverTimestamp,
  addDoc,
  Timestamp,
  query,
  where,
  onSnapshot,
  orderBy,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseClients } from "./config";
import type { SpreadsheetDocument } from "@/types";

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

interface FirestoreSpreadsheetDocument {
  title: string;
  ownerId: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  collaborators: string[];
}

export async function createSpreadsheetDocument(
  ownerId: string,
  title: string,
): Promise<SpreadsheetDocument> {
  const documents = getCollection<FirestoreSpreadsheetDocument>("documents");

  const nowServerTimestamp = serverTimestamp();

  try {
    const docRef = await addDoc(documents, {
      title,
      ownerId,
      createdAt: nowServerTimestamp,
      updatedAt: nowServerTimestamp,
      collaborators: [],
    });

    const now = new Date();
    return {
      id: docRef.id,
      title,
      ownerId,
      createdAt: now,
      updatedAt: now,
      collaborators: [],
    };
  } catch (error) {
    console.error("Failed to create spreadsheet document", error);
    throw error;
  }
}

export type SpreadsheetDocumentsListener = (docs: SpreadsheetDocument[]) => void;

export function listenToUserSpreadsheets(
  uid: string,
  listener: SpreadsheetDocumentsListener,
): Unsubscribe {
  const documents = getCollection<FirestoreSpreadsheetDocument>("documents");

  const ownedQuery = query(
    documents,
    where("ownerId", "==", uid),
    orderBy("updatedAt", "desc"),
  );

  const collaboratorQuery = query(
    documents,
    where("collaborators", "array-contains", uid),
    orderBy("updatedAt", "desc"),
  );

  const seen = new Map<string, SpreadsheetDocument>();

  const handleSnapshot = (snapshotDocs: FirestoreSpreadsheetDocument[], ids: string[]) => {
    snapshotDocs.forEach((data, index) => {
      const id = ids[index]!;
      const createdAt =
        data.createdAt instanceof Timestamp ? data.createdAt.toDate() : new Date();
      const updatedAt =
        data.updatedAt instanceof Timestamp ? data.updatedAt.toDate() : new Date();

      seen.set(id, {
        id,
        title: data.title,
        ownerId: data.ownerId,
        createdAt,
        updatedAt,
        collaborators: data.collaborators ?? [],
      });
    });

    const merged = Array.from(seen.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
    );
    listener(merged);
  };

  const ownedUnsub = onSnapshot(
    ownedQuery,
    (snapshot) => {
      const docs: FirestoreSpreadsheetDocument[] = [];
      const ids: string[] = [];
      snapshot.forEach((docSnapshot) => {
        docs.push(docSnapshot.data());
        ids.push(docSnapshot.id);
      });
      handleSnapshot(docs, ids);
    },
    (error) => {
      console.error("Error listening to owned spreadsheets", error);
    },
  );

  const collaboratorUnsub = onSnapshot(
    collaboratorQuery,
    (snapshot) => {
      const docs: FirestoreSpreadsheetDocument[] = [];
      const ids: string[] = [];
      snapshot.forEach((docSnapshot) => {
        docs.push(docSnapshot.data());
        ids.push(docSnapshot.id);
      });
      handleSnapshot(docs, ids);
    },
    (error) => {
      console.error("Error listening to collaborator spreadsheets", error);
    },
  );

  return () => {
    ownedUnsub();
    collaboratorUnsub();
  };
}



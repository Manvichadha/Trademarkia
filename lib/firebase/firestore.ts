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
  writeBatch,
  doc,
  deleteDoc,
  getDocs,
  updateDoc,
  arrayUnion,
  type QuerySnapshot,
  type Unsubscribe,
} from "firebase/firestore";
import { getFirebaseClients } from "./config";
import type { SpreadsheetDocument } from "@/types";
import type { CellData } from "@/lib/spreadsheet/types";

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
  initialCells?: Record<string, CellData>,
  initialColWidths?: Record<number, number>
): Promise<SpreadsheetDocument> {
  const firestore = getFirestoreClient();
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

    const metaRef = doc(firestore, "documents", docRef.id, "metadata", "main");
    
    // Batch write initial metadata and cells if provided
    const batch = writeBatch(firestore);
    
    // Always write the metadata document for proper initialization
    batch.set(metaRef, {
      title,
      colWidths: initialColWidths ?? {},
      rowHeights: {},
      updatedAt: Date.now()
    }, { merge: true });

    if (initialCells) {
      const nowMs = Date.now();
      for (const [cellId, cellData] of Object.entries(initialCells)) {
        const cellRef = doc(firestore, "documents", docRef.id, "cells", cellId);
        batch.set(cellRef, {
          raw: cellData.raw,
          formula: cellData.formula ?? null,
          computed: cellData.computed ?? null,
          formatting: cellData.formatting ?? {},
          updatedAt: nowMs,
          updatedBy: ownerId,
        });
      }
    }
    
    await batch.commit();

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

export async function deleteSpreadsheetDocument(docId: string): Promise<void> {
  const firestore = getFirestoreClient();
  const batch = writeBatch(firestore);

  // 1. Delete all cells in the subcollection
  const cellsRef = collection(firestore, "documents", docId, "cells");
  const cellsSnap = await getDocs(cellsRef);
  cellsSnap.forEach((cellDoc) => {
    batch.delete(cellDoc.ref);
  });

  // 2. Delete metadata
  const metaRef = doc(firestore, "documents", docId, "metadata", "main");
  batch.delete(metaRef);

  // 3. Delete parent document
  const parentRef = doc(firestore, "documents", docId);
  batch.delete(parentRef);

  await batch.commit();
}

export async function addCollaborator(docId: string, collaboratorUid: string): Promise<void> {
  const firestore = getFirestoreClient();
  const docRef = doc(firestore, "documents", docId);
  await updateDoc(docRef, {
    collaborators: arrayUnion(collaboratorUid),
    updatedAt: serverTimestamp(),
  });
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

  const handleSnapshot = (snapshot: QuerySnapshot<FirestoreSpreadsheetDocument>) => {
    let hasChanges = false;
    snapshot.docChanges().forEach((change) => {
      hasChanges = true;
      const id = change.doc.id;
      
      if (change.type === "removed") {
        seen.delete(id);
      } else {
        const data = change.doc.data();
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
      }
    });

    if (hasChanges) {
      const merged = Array.from(seen.values()).sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime(),
      );
      listener(merged);
    }
  };

  const ownedUnsub = onSnapshot(
    ownedQuery,
    handleSnapshot,
    (error) => {
      console.error("Error listening to owned spreadsheets", error);
    },
  );

  const collaboratorUnsub = onSnapshot(
    collaboratorQuery,
    handleSnapshot,
    (error) => {
      console.error("Error listening to collaborator spreadsheets", error);
    },
  );

  return () => {
    ownedUnsub();
    collaboratorUnsub();
  };
}



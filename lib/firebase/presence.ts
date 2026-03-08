/**
 * Presence system using Firebase Realtime Database.
 *
 * Why RTDB instead of Firestore:
 *   - onDisconnect() is handled server-side: stale presence entries are
 *     auto-removed even on browser crash or network loss.
 *   - Lower latency for ephemeral data (cursor position, active cell).
 *   - Firestore would require TTL-based cleanup which is unreliable.
 *
 * Schema:
 *   /presence/{docId}/{uid}
 *     uid, displayName, color, currentCell, lastSeen
 */

import {
  ref,
  set,
  onDisconnect,
  onValue,
  off,
  serverTimestamp,
  type Database,
} from "firebase/database";
import { getFirebaseClients } from "./config";
import { USER_COLORS } from "@/lib/utils/color";

// ---- Types ----

export interface PresenceUser {
  uid: string;
  displayName: string;
  color: string;
  currentCell: string | null;
  lastSeen: number;
}

export type PresenceMap = Record<string, PresenceUser>;

function getDb(): Database {
  return getFirebaseClients().realtimeDb;
}

let _userColor: string | null = null;

function assignColor(uid: string): string {
  if (_userColor) return _userColor;
  // Deterministic color from uid hash
  let hash = 0;
  for (let i = 0; i < uid.length; i++) {
    hash = (hash * 31 + uid.charCodeAt(i)) >>> 0;
  }
  _userColor = USER_COLORS[hash % USER_COLORS.length] ?? "#6366f1";
  return _userColor;
}

// ---- Join presence ----

/**
 * Register this user in the presence system for a document.
 * Sets up onDisconnect to auto-remove when the connection drops.
 * Returns a cleanup function to call on component unmount.
 */
export function joinPresence(
  docId: string,
  uid: string,
  displayName: string
): () => void {
  const db = getDb();
  const color = assignColor(uid);
  const presenceRef = ref(db, `presence/${docId}/${uid}`);

  const data: Omit<PresenceUser, "lastSeen"> & { lastSeen: object } = {
    uid,
    displayName,
    color,
    currentCell: null,
    lastSeen: serverTimestamp(),
  };

  set(presenceRef, data).catch(console.error);
  onDisconnect(presenceRef).remove();

  return () => {
    set(presenceRef, null).catch(console.error);
  };
}

// ---- Update current cell (throttled at call site) ----

export function updatePresenceCell(
  docId: string,
  uid: string,
  currentCell: string | null
): void {
  const db = getDb();
  const cellRef = ref(db, `presence/${docId}/${uid}/currentCell`);
  const lastSeenRef = ref(db, `presence/${docId}/${uid}/lastSeen`);
  set(cellRef, currentCell).catch(console.error);
  set(lastSeenRef, serverTimestamp()).catch(console.error);
}

// ---- Subscribe to presence map ----

export function subscribeToPresence(
  docId: string,
  currentUid: string,
  onData: (presence: PresenceMap) => void
): () => void {
  const db = getDb();
  const presenceRef = ref(db, `presence/${docId}`);

  const handler = onValue(presenceRef, (snapshot) => {
    const val = snapshot.val() as Record<string, PresenceUser> | null;
    if (!val) {
      onData({});
      return;
    }
    // Filter out current user
    const others: PresenceMap = {};
    for (const [uid, user] of Object.entries(val)) {
      if (uid !== currentUid) others[uid] = user;
    }
    onData(others);
  });

  return () => off(presenceRef, "value", handler);
}

// ---- Get user color ----

export function getUserColor(uid: string): string {
  return assignColor(uid);
}

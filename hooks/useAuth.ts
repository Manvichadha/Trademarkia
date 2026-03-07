import { useEffect, useState } from "react";
import type { User } from "firebase/auth";
import { listenToAuthState, signOut as firebaseSignOut } from "@/lib/firebase/auth";

export interface UseAuthResult {
  user: User | null;
  loading: boolean;
  signOut: () => Promise<void>;
}

export function useAuth(): UseAuthResult {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = listenToAuthState((nextUser) => {
      setUser(nextUser);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleSignOut = async (): Promise<void> => {
    await firebaseSignOut();
  };

  return {
    user,
    loading,
    signOut: handleSignOut,
  };
}


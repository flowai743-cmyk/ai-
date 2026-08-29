"use client";

import React, { useEffect, useState } from "react";
import { auth, googleProvider, signInWithPopup, signOut } from "@/lib/firebase";
import { onAuthStateChanged, User } from "firebase/auth";
import { LogIn, LogOut, User as UserIcon } from "lucide-react";

export default function GoogleLoginButton() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-zinc-400 font-mono text-xs">
        <span className="w-4 h-4 rounded-full border-2 border-zinc-600 border-t-zinc-400 animate-spin"></span>
        Loading...
      </div>
    );
  }

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-700 px-3 py-1.5 rounded-full">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName || "User"} className="w-5 h-5 rounded-full" />
          ) : (
            <UserIcon className="w-4 h-4 text-zinc-400" />
          )}
          <span className="text-xs font-mono text-zinc-200">{user.displayName || user.email}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 bg-rose-950/50 hover:bg-rose-900/50 border border-rose-800/50 text-rose-400 transition-colors px-3 py-1.5 rounded-full text-xs font-mono font-medium"
        >
          <LogOut className="w-3.5 h-3.5" />
          Sign Out
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 bg-zinc-100 hover:bg-white text-zinc-900 transition-colors px-4 py-1.5 rounded-full text-xs font-bold font-mono"
    >
      <LogIn className="w-4 h-4" />
      Sign in with Google
    </button>
  );
}

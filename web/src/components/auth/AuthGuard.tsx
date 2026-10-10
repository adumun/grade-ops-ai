"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth, firebaseConfigError } from "@/lib/firebase/client";

interface AuthGuardProps {
  children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!auth) {
      return;
    }

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user === null) {
        router.replace("/login");
        return;
      }

      const isGoogleUser = user.providerData?.some((p) => p.providerId === "google.com");
      if (!user.emailVerified && !isGoogleUser) {
        router.replace("/verify-email");
        return;
      }

      setLoading(false);
    });

    return unsubscribe;
  }, [router]);

  if (loading) {
    if (firebaseConfigError) {
      return (
        <main role="alert" className="flex min-h-screen items-center justify-center p-6 text-center">
          <div>
            <h1 className="text-xl font-semibold">Configuración de autenticación incompleta</h1>
            <p className="mt-2 max-w-xl">{firebaseConfigError}</p>
          </div>
        </main>
      );
    }

    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return <>{children}</>;
}

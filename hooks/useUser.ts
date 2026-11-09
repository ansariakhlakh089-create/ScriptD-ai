// FILE: hooks/useUser.ts
"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api-client";
import type { UserSummary } from "@/types";

// Top bar ke liye: naam, plan, tokens, free quota
export function useUser() {
  const [user, setUser] = useState<UserSummary | null>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    try {
      const data = await api<{ user: UserSummary }>("/api/user");
      setUser(data.user);
    } catch {
      // login screen par redirect api-client sambhal leta hai
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  return { user, loading, refresh };
}

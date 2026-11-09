// FILE: hooks/useProject.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, errorMessage } from "@/lib/api-client";
import { WORKING_STATUSES } from "@/lib/constants";
import type { ProjectDTO } from "@/types";

const POLL_MS = 3000;

// Ek project ko load karta hai, aur jab tak kaam chal raha hai har 3 second mein status refresh karta hai
export function useProject(projectId: string | null) {
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const activeId = useRef<string | null>(null);

  const fetchProject = useCallback(async (id: string, quiet: boolean) => {
    try {
      const data = await api<{ project: ProjectDTO }>(`/api/project/${id}`);
      if (activeId.current !== id) return; // purane project ka jawab, ignore
      setProject(data.project);
      setError(null);
    } catch (e) {
      if (activeId.current !== id) return;
      // Polling ke beech network ki chhoti galti par error mat dikhao (sirf 404 par)
      if (!quiet || (e instanceof ApiError && e.status === 404)) setError(errorMessage(e));
    } finally {
      if (activeId.current === id) setLoading(false);
    }
  }, []);

  useEffect(() => {
    activeId.current = projectId;
    setError(null);
    if (!projectId) {
      setProject(null);
      setLoading(false);
      return;
    }
    setProject((current) => (current && current.id === projectId ? current : null));
    setLoading(true);
    void fetchProject(projectId, false);
  }, [projectId, fetchProject]);

  const isWorking = !!project && (WORKING_STATUSES as string[]).includes(project.status);

  useEffect(() => {
    if (!projectId || !isWorking) return;
    const timer = setInterval(() => void fetchProject(projectId, true), POLL_MS);
    return () => clearInterval(timer);
  }, [projectId, isWorking, fetchProject]);

  const refresh = useCallback(async () => {
    if (projectId) await fetchProject(projectId, true);
  }, [projectId, fetchProject]);

  return { project, setProject, loading, error, refresh };
}

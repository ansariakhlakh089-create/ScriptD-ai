// FILE: hooks/useProject.ts
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api, ApiError, errorMessage } from "@/lib/api-client";
import { WORKING_STATUSES } from "@/lib/constants";
import type { ProjectDTO } from "@/types";

// Ek project ko dikhata hai aur kaam chalte waqt har 3 second mein khud update karta hai
export function useProject(projectId: string | null) {
  const [project, setProject] = useState<ProjectDTO | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);
  const failures = useRef(0);

  const fetchOnce = useCallback(async () => {
    if (!projectId) return;
    try {
      const data = await api<{ project: ProjectDTO }>(`/api/project/${projectId}`);
      setProject(data.project);
      setError(null);
      failures.current = 0;
    } catch (e) {
      if (e instanceof ApiError && e.status === 404) {
        setNotFound(true);
        setError("This script was not found. It may have been deleted.");
        return;
      }
      failures.current += 1;
      if (failures.current >= 3) setError(errorMessage(e));
    }
  }, [projectId]);

  // Project badalte hi sab kuch saaf, phir naya laao
  useEffect(() => {
    setProject(null);
    setError(null);
    setNotFound(false);
    failures.current = 0;
    if (projectId) void fetchOnce();
  }, [projectId, fetchOnce]);

  const working = project ? (WORKING_STATUSES as string[]).includes(project.status) : false;
  const shouldPoll = Boolean(projectId) && !notFound && (project === null || working);

  useEffect(() => {
    if (!shouldPoll) return;
    const timer = setInterval(() => {
      if (!document.hidden) void fetchOnce(); // tab chhupa ho to request nahi
    }, 3000);
    return () => clearInterval(timer);
  }, [shouldPoll, fetchOnce]);

  return { project, setProject, error, refresh: fetchOnce };
}

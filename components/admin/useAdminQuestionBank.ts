"use client";

import { useCallback, useEffect, useState } from "react";
import { loadAdminQuestionBank } from "@/app/actions/question-bank-actions";
import type { AdminQuestionBank } from "@/components/admin/question-bank-types";

export function useAdminQuestionBank(seasonId: string) {
  const [bank, setBank] = useState<AdminQuestionBank | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const refreshBank = useCallback(async () => {
    try {
      setBank(await loadAdminQuestionBank(seasonId));
      setLoadError(null);
    } catch (error) {
      setLoadError(error instanceof Error ? error.message : "The question bank could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    let active = true;
    void loadAdminQuestionBank(seasonId).then((nextBank) => {
      if (active) { setBank(nextBank); setLoadError(null); setIsLoading(false); }
    }).catch((error: unknown) => {
      if (active) { setLoadError(error instanceof Error ? error.message : "The question bank could not be loaded."); setIsLoading(false); }
    });
    return () => { active = false; };
  }, [seasonId]);

  return { bank, isLoading, loadError, refreshBank };
}

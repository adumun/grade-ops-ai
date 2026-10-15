"use client";

import { useCallback, useEffect, useState } from "react";
import { useDemoState } from "@/components/shell/ShellContext";
import { localContentSetDataSource } from "../data/localContentSetDataSource";
import type { ContentSetDataState, Material } from "../domain/types";

const LOAD_ERROR = "No pudimos cargar el conjunto de contenidos local.";

export function useContentSetData() {
  const { demoState } = useDemoState();
  const [state, setState] = useState<ContentSetDataState>({ status: "loading" });
  const [fixtures, setFixtures] = useState<Material[]>([]);
  const [retryCount, setRetryCount] = useState(0);
  const load = useCallback(async () => {
    setState({ status: "loading" });
    if (demoState === "loading") return;
    if (demoState === "error" && retryCount === 0) { setState({ status: "error", message: LOAD_ERROR }); return; }
    try {
      const [contentSet, materialFixtures, reusableContentSets, associatedContentSetId] = await Promise.all([localContentSetDataSource.getContentSet(), localContentSetDataSource.listMaterialFixtures(), localContentSetDataSource.listReusableContentSets(), localContentSetDataSource.getAssociatedContentSetId()]);
      const associatedContentSet = associatedContentSetId ? reusableContentSets.find((item) => item.id === associatedContentSetId) : undefined;
      const resolvedContentSet = associatedContentSet ?? contentSet;
      setFixtures(materialFixtures);
      setState({ status: "ready", contentSet: demoState === "empty" ? { ...resolvedContentSet, name: "", description: "", materials: [] } : resolvedContentSet, reusableContentSets });
    } catch { setState({ status: "error", message: LOAD_ERROR }); }
  }, [demoState, retryCount]);
  useEffect(() => { void load(); }, [load]);
  return { state, fixtures, retry: () => setRetryCount((count) => count + 1), reset: localContentSetDataSource.reset };
}

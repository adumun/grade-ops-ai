"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ObjectiveSetPage from "@/features/assessment-authoring/ObjectiveSetPage";
import type { AssessmentAccess } from "@/features/assessment-authoring/domain/types";

function ObjectiveRouteContent() {
  const searchParams = useSearchParams();
  const access = (searchParams.get("access") ?? "editable") as AssessmentAccess;
  return <ObjectiveSetPage access={access} simulateSaveError={searchParams.get("saveError") === "1"} />;
}

export default function PreviewObjectivesRoute() { return <Suspense fallback={<div aria-label="Cargando objetivos">Cargando…</div>}><ObjectiveRouteContent /></Suspense>; }

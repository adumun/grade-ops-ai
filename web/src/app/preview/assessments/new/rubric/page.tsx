"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import RubricPage from "@/features/assessment-authoring/RubricPage";
import type { AssessmentAccess } from "@/features/assessment-authoring/domain/types";

function RubricRouteContent() {
  const searchParams = useSearchParams();
  return <RubricPage access={(searchParams.get("access") ?? "editable") as AssessmentAccess} simulateError={searchParams.get("loadError") === "1"} simulateSaveError={searchParams.get("saveError") === "1"} />;
}

export default function PreviewRubricRoute() { return <Suspense fallback={<div aria-label="Cargando rúbrica">Cargando…</div>}><RubricRouteContent /></Suspense>; }

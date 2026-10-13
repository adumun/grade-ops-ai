"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ContentSetPage from "@/features/assessment-authoring/ContentSetPage";
import type { AssessmentAccess } from "@/features/assessment-authoring/domain/types";

function ContentRouteContent() {
  const searchParams = useSearchParams();
  const access = (searchParams.get("access") ?? "editable") as AssessmentAccess;
  return <ContentSetPage access={access} simulateSaveError={searchParams.get("saveError") === "1"} />;
}

export default function PreviewContentRoute() {
  return <Suspense fallback={<div aria-label="Cargando contenidos">Cargando…</div>}><ContentRouteContent /></Suspense>;
}

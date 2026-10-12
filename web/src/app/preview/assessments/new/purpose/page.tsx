"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import AssessmentPurposePage from "@/features/assessment-authoring/AssessmentPurposePage";
import type { AssessmentAccess } from "@/features/assessment-authoring/domain/types";

function PreviewAssessmentPurposeContent() {
  const searchParams = useSearchParams();
  const access = (searchParams.get("access") ?? "editable") as AssessmentAccess;
  return <AssessmentPurposePage access={access} simulateSaveError={searchParams.get("saveError") === "1"} />;
}

export default function PreviewAssessmentPurposeRoute() {
  return <Suspense fallback={<div aria-label="Cargando propósito">Cargando…</div>}><PreviewAssessmentPurposeContent /></Suspense>;
}

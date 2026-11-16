"use client";

import { use } from "react";
import EvaluationWorkspacePage from "@/features/evaluation-workspace/EvaluationWorkspacePage";

interface EvaluationWorkspaceRouteProps {
  params: Promise<{ id: string }>;
}

export default function EvaluationWorkspaceRoute({ params }: EvaluationWorkspaceRouteProps) {
  const { id } = use(params);
  return <EvaluationWorkspacePage assessmentId={id} />;
}

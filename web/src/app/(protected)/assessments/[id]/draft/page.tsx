"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ds";
import { useShellConfig } from "@/components/shell/ShellContext";
import {
  useAssessmentDraftBuilderPage,
  NOT_FOUND_MESSAGE,
} from "@/features/assessment-creation/hooks/useAssessmentDraftBuilderPage";
import DraftEditorSection from "@/features/assessment-creation/components/DraftEditorSection";
import RegenerateSection from "@/features/assessment-creation/components/RegenerateSection";
import VersionHistorySection from "@/features/assessment-creation/components/VersionHistorySection";

interface DraftBuilderPageProps {
  params: Promise<{ id: string }>;
}

// Shared layout for every generation-status-driven state (LOCAL-CONTRACTS.md § New/changed UI
// states) — same visual language as the pre-existing not-found block below, no new component
// library or design token introduced.
function CenteredStatePanel({
  role,
  message,
  errorMessage,
  action,
}: {
  role: "status" | "alert";
  message: string;
  errorMessage?: string | null;
  action?: { label: string; loadingLabel: string; loading: boolean; onClick: () => void };
}) {
  return (
    <div style={{ maxWidth: "var(--content-max)", textAlign: "center", padding: "48px 16px" }}>
      <p role={role} style={{ fontSize: "var(--text-lg)", color: "var(--text-strong)", margin: "0 0 16px" }}>
        {message}
      </p>
      {errorMessage && (
        <p role="alert" style={{ fontSize: "var(--text-sm)", color: "var(--danger-600)", margin: "0 0 16px" }}>
          {errorMessage}
        </p>
      )}
      {action && (
        <Button variant="primary" loading={action.loading} disabled={action.loading} onClick={action.onClick}>
          {action.loading ? action.loadingLabel : action.label}
        </Button>
      )}
    </div>
  );
}

// Safe translation for FAILED_TERMINAL failure codes — teachers never see raw technical codes.
// Unknown codes fall back to the generic explanation below (conservative: no invented meaning).
const TERMINAL_FAILURE_CODE_MESSAGES: Record<string, string> = {
  CONTENT_POLICY_VIOLATION:
    "El contenido de la evaluación fue rechazado por las políticas del proveedor de IA.",
  PROVIDER_CAPACITY_EXHAUSTED:
    "El proveedor de IA alcanzó su límite de capacidad. Esta solicitud no puede reintentarse automáticamente.",
  BUDGET_LIMIT_REACHED:
    "Se alcanzó el límite de presupuesto configurado para generación por IA.",
  UNSUPPORTED_LANGUAGE:
    "El idioma especificado no está soportado por el modelo seleccionado.",
};
const TERMINAL_FAILURE_DEFAULT_MESSAGE =
  "La generación no pudo completarse de forma permanente. Contacta al soporte si el problema persiste.";

function translateTerminalFailureCode(failureCode: string | undefined): string {
  if (!failureCode) return TERMINAL_FAILURE_DEFAULT_MESSAGE;
  return TERMINAL_FAILURE_CODE_MESSAGES[failureCode] ?? TERMINAL_FAILURE_DEFAULT_MESSAGE;
}

export default function DraftBuilderPage({ params }: DraftBuilderPageProps) {
  const { id } = use(params);

  useShellConfig({
    title: "Draft de la evaluación",
    subtitle: "Revisa, edita y regenera el borrador generado por IA",
  });

  const page = useAssessmentDraftBuilderPage(id);

  if (page.status === "loading") {
    return <p role="status">Cargando…</p>;
  }

  if (page.status === "not-found") {
    return (
      <div style={{ maxWidth: "var(--content-max)", textAlign: "center", padding: "48px 16px" }}>
        <p role="alert" style={{ fontSize: "var(--text-lg)", color: "var(--text-strong)", margin: "0 0 16px" }}>
          {NOT_FOUND_MESSAGE}
        </p>
        <Link
          href="/assessments"
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            height: 40,
            padding: "0 16px",
            borderRadius: "var(--radius-md)",
            background: "var(--brand)",
            color: "#fff",
            fontFamily: "var(--font-sans)",
            fontWeight: 500,
            textDecoration: "none",
          }}
        >
          Volver al listado
        </Link>
      </div>
    );
  }

  if (page.status === "error") {
    return <p role="alert">{page.error}</p>;
  }

  // Reached whenever the assessment exists but has no current revision yet — resolved via
  // generation-status instead of the old bare "not found" (Research 02 §5.6's demonstrated
  // dead end; see useAssessmentDraftBuilderPage's loadPage()).
  if (page.status === "generation-not-started") {
    return (
      <CenteredStatePanel
        role="status"
        message="Aún no se ha generado un borrador para esta evaluación."
        errorMessage={page.data.generateError}
        action={{
          label: "Generar borrador",
          loadingLabel: "Generando…",
          loading: page.data.isGenerating,
          onClick: page.data.onGenerate,
        }}
      />
    );
  }

  if (page.status === "generation-in-progress") {
    // No retry action here by design — offering one would risk a double-dispatch of a
    // possibly still-running attempt (LOCAL-CONTRACTS.md § Canonical failure-code taxonomy,
    // OPERATION_IN_PROGRESS).
    return <CenteredStatePanel role="status" message="Generando el borrador… esto puede tardar hasta un minuto." />;
  }

  if (page.status === "generation-failed") {
    return (
      <CenteredStatePanel
        role="alert"
        message="No pudimos generar el borrador."
        errorMessage={page.data.retryError}
        action={{
          label: "Reintentar",
          loadingLabel: "Reintentando…",
          loading: page.data.isRetrying,
          onClick: page.data.onRetry,
        }}
      />
    );
  }

  // A permanent, non-retryable failure — no retry button is shown. Visual and semantic
  // distinction from FAILED_RETRYABLE: the teacher sees why it failed (via a safe translation)
  // and that they cannot retry from here. Must not redirect to not-found (the assessment exists)
  // and must not fall into the generic error block (this is a known, expected state).
  if (page.status === "generation-failed-terminal") {
    const terminalFailureMessage = translateTerminalFailureCode(page.data.failureCode);
    return (
      <CenteredStatePanel
        role="alert"
        message="La generación del borrador no pudo completarse."
        errorMessage={terminalFailureMessage}
      />
    );
  }

  if (page.status === "generation-indeterminate") {
    return (
      <CenteredStatePanel
        role="alert"
        message="No pudimos confirmar el estado de la generación. Puedes reintentar, pero podría duplicar un intento anterior."
        errorMessage={page.data.retryError}
        action={{
          label: "Reintentar de todas formas",
          loadingLabel: "Reintentando…",
          loading: page.data.isRetrying,
          onClick: page.data.onRetry,
        }}
      />
    );
  }

  const { data } = page;
  const isBlockedByConflict = Boolean(data.staleConflict);

  return (
    <div style={{ maxWidth: "var(--content-max)", display: "flex", flexDirection: "column", gap: 32 }}>
      {data.staleConflict && (
        <div
          role="alert"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            gap: 16,
            padding: "12px 16px",
            borderRadius: "var(--radius-md)",
            border: "1px solid var(--warning-200)",
            background: "var(--warning-50)",
            color: "var(--warning-700)",
            fontSize: "var(--text-sm)",
          }}
        >
          <span>{data.staleConflict.message}</span>
          <Button variant="outline" size="sm" onClick={data.staleConflict.onReload}>
            Recargar
          </Button>
        </div>
      )}
      <DraftEditorSection
        draft={data.draft}
        isReadOnly={data.isViewingHistoricalVersion || isBlockedByConflict}
        isSaving={data.isSaving}
        fieldErrors={data.saveFieldErrors}
        serverError={data.saveServerError}
        onSave={data.onSave}
      />
      <RegenerateSection
        isRegenerating={data.isRegenerating}
        fieldError={data.regenerateFieldError}
        agentError={data.regenerateAgentError}
        onRegenerate={data.onRegenerate}
        disabled={isBlockedByConflict}
      />
      <VersionHistorySection versions={data.versions} selectedVersion={data.selectedVersion} onViewVersion={data.onViewVersion} />
    </div>
  );
}

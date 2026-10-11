"use client";

import { useMemo, useState } from "react";
import { useDemoState, type DemoState } from "@/components/shell/ShellContext";
import {
  DATE_OPTIONS,
  OPERATIONS,
  QUEUES,
  type DemoInboxState,
  type DemoOperation,
  type DueDateFilter,
  type OperationsQueue,
} from "./data";

export interface InboxFilters {
  className: string;
  subject: string;
  status: string;
  date: DueDateFilter;
}

export const DEFAULT_INBOX_FILTERS: InboxFilters = {
  className: "Todas las clases",
  subject: "Todas las asignaturas",
  status: "Todos los estados",
  date: "all",
};

export function useOperationsInbox() {
  const [activeQueue, setActiveQueue] = useState<OperationsQueue>(() => getContextFromUrl().queue);
  const [filters, setFilters] = useState<InboxFilters>(() => getContextFromUrl().filters);
  const [search, setSearch] = useState(() => getContextFromUrl().search);
  const { demoState, setDemoState } = useDemoState();
  const [notice, setNotice] = useState(() => typeof window !== "undefined" && new URLSearchParams(window.location.search).has("returned") ? "Volviste a Operaciones; cola, búsqueda y filtros fueron restaurados." : "Datos de demostración · los cambios no se guardan.");
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionErrorId, setActionErrorId] = useState<string | null>(null);
  const [attempts, setAttempts] = useState<Record<string, number>>({});
  const [contextTarget, setContextTarget] = useState<DemoOperation | null>(null);

  function contextHref(operation: DemoOperation) {
    const params = new URLSearchParams({ queue: activeQueue, search, className: filters.className, subject: filters.subject, status: filters.status, date: filters.date, returnPath: operation.contextDestination.returnPath });
    return `${operation.contextDestination.href}${operation.contextDestination.href.includes("?") ? "&" : "?"}${params.toString()}`;
  }

  function destinationHref(operation: DemoOperation) {
    const params = new URLSearchParams({ queue: activeQueue, search, className: filters.className, subject: filters.subject, status: filters.status, date: filters.date, returnPath: operation.primaryDestination.returnPath });
    return `${operation.primaryDestination.href}${operation.primaryDestination.href.includes("?") ? "&" : "?"}${params.toString()}`;
  }

  const queueCounts = useMemo(() => Object.fromEntries(QUEUES.map((queue) => [queue.id, OPERATIONS.filter((item) => item.queue === queue.id).length])) as Record<OperationsQueue, number>, []);
  const visibleOperations = useMemo(() => {
    const normalizedSearch = search.trim().toLocaleLowerCase("es");
    return OPERATIONS.filter((operation) => {
      if (demoState === "empty") return false;
      if (operation.queue !== activeQueue) return false;
      if (filters.className !== "Todas las clases" && operation.className !== filters.className) return false;
      if (filters.subject !== "Todas las asignaturas" && operation.subject !== filters.subject) return false;
      if (filters.status !== "Todos los estados" && operation.status !== filters.status) return false;
      if (filters.date === "today" && operation.dueDateIso !== "2026-10-10") return false;
      if (filters.date === "overdue" && operation.dueDateIso >= "2026-10-10") return false;
      if (filters.date === "upcoming" && operation.dueDateIso <= "2026-10-10") return false;
      if (!normalizedSearch) return true;
      return [operation.title, operation.context, operation.className, operation.subject, operation.status].some((value) => value.toLocaleLowerCase("es").includes(normalizedSearch));
    });
  }, [activeQueue, demoState, filters, search]);

  const hasFilters = search.trim().length > 0 || Object.values(filters).some((value) => value !== "all" && !value.startsWith("Todas") && !value.startsWith("Todos"));

  function changeDemoState(nextState: DemoState) {
    setDemoState(nextState);
    setActionErrorId(null);
    setNotice(`Estado cambiado a ${nextState === "ready" ? "datos demo" : INBOX_STATE_LABELS[nextState]}.`);
  }

  function clearFilters() {
    setFilters(DEFAULT_INBOX_FILTERS);
    setSearch("");
    setNotice("Filtros y búsqueda limpiados.");
  }

  function openContext(operation: DemoOperation) {
    setContextTarget(operation);
    setNotice(`Contexto simulado abierto: ${operation.originPath}.`);
  }

  function returnToInbox() {
    setContextTarget(null);
    setNotice("Volviste a la bandeja; se conserva tu contexto de búsqueda.");
  }

  function runAction(operation: DemoOperation, isRetry = false) {
    if (demoState === "readonly" || demoState === "permission" || operation.access === "read-only") return;
    setActionErrorId(null);
    setActionLoadingId(operation.id);
    window.setTimeout(() => {
      const attempt = (attempts[operation.id] ?? 0) + 1;
      setAttempts((current) => ({ ...current, [operation.id]: attempt }));
      setActionLoadingId(null);
      if (operation.actionMode === "fails-once" && attempt === 1 && !isRetry) {
        setActionErrorId(operation.id);
        setNotice(`No pudimos completar “${operation.primaryAction}”. El contexto se conserva.`);
        return;
      }
      setNotice(`${operation.primaryAction} completada en modo demo. Destino: ${operation.primaryDestination.context}.`);
      if (process.env.NODE_ENV !== "test") window.location.assign(destinationHref(operation));
    }, 350);
  }

  return {
    activeQueue,
    setActiveQueue: (queue: OperationsQueue) => {
      setActiveQueue(queue);
      setActionErrorId(null);
    },
    filters,
    setFilters,
    search,
    setSearch,
    demoState,
    changeDemoState,
    queueCounts,
    visibleOperations,
    hasFilters,
    clearFilters,
    actionLoadingId,
    actionErrorId,
    contextTarget,
    openContext,
    returnToInbox,
    runAction,
    dateOptions: DATE_OPTIONS,
    notice,
    contextHref,
    destinationHref,
  };
}

function getContextFromUrl(): { queue: OperationsQueue; filters: InboxFilters; search: string } {
  if (typeof window === "undefined") return { queue: "review", filters: DEFAULT_INBOX_FILTERS, search: "" };
  const params = new URLSearchParams(window.location.search);
  const queue = params.get("queue");
  return {
    queue: queue === "prepare" || queue === "confirm" || queue === "approve" ? queue : "review",
    search: params.get("search") ?? "",
    filters: {
      className: params.get("className") ?? DEFAULT_INBOX_FILTERS.className,
      subject: params.get("subject") ?? DEFAULT_INBOX_FILTERS.subject,
      status: params.get("status") ?? DEFAULT_INBOX_FILTERS.status,
      date: (params.get("date") as DueDateFilter) ?? DEFAULT_INBOX_FILTERS.date,
    },
  };
}

const INBOX_STATE_LABELS: Record<Exclude<DemoInboxState, "ready">, string> = {
  loading: "carga",
  empty: "vacío global",
  error: "error de carga",
  readonly: "solo lectura",
  permission: "permisos insuficientes",
};

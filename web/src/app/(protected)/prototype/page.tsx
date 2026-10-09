"use client";

import TeacherOperationsPage from "@/features/teacher-operations-mock/TeacherOperationsPage";
import { useShellConfig } from "@/components/shell/ShellContext";

export default function TeacherOperationsPrototypePage() {
  useShellConfig({ title: "Operación docente", subtitle: "Consola de decisiones y evidencia" });
  return <TeacherOperationsPage />;
}

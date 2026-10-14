import AppShell from "@/components/shell/AppShell";
import { NAVIGATION_CONFIG } from "@/components/shell/NavigationConfig";
import PageNotFound from "@/components/shell/PageNotFound";

const ROUTE_LABEL_ALIASES: Record<string, string> = {
  calendario: "Calendario",
  calendar: "Calendario",
  recursos: "Recursos",
  resources: "Recursos",
  reportes: "Reportes",
  reports: "Reportes",
};

function getAreaLabel(requestedPath: string) {
  if (requestedPath === "/preview/assessments/new/questions") return "Preguntas";
  const navigationItem = NAVIGATION_CONFIG.find((item) => item.href === "/preview" ? requestedPath === item.href : requestedPath === item.href || requestedPath.startsWith(`${item.href}/`));
  if (navigationItem) return navigationItem.label;

  const segment = requestedPath.split("/").filter(Boolean).at(-1) ?? "Vista";
  return ROUTE_LABEL_ALIASES[segment.toLowerCase()] ?? segment.replace(/[-_]+/g, " ").replace(/^./, (character) => character.toUpperCase());
}

export default async function PreviewMissingRoute({ params }: { params: Promise<{ path: string[] }> }) {
  const { path } = await params;
  const requestedPath = `/preview/${path.join("/")}`;
  return <AppShell><PageNotFound requestedPath={requestedPath} areaLabel={getAreaLabel(requestedPath)} /></AppShell>;
}

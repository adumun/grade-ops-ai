import SubmissionListPage from "@/features/submissions-review/SubmissionListPage";

export default async function SubmissionsRoute({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const source = await searchParams;
  const query = new URLSearchParams();
  ["queue", "search", "className", "subject", "status", "date"].forEach((key) => { const value = source[key]; if (typeof value === "string" && value) query.set(key, value); });
  query.set("returnPath", "/preview/operations");
  return <SubmissionListPage returnQuery={query.toString()} />;
}

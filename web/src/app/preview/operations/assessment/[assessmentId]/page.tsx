import AssessmentEvidencePage from "@/features/assessment-evidence/AssessmentEvidencePage";

export default async function AssessmentEvidenceRoute({ params }: { params: Promise<{ assessmentId: string }> }) {
  const { assessmentId } = await params;
  return <AssessmentEvidencePage assessmentId={assessmentId} />;
}

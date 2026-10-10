import { redirect } from "next/navigation";

export default function RootPage() {
  const profile = process.env.NEXT_PUBLIC_GRADEOPS_PROFILE ?? process.env.WEB_PROFILE;

  redirect(profile === "local-preview" ? "/preview" : "/login");
}

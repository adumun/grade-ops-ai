import { ShellProvider } from "@/components/shell/ShellContext";

export default function PreviewLayout({ children }: { children: React.ReactNode }) {
  return <ShellProvider>{children}</ShellProvider>;
}

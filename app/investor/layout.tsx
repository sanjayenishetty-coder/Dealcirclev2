import InvestorShell from "@/components/layout/InvestorShell";

export default function InvestorLayout({ children }: { children: React.ReactNode }) {
  return <InvestorShell>{children}</InvestorShell>;
}

import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: "DealCircle — Curated Investment Deals",
  description: "Admin-curated investment deal marketplace for startup funding, SME investments, and debt opportunities.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        {children}
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: "#111827",
              border: "1px solid #1E2D45",
              color: "#F1F5F9",
            },
          }}
        />
      </body>
    </html>
  );
}

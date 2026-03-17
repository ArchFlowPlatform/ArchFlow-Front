import type { Metadata } from "next";

import AuthProviderWrapper from "@/components/providers/AuthProviderWrapper";
import GlobalLoadingOverlay from "@/components/ui/GlobalLoadingOverlay";
import "@/app/globals.css";

export const metadata: Metadata = {
  title: "ArchFlow",
  description: "ArchFlow - Architecture-driven project management",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/archflow-logo.png" type="image/png" />
      </head>
      <body
        className="min-h-screen bg-[#16171d] text-white antialiased"
        style={{
          fontFamily:
            'Satoshi, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, Helvetica, Arial, sans-serif, monospace',
        }}
      >
        <AuthProviderWrapper>
          {children}
          <GlobalLoadingOverlay />
        </AuthProviderWrapper>
      </body>
    </html>
  );
}

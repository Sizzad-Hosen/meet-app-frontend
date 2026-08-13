import type { Metadata } from "next";
import { AppProviders } from "@/providers/app-providers";
import "@livekit/components-styles";
import "./globals.css";

export const metadata: Metadata = {
  title: "Meet Apps",
  description: "Simple, secure video meetings",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-background text-foreground">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}

import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Medicine Tracker",
  description: "Advanced medicine stock management system",
};

import GoogleAuthWrapper from "@/components/GoogleAuthWrapper";

// ...
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <GoogleAuthWrapper>
          {children}
        </GoogleAuthWrapper>
      </body>
    </html>
  );
}

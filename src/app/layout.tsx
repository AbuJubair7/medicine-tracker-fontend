import type { ReactNode } from 'react';
import GoogleAuthWrapper from "@/components/GoogleAuthWrapper";

// ...
export default function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  return (
    <GoogleAuthWrapper>
      {children}
    </GoogleAuthWrapper>
  );
}

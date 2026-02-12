import Navbar from '@/components/Navbar';
import type { ReactNode } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div style={{ minHeight: '100vh', paddingBottom: '2rem' }}>
      <Navbar />
      <main style={{ padding: '0 1rem', maxWidth: '1200px', margin: '0 auto' }}>
        {children}
      </main>
    </div>
  );
}

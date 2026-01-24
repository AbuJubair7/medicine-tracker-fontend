import Link from "next/link";

export default function Home() {
  return (
    <main style={{
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      background: 'radial-gradient(circle at center, #1e1b4b 0%, #0a0b1e 100%)'
    }}>
      <div className="glass-panel animate-fade-in" style={{ padding: '3rem', textAlign: 'center', maxWidth: '500px' }}>
        <h1 style={{ fontSize: '3rem', marginBottom: '1rem', background: 'linear-gradient(to right, #a78bfa, #22d3ee)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Medicine Tracker
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.2rem' }}>
          Manage your stock with futuristic efficiency.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
          <Link href="/login" className="glass-button">
            Login
          </Link>
          <Link href="/signup" className="glass-button" style={{ background: 'transparent', border: '1px solid var(--accent-secondary)' }}>
            Sign Up
          </Link>
        </div>
      </div>
    </main>
  );
}

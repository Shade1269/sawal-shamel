import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40">
      <div className="h-0.5 bg-gradient-to-r from-primary via-anaqati-gold to-primary" />
      <nav className="bg-white/80 backdrop-blur-md border-b border-anaqati-border px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-wide text-primary">
            سوال شامل
          </Link>
          <div className="hidden md:flex gap-6 text-sm text-anaqati-text-secondary">
            <Link to="/store" className="hover:text-primary transition-colors">
              المتجر
            </Link>
            <Link to="/alliances" className="hover:text-primary transition-colors">
              التحالفات
            </Link>
            <Link to="/leaderboard" className="hover:text-primary transition-colors">
              المتصدرون
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/account" className="text-sm text-anaqati-text-secondary hover:text-primary transition-colors">
              حسابي
            </Link>
            <Link
              to="/cart"
              className="ml-2 rounded-xl px-4 py-2 bg-primary text-white hover:bg-anaqati-burgundy-hover transition-colors font-medium"
            >
              السلة
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

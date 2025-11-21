import { Link } from 'react-router-dom';

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40">
      <div className="h-0.5 bg-gradient-primary" />
      <nav className="bg-card/30 backdrop-blur-md border-b border-border/50 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto flex h-16 items-center justify-between">
          <Link to="/" className="text-lg font-semibold tracking-wide">
            سوال شامل
          </Link>
          <div className="hidden md:flex gap-6 text-sm text-muted-foreground">
            <Link to="/store" className="hover:text-foreground">
              المتجر
            </Link>
            <Link to="/alliances" className="hover:text-foreground">
              التحالفات
            </Link>
            <Link to="/leaderboard" className="hover:text-foreground">
              المتصدرون
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <Link to="/account" className="text-sm hover:text-foreground">
              حسابي
            </Link>
            <Link
              to="/cart"
              className="ml-2 rounded-xl px-3 py-2 bg-white/5 hover:bg-white/10 border border-white/10"
            >
              السلة
            </Link>
          </div>
        </div>
      </nav>
    </header>
  );
}

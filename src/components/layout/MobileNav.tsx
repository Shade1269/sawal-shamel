import { Link, useLocation } from 'react-router-dom';

const tabs = [
  { to: '/', label: 'الرئيسية' },
  { to: '/store', label: 'المتجر' },
  { to: '/search', label: 'بحث' },
  { to: '/cart', label: 'السلة' },
];

export default function MobileNav() {
  const { pathname } = useLocation();
  return (
    <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-glass rounded-2xl backdrop-blur px-2 py-1 border border-white/10">
      <ul className="flex justify-between">
        {tabs.map((tab) => {
          const active = pathname === tab.to;
          return (
            <li key={tab.to}>
              <Link
                to={tab.to}
                className={`px-3 py-2 rounded-xl text-sm ${
                  active ? 'bg-white/10 border border-white/10' : 'text-muted-foreground'
                }`}
              >
                {tab.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

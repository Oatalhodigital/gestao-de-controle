'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LayoutDashboard, Wallet, CreditCard, GraduationCap, Target, Settings, LogOut, Gamepad2 } from 'lucide-react';

const menu = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/incomes', label: 'Receitas', icon: Wallet },
  { href: '/expenses', label: 'Despesas', icon: Wallet },
  { href: '/credit-cards', label: 'Cartões', icon: CreditCard },
  { href: '/tuitions', label: 'Mensalidades', icon: GraduationCap },
  { href: '/betting', label: 'Apostas', icon: Gamepad2 },
  { href: '/goals', label: 'Metas', icon: Target },
  { href: '/settings', label: 'Configurações', icon: Settings },
];

export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) router.push('/login');
    else setLoading(false);
  }, [router]);

  function logout() {
    localStorage.removeItem('token');
    router.push('/login');
  }

  if (loading) return <div className="p-8">Carregando...</div>;

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      <aside className="w-full md:w-64 bg-primary text-white p-4 flex flex-col">
        <div className="text-xl font-bold mb-8 px-2">FinançasPro</div>
        <nav className="flex-1 space-y-1">
          {menu.map((m) => (
            <Link key={m.href} href={m.href} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-slate-800">
              <m.icon className="w-5 h-5" />
              {m.label}
            </Link>
          ))}
        </nav>
        <button onClick={logout} className="flex items-center gap-3 px-2 py-2 rounded hover:bg-slate-800 mt-4">
          <LogOut className="w-5 h-5" />
          Sair
        </button>
      </aside>
      <main className="flex-1 p-4 md:p-8 overflow-auto">{children}</main>
    </div>
  );
}

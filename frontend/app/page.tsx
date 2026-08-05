'use client';

import Link from 'next/link';
import { Wallet, PieChart, TrendingUp, Shield, Smartphone, CreditCard } from 'lucide-react';

export default function LandingPage() {
  return (
    <main className="bg-white">
      <header className="border-b px-6 py-4 flex items-center justify-between max-w-6xl mx-auto">
        <div className="flex items-center gap-2 font-bold text-xl text-slate-900">
          <Wallet className="w-6 h-6 text-accent" />
          FinançasPro
        </div>
        <div className="flex gap-4">
          <Link href="/login" className="px-4 py-2 text-slate-600 hover:text-slate-900">Entrar</Link>
          <Link href="/register" className="px-4 py-2 bg-accent text-white rounded-lg hover:bg-blue-600">Cadastrar</Link>
        </div>
      </header>

      <section className="py-20 px-6 text-center max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-6">
          Controle total da sua vida financeira
        </h1>
        <p className="text-lg text-slate-600 mb-8">
          Receitas, despesas, cartões, mensalidades e até controle de apostas em um só lugar. Multi-tenant e pronto para SaaS.
        </p>
        <div className="flex justify-center gap-4">
          <Link href="/register" className="px-6 py-3 bg-accent text-white rounded-lg font-semibold hover:bg-blue-600">
            Começar grátis
          </Link>
          <Link href="/login" className="px-6 py-3 border rounded-lg font-semibold hover:bg-slate-50">
            Ver demonstração
          </Link>
        </div>
      </section>

      <section className="py-16 bg-slate-50 px-6">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          <FeatureCard icon={<PieChart />} title="Dashboard mensal" desc="Veja receitas, despesas e saldo de um jeito visual e simples." />
          <FeatureCard icon={<CreditCard />} title="Cartão de crédito" desc="Fatura, parcelas e limite disponível sempre atualizados." />
          <FeatureCard icon={<TrendingUp />} title="Metas e apostas" desc="Acompanhe seu bankroll, meta diária e ROI com gráficos." />
          <FeatureCard icon={<Shield />} title="Multi-tenant" desc="Dados isolados por usuário, pronto para vender como SaaS." />
          <FeatureCard icon={<Smartphone />} title="Mobile-first" desc="Lance dados rapidamente pelo celular, de onde estiver." />
          <FeatureCard icon={<Wallet />} title="Módulos configuráveis" desc="Ative apenas o que precisa, como um app de assinatura." />
        </div>
      </section>

      <footer className="py-8 text-center text-slate-500 text-sm">
        &copy; 2026 FinançasPro. Todos os direitos reservados.
      </footer>
    </main>
  );
}

function FeatureCard({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border">
      <div className="w-10 h-10 flex items-center justify-center bg-blue-50 text-accent rounded-lg mb-4">{icon}</div>
      <h3 className="font-bold text-lg mb-2">{title}</h3>
      <p className="text-slate-600">{desc}</p>
    </div>
  );
}

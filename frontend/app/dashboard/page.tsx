'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

export default function DashboardPage() {
  const [incomes, setIncomes] = useState<any[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [cards, setCards] = useState<any[]>([]);
  const [tuitions, setTuitions] = useState<any[]>([]);

  const month = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    api.get('/incomes?month=' + month).then((r) => setIncomes(r.data));
    api.get('/expenses?month=' + month).then((r) => setExpenses(r.data));
    api.get('/credit-cards').then((r) => setCards(r.data));
    api.get('/tuitions').then((r) => setTuitions(r.data));
  }, [month]);

  const totalIncome = incomes.reduce((sum, i) => sum + Number(i.amount), 0);
  const totalExpense = expenses.reduce((sum, e) => sum + Number(e.amount), 0);
  const balance = totalIncome - totalExpense;

  const expenseByCategory: Record<string, number> = {};
  expenses.forEach((e) => {
    const key = e.category?.name || 'Sem categoria';
    expenseByCategory[key] = (expenseByCategory[key] || 0) + Number(e.amount);
  });
  const pieData = Object.entries(expenseByCategory).map(([name, value]) => ({ name, value }));
  const colors = ['#ef4444', '#f97316', '#eab308', '#22c55e', '#3b82f6', '#8b5cf6'];

  const upcoming = expenses.filter((e) => !e.paid && e.dueDate && new Date(e.dueDate) >= new Date());

  return (
    <ProtectedLayout>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <SummaryCard title="Receitas" value={totalIncome} color="text-success" />
        <SummaryCard title="Despesas" value={totalExpense} color="text-danger" />
        <SummaryCard title="Saldo" value={balance} color={balance >= 0 ? 'text-accent' : 'text-danger'} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="font-bold mb-4">Despesas por categoria</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80}>
                  {pieData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="font-bold mb-4">Contas a vencer</h2>
          {upcoming.length === 0 ? (
            <p className="text-slate-500">Nenhuma conta pendente.</p>
          ) : (
            <ul className="space-y-2">
              {upcoming.map((e) => (
                <li key={e.id} className="flex justify-between border-b pb-2">
                  <span>{e.description}</span>
                  <span className="font-semibold">R$ {Number(e.amount).toFixed(2)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="font-bold mb-4">Cartões de crédito</h2>
          {cards.map((c) => (
            <div key={c.id} className="mb-3 border-b pb-2">
              <div className="flex justify-between font-semibold">
                <span>{c.name}</span>
                <span>R$ {c.transactions.reduce((s: number, t: any) => s + Number(t.amount), 0).toFixed(2)}</span>
              </div>
              <p className="text-sm text-slate-500">Limite: R$ {Number(c.limitAmount).toFixed(2)}</p>
            </div>
          ))}
        </div>

        <div className="bg-white p-6 rounded-xl border shadow-sm">
          <h2 className="font-bold mb-4">Mensalidades</h2>
          {tuitions.map((t) => (
            <div key={t.id} className="mb-2 border-b pb-2 flex justify-between">
              <span>{t.institution}</span>
              <span className={t.paid ? 'text-success' : 'text-danger'}>{t.paid ? 'Pago' : 'Pendente'}</span>
            </div>
          ))}
        </div>
      </div>
    </ProtectedLayout>
  );
}

function SummaryCard({ title, value, color }: { title: string; value: number; color: string }) {
  return (
    <div className="bg-white p-6 rounded-xl border shadow-sm">
      <p className="text-slate-500 text-sm">{title}</p>
      <p className={`text-3xl font-bold ${color}`}>R$ {value.toFixed(2)}</p>
    </div>
  );
}

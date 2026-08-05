'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function BettingPage() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [bankrollForm, setBankrollForm] = useState({ initialCapital: '', dailyGoal: '' });
  const [entryForm, setEntryForm] = useState({ date: new Date().toISOString().slice(0, 10), stakeAmount: '', resultAmount: '', notes: '' });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await api.get('/betting/dashboard');
    setDashboard(data);
  }

  async function createBankroll(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/betting/bankroll', {
      initialCapital: Number(bankrollForm.initialCapital),
      dailyGoal: Number(bankrollForm.dailyGoal),
    });
    setBankrollForm({ initialCapital: '', dailyGoal: '' });
    load();
  }

  async function addEntry(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/betting/entries', {
      ...entryForm,
      stakeAmount: Number(entryForm.stakeAmount),
      resultAmount: Number(entryForm.resultAmount),
      date: new Date(entryForm.date),
    });
    setEntryForm({ date: new Date().toISOString().slice(0, 10), stakeAmount: '', resultAmount: '', notes: '' });
    load();
  }

  if (!dashboard) return <ProtectedLayout><div className="p-8">Carregando...</div></ProtectedLayout>;

  if (!dashboard.bankroll) {
    return (
      <ProtectedLayout>
        <h1 className="text-2xl font-bold mb-6">Controle de Apostas</h1>
        <form onSubmit={createBankroll} className="bg-white p-6 rounded-xl border shadow-sm max-w-md grid gap-4">
          <h2 className="font-bold">Configurar bankroll</h2>
          <input type="number" step="0.01" placeholder="Capital inicial" value={bankrollForm.initialCapital} onChange={(e) => setBankrollForm({ ...bankrollForm, initialCapital: e.target.value })} className="border rounded px-3 py-2" required />
          <input type="number" step="0.01" placeholder="Meta diária" value={bankrollForm.dailyGoal} onChange={(e) => setBankrollForm({ ...bankrollForm, dailyGoal: e.target.value })} className="border rounded px-3 py-2" required />
          <button className="bg-accent text-white rounded px-4 py-2 font-semibold">Criar bankroll</button>
        </form>
      </ProtectedLayout>
    );
  }

  const colorMap: Record<string, string> = { green: 'bg-success', yellow: 'bg-warning', red: 'bg-danger' };
  const statusText: Record<string, string> = { green: 'Acima ou na meta', yellow: 'Abaixo da meta', red: 'Prejuízo' };

  return (
    <ProtectedLayout>
      <h1 className="text-2xl font-bold mb-6">Controle de Apostas</h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-slate-500 text-sm">Saldo atual</p>
          <p className="text-2xl font-bold text-accent">R$ {dashboard.bankroll.currentBalance.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-slate-500 text-sm">Lucro do dia</p>
          <p className="text-2xl font-bold" style={{ color: dashboard.todayProfit >= dashboard.bankroll.dailyGoal ? '#22c55e' : dashboard.todayProfit > 0 ? '#eab308' : '#ef4444' }}>
            R$ {dashboard.todayProfit.toFixed(2)}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-slate-500 text-sm">Meta diária</p>
          <p className="text-2xl font-bold">R$ {dashboard.bankroll.dailyGoal.toFixed(2)}</p>
        </div>
        <div className={`p-4 rounded-xl border shadow-sm text-white ${colorMap[dashboard.statusColor]}`}>
          <p className="text-sm opacity-90">Status</p>
          <p className="text-xl font-bold">{statusText[dashboard.statusColor]}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-slate-500 text-sm">Total apostado</p>
          <p className="text-xl font-bold">R$ {dashboard.totalStaked.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-slate-500 text-sm">Total lucrado</p>
          <p className={`text-xl font-bold ${dashboard.totalProfit >= 0 ? 'text-success' : 'text-danger'}`}>R$ {dashboard.totalProfit.toFixed(2)}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border shadow-sm">
          <p className="text-slate-500 text-sm">ROI</p>
          <p className={`text-xl font-bold ${dashboard.roi >= 0 ? 'text-success' : 'text-danger'}`}>{dashboard.roi}%</p>
        </div>
      </div>

      <form onSubmit={addEntry} className="bg-white p-4 rounded-xl border shadow-sm mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input type="date" value={entryForm.date} onChange={(e) => setEntryForm({ ...entryForm, date: e.target.value })} className="border rounded px-3 py-2" />
        <input type="number" step="0.01" placeholder="Valor apostado" value={entryForm.stakeAmount} onChange={(e) => setEntryForm({ ...entryForm, stakeAmount: e.target.value })} className="border rounded px-3 py-2" required />
        <input type="number" step="0.01" placeholder="Retorno" value={entryForm.resultAmount} onChange={(e) => setEntryForm({ ...entryForm, resultAmount: e.target.value })} className="border rounded px-3 py-2" required />
        <input placeholder="Notas" value={entryForm.notes} onChange={(e) => setEntryForm({ ...entryForm, notes: e.target.value })} className="border rounded px-3 py-2" />
        <button className="bg-accent text-white rounded px-4 py-2 font-semibold">Registrar aposta</button>
      </form>

      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
        <h2 className="font-bold mb-4">Evolução do bankroll</h2>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dashboard.history}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="balance" name="Saldo" stroke="#3b82f6" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="target" name="Meta ideal" stroke="#22c55e" strokeDasharray="5 5" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </ProtectedLayout>
  );
}

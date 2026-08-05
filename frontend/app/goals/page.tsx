'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';

export default function GoalsPage() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ module: '', targetAmount: '', period: 'monthly', startDate: new Date().toISOString().slice(0, 10), active: true });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await api.get('/goals');
    setList(data);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/goals', { ...form, targetAmount: Number(form.targetAmount), startDate: new Date(form.startDate) });
    setForm({ module: '', targetAmount: '', period: 'monthly', startDate: new Date().toISOString().slice(0, 10), active: true });
    load();
  }

  async function remove(id: string) {
    await api.delete('/goals/' + id);
    load();
  }

  return (
    <ProtectedLayout>
      <h1 className="text-2xl font-bold mb-6">Metas Financeiras</h1>
      <form onSubmit={submit} className="bg-white p-4 rounded-xl border shadow-sm mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input placeholder="Módulo" value={form.module} onChange={(e) => setForm({ ...form, module: e.target.value })} className="border rounded px-3 py-2" required />
        <input type="number" step="0.01" placeholder="Valor da meta" value={form.targetAmount} onChange={(e) => setForm({ ...form, targetAmount: e.target.value })} className="border rounded px-3 py-2" required />
        <select value={form.period} onChange={(e) => setForm({ ...form, period: e.target.value })} className="border rounded px-3 py-2">
          <option value="daily">Diária</option>
          <option value="weekly">Semanal</option>
          <option value="monthly">Mensal</option>
        </select>
        <input type="date" value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} className="border rounded px-3 py-2" />
        <button className="bg-accent text-white rounded px-4 py-2 font-semibold">Criar meta</button>
      </form>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr><th className="text-left p-3">Módulo</th><th className="text-left p-3">Período</th><th className="text-right p-3">Valor</th><th className="text-center p-3">Ativa</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {list.map((g) => (
              <tr key={g.id} className="border-t">
                <td className="p-3">{g.module}</td>
                <td className="p-3 capitalize">{g.period}</td>
                <td className="p-3 text-right font-semibold">R$ {Number(g.targetAmount).toFixed(2)}</td>
                <td className="p-3 text-center">{g.active ? 'Sim' : 'Não'}</td>
                <td className="p-3 text-center">
                  <button onClick={() => remove(g.id)} className="text-slate-400 hover:text-danger">x</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedLayout>
  );
}

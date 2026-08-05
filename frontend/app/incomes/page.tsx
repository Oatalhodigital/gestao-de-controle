'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';

export default function IncomesPage() {
  const [list, setList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({ description: '', amount: '', date: new Date().toISOString().slice(0, 10), categoryId: '', recurring: false });
  const month = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    load();
    api.get('/categories').then((r) => setCategories(r.data.filter((c: any) => c.type === 'income')));
  }, []);

  async function load() {
    const { data } = await api.get('/incomes?month=' + month);
    setList(data);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/incomes', { ...form, amount: Number(form.amount), date: new Date(form.date) });
    setForm({ description: '', amount: '', date: new Date().toISOString().slice(0, 10), categoryId: '', recurring: false });
    load();
  }

  return (
    <ProtectedLayout>
      <h1 className="text-2xl font-bold mb-6">Receitas</h1>
      <form onSubmit={submit} className="bg-white p-4 rounded-xl border shadow-sm mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
        <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border rounded px-3 py-2" />
        <input type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="border rounded px-3 py-2" required />
        <input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} className="border rounded px-3 py-2" />
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="border rounded px-3 py-2">
          <option value="">Categoria</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} />
          Recorrente
        </label>
        <button className="bg-success text-white rounded px-4 py-2 font-semibold">Adicionar</button>
      </form>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr><th className="text-left p-3">Descrição</th><th className="text-left p-3">Data</th><th className="text-left p-3">Categoria</th><th className="text-right p-3">Valor</th></tr>
          </thead>
          <tbody>
            {list.map((i) => (
              <tr key={i.id} className="border-t">
                <td className="p-3">{i.description}</td>
                <td className="p-3">{new Date(i.date).toLocaleDateString('pt-BR')}</td>
                <td className="p-3">{i.category?.name}</td>
                <td className="p-3 text-right text-success font-semibold">R$ {Number(i.amount).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedLayout>
  );
}

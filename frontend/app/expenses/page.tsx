'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';

export default function ExpensesPage() {
  const [list, setList] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [form, setForm] = useState({
    description: '',
    amount: '',
    dueDate: new Date().toISOString().slice(0, 10),
    categoryId: '',
    paymentMethod: 'pix',
    paid: false,
    recurring: false,
  });
  const month = new Date().toISOString().slice(0, 7);

  useEffect(() => {
    load();
    api.get('/categories').then((r) => setCategories(r.data.filter((c: any) => c.type === 'expense')));
  }, []);

  async function load() {
    const { data } = await api.get('/expenses?month=' + month);
    setList(data);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/expenses', {
      ...form,
      amount: Number(form.amount),
      dueDate: new Date(form.dueDate),
    });
    setForm({ description: '', amount: '', dueDate: new Date().toISOString().slice(0, 10), categoryId: '', paymentMethod: 'pix', paid: false, recurring: false });
    load();
  }

  async function pay(id: string) {
    await api.put('/expenses/' + id, { paid: true });
    load();
  }

  async function remove(id: string) {
    await api.delete('/expenses/' + id);
    load();
  }

  return (
    <ProtectedLayout>
      <h1 className="text-2xl font-bold mb-6">Despesas</h1>
      <form onSubmit={submit} className="bg-white p-4 rounded-xl border shadow-sm mb-6 grid grid-cols-1 md:grid-cols-8 gap-3">
        <input placeholder="Descrição" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="border rounded px-3 py-2" />
        <input type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="border rounded px-3 py-2" required />
        <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="border rounded px-3 py-2" />
        <select value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className="border rounded px-3 py-2">
          <option value="">Categoria</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select value={form.paymentMethod} onChange={(e) => setForm({ ...form, paymentMethod: e.target.value })} className="border rounded px-3 py-2">
          <option value="pix">Pix</option>
          <option value="dinheiro">Dinheiro</option>
          <option value="cartao">Cartão</option>
        </select>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.paid} onChange={(e) => setForm({ ...form, paid: e.target.checked })} />
          Pago
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" checked={form.recurring} onChange={(e) => setForm({ ...form, recurring: e.target.checked })} />
          Fixo
        </label>
        <button className="bg-danger text-white rounded px-4 py-2 font-semibold">Adicionar</button>
      </form>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="text-left p-3">Descrição</th>
              <th className="text-left p-3">Vencimento</th>
              <th className="text-left p-3">Categoria</th>
              <th className="text-right p-3">Valor</th>
              <th className="text-center p-3">Pago</th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {list.map((e) => (
              <tr key={e.id} className="border-t">
                <td className="p-3">{e.description}</td>
                <td className="p-3">{e.dueDate ? new Date(e.dueDate).toLocaleDateString('pt-BR') : '-'}</td>
                <td className="p-3">{e.category?.name}</td>
                <td className="p-3 text-right text-danger font-semibold">R$ {Number(e.amount).toFixed(2)}</td>
                <td className="p-3 text-center">
                  {e.paid ? 'Sim' : <button onClick={() => pay(e.id)} className="text-accent hover:underline">Pagar</button>}
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => remove(e.id)} className="text-slate-400 hover:text-danger">x</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedLayout>
  );
}

'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';

export default function TuitionsPage() {
  const [list, setList] = useState<any[]>([]);
  const [form, setForm] = useState({ institution: '', amount: '', dueDate: new Date().toISOString().slice(0, 10) });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await api.get('/tuitions');
    setList(data);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/tuitions', { ...form, amount: Number(form.amount), dueDate: new Date(form.dueDate) });
    setForm({ institution: '', amount: '', dueDate: new Date().toISOString().slice(0, 10) });
    load();
  }

  async function pay(id: string) {
    await api.put('/tuitions/' + id + '/pay', {});
    load();
  }

  async function remove(id: string) {
    await api.delete('/tuitions/' + id);
    load();
  }

  return (
    <ProtectedLayout>
      <h1 className="text-2xl font-bold mb-6">Faculdade / Mensalidades</h1>
      <form onSubmit={submit} className="bg-white p-4 rounded-xl border shadow-sm mb-6 grid grid-cols-1 md:grid-cols-4 gap-3">
        <input placeholder="Instituição" value={form.institution} onChange={(e) => setForm({ ...form, institution: e.target.value })} className="border rounded px-3 py-2" required />
        <input type="number" step="0.01" placeholder="Valor" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} className="border rounded px-3 py-2" required />
        <input type="date" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} className="border rounded px-3 py-2" />
        <button className="bg-accent text-white rounded px-4 py-2 font-semibold">Adicionar</button>
      </form>

      <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr><th className="text-left p-3">Instituição</th><th className="text-left p-3">Vencimento</th><th className="text-right p-3">Valor</th><th className="text-center p-3">Status</th><th className="p-3"></th></tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="border-t">
                <td className="p-3">{t.institution}</td>
                <td className="p-3">{new Date(t.dueDate).toLocaleDateString('pt-BR')}</td>
                <td className="p-3 text-right font-semibold">R$ {Number(t.amount).toFixed(2)}</td>
                <td className="p-3 text-center">
                  {t.paid ? <span className="text-success">Pago</span> : <button onClick={() => pay(t.id)} className="text-danger hover:underline">Pendente</button>}
                </td>
                <td className="p-3 text-center">
                  <button onClick={() => remove(t.id)} className="text-slate-400 hover:text-danger">x</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ProtectedLayout>
  );
}

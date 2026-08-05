'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';

export default function SettingsPage() {
  const [modules, setModules] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [catForm, setCatForm] = useState({ name: '', type: 'expense', color: '#3b82f6' });

  useEffect(() => {
    api.get('/modules').then((r) => setModules(r.data));
    api.get('/categories').then((r) => setCategories(r.data));
  }, []);

  async function toggleModule(id: string, active: boolean) {
    await api.put('/modules/' + id, { active });
    const { data } = await api.get('/modules');
    setModules(data);
  }

  async function addCategory(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/categories', catForm);
    setCatForm({ name: '', type: 'expense', color: '#3b82f6' });
    const { data } = await api.get('/categories');
    setCategories(data);
  }

  async function removeCategory(id: string) {
    await api.delete('/categories/' + id);
    const { data } = await api.get('/categories');
    setCategories(data);
  }

  return (
    <ProtectedLayout>
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <div className="bg-white p-6 rounded-xl border shadow-sm mb-6">
        <h2 className="font-bold text-lg mb-4">Módulos ativos</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {modules.map((m) => (
            <label key={m.id} className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <p className="font-semibold">{m.name}</p>
                <p className="text-sm text-slate-500">{m.description}</p>
              </div>
              <input
                type="checkbox"
                checked={m.active}
                onChange={(e) => toggleModule(m.id, e.target.checked)}
                className="w-5 h-5 accent-blue-600"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="bg-white p-6 rounded-xl border shadow-sm">
        <h2 className="font-bold text-lg mb-4">Categorias</h2>
        <form onSubmit={addCategory} className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4">
          <input placeholder="Nome" value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} className="border rounded px-3 py-2" required />
          <select value={catForm.type} onChange={(e) => setCatForm({ ...catForm, type: e.target.value })} className="border rounded px-3 py-2">
            <option value="expense">Despesa</option>
            <option value="income">Receita</option>
          </select>
          <input type="color" value={catForm.color} onChange={(e) => setCatForm({ ...catForm, color: e.target.value })} className="border rounded h-10" />
          <button className="bg-accent text-white rounded px-4 py-2 font-semibold">Adicionar categoria</button>
        </form>

        <div className="overflow-hidden border rounded-lg">
          <table className="w-full text-sm">
            <thead className="bg-slate-100">
              <tr><th className="text-left p-3">Nome</th><th className="text-left p-3">Tipo</th><th className="text-left p-3">Cor</th><th className="p-3"></th></tr>
            </thead>
            <tbody>
              {categories.map((c) => (
                <tr key={c.id} className="border-t">
                  <td className="p-3">{c.name}</td>
                  <td className="p-3 capitalize">{c.type === 'income' ? 'Receita' : 'Despesa'}</td>
                  <td className="p-3"><div className="w-6 h-6 rounded" style={{ background: c.color }}></div></td>
                  <td className="p-3 text-center">
                    <button onClick={() => removeCategory(c.id)} className="text-slate-400 hover:text-danger">x</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </ProtectedLayout>
  );
}

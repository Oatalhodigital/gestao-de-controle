'use client';

import { useEffect, useState } from 'react';
import ProtectedLayout from '@/components/ProtectedLayout';
import api from '@/lib/api';

export default function CreditCardsPage() {
  const [cards, setCards] = useState<any[]>([]);
  const [cardForm, setCardForm] = useState({ name: '', limitAmount: '', closingDay: '', dueDay: '' });
  const [txForm, setTxForm] = useState({ cardId: '', description: '', amount: '', installments: '1', date: new Date().toISOString().slice(0, 10) });

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const { data } = await api.get('/credit-cards');
    setCards(data);
  }

  async function addCard(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/credit-cards', {
      ...cardForm,
      limitAmount: Number(cardForm.limitAmount),
      closingDay: Number(cardForm.closingDay),
      dueDay: Number(cardForm.dueDay),
    });
    setCardForm({ name: '', limitAmount: '', closingDay: '', dueDay: '' });
    load();
  }

  async function addTx(e: React.FormEvent) {
    e.preventDefault();
    await api.post('/credit-cards/transactions', {
      ...txForm,
      amount: Number(txForm.amount),
      installments: Number(txForm.installments),
      date: new Date(txForm.date),
    });
    setTxForm({ cardId: '', description: '', amount: '', installments: '1', date: new Date().toISOString().slice(0, 10) });
    load();
  }

  return (
    <ProtectedLayout>
      <h1 className="text-2xl font-bold mb-6">Cartões de Crédito</h1>

      <form onSubmit={addCard} className="bg-white p-4 rounded-xl border shadow-sm mb-6 grid grid-cols-1 md:grid-cols-5 gap-3">
        <input placeholder="Nome do cartão" value={cardForm.name} onChange={(e) => setCardForm({ ...cardForm, name: e.target.value })} className="border rounded px-3 py-2" required />
        <input type="number" step="0.01" placeholder="Limite" value={cardForm.limitAmount} onChange={(e) => setCardForm({ ...cardForm, limitAmount: e.target.value })} className="border rounded px-3 py-2" />
        <input type="number" placeholder="Dia fechamento" value={cardForm.closingDay} onChange={(e) => setCardForm({ ...cardForm, closingDay: e.target.value })} className="border rounded px-3 py-2" />
        <input type="number" placeholder="Dia vencimento" value={cardForm.dueDay} onChange={(e) => setCardForm({ ...cardForm, dueDay: e.target.value })} className="border rounded px-3 py-2" />
        <button className="bg-accent text-white rounded px-4 py-2 font-semibold">Adicionar cartão</button>
      </form>

      <form onSubmit={addTx} className="bg-white p-4 rounded-xl border shadow-sm mb-6 grid grid-cols-1 md:grid-cols-6 gap-3">
        <select value={txForm.cardId} onChange={(e) => setTxForm({ ...txForm, cardId: e.target.value })} className="border rounded px-3 py-2" required>
          <option value="">Cartão</option>
          {cards.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input placeholder="Descrição" value={txForm.description} onChange={(e) => setTxForm({ ...txForm, description: e.target.value })} className="border rounded px-3 py-2" />
        <input type="number" step="0.01" placeholder="Valor" value={txForm.amount} onChange={(e) => setTxForm({ ...txForm, amount: e.target.value })} className="border rounded px-3 py-2" required />
        <input type="number" placeholder="Parcelas" value={txForm.installments} onChange={(e) => setTxForm({ ...txForm, installments: e.target.value })} className="border rounded px-3 py-2" />
        <input type="date" value={txForm.date} onChange={(e) => setTxForm({ ...txForm, date: e.target.value })} className="border rounded px-3 py-2" />
        <button className="bg-accent text-white rounded px-4 py-2 font-semibold">Lançar compra</button>
      </form>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cards.map((c) => {
          const used = c.transactions.reduce((s: number, t: any) => s + Number(t.amount), 0);
          const available = Number(c.limitAmount) - used;
          return (
            <div key={c.id} className="bg-white p-6 rounded-xl border shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <h2 className="font-bold text-lg">{c.name}</h2>
                <span className={available >= 0 ? 'text-success' : 'text-danger'}>R$ {available.toFixed(2)}</span>
              </div>
              <p className="text-sm text-slate-500 mb-4">Limite: R$ {Number(c.limitAmount).toFixed(2)} | Fatura: {c.closingDay}/mês | Venc: {c.dueDay}/mês</p>
              <h3 className="font-semibold text-sm mb-2">Compras</h3>
              <ul className="text-sm space-y-1">
                {c.transactions.map((t: any) => (
                  <li key={t.id} className="flex justify-between border-b py-1">
                    <span>{t.description} ({t.installments}x)</span>
                    <span>R$ {Number(t.amount).toFixed(2)}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>
    </ProtectedLayout>
  );
}

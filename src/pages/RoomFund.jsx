import React, {useEffect, useState} from 'react'
import { supabase } from '../lib/supabase'

export default function RoomFund(){
  const [txs,setTxs]=useState([])
  const [members,setMembers]=useState([])
  const [amount,setAmount]=useState('')
  const [note,setNote]=useState('')
  const [memberName,setMemberName]=useState('')
  const [type,setType]=useState('contribution')
  const [message,setMessage]=useState('')

  async function load(){
    const [fundRes, membersRes] = await Promise.all([
      supabase.from('fund_transactions').select('*').order('created_at',{ascending:false}),
      supabase.from('members').select('*').order('created_at',{ascending:true}),
    ])
    setTxs(fundRes.data||[])
    setMembers(membersRes.data||[])
  }

  useEffect(() => {
    load()

    const channel = supabase.channel('fund-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'fund_transactions' }, load).subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function add(e){
    e.preventDefault()
    const parsedAmount = parseFloat(amount)
    if(!parsedAmount) return

    const payload = {
      amount: type === 'expense' ? -Math.abs(parsedAmount) : Math.abs(parsedAmount),
      note: (note || (type === 'expense' ? 'Expense' : 'Contribution')).trim(),
    }

    if (memberName) {
      payload.note = `${payload.note} • ${memberName}`
    }

    const { error } = await supabase.from('fund_transactions').insert([payload])

    if(error){
      setMessage(error.message)
      return
    }

    setMessage('Saved to the room fund.')
    setAmount('');setNote('');setMemberName('');load()
  }

  const total = txs.reduce((sum, item) => sum + Number(item.amount || 0), 0)
  const contributions = txs.filter((item) => Number(item.amount) > 0).reduce((sum, item) => sum + Number(item.amount), 0)
  const expenses = Math.abs(txs.filter((item) => Number(item.amount) < 0).reduce((sum, item) => sum + Number(item.amount), 0))

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="icon-pill">💰</div>
          <div>
            <h2 className="text-xl font-semibold">Room Fund</h2>
            <p className="text-sm text-slate-500">See who contributed, what was spent, and the current balance.</p>
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-2xl bg-slate-50 p-3">
            <div className="text-xs text-slate-500">Balance</div>
            <div className="font-semibold">{total}৳</div>
          </div>
          <div className="rounded-2xl bg-emerald-50 p-3">
            <div className="text-xs text-emerald-700">Contributed</div>
            <div className="font-semibold text-emerald-700">{contributions}৳</div>
          </div>
          <div className="rounded-2xl bg-rose-50 p-3">
            <div className="text-xs text-rose-700">Spent</div>
            <div className="font-semibold text-rose-700">{expenses}৳</div>
          </div>
        </div>

        <form onSubmit={add} className="space-y-3">
          {message ? <div className="rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">{message}</div> : null}
          <select value={type} onChange={(e)=>setType(e.target.value)}>
            <option value="contribution">Contribution</option>
            <option value="expense">Expense</option>
          </select>
          <input placeholder="Amount" value={amount} onChange={e=>setAmount(e.target.value)} />
          <input placeholder="Who paid / note" value={note} onChange={e=>setNote(e.target.value)} />
          <select value={memberName} onChange={(e)=>setMemberName(e.target.value)}>
            <option value="">Select member (optional)</option>
            {members.map((member) => <option key={member.id} value={member.name}>{member.name}</option>)}
          </select>
          <button type="submit" className="w-full">Add entry</button>
        </form>

        <div className="mt-4 space-y-2">
          {txs.map((t)=> (
            <div key={t.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-3">
              <div>
                <div className={`font-semibold ${Number(t.amount) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>{Number(t.amount) >= 0 ? '+' : '-'}{Math.abs(Number(t.amount))}৳</div>
                <div className="text-sm text-slate-500">{t.note || 'No note'}</div>
              </div>
              <div className="text-right text-sm text-slate-400">{new Date(t.created_at).toLocaleString()}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

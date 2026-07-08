import React, {useEffect, useState} from 'react'
import { supabase } from '../lib/supabase'

export default function WifiBilling(){
  const [bills,setBills]=useState([])
  const [amount,setAmount]=useState('')
  const [dueDate,setDueDate]=useState(new Date().toISOString().slice(0,10))
  const [note,setNote]=useState('')
  const [paid,setPaid]=useState(false)

  async function load(){
    const { data } = await supabase.from('wifi_bills').select('*').order('due_date',{ascending:false})
    setBills(data||[])
  }

  useEffect(() => {
    load()

    const channel = supabase.channel('wifi-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'wifi_bills' }, load).subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function togglePaid(b){
    await supabase.from('wifi_bills').update({paid: !b.paid}).eq('id', b.id)
    load()
  }

  async function add(e){
    e.preventDefault()
    if(!amount) return

    await supabase.from('wifi_bills').insert([{ amount: Number(amount), due_date: dueDate, paid, note }])

    setAmount('')
    setDueDate(new Date().toISOString().slice(0,10))
    setNote('')
    setPaid(false)
    load()
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="icon-pill">📶</div>
          <div>
            <h2 className="text-xl font-semibold">Wifi Bills</h2>
            <p className="text-sm text-slate-500">Track the monthly bill and who has paid.</p>
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <form onSubmit={add} className="space-y-3">
          <input placeholder="Amount" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} />
          <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
          <input placeholder="Note" value={note} onChange={(e) => setNote(e.target.value)} />
          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" checked={paid} onChange={(e) => setPaid(e.target.checked)} />
            Mark as paid
          </label>
          <button type="submit" className="w-full">Add bill</button>
        </form>
      </div>

      <div className="card space-y-2">
        {bills.map((b) => (
          <div key={b.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-3">
            <div>
              <div className="font-semibold">{b.amount}৳</div>
              <div className="text-sm text-slate-500">Due {b.due_date} • Paid: {b.paid ? 'Yes' : 'No'}{b.note ? ` • ${b.note}` : ''}</div>
            </div>
            <button onClick={() => togglePaid(b)}>{b.paid ? 'Mark Unpaid' : 'Mark Paid'}</button>
          </div>
        ))}
      </div>
    </div>
  )
}

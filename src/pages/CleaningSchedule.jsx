import React, {useEffect, useState} from 'react'
import { supabase } from '../lib/supabase'

export default function CleaningSchedule(){
  const [items,setItems]=useState([])
  const [members,setMembers]=useState([])
  const [task,setTask]=useState('')
  const [date,setDate]=useState(new Date().toISOString().slice(0,10))
  const [assignedMembers,setAssignedMembers]=useState('')

  async function load(){
    const [cleaningRes, membersRes] = await Promise.all([
      supabase.from('cleaning_schedule').select('*').order('date', {ascending:true}),
      supabase.from('members').select('*').order('created_at', {ascending:true})
    ])
    setItems(cleaningRes.data||[])
    setMembers(membersRes.data||[])
  }

  useEffect(() => {
    load()

    const channel = supabase.channel('cleaning-updates').on('postgres_changes', { event: '*', schema: 'public', table: 'cleaning_schedule' }, load).subscribe()
    return () => supabase.removeChannel(channel)
  }, [])

  async function add(e){
    e.preventDefault()
    if(!task.trim()) return

    await supabase.from('cleaning_schedule').insert([{
      task,
      date,
      assigned_members: assignedMembers.trim() || (members.map((member) => member.name).join(', ') || 'Unassigned')
    }])

    setTask('')
    setDate(new Date().toISOString().slice(0,10))
    setAssignedMembers('')
    load()
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="icon-pill">🧹</div>
          <div>
            <h2 className="text-xl font-semibold">Cleaning Schedule</h2>
            <p className="text-sm text-slate-500">Keep the floor and bathroom work rotating fairly.</p>
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="text-sm text-slate-500">Current members: {members.length ? members.map((member) => member.name).join(', ') : 'No members yet'}</div>
        <form onSubmit={add} className="space-y-3">
          <input placeholder="Task" value={task} onChange={(e) => setTask(e.target.value)} />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          <input placeholder="Assigned members" value={assignedMembers} onChange={(e) => setAssignedMembers(e.target.value)} />
          <button type="submit" className="w-full">Add cleaning task</button>
        </form>
      </div>

      <div className="card space-y-2">
        {items.map((i) => (
          <div key={i.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-3">
            <div>
              <div className="font-semibold">{i.task}</div>
              <div className="text-sm text-slate-500">{i.assigned_members}</div>
            </div>
            <div className="text-sm text-slate-400">{i.date}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

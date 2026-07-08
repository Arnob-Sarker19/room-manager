import React, {useEffect, useState} from 'react'
import { supabase } from '../lib/supabase'

export default function Members(){
  const [members,setMembers]=useState([])
  const [name,setName]=useState('')

  async function load(){
    const { data } = await supabase.from('members').select('*').order('created_at',{ascending:true})
    setMembers(data||[])
  }
  useEffect(()=>{load()},[])

  async function add(e){
    e.preventDefault();
    await supabase.from('members').insert([{name}]);
    setName('');load()
  }

  async function remove(id){
    await supabase.from('members').delete().eq('id',id);load()
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="icon-pill">👥</div>
          <div>
            <h2 className="text-xl font-semibold">Members</h2>
            <p className="text-sm text-slate-500">Add or remove room members whenever needed.</p>
          </div>
        </div>
      </div>
      <div className="card">
        <form onSubmit={add} className="space-y-3">
          <input placeholder="Member name" value={name} onChange={e=>setName(e.target.value)} />
          <button type="submit" className="w-full">Add member</button>
        </form>
        <div className="mt-4 space-y-2">
          {members.map(m=> (
            <div key={m.id} className="flex items-center justify-between rounded-2xl border border-slate-200 px-3 py-3">
              <div className="font-medium">{m.name}</div>
              <button onClick={()=>remove(m.id)} className="bg-rose-600 hover:bg-rose-700">Remove</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

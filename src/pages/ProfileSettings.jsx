import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ProfileSettings(){
  const [members, setMembers] = useState([])
  const [fundBalance, setFundBalance] = useState(0)
  const [pendingBills, setPendingBills] = useState(0)

  useEffect(() => {
    async function load(){
      const [membersRes, fundRes, wifiRes] = await Promise.all([
        supabase.from('members').select('*').order('created_at', { ascending: true }),
        supabase.from('fund_transactions').select('amount'),
        supabase.from('wifi_bills').select('amount, paid').eq('paid', false),
      ])

      setMembers(membersRes.data || [])
      const balance = (fundRes.data || []).reduce((sum, item) => sum + Number(item.amount || 0), 0)
      setFundBalance(balance)
      setPendingBills((wifiRes.data || []).reduce((sum, item) => sum + Number(item.amount || 0), 0))
    }

    load()

    const membersChannel = supabase.channel('profile-members').on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, load).subscribe()
    const fundChannel = supabase.channel('profile-fund').on('postgres_changes', { event: '*', schema: 'public', table: 'fund_transactions' }, load).subscribe()
    const wifiChannel = supabase.channel('profile-wifi').on('postgres_changes', { event: '*', schema: 'public', table: 'wifi_bills' }, load).subscribe()

    return () => {
      supabase.removeChannel(membersChannel)
      supabase.removeChannel(fundChannel)
      supabase.removeChannel(wifiChannel)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="icon-pill">👤</div>
          <div>
            <h2 className="text-xl font-semibold">Profile & Settings</h2>
            <p className="text-sm text-slate-500">A cleaner place to manage your room profile.</p>
          </div>
        </div>
      </div>

      <div className="card space-y-3">
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="text-sm text-slate-500">Room name</div>
          <div className="font-semibold">Smart Room</div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="text-sm text-slate-500">Members</div>
          <div className="font-semibold">{members.length} active member{members.length === 1 ? '' : 's'}</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {members.map((member) => (
              <span key={member.id} className="rounded-full bg-white px-3 py-1 text-sm shadow-sm">{member.name}</span>
            ))}
          </div>
        </div>
        <div className="rounded-2xl bg-slate-50 p-3">
          <div className="text-sm text-slate-500">Current room summary</div>
          <div className="font-semibold">Fund balance: {fundBalance}৳ • Pending wifi: {pendingBills}৳</div>
        </div>
      </div>
    </div>
  )
}

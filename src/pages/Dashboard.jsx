import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'

const quickActions = [
  { to: '/fund', title: 'Room Fund', desc: 'Add money and track spending', icon: '💰' },
  { to: '/cleaning', title: 'Cleaning', desc: 'See floor & bathroom rota', icon: '🧹' },
  { to: '/wifi', title: 'Wifi', desc: 'Mark bill paid / unpaid', icon: '📶' },
  { to: '/chat', title: 'Chat', desc: 'Send quick room updates', icon: '💬' },
]

export default function Dashboard(){
  const [memberCount, setMemberCount] = useState(0)
  const [fundBalance, setFundBalance] = useState(0)

  useEffect(() => {
    async function loadData(){
      const [membersRes, fundRes] = await Promise.all([
        supabase.from('members').select('id'),
        supabase.from('fund_transactions').select('amount')
      ])

      setMemberCount(membersRes.data?.length || 0)
      const balance = (fundRes.data || []).reduce((sum, item) => sum + Number(item.amount || 0), 0)
      setFundBalance(balance)
    }

    loadData()

    const membersChannel = supabase.channel('dashboard-members').on('postgres_changes', { event: '*', schema: 'public', table: 'members' }, loadData).subscribe()
    const fundChannel = supabase.channel('dashboard-fund').on('postgres_changes', { event: '*', schema: 'public', table: 'fund_transactions' }, loadData).subscribe()

    return () => {
      supabase.removeChannel(membersChannel)
      supabase.removeChannel(fundChannel)
    }
  }, [])

  const roomStatus = [
    { label: 'Room', value: `${memberCount} member${memberCount === 1 ? '' : 's'}` },
    { label: 'Fund', value: `${fundBalance}৳` },
    { label: 'Next clean', value: 'Today' },
    { label: 'Wifi', value: 'Live' },
  ]

  return (
    <div className="space-y-4">
      <div className="card space-y-3">
        <div className="inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700">Mobile-first room app</div>
        <h1 className="text-2xl font-semibold text-slate-900">Everything for your room in one place</h1>
        <p className="text-sm leading-6 text-slate-600">Fast, calm, and professional — manage fund, cleaning, wifi and chat from your phone.</p>
      </div>

      <div className="card rounded-[28px] bg-gradient-to-br from-blue-600 to-indigo-700 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold text-blue-100">Room status</div>
            <div className="text-xl font-semibold">All good today</div>
          </div>
          <div className="rounded-2xl bg-white/20 p-3 text-2xl">🏡</div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          {roomStatus.map((item) => (
            <div key={item.label} className="rounded-2xl bg-white/15 p-3">
              <div className="text-xs uppercase tracking-wide text-blue-100">{item.label}</div>
              <div className="mt-1 font-semibold">{item.value}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {quickActions.map((item) => (
          <Link key={item.to} to={item.to} className="card flex items-start gap-3">
            <div className="icon-pill">{item.icon}</div>
            <div>
              <div className="font-semibold">{item.title}</div>
              <div className="text-sm text-slate-500">{item.desc}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}

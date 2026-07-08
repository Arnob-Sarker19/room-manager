import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function showBrowserNotification(title, body) {
  if (!('Notification' in window)) return

  if (Notification.permission === 'granted') {
    new Notification(title, { body })
    return
  }

  if (Notification.permission !== 'denied') {
    Notification.requestPermission().then((permission) => {
      if (permission === 'granted') {
        new Notification(title, { body })
      }
    })
  }
}

export default function NotificationsPanel(){
  const [items, setItems] = useState([])

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js').catch(() => {})
    }

    async function load(){
      const [chatRes, fundRes, cleaningRes, wifiRes] = await Promise.all([
        supabase.from('chat_messages').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('fund_transactions').select('*').order('created_at', { ascending: false }).limit(5),
        supabase.from('cleaning_schedule').select('*').order('date', { ascending: true }).limit(5),
        supabase.from('wifi_bills').select('*').order('due_date', { ascending: false }).limit(5),
      ])

      const notifications = []

      ;(chatRes.data || []).forEach((message) => {
        notifications.push({
          title: 'New chat message',
          text: `${message.author}: ${message.content}`,
          tone: 'bg-blue-50 text-blue-700',
          created_at: message.created_at,
        })
      })

      ;(fundRes.data || []).forEach((entry) => {
        notifications.push({
          title: entry.amount >= 0 ? 'Fund contribution' : 'Fund expense',
          text: `${entry.note || 'Room fund update'} • ${entry.amount}৳`,
          tone: entry.amount >= 0 ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700',
          created_at: entry.created_at,
        })
      })

      ;(cleaningRes.data || []).forEach((item) => {
        notifications.push({
          title: 'Cleaning task',
          text: `${item.task} • ${item.assigned_members || 'Unassigned'}`,
          tone: 'bg-amber-50 text-amber-700',
          created_at: item.created_at,
        })
      })

      ;(wifiRes.data || []).forEach((bill) => {
        notifications.push({
          title: bill.paid ? 'Wifi paid' : 'Wifi due',
          text: `${bill.amount}৳ due ${bill.due_date}${bill.note ? ` • ${bill.note}` : ''}`,
          tone: bill.paid ? 'bg-slate-100 text-slate-700' : 'bg-indigo-50 text-indigo-700',
          created_at: bill.created_at,
        })
      })

      const sorted = notifications.sort((a, b) => new Date(b.created_at) - new Date(a.created_at)).slice(0, 12)
      setItems(sorted)

      if (sorted[0]) {
        showBrowserNotification(sorted[0].title, sorted[0].text)
      }
    }

    load()

    const chatChannel = supabase.channel('notifications-chat').on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, load).subscribe()
    const fundChannel = supabase.channel('notifications-fund').on('postgres_changes', { event: '*', schema: 'public', table: 'fund_transactions' }, load).subscribe()
    const cleaningChannel = supabase.channel('notifications-cleaning').on('postgres_changes', { event: '*', schema: 'public', table: 'cleaning_schedule' }, load).subscribe()
    const wifiChannel = supabase.channel('notifications-wifi').on('postgres_changes', { event: '*', schema: 'public', table: 'wifi_bills' }, load).subscribe()

    return () => {
      supabase.removeChannel(chatChannel)
      supabase.removeChannel(fundChannel)
      supabase.removeChannel(cleaningChannel)
      supabase.removeChannel(wifiChannel)
    }
  }, [])

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="icon-pill">🔔</div>
          <div>
            <h2 className="text-xl font-semibold">Notifications</h2>
            <p className="text-sm text-slate-500">Push-style reminders for important room events.</p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        {items.map((item, index) => (
          <div key={`${item.title}-${index}`} className={`rounded-2xl border border-slate-200 p-3 ${item.tone}`}>
            <div className="font-semibold">{item.title}</div>
            <div className="mt-1 text-sm">{item.text}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

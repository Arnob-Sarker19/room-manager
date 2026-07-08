import React, { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

export default function ChatRoom(){
  const [messages, setMessages] = useState([])
  const [text, setText] = useState('')
  const [author, setAuthor] = useState('You')

  useEffect(() => {
    async function load(){
      const { data } = await supabase.from('chat_messages').select('*').order('created_at', { ascending: true })
      setMessages(data || [])
    }

    load()

    const channel = supabase.channel('room-chat')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'chat_messages' }, (payload) => {
        setMessages((prev) => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [])

  async function sendMessage(e){
    e.preventDefault()
    if(!text.trim()) return

    await supabase.from('chat_messages').insert([{ author: author.trim() || 'You', content: text.trim() }])
    setText('')
  }

  return (
    <div className="space-y-4">
      <div className="card">
        <div className="flex items-center gap-3">
          <div className="icon-pill">💬</div>
          <div>
            <h2 className="text-xl font-semibold">Room Chat</h2>
            <p className="text-sm text-slate-500">Realtime updates for shared notes and quick check-ins.</p>
          </div>
        </div>
      </div>
      <div className="card">
        <div className="min-h-[220px] max-h-[360px] space-y-2 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50 p-3">
          {messages.map((message) => (
            <div key={message.id} className="rounded-2xl bg-white px-3 py-2 shadow-sm">
              <div className="text-sm font-semibold text-slate-700">{message.author || 'Member'}</div>
              <div className="text-sm text-slate-600">{message.content}</div>
            </div>
          ))}
        </div>
        <form onSubmit={sendMessage} className="mt-3 flex flex-col gap-2">
          <input className="flex-1" value={author} onChange={(e) => setAuthor(e.target.value)} placeholder="Your name" />
          <div className="flex gap-2">
            <input className="flex-1" value={text} onChange={(e) => setText(e.target.value)} placeholder="Write a message" />
            <button type="submit">Send</button>
          </div>
        </form>
      </div>
    </div>
  )
}

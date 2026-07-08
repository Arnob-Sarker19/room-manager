import React from 'react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

const insertMock = vi.fn()
const selectMock = vi.fn()

vi.mock('../../lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({ order: vi.fn(() => Promise.resolve({ data: [{ id: 1, content: 'hello', author: 'A' }] })) })),
      insert: insertMock,
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnThis(),
    })),
    removeChannel: vi.fn(),
  },
}))

import ChatRoom from '../ChatRoom'

describe('ChatRoom', () => {
  beforeEach(() => {
    insertMock.mockReset()
    insertMock.mockResolvedValue({})
  })

  it('renders existing messages and sends a new one', async () => {
    render(<ChatRoom />)
    expect(await screen.findByText('hello')).toBeInTheDocument()

    fireEvent.change(screen.getByPlaceholderText('Write a message'), { target: { value: 'new message' } })
    fireEvent.click(screen.getByRole('button', { name: 'Send' }))

    expect(insertMock).toHaveBeenCalledWith([{ author: 'You', content: 'new message' }])
  })
})

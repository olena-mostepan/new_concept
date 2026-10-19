'use client'

import * as React from 'react'

const btnGhost =
  'rounded-lg border border-cq-border bg-white px-4 py-2 text-sm font-bold text-cq-text hover:bg-cq-bg'
const btnGreen =
  'rounded-lg bg-[var(--cq-green)] px-4 py-2 text-sm font-bold text-white hover:bg-[var(--cq-green-hover)]'

export function AddDetailsForm({
  onCancel,
  onSend,
}: {
  onCancel: () => void
  onSend: (text: string) => void
}) {
  const [text, setText] = React.useState('')

  return (
    <div className="space-y-3 rounded-lg border border-cq-border bg-white p-4">
      <label className="block text-sm font-bold text-cq-text" htmlFor="supplier-reply">
        Your reply
      </label>
      <textarea
        id="supplier-reply"
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={5}
        placeholder="Type your answer…"
        className="w-full resize-y rounded-lg border border-cq-border bg-white px-3 py-2 text-sm text-cq-text outline-none focus:border-cq-text focus:ring-1 focus:ring-cq-text/10"
      />
      <div className="flex flex-wrap justify-end gap-2">
        <button type="button" className={btnGhost} onClick={onCancel}>
          Cancel
        </button>
        <button
          type="button"
          className={btnGreen}
          disabled={!text.trim()}
          onClick={() => onSend(text)}
        >
          Send
        </button>
      </div>
    </div>
  )
}

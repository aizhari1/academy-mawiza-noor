'use client'

export function MessageBubble({ body, mine, time }: { body: string; mine: boolean; time?: string }) {
  const lines = (body || '').split('\n')
  const url = lines.find((l) => l.startsWith('http'))
  const isVoice = (body || '').includes('رسالة صوتية') && !!url

  return (
    <div className={`flex ${mine ? 'justify-start' : 'justify-end'}`}>
      <div
        className="max-w-[80%] rounded-2xl px-3.5 py-2.5"
        style={{
          background: mine ? '#176b52' : '#fff',
          color: mine ? '#fff' : '#111e1a',
          border: mine ? 'none' : '1px solid rgba(18,61,50,0.08)',
        }}
      >
        {isVoice && url ? (
          <div className="space-y-1">
            <p className="text-[12px] font-bold">🎤 رسالة صوتية</p>
            <audio controls src={url} className="w-full max-w-[220px]" style={{ height: 36 }} />
          </div>
        ) : (
          <p className="text-[13px] whitespace-pre-wrap leading-relaxed">{body}</p>
        )}
        {time && <p className="text-[9px] mt-1 opacity-70">{time}</p>}
      </div>
    </div>
  )
}

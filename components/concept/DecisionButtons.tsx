export function DecisionButtons({ onGo, onNotNow, goLabel = 'Go ahead' }: { onGo: () => void; onNotNow: () => void; goLabel?: string }) {
  return (
    <div className="flex flex-wrap gap-2">
      <button type="button" className="btn-primary-sm" onClick={onGo}>
        {goLabel}
      </button>
      <button type="button" className="btn-secondary-sm" onClick={onNotNow}>
        Not now
      </button>
    </div>
  )
}

import React from 'react'

import { Button } from '../button/button'

export function ErrorStateCard({
  error,
  onAction,
  actionLabel,
}: {
  error: string
  onAction?: () => void
  actionLabel?: string
}) {
  return (
    <div className="flex flex-col gap-6 bg-red-400 rounded-lg p-6 text-3xl">
      {error}
      {onAction ? <Button onClick={onAction}>{actionLabel}</Button> : undefined}
    </div>
  )
}

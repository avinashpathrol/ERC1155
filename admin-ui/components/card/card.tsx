import React from 'react'

const CARD_CLASSES = 'bg-gray-800 p-4 rounded-xl'

export function Card({
  children,
  className = '',
}: {
  children: React.ReactNode
  className?: string
}) {
  return <div className={`${CARD_CLASSES} ${className}`}>{children}</div>
}

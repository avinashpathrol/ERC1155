import React from 'react'

const BUTTON_CLASSES =
  'rounded-lg bg-blue-500 hover:bg-blue-600 p-4 py-2 duration-200'

export function Button({
  onClick,
  children,
  className = '',
}: {
  onClick: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button className={`${BUTTON_CLASSES} ${className}`} onClick={onClick}>
      {children}
    </button>
  )
}

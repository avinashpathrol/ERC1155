import React from 'react'

const INPUT_CLASSES = 'rounded-lg px-4 py-1 text-gray-700'

export function Input({
  placeholder,
  inputType,
  value,
  onChange,
  className = '',
}: {
  placeholder?: string
  inputType?: string
  value: string
  onChange: (value: string) => void
  className?: string
}) {
  return (
    <input
      placeholder={placeholder}
      className={`${INPUT_CLASSES} ${className}`}
      value={value}
      type={inputType}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}

'use client'

import { HighlightTextProps } from '../types'

export default function HighlightText({
  segments,
  highlightClassName = 'bg-yellow-200 text-yellow-900 rounded px-0.5',
}: HighlightTextProps) {
  return (
    <>
      {segments.map((segment, index) => (
        segment.isMatch ? (
          <mark key={index} className={highlightClassName}>
            {segment.text}
          </mark>
        ) : (
          <span key={index}>{segment.text}</span>
        )
      ))}
    </>
  )
}

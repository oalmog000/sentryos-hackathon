'use client'

import ReactMarkdown from 'react-markdown'
import * as Sentry from '@sentry/nextjs'
import { useEffect } from 'react'

interface NotepadProps {
  content: string
  filename: string
}

export function Notepad({ content, filename }: NotepadProps) {
  useEffect(() => {
    Sentry.addBreadcrumb({
      category: 'notepad',
      message: `Notepad opened: ${filename}`,
      level: 'info',
      data: { filename, contentLength: content.length }
    })
    Sentry.metrics.increment('notepad.opened', 1, {
      tags: { filename }
    })
    Sentry.metrics.distribution('notepad.content_length', content.length)
  }, [filename, content.length])

  return (
    <div className="h-full flex flex-col bg-[#1e1a2a]">
      {/* Menu bar */}
      <div className="flex items-center gap-4 px-2 py-1 border-b border-[#362552] bg-[#2a2438] text-xs text-[#9086a3]">
        <span className="hover:text-[#e8e4f0] cursor-pointer">File</span>
        <span className="hover:text-[#e8e4f0] cursor-pointer">Edit</span>
        <span className="hover:text-[#e8e4f0] cursor-pointer">View</span>
        <span className="hover:text-[#e8e4f0] cursor-pointer">Help</span>
      </div>

      {/* Status showing filename */}
      <div className="px-3 py-1.5 border-b border-[#362552] bg-[#2a2438]/30 text-xs text-[#9086a3]">
        {filename}
      </div>

      {/* Content area */}
      <div className="flex-1 overflow-auto p-4">
        <div className="markdown-content text-sm leading-relaxed">
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 border-t border-[#362552] bg-[#2a2438] text-xs text-[#9086a3]">
        <span>Markdown Preview</span>
        <span>UTF-8</span>
      </div>
    </div>
  )
}

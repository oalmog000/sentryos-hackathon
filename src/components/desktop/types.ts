'use client'

export interface WindowState {
  id: string
  title: string
  icon: string
  x: number
  y: number
  width: number
  height: number
  minWidth: number
  minHeight: number
  isMinimized: boolean
  isMaximized: boolean
  isFocused: boolean
  zIndex: number
  content: React.ReactNode
}

export interface DesktopIconType {
  id: string
  label: string
  icon: string
  action: () => void
}

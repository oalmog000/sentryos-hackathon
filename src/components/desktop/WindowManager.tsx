'use client'

import { useState, useCallback, createContext, useContext, ReactNode, useEffect } from 'react'
import * as Sentry from '@sentry/nextjs'
import { metrics } from '@/lib/metrics'
import { WindowState } from './types'

interface WindowManagerContextType {
  windows: WindowState[]
  openWindow: (window: Omit<WindowState, 'zIndex' | 'isFocused'>) => void
  closeWindow: (id: string) => void
  minimizeWindow: (id: string) => void
  maximizeWindow: (id: string) => void
  restoreWindow: (id: string) => void
  focusWindow: (id: string) => void
  updateWindowPosition: (id: string, x: number, y: number) => void
  updateWindowSize: (id: string, width: number, height: number) => void
  topZIndex: number
}

const WindowManagerContext = createContext<WindowManagerContextType | null>(null)

export function useWindowManager() {
  const context = useContext(WindowManagerContext)
  if (!context) {
    throw new Error('useWindowManager must be used within WindowManagerProvider')
  }
  return context
}

export function WindowManagerProvider({ children }: { children: ReactNode }) {
  const [windows, setWindows] = useState<WindowState[]>([])
  const [topZIndex, setTopZIndex] = useState(100)

  // Track window count as a gauge metric
  useEffect(() => {
    const openCount = windows.filter(w => !w.isMinimized).length
    const minimizedCount = windows.filter(w => w.isMinimized).length

    metrics.gauge('window.count.total', windows.length)
    metrics.gauge('window.count.open', openCount)
    metrics.gauge('window.count.minimized', minimizedCount)
  }, [windows])

  const openWindow = useCallback((window: Omit<WindowState, 'zIndex' | 'isFocused'>) => {
    Sentry.addBreadcrumb({
      category: 'window',
      message: `Opening window: ${window.title}`,
      level: 'info',
      data: { windowId: window.id, windowTitle: window.title, metric: 'window.open' }
    })

    setTopZIndex(currentZ => {
      const newZ = currentZ + 1
      setWindows(prev => {
        const existing = prev.find(w => w.id === window.id)
        if (existing) {
          if (existing.isMinimized) {
            Sentry.captureMessage('Window restored from minimized', {
              level: 'info',
              tags: { windowId: window.id, windowTitle: window.title }
            })
                        return prev.map(w =>
              w.id === window.id
                ? { ...w, isMinimized: false, isFocused: true, zIndex: newZ }
                : { ...w, isFocused: false }
            )
          }
          Sentry.captureMessage('Window refocused', {
            level: 'info',
            tags: { windowId: window.id, windowTitle: window.title }
          })
          return prev.map(w =>
            w.id === window.id
              ? { ...w, isFocused: true, zIndex: newZ }
              : { ...w, isFocused: false }
          )
        }
        Sentry.captureMessage('New window opened', {
          level: 'info',
          tags: { windowId: window.id, windowTitle: window.title },
          extra: { width: window.width, height: window.height, position: { x: window.x, y: window.y } }
        })
        return [
          ...prev.map(w => ({ ...w, isFocused: false })),
          { ...window, zIndex: newZ, isFocused: true }
        ]
      })
      return newZ
    })
  }, [])

  const closeWindow = useCallback((id: string) => {
    const window = windows.find(w => w.id === id)
    Sentry.addBreadcrumb({
      category: 'window',
      message: `Closing window: ${window?.title || id}`,
      level: 'info',
      data: { windowId: id }
    })
    metrics.increment('window.close', 1, { tags: { windowId: id } })
    Sentry.captureMessage('Window closed', {
      level: 'info',
      tags: { windowId: id, windowTitle: window?.title }
    })
    setWindows(prev => prev.filter(w => w.id !== id))
  }, [windows])

  const minimizeWindow = useCallback((id: string) => {
    const window = windows.find(w => w.id === id)
    Sentry.addBreadcrumb({
      category: 'window',
      message: `Minimizing window: ${window?.title || id}`,
      level: 'info',
      data: { windowId: id }
    })
    metrics.increment('window.minimize', 1, { tags: { windowId: id } })
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMinimized: true, isFocused: false } : w
    ))
  }, [windows])

  const maximizeWindow = useCallback((id: string) => {
    const window = windows.find(w => w.id === id)
    const isMaximizing = !window?.isMaximized
    Sentry.addBreadcrumb({
      category: 'window',
      message: `${isMaximizing ? 'Maximizing' : 'Restoring'} window: ${window?.title || id}`,
      level: 'info',
      data: { windowId: id, action: isMaximizing ? 'maximize' : 'restore' }
    })
    metrics.increment(isMaximizing ? 'window.maximize' : 'window.restore_size', 1, {
      tags: { windowId: id }
    })
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, isMaximized: !w.isMaximized } : w
    ))
  }, [windows])

  const restoreWindow = useCallback((id: string) => {
    setTopZIndex(currentZ => {
      const newZ = currentZ + 1
      setWindows(prev => prev.map(w =>
        w.id === id
          ? { ...w, isMinimized: false, isFocused: true, zIndex: newZ }
          : { ...w, isFocused: false }
      ))
      return newZ
    })
  }, [])

  const focusWindow = useCallback((id: string) => {
    setTopZIndex(currentZ => {
      const newZ = currentZ + 1
      setWindows(prev => prev.map(w =>
        w.id === id
          ? { ...w, isFocused: true, zIndex: newZ }
          : { ...w, isFocused: false }
      ))
      return newZ
    })
  }, [])

  const updateWindowPosition = useCallback((id: string, x: number, y: number) => {
    Sentry.addBreadcrumb({
      category: 'window',
      message: `Window position updated`,
      level: 'debug',
      data: { windowId: id, x, y }
    })
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, x, y } : w
    ))
  }, [])

  const updateWindowSize = useCallback((id: string, width: number, height: number) => {
    Sentry.addBreadcrumb({
      category: 'window',
      message: `Window size updated`,
      level: 'debug',
      data: { windowId: id, width, height }
    })
    metrics.gauge('window.size', width * height, {
      tags: { windowId: id, dimension: 'area' }
    })
    setWindows(prev => prev.map(w =>
      w.id === id ? { ...w, width, height } : w
    ))
  }, [])

  return (
    <WindowManagerContext.Provider value={{
      windows,
      openWindow,
      closeWindow,
      minimizeWindow,
      maximizeWindow,
      restoreWindow,
      focusWindow,
      updateWindowPosition,
      updateWindowSize,
      topZIndex
    }}>
      {children}
    </WindowManagerContext.Provider>
  )
}

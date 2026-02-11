# SentryOS Install Guide

Welcome to **SentryOS** - your desktop environment for Sentry demos and presentations.

## Getting Started

This emulated desktop environment provides a Linux-like experience with:

- **Movable Windows** - Drag windows by their title bar
- **Resizable Windows** - Grab any edge or corner to resize
- **Minimize/Maximize** - Use the title bar buttons
- **Taskbar** - View and restore minimized windows

## Adding Custom Content

To add your own markdown files:

1. Place `.md` files in the `public/` directory
2. Create a desktop icon in `page.tsx`
3. Reference your file in the icon's click handler

## Customization

### Colors

The desktop uses Sentry's brand colors:

- Primary: `#7553FF` (Blurple)
- Accent: `#FF45A8` (Pink)
- Background: `#0F0C14` (Deep Purple)

### Fonts

All text uses **JetBrains Mono** for that authentic terminal feel.

## Tips

- Double-click desktop icons to open applications
- Click the taskbar to restore minimized windows
- The clock in the system tray shows current time

---

*Built with Next.js and React for the Sentry team.*

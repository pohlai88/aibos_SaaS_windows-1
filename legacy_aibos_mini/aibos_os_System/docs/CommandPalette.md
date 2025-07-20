'use client'

import { useState, useEffect, useCallback } from 'react'
import { MagnifyingGlassIcon, CommandLineIcon } from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface Command {
  id: string
  title: string
  subtitle?: string
  icon: React.ReactNode
  action: () => void
  category: 'navigation' | 'actions' | 'settings'
}

const commands: Command[] = [
  {
    id: 'dashboard',
    title: 'Dashboard',
    subtitle: 'View main dashboard',
    icon: <div className="w-4 h-4 rounded bg-blue-500" />,
    action: () => window.location.href = '/',
    category: 'navigation'
  },
  {
    id: 'create-invoice',
    title: 'Create Invoice',
    subtitle: 'Generate new invoice',
    icon: <div className="w-4 h-4 rounded bg-green-500" />,
    action: () => console.log('Create invoice'),
    category: 'actions'
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'App preferences',
    icon: <div className="w-4 h-4 rounded bg-gray-500" />,
    action: () => console.log('Settings'),
    category: 'settings'
  }
]

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [filteredCommands, setFilteredCommands] = useState(commands)

  // Apple's signature ⌘K shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        setIsOpen(true)
      }
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Filter commands based on query
  useEffect(() => {
    if (!query) {
      setFilteredCommands(commands)
    } else {
      setFilteredCommands(
        commands.filter(cmd => 
          cmd.title.toLowerCase().includes(query.toLowerCase()) ||
          cmd.subtitle?.toLowerCase().includes(query.toLowerCase())
        )
      )
    }
  }, [query])

  return (
    <>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(true)}
        className="apple-button-secondary flex items-center gap-2 px-3 py-2 text-sm"
        aria-label="Open Command Palette"
      >
        <MagnifyingGlassIcon className="w-4 h-4" />
        <span className="hidden sm:inline">Search</span>
        <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 text-xs bg-gray-100 dark:bg-gray-800 rounded">
          ⌘K
        </kbd>
      </button>

      {/* Command Palette Modal */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15, ease: [0.4, 0.0, 0.2, 1] }}
            className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh] px-4"
            onClick={() => setIsOpen(false)}
          >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm" />
            
            {/* Command Palette */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.15, ease: [0.4, 0.0, 0.2, 1] }}
              className="glass-panel w-full max-w-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Search Input */}
              <div className="flex items-center gap-3 p-4 border-b border-gray-200/50 dark:border-gray-700/50">
                <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search commands..."
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-gray-100 placeholder-gray-500"
                  autoFocus
                />
              </div>

              {/* Commands List */}
              <div className="max-h-80 overflow-y-auto">
                {filteredCommands.length === 0 ? (
                  <div className="p-8 text-center text-gray-500">
                    No commands found
                  </div>
                ) : (
                  filteredCommands.map((command, index) => (
                    <motion.button
                      key={command.id}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.02 }}
                      onClick={() => {
                        command.action()
                        setIsOpen(false)
                        setQuery('')
                      }}
                      className="w-full flex items-center gap-3 p-3 text-left hover:bg-gray-50/50 dark:hover:bg-gray-800/50 transition-colors"
                    >
                      {command.icon}
                      <div className="flex-1">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {command.title}
                        </div>
                        {command.subtitle && (
                          <div className="text-xs text-gray-500">
                            {command.subtitle}
                          </div>
                        )}
                      </div>
                    </motion.button>
                  ))
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
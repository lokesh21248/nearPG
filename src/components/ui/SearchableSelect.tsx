import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Search, X, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Option {
  id: string
  name: string
}

interface SearchableSelectProps {
  label?: string
  options: Option[]
  value?: string
  onChange: (value: string, name: string) => void
  placeholder: string
  disabled?: boolean
  isLoading?: boolean
  error?: string
  required?: boolean
  id?: string
}

export default function SearchableSelect({
  label,
  options = [],
  value,
  onChange,
  placeholder,
  disabled = false,
  isLoading = false,
  error,
  required = false,
  id,
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Find currently selected option
  const selectedOption = options.find(opt => opt.id === value)

  // Filter options by search input
  const filteredOptions = options.filter(opt =>
    opt.name.toLowerCase().includes(search.toLowerCase())
  )

  // Handle outside click to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [])

  // Clear search on open/close
  useEffect(() => {
    if (!isOpen) {
      setSearch('')
    }
  }, [isOpen])

  const handleSelect = (opt: Option) => {
    onChange(opt.id, opt.name)
    setIsOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    onChange('', '')
    setIsOpen(false)
  }

  return (
    <div className="relative w-full text-left" ref={containerRef}>
      {label && (
        <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      <button
        id={id}
        type="button"
        disabled={disabled || isLoading}
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 bg-white border rounded-xl text-sm font-semibold transition-all duration-200 text-left outline-none ${
          disabled
            ? 'bg-slate-50 border-slate-200 text-slate-400 cursor-not-allowed'
            : error
            ? 'border-rose-400 focus:ring-2 focus:ring-rose-500/15 focus:border-rose-500 text-slate-800'
            : isOpen
            ? 'border-blue-500 ring-2 ring-blue-500/15 text-slate-800'
            : 'border-slate-200 hover:border-slate-300 text-slate-700 focus:border-blue-400'
        }`}
      >
        <span className="truncate">
          {isLoading ? (
            <span className="flex items-center gap-2 text-slate-400">
              <Loader2 className="w-4 h-4 animate-spin text-blue-500" />
              Loading...
            </span>
          ) : selectedOption ? (
            selectedOption.name
          ) : (
            <span className="text-slate-400 font-medium">{placeholder}</span>
          )}
        </span>

        <div className="flex items-center gap-1 shrink-0 ml-2">
          {selectedOption && !disabled && !isLoading && (
            <span
              onClick={handleClear}
              className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-blue-600' : ''
            }`}
          />
        </div>
      </button>

      {error && <p className="text-rose-500 text-xs mt-1 font-medium">{error}</p>}

      <AnimatePresence>
        {isOpen && !disabled && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-full mt-2 bg-white border border-slate-200 rounded-xl shadow-xl overflow-hidden flex flex-col max-h-60"
            style={{ boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)' }}
          >
            {/* Search Input */}
            <div className="relative shrink-0 border-b border-slate-100 p-2 bg-slate-50">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search..."
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-blue-400 transition-colors"
                autoFocus
              />
            </div>

            {/* Options List */}
            <div className="flex-1 overflow-y-auto py-1">
              {filteredOptions.length > 0 ? (
                filteredOptions.map(opt => {
                  const isSelected = opt.id === value
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleSelect(opt)}
                      className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                        isSelected
                          ? 'bg-blue-50 text-blue-700 font-bold'
                          : 'text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {opt.name}
                    </button>
                  )
                })
              ) : (
                <div className="px-4 py-4 text-center text-xs text-slate-400 font-medium">
                  No matches found
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

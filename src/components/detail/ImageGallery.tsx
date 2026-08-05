import { useState, useCallback } from 'react'
import { ChevronLeft, ChevronRight, X, Expand, Grid2x2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PGImage } from '../../types/pg.types'

export function ImageGallery({ images }: { images: PGImage[] }) {
  const [activeIdx,    setActiveIdx]    = useState(0)
  const [isFullscreen, setIsFullscreen] = useState(false)

  const handlePrev = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveIdx(p => (p === 0 ? images.length - 1 : p - 1))
  }, [images.length])

  const handleNext = useCallback((e?: React.MouseEvent) => {
    e?.stopPropagation()
    setActiveIdx(p => (p === images.length - 1 ? 0 : p + 1))
  }, [images.length])

  if (!images || images.length === 0) {
    return <div className="w-full rounded-2xl skeleton" style={{ aspectRatio: '16/7' }} />
  }

  return (
    <>
      {/* ── Main gallery layout ── */}
      {/* Mobile view: single carousel image with fixed aspect ratio */}
      <div className="sm:hidden relative overflow-hidden rounded-2xl aspect-[4/3] max-h-[260px] w-full bg-slate-900 group" onClick={() => setIsFullscreen(true)}>
        <img
          src={images[activeIdx]?.image_url}
          alt="Primary view"
          className="w-full h-full object-cover transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />

        {/* Mobile Prev/Next buttons */}
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all shadow-md z-10"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-md transition-all shadow-md z-10"
            >
              <ChevronRight size={18} />
            </button>
          </>
        )}

        {/* Counter & Fullscreen */}
        <div className="absolute bottom-2.5 left-2.5 px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-sm text-white text-[11px] font-bold">
          {activeIdx + 1} / {images.length}
        </div>
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute bottom-2.5 right-2.5 p-1.5 rounded-lg bg-black/60 backdrop-blur-sm text-white transition-all shadow-sm"
        >
          <Expand size={14} />
        </button>
      </div>

      {/* Desktop view: 2-column grid */}
      <div className="hidden sm:grid gap-2" style={{ gridTemplateColumns: images.length > 1 ? '1fr 1fr' : '1fr', gridTemplateRows: images.length > 2 ? '280px 160px' : '400px' }}>

        {/* Hero image */}
        <div
          className={`relative overflow-hidden rounded-2xl cursor-zoom-in group ${images.length > 1 ? 'row-span-2' : ''}`}
          onClick={() => setIsFullscreen(true)}
        >
          <img
            src={images[activeIdx]?.image_url}
            alt="Primary view"
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
            style={{ minHeight: images.length > 1 ? 440 : 400 }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

          {/* Prev/Next on main image */}
          {images.length > 1 && (
            <>
              <button
                onClick={handlePrev}
                className="absolute left-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/25 hover:bg-white/90 text-white hover:text-slate-900 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-lg"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={handleNext}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-white/25 hover:bg-white/90 text-white hover:text-slate-900 backdrop-blur-md opacity-0 group-hover:opacity-100 transition-all shadow-lg"
              >
                <ChevronRight size={20} />
              </button>
            </>
          )}

          {/* Fullscreen button */}
          <button
            onClick={() => setIsFullscreen(true)}
            className="absolute bottom-3 right-3 p-2 rounded-xl bg-white/20 hover:bg-white backdrop-blur-md text-white hover:text-slate-900 opacity-0 group-hover:opacity-100 transition-all shadow-sm"
          >
            <Expand size={16} />
          </button>

          {/* Counter */}
          <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/55 backdrop-blur-sm text-white text-xs font-bold">
            {activeIdx + 1} / {images.length}
          </div>
        </div>

        {/* Side thumbnails (grid) */}
        {images.length > 1 && images.slice(1, 3).map((img, i) => (
          <div
            key={img.id}
            className="relative rounded-2xl overflow-hidden cursor-pointer group/thumb"
            onClick={() => { setActiveIdx(i + 1); setIsFullscreen(true) }}
          >
            <img
              src={img.image_url}
              alt={`View ${i + 2}`}
              className="w-full h-full object-cover transition-transform duration-500 group-hover/thumb:scale-105"
            />
            {/* "View all" on last thumbnail */}
            {i === 1 && images.length > 3 && (
              <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                <Grid2x2 size={24} className="text-white mb-2" />
                <span className="text-white font-bold text-sm">+{images.length - 3} more</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* ── Thumbnail strip ── */}
      {images.length > 1 && (
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
          {images.map((img, idx) => (
            <button
              key={img.id}
              onClick={() => setActiveIdx(idx)}
              className={`relative shrink-0 w-20 h-14 rounded-xl overflow-hidden transition-all ${
                activeIdx === idx ? 'ring-2 ring-blue-600 ring-offset-2 opacity-100 scale-[1.02]' : 'opacity-60 hover:opacity-90'
              }`}
            >
              <img src={img.image_url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* ── Fullscreen Lightbox ── */}
      <AnimatePresence>
        {isFullscreen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/96 flex flex-col"
            style={{ backdropFilter: 'blur(4px)' }}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 sm:p-6">
              <span className="text-white/60 text-sm font-medium">{activeIdx + 1} of {images.length}</span>
              <button
                onClick={() => setIsFullscreen(false)}
                className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                <X size={22} />
              </button>
            </div>

            {/* Image */}
            <div className="flex-1 flex items-center justify-center relative px-4 py-2">
              <AnimatePresence mode="wait">
                <motion.img
                  key={activeIdx}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.97 }}
                  transition={{ duration: 0.25 }}
                  src={images[activeIdx]?.image_url}
                  alt={`Photo ${activeIdx + 1}`}
                  className="max-w-full max-h-full object-contain select-none rounded-xl"
                />
              </AnimatePresence>

              {images.length > 1 && (
                <>
                  <button onClick={handlePrev} className="absolute left-2 sm:left-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                    <ChevronLeft size={28} />
                  </button>
                  <button onClick={handleNext} className="absolute right-2 sm:right-8 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-all">
                    <ChevronRight size={28} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail strip */}
            <div className="flex gap-2 justify-center px-4 py-4 overflow-x-auto scrollbar-hide">
              {images.map((img, idx) => (
                <button
                  key={img.id}
                  onClick={() => setActiveIdx(idx)}
                  className={`shrink-0 w-16 h-11 rounded-lg overflow-hidden transition-all ${
                    idx === activeIdx ? 'ring-2 ring-blue-400 opacity-100' : 'opacity-40 hover:opacity-70'
                  }`}
                >
                  <img src={img.image_url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}

import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Header } from './Header'
import { Footer } from './Footer'
import { BottomNav } from './BottomNav'

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit:    { opacity: 0, y: -8 },
}

export function PageWrapper({ children, hideFooter = false }: { children: React.ReactNode; hideFooter?: boolean }) {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' })
  }, [pathname])

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--bg-page)' }}>
      <Header />
      <motion.main
        key={pathname}
        className="flex-1 pb-20 sm:pb-0"
        variants={pageVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        transition={{ duration: 0.25, ease: 'easeOut' }}
      >
        {children}
      </motion.main>
      {!hideFooter && <Footer />}
      <BottomNav />
    </div>
  )
}

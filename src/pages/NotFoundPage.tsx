import { Helmet } from 'react-helmet-async'
import { PageWrapper } from '../components/layout/PageWrapper'
import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <PageWrapper>
      <Helmet>
        <title>Page Not Found | NearPG</title>
      </Helmet>
      
      <div className="flex-1 flex flex-col items-center justify-center py-20 px-4 text-center">
        <h1 className="text-9xl font-black text-slate-200 tracking-tighter mb-4">404</h1>
        <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-4">Page Not Found</h2>
        <p className="text-slate-500 max-w-md mx-auto mb-8">
          The page you are looking for might have been removed, had its name changed, or is temporarily unavailable.
        </p>
        <Link to="/" className="btn-primary">
          <Home size={18} />
          Back to Home
        </Link>
      </div>
    </PageWrapper>
  )
}

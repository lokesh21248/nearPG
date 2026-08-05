import { useState } from 'react'
import { StarRating } from '../ui/StarRating'
import { useReviews, useAddReview, useDeleteReview } from '../../hooks/useReviews'
import { MessageSquare, Trash2, Send } from 'lucide-react'
import { useToast } from '../ui/Toast'
import { useFirebaseAuth } from '../../hooks/useFirebaseAuth'

export function ReviewsList({ pgId }: { pgId: string }) {
  const { isAuthenticated, firebaseUser, profile } = useFirebaseAuth()
  const { showToast } = useToast()

  const { data: reviews = [], isLoading } = useReviews(pgId)
  const { mutate: addReview, isPending: adding } = useAddReview()
  const { mutate: deleteReview, isPending: deleting } = useDeleteReview()

  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')

  const avgRating = reviews.length
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isAuthenticated) {
      showToast('Please login to leave a review', 'error')
      return
    }
    addReview(
      {
        pg_id: pgId,
        user_name: profile?.full_name ?? 'Anonymous User',
        rating,
        comment,
      },
      {
        onSuccess: () => {
          showToast('Review submitted successfully!')
          setRating(5)
          setComment('')
        },
        onError: (err) => showToast(err.message, 'error'),
      }
    )
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Delete your review?')) {
      deleteReview(id, {
        onSuccess: () => showToast('Review deleted'),
      })
    }
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between border-b border-slate-100 pb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
            Reviews <span className="text-slate-400 font-medium text-base">({reviews.length})</span>
          </h2>
          {reviews.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              <StarRating rating={Number(avgRating)} />
              <span className="font-bold text-slate-700">{avgRating} out of 5</span>
            </div>
          )}
        </div>
      </div>

      {/* Review Form */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="bg-slate-50 border border-slate-100 rounded-2xl p-5">
          <h4 className="font-bold text-slate-900 mb-4">Write a Review</h4>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-slate-700 mb-2">Your Rating</label>
            <StarRating rating={rating} readOnly={false} onChange={setRating} />
          </div>
          <div className="mb-4">
            <textarea
              placeholder="Share your experience (optional)..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-400 transition-all resize-none h-24"
            />
          </div>
          <div className="flex justify-end">
            <button type="submit" disabled={adding} className="btn-primary py-2 px-6">
              <Send size={16} />
              {adding ? 'Posting...' : 'Post Review'}
            </button>
          </div>
        </form>
      ) : (
        <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5 text-center">
          <p className="text-indigo-800 text-sm font-medium">Log in to leave a review</p>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center text-slate-400 py-8 text-sm">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare size={32} className="mx-auto text-slate-300 mb-3" />
            <p className="text-slate-500 text-sm">No reviews yet. Be the first to review!</p>
          </div>
        ) : (
          reviews.map(review => (
            <div key={review.id} className="bg-white border border-slate-100 rounded-2xl p-5">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-violet-100 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {review.user_name[0]?.toUpperCase()}
                  </div>
                  <div>
                    <h5 className="font-bold text-slate-900 text-sm">{review.user_name}</h5>
                    <div className="flex items-center gap-2 mt-0.5">
                      <StarRating rating={review.rating} />
                      <span className="text-[11px] text-slate-400 font-medium">
                        {new Date(review.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                      </span>
                    </div>
                  </div>
                </div>
                {firebaseUser?.uid === review.user_id && (
                  <button
                    onClick={() => handleDelete(review.id)}
                    disabled={deleting}
                    className="text-slate-400 hover:text-rose-500 p-1 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              {review.comment && (
                <p className="text-slate-600 text-sm leading-relaxed ml-13">{review.comment}</p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

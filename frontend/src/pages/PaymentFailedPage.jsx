import { useSearchParams, Link } from 'react-router-dom'

export default function PaymentFailedPage() {
  const [params] = useSearchParams()
  const orderNumber = params.get('order')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 shadow-sm text-center max-w-md w-full">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-black mb-2">
          Payment Failed
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Something went wrong with your payment for order{' '}
          <span className="font-bold text-black">#{orderNumber}</span>.
          Your order is saved — you can retry payment.
        </p>
        <div className="space-y-3">
          <Link to="/checkout"
            className="block w-full bg-black text-white py-3 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors">
            Retry Payment
          </Link>
          <Link to="/"
            className="block w-full border-2 border-gray-200 text-black py-3 text-sm font-bold uppercase tracking-widest rounded-xl hover:border-black transition-colors">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
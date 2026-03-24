import { useSearchParams, Link } from 'react-router-dom'

export default function PaymentSuccessPage() {
  const [params] = useSearchParams()
  const orderNumber = params.get('order')

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white rounded-2xl p-10 shadow-sm text-center max-w-md w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-black uppercase tracking-tight text-black mb-2">
          Payment Successful!
        </h1>
        <p className="text-gray-500 text-sm mb-6">
          Your order <span className="font-bold text-black">#{orderNumber}</span> has been confirmed.
          A confirmation email has been sent to you.
        </p>
        <div className="space-y-3">
          <Link to={`/orders/${orderNumber}`}
            className="block w-full bg-black text-white py-3 text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-gray-800 transition-colors">
            View Order
          </Link>
          <Link to="/"
            className="block w-full border-2 border-gray-200 text-black py-3 text-sm font-bold uppercase tracking-widest rounded-xl hover:border-black transition-colors">
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  )
}
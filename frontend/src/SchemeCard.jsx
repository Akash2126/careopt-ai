const SchemeCard = ({ scheme }) => {
  return (
    <div className="card border-l-4 border-healthcare-secondary">
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h4 className="text-lg font-bold text-gray-900 mb-2">{scheme.name}</h4>
          <p className="text-sm text-gray-600 mb-3">{scheme.description}</p>
        </div>
        <div className="ml-4">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
            <svg className="w-6 h-6 text-healthcare-secondary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-green-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Coverage</div>
          <div className="text-lg font-bold text-healthcare-secondary">
            {scheme.coverage}%
          </div>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <div className="text-xs text-gray-600 mb-1">Max Benefit</div>
          <div className="text-lg font-bold text-healthcare-primary">
            ₹{scheme.maxBenefit.toLocaleString('en-IN')}
          </div>
        </div>
      </div>

      <div className="border-t pt-3">
        <div className="text-sm font-semibold text-healthcare-secondary mb-2">
          Your Savings: ₹{scheme.savings.toLocaleString('en-IN')}
        </div>
        <div className="flex items-center text-xs text-gray-500">
          <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Eligibility: {scheme.eligibility}
        </div>
      </div>
    </div>
  )
}

export default SchemeCard
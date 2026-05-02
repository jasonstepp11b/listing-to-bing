import { useState } from 'react'
import type { GenerateRequest } from '../lib/types'

type Props = {
  onSubmit: (data: GenerateRequest) => void
}

type FormErrors = {
  listing?: string
  city?: string
  price?: string
}

export function ListingForm({ onSubmit }: Props) {
  const [listing, setListing] = useState('')
  const [city, setCity] = useState('')
  const [price, setPrice] = useState('')
  const [errors, setErrors] = useState<FormErrors>({})

  function validate(): FormErrors {
    const errs: FormErrors = {}
    if (!listing.trim()) errs.listing = 'Please enter the property listing.'
    if (!city.trim()) errs.city = 'Please enter a city.'
    const priceNum = parseFloat(price)
    if (!price || isNaN(priceNum) || priceNum <= 0) errs.price = 'Please enter a valid price.'
    return errs
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) {
      setErrors(errs)
      return
    }
    setErrors({})
    onSubmit({ listing: listing.trim(), city: city.trim(), price: parseFloat(price) })
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-12">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">
          Generate Your Bing Ads Campaign
        </h1>
        <p className="text-slate-500">
          Paste a property listing and get a ready-to-run campaign in under a minute.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <div>
          <label
            className="block text-sm font-medium text-slate-700 mb-1.5"
            htmlFor="listing"
          >
            Property Listing
          </label>
          <textarea
            id="listing"
            rows={5}
            value={listing}
            onChange={e => {
              setListing(e.target.value)
              setErrors(prev => ({ ...prev, listing: undefined }))
            }}
            placeholder="Paste your full listing description here..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
          {errors.listing && (
            <p className="mt-1 text-sm text-red-600">{errors.listing}</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              className="block text-sm font-medium text-slate-700 mb-1.5"
              htmlFor="city"
            >
              City / Market
            </label>
            <input
              id="city"
              type="text"
              value={city}
              onChange={e => {
                setCity(e.target.value)
                setErrors(prev => ({ ...prev, city: undefined }))
              }}
              placeholder="e.g. Cleveland, OH"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.city && (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            )}
          </div>

          <div>
            <label
              className="block text-sm font-medium text-slate-700 mb-1.5"
              htmlFor="price"
            >
              Listing Price
            </label>
            <input
              id="price"
              type="number"
              min="1"
              value={price}
              onChange={e => {
                setPrice(e.target.value)
                setErrors(prev => ({ ...prev, price: undefined }))
              }}
              placeholder="e.g. 350000"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.price && (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            )}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
        >
          Generate Campaign
        </button>
      </form>
    </div>
  )
}

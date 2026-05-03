import { useState } from 'react'
import type { GenerateRequest } from '../lib/types'
import {
  LISTING_MAX_LENGTH,
  LISTING_MIN_SOFT,
  PRICE_HARD_MIN,
  PRICE_HARD_MAX,
  PRICE_SOFT_MAX_LOW,
  PRICE_SOFT_MIN_HIGH,
  CITY_SOFT_MIN,
} from '../lib/types'

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

  // Live computed values
  const listingLength = listing.length
  const counterColor =
    listingLength >= LISTING_MAX_LENGTH
      ? 'text-red-500'
      : listingLength >= Math.floor(LISTING_MAX_LENGTH * 0.9)
      ? 'text-amber-500'
      : 'text-slate-400'

  const listingWarning =
    listing.trim().length > 0 && listing.trim().length < LISTING_MIN_SOFT
      ? "We'll do our best, but more detail produces better campaigns."
      : null

  const cityWarning =
    city.trim().length > 0 && city.trim().length < CITY_SOFT_MIN
      ? 'City names usually have at least a couple letters.'
      : null

  const parsedPrice = parseFloat(price.trim())
  const priceWarning =
    !isNaN(parsedPrice) &&
    parsedPrice >= PRICE_HARD_MIN &&
    parsedPrice <= PRICE_HARD_MAX &&
    (parsedPrice < PRICE_SOFT_MAX_LOW || parsedPrice > PRICE_SOFT_MIN_HIGH)
      ? 'Double-check this price?'
      : null

  function validate(): FormErrors {
    const errs: FormErrors = {}
    const trimmedListing = listing.trim()
    const trimmedCity = city.trim()
    const priceNum = parseFloat(price.trim())

    if (!trimmedListing) {
      errs.listing = 'Please enter the property listing.'
    }

    if (!trimmedCity) {
      errs.city = 'Please enter a city.'
    }

    if (!price.trim() || isNaN(priceNum) || priceNum <= 0) {
      errs.price = 'Please enter a valid price.'
    } else if (priceNum < PRICE_HARD_MIN || priceNum > PRICE_HARD_MAX) {
      errs.price = 'Please enter a realistic price.'
    }

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
    onSubmit({
      listing: listing.trim(),
      city: city.trim(),
      price: parseFloat(price.trim()),
    })
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
            maxLength={LISTING_MAX_LENGTH}
            onChange={e => {
              setListing(e.target.value)
              setErrors(prev => ({ ...prev, listing: undefined }))
            }}
            placeholder="Paste your full listing description here..."
            className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
          <div className="flex justify-between items-start mt-1 min-h-[1.25rem]">
            <div>
              {errors.listing ? (
                <p className="text-sm text-red-600">{errors.listing}</p>
              ) : listingWarning ? (
                <p className="text-sm text-amber-600">{listingWarning}</p>
              ) : null}
            </div>
            <p className={`text-xs ml-3 shrink-0 tabular-nums ${counterColor}`}>
              {listingLength} / {LISTING_MAX_LENGTH}
            </p>
          </div>
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
            {errors.city ? (
              <p className="mt-1 text-sm text-red-600">{errors.city}</p>
            ) : cityWarning ? (
              <p className="mt-1 text-sm text-amber-600">{cityWarning}</p>
            ) : null}
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
              min={PRICE_HARD_MIN}
              max={PRICE_HARD_MAX}
              value={price}
              onChange={e => {
                setPrice(e.target.value)
                setErrors(prev => ({ ...prev, price: undefined }))
              }}
              placeholder="e.g. 350000"
              className="w-full px-3 py-2.5 border border-slate-300 rounded-lg text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            {errors.price ? (
              <p className="mt-1 text-sm text-red-600">{errors.price}</p>
            ) : priceWarning ? (
              <p className="mt-1 text-sm text-amber-600">{priceWarning}</p>
            ) : null}
          </div>
        </div>

        <button
          type="submit"
          disabled={listingLength >= LISTING_MAX_LENGTH}
          className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Generate Campaign
        </button>
      </form>
    </div>
  )
}

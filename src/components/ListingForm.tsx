import { useState } from 'react';
import type { GenerateCampaignInput } from '../lib/types';

type Props = {
  onSubmit: (input: GenerateCampaignInput) => void;
  initialValues?: Partial<GenerateCampaignInput>;
};

type FormErrors = {
  listing?: string;
  city?: string;
  price?: string;
};

export default function ListingForm({ onSubmit, initialValues }: Props) {
  const [listing, setListing] = useState(initialValues?.listing ?? '');
  const [city, setCity] = useState(initialValues?.city ?? '');
  const [price, setPrice] = useState(
    initialValues?.price != null ? String(initialValues.price) : '',
  );
  const [leadType, setLeadType] = useState<'buyer' | 'seller'>(
    initialValues?.leadType ?? 'buyer',
  );
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const errs: FormErrors = {};
    if (!listing.trim()) errs.listing = 'Please describe the property.';
    if (!city.trim()) errs.city = 'Please enter a city or location.';
    const priceNum = parseFloat(price);
    if (!price || isNaN(priceNum) || priceNum <= 0)
      errs.price = 'Please enter a valid price greater than $0.';
    return errs;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit({
      listing: listing.trim(),
      city: city.trim(),
      price: parseFloat(price),
      leadType,
    });
  }

  const inputClass =
    'w-full px-3.5 py-2.5 border border-gray-300 rounded-lg text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition';
  const labelClass = 'block text-sm font-medium text-gray-700 mb-1.5';
  const errorClass = 'mt-1.5 text-sm text-red-600';

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-6">
      <div>
        <label htmlFor="listing" className={labelClass}>
          Property description
        </label>
        <textarea
          id="listing"
          value={listing}
          onChange={(e) => setListing(e.target.value)}
          placeholder="Paste the listing description here — bedrooms, bathrooms, features, neighborhood..."
          rows={6}
          className={`${inputClass} resize-none`}
        />
        {errors.listing && <p className={errorClass}>{errors.listing}</p>}
      </div>

      <div>
        <label htmlFor="city" className={labelClass}>
          City / location
        </label>
        <input
          id="city"
          type="text"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          placeholder="e.g. Austin, TX"
          className={inputClass}
        />
        {errors.city && <p className={errorClass}>{errors.city}</p>}
      </div>

      <div>
        <label htmlFor="price" className={labelClass}>
          Listing price ($)
        </label>
        <input
          id="price"
          type="number"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          placeholder="e.g. 450000"
          min="1"
          className={inputClass}
        />
        {errors.price && <p className={errorClass}>{errors.price}</p>}
      </div>

      <div>
        <p className={labelClass}>Who are you trying to reach?</p>
        <div className="flex rounded-lg border border-gray-300 overflow-hidden w-fit">
          <button
            type="button"
            onClick={() => setLeadType('buyer')}
            className={`px-6 py-2.5 text-sm font-medium transition ${
              leadType === 'buyer'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Buyers
          </button>
          <button
            type="button"
            onClick={() => setLeadType('seller')}
            className={`px-6 py-2.5 text-sm font-medium border-l border-gray-300 transition ${
              leadType === 'seller'
                ? 'bg-blue-600 text-white'
                : 'bg-white text-gray-700 hover:bg-gray-50'
            }`}
          >
            Sellers
          </button>
        </div>
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
      >
        Generate Campaign
      </button>
    </form>
  );
}

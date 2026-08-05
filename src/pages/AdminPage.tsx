import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { PageWrapper } from '../components/layout/PageWrapper'
import { useToast } from '../components/ui/Toast'
import { supabase } from '../lib/supabase'
import LocationSelectorGroup from '../components/ui/LocationSelectorGroup'
import { Save, PlusCircle, ArrowLeft, Loader2, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

const ALL_AMENITIES = [
  'WiFi', 'AC', 'Parking', 'Food Included', 'Laundry', 'Housekeeping',
  'RO Water', 'Power Backup', 'CCTV', 'Gym', 'TV', 'Geyser',
  'Attached Bathroom', 'Balcony', 'Cupboard', 'Study Table',
  'Refrigerator', 'Washing Machine', 'Bike Parking', 'Car Parking',
]

const pgSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters'),
  gender: z.enum(['Men', 'Women', 'Coliving'], {
    errorMap: () => ({ message: 'Gender selection is required' }),
  }),
  state_id: z.string().min(1, 'State is required'),
  city_id: z.string().min(1, 'City is required'),
  area_id: z.string().min(1, 'Area is required'),
  address: z.string().min(5, 'Address is required'),
  pincode: z.string().min(6, 'Pincode must be at least 6 digits').max(8, 'Invalid pincode').optional().or(z.literal('')),
  latitude: z.preprocess(val => val === '' ? null : Number(val), z.number().nullable().optional()),
  longitude: z.preprocess(val => val === '' ? null : Number(val), z.number().nullable().optional()),
  google_map_link: z.string().url('Invalid Google Map URL').optional().or(z.literal('')),
  owner_phone: z.string().min(10, 'Owner phone must be a valid 10-digit number'),
  reception_phone: z.string().optional().or(z.literal('')),
  whatsapp_number: z.string().optional().or(z.literal('')),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  featured: z.boolean().default(false),
  verified: z.boolean().default(false),
  couples_allowed: z.boolean().default(false),
  bachelor_friendly: z.boolean().default(true),
})

type PGFormValues = z.infer<typeof pgSchema>

export default function AdminPage() {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Track the text values for backwards compatibility
  const [stateName, setStateName] = useState('')
  const [cityName, setCityName]   = useState('')
  const [areaName, setAreaName]   = useState('')

  // State for Amenities Selection
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([
    'WiFi', 'Power Backup', 'RO Water', 'Housekeeping', 'CCTV', 'Attached Bathroom'
  ])

  // State for Room Option
  const [roomSharing, setRoomSharing] = useState<'Single Sharing' | '2 Sharing' | '3 Sharing' | '4 Sharing'>('Single Sharing')
  const [roomAc, setRoomAc] = useState<'AC' | 'Non AC'>('AC')
  const [roomPrice, setRoomPrice] = useState('7500')
  const [roomSecurity, setRoomSecurity] = useState('1000')
  const [roomBedsTotal, setRoomBedsTotal] = useState('4')
  const [roomBedsAvailable, setRoomBedsAvailable] = useState('2')

  // State for Image URLs
  const [imageUrls, setImageUrls] = useState<string>('')

  const toggleAmenity = (name: string) => {
    setSelectedAmenities(prev =>
      prev.includes(name) ? prev.filter(a => a !== name) : [...prev, name]
    )
  }

  const selectAllAmenities = () => setSelectedAmenities([...ALL_AMENITIES])
  const clearAllAmenities = () => setSelectedAmenities([])

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(pgSchema),
    defaultValues: {
      name: '',
      gender: 'Coliving' as 'Men' | 'Women' | 'Coliving',
      state_id: '',
      city_id: '',
      area_id: '',
      address: '',
      pincode: '',
      latitude: '',
      longitude: '',
      google_map_link: '',
      owner_phone: '',
      reception_phone: '',
      whatsapp_number: '',
      description: '',
      featured: false,
      verified: false,
      couples_allowed: false,
      bachelor_friendly: true,
    },
  })

  // Watch location state values
  const stateId = watch('state_id')
  const cityId = watch('city_id')
  const areaId = watch('area_id')

  const onSubmit = async (values: any) => {
    setIsSubmitting(true)
    try {
      // Map both relational IDs and text names for backwards-compatibility
      const payload = {
        name: values.name,
        gender: values.gender,
        state_id: values.state_id,
        city_id: values.city_id,
        area_id: values.area_id,
        state: stateName,
        city: cityName,
        area: areaName,
        address: values.address,
        pincode: values.pincode || null,
        latitude: values.latitude || null,
        longitude: values.longitude || null,
        google_map_link: values.google_map_link || null,
        owner_phone: values.owner_phone,
        reception_phone: values.reception_phone || null,
        whatsapp_number: values.whatsapp_number || null,
        description: values.description,
        featured: values.featured,
        verified: values.verified,
        couples_allowed: values.couples_allowed,
        bachelor_friendly: values.bachelor_friendly,
        status: 'Available',
      }

      const { data, error } = await supabase
        .from('pg_listings')
        .insert(payload)
        .select()

      if (error) throw new Error(error.message)
      const newPgId = data[0].id

      // 1. Insert selected amenities into pg_amenities
      if (selectedAmenities.length > 0) {
        const amenitiesPayload = selectedAmenities.map(name => ({
          pg_id: newPgId,
          amenity_name: name,
        }))
        const { error: amenErr } = await supabase.from('pg_amenities').insert(amenitiesPayload)
        if (amenErr) console.warn('Could not insert amenities:', amenErr.message)
      }

      // 2. Insert room details into pg_rooms
      const roomPayload = {
        pg_id: newPgId,
        sharing_type: roomSharing,
        ac_type: roomAc,
        price: Number(roomPrice) || 7500,
        security_deposit: Number(roomSecurity) || 1000,
        total_beds: Number(roomBedsTotal) || 4,
        available_beds: Number(roomBedsAvailable) || 2,
      }
      const { error: roomErr } = await supabase.from('pg_rooms').insert(roomPayload)
      if (roomErr) console.warn('Could not insert room options:', roomErr.message)

      // 3. Insert images into pg_images
      const parsedUrls = imageUrls
        .split('\n')
        .map(u => u.trim())
        .filter(u => u.startsWith('http'))
      const finalImageUrls = parsedUrls.length > 0 ? parsedUrls : [
        'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=800'
      ]
      const imagesPayload = finalImageUrls.map((url, idx) => ({
        pg_id: newPgId,
        image_url: url,
        display_order: idx + 1,
      }))
      const { error: imgErr } = await supabase.from('pg_images').insert(imagesPayload)
      if (imgErr) console.warn('Could not insert images:', imgErr.message)

      showToast('PG Listing added successfully with amenities & rooms! 🎉', 'success')
      reset()
      setStateName('')
      setCityName('')
      setAreaName('')
      
      // Auto-navigate to search to see the new listing
      if (data && data[0]) {
        setTimeout(() => navigate(`/pg/${data[0].id}`), 1000)
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to add PG listing', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <PageWrapper>
      <Helmet>
        <title>Add PG Listing | NearPG Admin</title>
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 py-8 sm:py-12">
        {/* Back and Page Header */}
        <div className="flex items-center justify-between mb-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-slate-500 hover:text-slate-800 font-semibold text-sm transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>

          <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5" />
            Admin Panel
          </div>
        </div>

        <h1 className="text-3xl font-black text-slate-900 mb-2" style={{ fontFamily: 'Outfit,sans-serif' }}>
          Add New PG Listing
        </h1>
        <p className="text-slate-500 font-medium mb-8">
          Fill in the details to list a new PG stays on the platform. All red asterisks (*) are required.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          
          {/* Section 1: Basic Information */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              1. Basic Information
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {/* PG Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  PG Name <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  {...register('name')}
                  placeholder="e.g. Stanza Living Koramangala"
                  className="input-base"
                />
                {errors.name && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.name.message}</p>}
              </div>

              {/* Gender Preference */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Gender Preference <span className="text-rose-500">*</span>
                </label>
                <select {...register('gender')} className="input-base bg-white appearance-none">
                  <option value="Coliving">Coliving / Unisex</option>
                  <option value="Men">Men Only</option>
                  <option value="Women">Women Only</option>
                </select>
                {errors.gender && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.gender.message}</p>}
              </div>
            </div>
          </div>

          {/* Section 2: Address & Location */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              2. Location Details
            </h3>

            {/* Cascading selectors using Controller */}
            <div className="space-y-4">
              <Controller
                name="state_id"
                control={control}
                render={({ field }) => (
                  <Controller
                    name="city_id"
                    control={control}
                    render={({ field: cityField }) => (
                      <Controller
                        name="area_id"
                        control={control}
                        render={({ field: areaField }) => (
                          <LocationSelectorGroup
                            stateId={field.value}
                            cityId={cityField.value}
                            areaId={areaField.value}
                            onStateChange={(id, name) => {
                              field.onChange(id)
                              setStateName(name)
                            }}
                            onCityChange={(id, name) => {
                              cityField.onChange(id)
                              setCityName(name)
                            }}
                            onAreaChange={(id, name) => {
                              areaField.onChange(id)
                              setAreaName(name)
                            }}
                            horizontal={true}
                            onlyWithListings={false} // Load all areas, not just ones with existing listings!
                          />
                        )}
                      />
                    )}
                  />
                )}
              />
              {/* Errors validation list */}
              {(errors.state_id || errors.city_id || errors.area_id) && (
                <div className="text-rose-500 text-xs font-semibold space-y-1 bg-rose-50 border border-rose-100 p-3 rounded-xl">
                  {errors.state_id && <p>• {errors.state_id.message}</p>}
                  {errors.city_id && <p>• {errors.city_id.message}</p>}
                  {errors.area_id && <p>• {errors.area_id.message}</p>}
                </div>
              )}
            </div>

            {/* Address */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Full Address <span className="text-rose-500">*</span>
              </label>
              <textarea
                {...register('address')}
                placeholder="House No, Street Name, Landmark..."
                className="input-base h-20 resize-none py-2"
              />
              {errors.address && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.address.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
              {/* Pincode */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Pincode
                </label>
                <input
                  type="text"
                  {...register('pincode')}
                  placeholder="e.g. 560034"
                  className="input-base"
                />
                {errors.pincode && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.pincode.message}</p>}
              </div>

              {/* Latitude */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Latitude
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('latitude')}
                  placeholder="12.9716"
                  className="input-base"
                />
              </div>

              {/* Longitude */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Longitude
                </label>
                <input
                  type="number"
                  step="any"
                  {...register('longitude')}
                  placeholder="77.5946"
                  className="input-base"
                />
              </div>
            </div>

            {/* Google Map Link */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Google Map Link URL
              </label>
              <input
                type="text"
                {...register('google_map_link')}
                placeholder="https://maps.google.com/?q=..."
                className="input-base"
              />
              {errors.google_map_link && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.google_map_link.message}</p>}
            </div>
          </div>

          {/* Section 3: Owner Contacts */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              3. Contact Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {/* Owner Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Owner Phone *
                </label>
                <input
                  type="tel"
                  {...register('owner_phone')}
                  placeholder="9876543210"
                  className="input-base"
                />
                {errors.owner_phone && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.owner_phone.message}</p>}
              </div>

              {/* Reception Phone */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Reception Phone
                </label>
                <input
                  type="tel"
                  {...register('reception_phone')}
                  placeholder="9876543211"
                  className="input-base"
                />
              </div>

              {/* WhatsApp Number */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  WhatsApp Number
                </label>
                <input
                  type="tel"
                  {...register('whatsapp_number')}
                  placeholder="9876543210"
                  className="input-base"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Details & Status */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              4. Property Details
            </h3>

            {/* Description */}
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Description <span className="text-rose-500">*</span>
              </label>
              <textarea
                {...register('description')}
                placeholder="Write about room features, meals, rules, policy..."
                className="input-base h-28 resize-none py-2"
              />
              {errors.description && <p className="text-rose-500 text-xs mt-1 font-medium">{errors.description.message}</p>}
            </div>

            {/* Featured & Verified & Policy toggles */}
            <div className="flex flex-wrap gap-6 pt-2">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('featured')}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-700">Feature this listing</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('verified')}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-700">Mark as Verified</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('couples_allowed')}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-700">Couples Allowed</span>
              </label>

              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('bachelor_friendly')}
                  className="w-4 h-4 text-blue-600 border-slate-300 rounded focus:ring-blue-500"
                />
                <span className="text-sm font-semibold text-slate-700">Bachelor Friendly</span>
              </label>
            </div>
          </div>

          {/* Section 5: Amenities Selection */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-lg font-bold text-slate-900">
                  5. Amenities &amp; Facilities
                </h3>
                <p className="text-xs text-slate-500">Select all amenities available at this PG</p>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={selectAllAmenities}
                  className="text-blue-600 hover:underline"
                >
                  Select All
                </button>
                <span className="text-slate-300">|</span>
                <button
                  type="button"
                  onClick={clearAllAmenities}
                  className="text-rose-500 hover:underline"
                >
                  Clear All
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5">
              {ALL_AMENITIES.map(amenity => {
                const isChecked = selectedAmenities.includes(amenity)
                return (
                  <button
                    key={amenity}
                    type="button"
                    onClick={() => toggleAmenity(amenity)}
                    className={`flex items-center gap-2 p-3 rounded-xl border text-xs font-semibold text-left transition-all ${
                      isChecked
                        ? 'bg-blue-50 border-blue-400 text-blue-800 shadow-xs'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 border ${
                      isChecked ? 'bg-blue-600 border-blue-600 text-white' : 'border-slate-300'
                    }`}>
                      {isChecked && <span className="text-[10px] font-black leading-none">✓</span>}
                    </div>
                    <span className="truncate">{amenity}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 6: Room Options & Rent */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              6. Initial Room &amp; Rent Details
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Sharing Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Sharing Type
                </label>
                <select
                  value={roomSharing}
                  onChange={e => setRoomSharing(e.target.value as any)}
                  className="input-base bg-white"
                >
                  <option value="Single Sharing">Single Sharing</option>
                  <option value="2 Sharing">2 Sharing</option>
                  <option value="3 Sharing">3 Sharing</option>
                  <option value="4 Sharing">4 Sharing</option>
                </select>
              </div>

              {/* AC Type */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  AC Type
                </label>
                <select
                  value={roomAc}
                  onChange={e => setRoomAc(e.target.value as any)}
                  className="input-base bg-white"
                >
                  <option value="AC">AC</option>
                  <option value="Non AC">Non AC</option>
                </select>
              </div>

              {/* Monthly Price */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Monthly Rent (₹)
                </label>
                <input
                  type="number"
                  value={roomPrice}
                  onChange={e => setRoomPrice(e.target.value)}
                  placeholder="e.g. 7500"
                  className="input-base"
                />
              </div>

              {/* Security Deposit */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Security Deposit (₹)
                </label>
                <input
                  type="number"
                  value={roomSecurity}
                  onChange={e => setRoomSecurity(e.target.value)}
                  placeholder="e.g. 1000"
                  className="input-base"
                />
              </div>

              {/* Total Beds */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Total Beds
                </label>
                <input
                  type="number"
                  value={roomBedsTotal}
                  onChange={e => setRoomBedsTotal(e.target.value)}
                  placeholder="4"
                  className="input-base"
                />
              </div>

              {/* Available Beds */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Available Beds
                </label>
                <input
                  type="number"
                  value={roomBedsAvailable}
                  onChange={e => setRoomBedsAvailable(e.target.value)}
                  placeholder="2"
                  className="input-base"
                />
              </div>
            </div>
          </div>

          {/* Section 7: Property Images */}
          <div className="bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm space-y-6">
            <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              7. Property Image URLs
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Image URLs (one per line)
              </label>
              <textarea
                value={imageUrls}
                onChange={e => setImageUrls(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="input-base h-24 font-mono text-xs py-2 resize-none"
              />
              <p className="text-[11px] text-slate-400 mt-1">Leave as default or enter public image URLs separated by lines.</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="btn-secondary px-6"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary px-8 flex items-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Listing
                </>
              )}
            </button>
          </div>

        </form>
      </div>
    </PageWrapper>
  )
}

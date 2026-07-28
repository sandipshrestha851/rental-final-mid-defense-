"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
import {
  MapPin, Star, Heart, Share2, Bed, Bath, Maximize, Users, Wifi,
  ChefHat, Car, Waves, Dumbbell, Trees, Shield, Snowflake, Flame,
  Tv, Wind, Droplets, Flower2, Umbrella, ArrowLeft, X, Send, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import PropertyCard2 from '@/components/ui/PropertyCard2';
import type { Property, Review } from '@/lib/types';
import { api } from '@/lib/api';
import { useAuth } from '@/hooks/useAuth';

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1560184897-ae75f418493e?w=600&auto=format&fit=crop&q=60";

const iconMap: Record<string, React.ElementType> = {
  wifi: Wifi, kitchen: ChefHat, washer: Droplets, dryer: Wind, ac: Snowflake,
  heating: Flame, tv: Tv, pool: Waves, gym: Dumbbell, parking: Car,
  balcony: Trees, security: Shield, garden: Flower2, fireplace: Flame,
  beach: Umbrella, elevator: Maximize, patio: Trees,
};

const amenityNames: Record<string, string> = {
  wifi: 'WiFi', kitchen: 'Kitchen', washer: 'Washer', dryer: 'Dryer', ac: 'Air Conditioning',
  heating: 'Heating', tv: 'TV', pool: 'Pool', gym: 'Gym', parking: 'Free Parking',
  balcony: 'Balcony', security: 'Security System', garden: 'Garden', fireplace: 'Fireplace',
  beach: 'Beach Access', elevator: 'Elevator', patio: 'Patio',
};

interface PropertyDetailProps {
  property: Property;
  initialWishlisted?: boolean;
  onWishlistChange?: (v: boolean) => void;
  similarProperties?: Property[];
}

export default function PropertyDetail({
  property,
  initialWishlisted,
  onWishlistChange,
  similarProperties,
}: PropertyDetailProps) {
  const { user } = useAuth();
  const [selectedImage, setSelectedImage] = useState(0);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [favorited, setFavorited] = useState(initialWishlisted || false);
  const [wishlistLoading, setWishlistLoading] = useState(false);
  const [shareTooltip, setShareTooltip] = useState(false);

  const backendImages = (property.images || []).map(i => i.image_url.startsWith('http') ? i.image_url : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'}${i.image_url}`);
  const images = backendImages.length > 0
    ? backendImages
    : (property.photos?.length ? property.photos.filter(Boolean) : [property.imageUrl].filter(Boolean));
  const imagesToShow = images.length > 0 ? images : [PLACEHOLDER_IMAGE];
  const ownerName = property.landlordName || 'Host';

  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewLoading, setReviewLoading] = useState(true);
  const [newRating, setNewRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    setReviewLoading(true);
    api.getPropertyReviews(property.id)
      .then(setReviews)
      .catch(() => setReviews([]))
      .finally(() => setReviewLoading(false));
  }, [property.id]);

  async function handleSubmitReview() {
    if (newRating === 0 || !newComment.trim() || submittingReview) return;
    setSubmittingReview(true);
    try {
      await api.createReview(property.id, newRating, newComment.trim());
      setNewRating(0);
      setNewComment('');
      const fresh = await api.getPropertyReviews(property.id);
      setReviews(fresh);
    } catch {
      alert('Failed to submit review. Please try again.');
    } finally {
      setSubmittingReview(false);
    }
  }

  const handleWishlist = async () => {
    if (!user || wishlistLoading) return;
    setWishlistLoading(true);
    try {
      if (favorited) {
        await api.removeFromWishlist(property.id);
        setFavorited(false);
        onWishlistChange?.(false);
      } else {
        await api.addToWishlist(property.id);
        setFavorited(true);
        onWishlistChange?.(true);
      }
    } catch {}
    setWishlistLoading(false);
  };

  const handleShare = async () => {
    try {
      const info = await api.getShareInfo(property.id);
      if (navigator.share) {
        await navigator.share({ title: info.title, text: info.description, url: info.url });
      } else {
        await navigator.clipboard.writeText(info.url);
        setShareTooltip(true);
        setTimeout(() => setShareTooltip(false), 2000);
      }
    } catch {}
  };

  return (
    <div className="space-y-8">
      <Link href="/tenant" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-[#5E35B1] transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to properties
      </Link>

      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1A1A2E]">{property.title}</h1>
          <div className="flex items-center gap-4 mt-2">
            <div className="flex items-center gap-1 text-gray-500"><MapPin className="w-4 h-4" /><span>{property.address || property.location}, {property.city}, {property.state}</span></div>
            <div className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><span className="font-medium">{Number(property.rating).toFixed(1)}</span><span className="text-gray-400">({property.reviewCount || 0} {property.reviewCount === 1 ? 'review' : 'reviews'})</span></div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-xl" onClick={handleWishlist} disabled={wishlistLoading}>
            {wishlistLoading ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Heart className={`w-4 h-4 mr-1 ${favorited ? 'text-red-500 fill-red-500' : ''}`} />}
            {favorited ? 'Saved' : 'Save'}
          </Button>
          <Button variant="outline" size="sm" className="rounded-xl relative" onClick={handleShare}>
            <Share2 className="w-4 h-4 mr-1" /> Share
            {shareTooltip && <span className="absolute -bottom-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-xs text-white shadow">Link copied!</span>}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 rounded-2xl overflow-hidden">
        <div className="aspect-16/10 md:aspect-auto cursor-pointer" onClick={() => setGalleryOpen(true)}>
          <img src={imagesToShow[selectedImage]} alt={property.title} className="w-full h-full object-cover hover:opacity-95 transition-opacity" onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }} />
        </div>
        <div className="hidden md:grid grid-cols-2 gap-2">
          {imagesToShow.slice(0, 4).map((img, i) => (
            <div key={i} className={`aspect-4/3 cursor-pointer ${i >= imagesToShow.length - 1 ? 'relative' : ''}`} onClick={() => { setSelectedImage(i); setGalleryOpen(true); }}>
              <img src={img} alt={`${property.title} ${i + 1}`} className="w-full h-full object-cover hover:opacity-90 transition-opacity rounded-lg" onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }} />
              {i === 3 && imagesToShow.length > 4 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-lg">
                  <span className="text-white font-medium">+{imagesToShow.length - 4} more</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_380px] gap-8">
        <div className="space-y-8">
          <div className="flex flex-wrap gap-4 py-4 border-y border-gray-100">
            {[
              { icon: Bed, label: `${property.beds} Bedrooms` },
              { icon: Bath, label: `${property.baths} Bathrooms` },
              { icon: Maximize, label: `${property.sqft || 0} sqft` },
              { icon: Users, label: `Max ${property.guests || 2} guests` },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-2 text-gray-600"><item.icon className="w-5 h-5 text-gray-400" /><span className="text-sm">{item.label}</span></div>
            ))}
          </div>

          {property.description && (
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A2E] mb-3">About this property</h2>
              <p className="text-gray-600 leading-relaxed">{property.description}</p>
            </div>
          )}

          {property.amenities && property.amenities.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold text-[#1A1A2E] mb-4">What this place offers</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {property.amenities.map((amenityId) => {
                  const Icon = iconMap[amenityId] || Trees;
                  return (
                    <div key={amenityId} className="flex items-center gap-3 text-gray-600">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <span className="text-sm">{amenityNames[amenityId] || amenityId}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-4">Where you will be</h2>
            <div className="bg-gray-100 rounded-2xl h-64 flex items-center justify-center">
              <div className="text-center">
                <MapPin className="w-8 h-8 text-[#5E35B1] mx-auto mb-2" />
                <p className="text-gray-600 font-medium">{property.address || property.location}</p>
                <p className="text-gray-500 text-sm">{property.city}, {property.state} {property.zipCode}</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100">
            <Avatar className="w-14 h-14">
              <AvatarFallback className="bg-[#5E35B1] text-white text-lg">{ownerName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <p className="font-semibold text-[#1A1A2E]">{ownerName}</p>
              <p className="text-sm text-gray-500">Property Owner</p>
            </div>
            <Link href="/tenant/messages"><Button variant="outline" className="rounded-xl">Contact</Button></Link>
          </div>

          <div>
            <h2 className="text-xl font-semibold text-[#1A1A2E] mb-4">Reviews & Feedback</h2>
            <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6">
              <h3 className="text-sm font-semibold text-[#1A1A2E] mb-3">Write a review</h3>
              <div className="flex items-center gap-1 mb-3">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star key={star} className={`w-6 h-6 cursor-pointer transition-colors ${star <= (hoverRating || newRating) ? 'text-amber-400 fill-amber-400' : 'text-gray-300'}`}
                    onMouseEnter={() => setHoverRating(star)} onMouseLeave={() => setHoverRating(0)} onClick={() => setNewRating(star)} />
                ))}
                {newRating > 0 && <span className="ml-2 text-sm text-gray-500">{['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][newRating]}</span>}
              </div>
              <textarea placeholder="Share your experience..." value={newComment} onChange={(e) => setNewComment(e.target.value)}
                className="w-full border border-gray-200 rounded-xl p-3 text-sm text-gray-700 placeholder-gray-400 resize-none focus:outline-none focus:ring-2 focus:ring-[#5E35B1]/30 focus:border-[#5E35B1] transition-all" rows={3} />
              <div className="flex justify-end mt-3">
                <Button className="bg-[#5E35B1] hover:bg-[#4A2AA0] text-white rounded-xl text-sm" disabled={newRating === 0 || !newComment.trim() || submittingReview} onClick={handleSubmitReview}>
                  {submittingReview ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Send className="w-3.5 h-3.5 mr-1.5" />} {submittingReview ? 'Submitting...' : 'Submit Review'}
                </Button>
              </div>
            </div>
            <div className="space-y-4">
              {reviewLoading ? (
                Array.from({ length: 2 }).map((_, i) => (
                  <div key={i} className="animate-pulse p-4 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2"><div className="w-9 h-9 rounded-full bg-gray-100" /><div className="flex-1"><div className="h-3 w-24 rounded bg-gray-100" /><div className="mt-1 h-2 w-16 rounded bg-gray-100" /></div></div>
                    <div className="h-3 w-full rounded bg-gray-100" />
                  </div>
                ))
              ) : reviews.length === 0 ? (
                <p className="text-sm text-gray-400 text-center py-6">No reviews yet. Be the first to share your feedback!</p>
              ) : (
                reviews.map((review) => (
                  <div key={review.id} className="p-4 bg-white rounded-xl border border-gray-100">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="w-9 h-9"><AvatarFallback className="bg-[#5E35B1] text-white text-xs">{review.guestName.charAt(0)}</AvatarFallback></Avatar>
                      <div><p className="font-medium text-sm text-[#1A1A2E]">{review.guestName}</p><p className="text-xs text-gray-400">{new Date(review.createdAt).toLocaleDateString()}</p></div>
                      <div className="ml-auto flex gap-0.5">{Array.from({ length: review.rating }).map((_, i) => (<Star key={i} className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />))}</div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{review.comment}</p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="lg:sticky lg:top-24 h-fit">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-2xl font-bold text-[#1A1A2E]">${property.price.toLocaleString()}<span className="text-base font-normal text-gray-400">/month</span></p>
              <div className="flex items-center gap-1"><Star className="w-4 h-4 text-amber-400 fill-amber-400" /><span className="font-medium">{property.rating}</span></div>
            </div>
            <Link href={`/tenant/book/${property.id}`}>
              <Button className="cursor-pointer text-white w-full h-12 bg-[#5E35B1] hover:bg-[#4A2AA0] rounded-xl font-semibold text-base">Book Now</Button>
            </Link>
            <p className="text-center text-sm text-gray-400 mt-3">You will not be charged yet</p>
            <div className="mt-6 pt-6 border-t border-gray-100 space-y-3">
              <div className="flex justify-between text-sm"><span className="text-gray-600">Monthly rent</span><span className="font-medium">${property.price.toLocaleString()}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Security deposit</span><span className="font-medium">$0</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-600">Service fee</span><span className="font-medium">${Math.round(property.price * 0.05).toLocaleString()}</span></div>
              <div className="flex justify-between text-sm pt-3 border-t border-gray-100 font-semibold"><span>First month total</span><span>${(property.price + Math.round(property.price * 0.05)).toLocaleString()}</span></div>
            </div>
          </div>
        </div>
      </div>

      {galleryOpen && (
        <div className="fixed inset-0 z-600 bg-black/95 flex items-center justify-center p-4 animate-fadeIn" onClick={() => setGalleryOpen(false)}>
          <button className="absolute top-4 right-4 text-white/80 hover:text-white"><X className="w-8 h-8" /></button>
          <img src={imagesToShow[selectedImage]} alt="" className="max-w-full max-h-[85vh] object-contain rounded-lg" onClick={(e) => e.stopPropagation()} onError={(e) => { e.currentTarget.src = PLACEHOLDER_IMAGE; }} />
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {images.map((_, i) => (
              <button key={i} onClick={(e) => { e.stopPropagation(); setSelectedImage(i); }} className={`w-2 h-2 rounded-full transition-colors ${i === selectedImage ? 'bg-white' : 'bg-white/40'}`} />
            ))}
          </div>
        </div>
      )}

      {similarProperties && similarProperties.length > 0 && (
        <div className="pt-8 border-t border-gray-100">
          <h2 className="text-xl font-semibold text-[#1A1A2E] mb-4">Similar Properties</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {similarProperties.slice(0, 3).map((p) => (
              <PropertyCard2 key={p.id} property={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

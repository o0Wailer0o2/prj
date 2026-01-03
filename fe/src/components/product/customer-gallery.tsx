"use client";

import { ImageWithFallback } from "../image-with-fallback";

interface CustomerPhoto {
  id: number;
  url: string;
  alt: string;
}

interface CustomerGalleryProps {
  photos: CustomerPhoto[];
}

export default function CustomerGallery({ photos }: CustomerGalleryProps) {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">Customer Photos & Videos</h3>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-5 md:grid-cols-7">
        {photos.map((photo) => (
          <button
            key={photo.id}
            className="group relative aspect-square cursor-pointer overflow-hidden rounded-lg bg-gray-100 transition-all hover:ring-2 hover:ring-orange-400"
          >
            <ImageWithFallback
              src={photo.url || "/placeholder.svg"}
              alt={photo.alt}
              className="object-cover transition-transform group-hover:scale-105"
            />
          </button>
        ))}
      </div>
    </div>
  );
}

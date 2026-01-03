"use client";

import { Star, ShoppingCart, Heart, Truck, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger
} from "@/components/ui/accordion";

import RatingDistribution from "@/components/product/rating-distribution";
import ReviewSection from "@/components/product/review-section";
import CustomerGallery from "@/components/product/customer-gallery";
import { ImageWithFallback } from "@/components/image-with-fallback";
import type {
  ProductType,
  NewspaperDetails,
  BookDetails,
  CDDetails,
  DVDDetails
} from "@/lib/types/product";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { createProductDetailsQueryOptions } from "@/lib/tanstack/options/product";
import { useCartStore } from "@/stores/cart-store";
import { useState } from "react";
import { toast } from "sonner";

// Fake reviews & customer photos tạm thời vẫn mock
const mockReviews = [
  {
    id: 1,
    author: "Cristofer Torff",
    rating: 4.5,
    verified: true,
    date: "5-1-2025",
    text: "Almost complete building my replacement website and very pleased with the result. Although the customization is freate the theme's features and customer support have also been great.",
    helpful: 25,
    notHelpful: 1,
    avatar: "/images/image.png"
  },
  {
    id: 2,
    author: "Cris Baptista",
    rating: 4.5,
    verified: true,
    date: "11-12-2023",
    text: "Really nicely designed theme and quite fast loading. The quickness of page loads you can really appreciatence you turn off page transition theme options. Custom support was really quick to respond to all my questions and resolve all my issues.",
    helpful: 33,
    notHelpful: 3,
    avatar: "/images/image.png"
  },
  {
    id: 3,
    author: "Cheyenne",
    rating: 4.5,
    verified: true,
    date: "8-11-2023",
    text: "Very high quality theme and perfect for any business modal that wants to showcase it's products or services. Great work!",
    helpful: 20,
    notHelpful: 0,
    avatar: "/images/image.png"
  }
];

const mockCustomerPhotos = [
  { id: 1, url: "/images/image.png", alt: "Customer photo 1" },
  { id: 2, url: "/images/image.png", alt: "Customer photo 2" },
  { id: 3, url: "/images/image.png", alt: "Customer photo 3" },
  { id: 4, url: "/images/image.png", alt: "Customer photo 4" },
  { id: 5, url: "/images/image.png", alt: "Customer photo 5" },
  { id: 6, url: "/images/image.png", alt: "Customer photo 6" },
  { id: 7, url: "/images/image.png", alt: "Customer photo 7" }
];

export default function ProductDetail() {
  const { id } = useParams({ from: "/_shop/product/$id" });

  const addToCart = useCartStore((state) => state.addToCart);
  const navigate = useNavigate();
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = async () => {
    if (isAdded) return;

    try {
      setIsAdded(true);
      addToCart(product.id);
      toast.success("Added to cart");
    } catch {
      toast.error("Failed to add to cart");
    } finally {
      setTimeout(() => setIsAdded(false), 1000);
    }
  };

  const { data } = useQuery({ ...createProductDetailsQueryOptions({ id: Number(id) }) });

  if (!data) return <div>Error...</div>;

  const { product, book, cd, dvd, newspaper } = data;
  const discount =
    product.originalValue > product.currentPrice
      ? Math.round(((product.originalValue - product.currentPrice) / product.originalValue) * 100)
      : 0;

  const priceToDisplay = product.currentPrice ?? product.originalValue;

  const breadcrumbCategoryByType: Record<ProductType, string> = {
    BOOK: "Books",
    DVD: "DVD & Movies",
    CD: "Music CDs",
    NEWSPAPER: "News & Magazines"
  };

  const detailTitleByType: Record<ProductType, string> = {
    BOOK: "Book Information",
    DVD: "DVD Information",
    CD: "CD Information",
    NEWSPAPER: "Newspaper Information"
  };

  const renderTypeDetails = () => {
    switch (product.type) {
      case "BOOK": {
        const d = book as BookDetails | undefined;
        if (!d) return null;
        return (
          <div className="grid grid-cols-2 gap-6 py-4 md:grid-cols-3">
            <DetailItem label="Authors" value={d.authors} />
            <DetailItem label="Publisher" value={d.publisher} />
            <DetailItem label="Cover Type" value={d.coverType} />
            <DetailItem label="Pages" value={d.pages} />
            <DetailItem label="Language" value={d.language} />
            <DetailItem label="Genre" value={d.genre} />
            <DetailItem
              label="Publication Date"
              value={new Date(d.publicationDate).toLocaleDateString()}
            />
          </div>
        );
      }
      case "CD": {
        const d = cd as CDDetails | undefined;
        if (!d) return null;
        return (
          <div className="grid grid-cols-2 gap-6 py-4 md:grid-cols-3">
            <DetailItem label="Artists" value={d.artists} />
            <DetailItem label="Record Label" value={d.recordLabel} />
            <DetailItem label="Genre" value={d.genre} />
            <DetailItem label="Release Date" value={new Date(d.releaseDate).toLocaleDateString()} />
            <DetailItem label="Length (seconds)" value={d.lengthSeconds} />
          </div>
        );
      }
      case "DVD": {
        const d = dvd as DVDDetails | undefined;
        if (!d) return null;
        return (
          <div className="grid grid-cols-2 gap-6 py-4 md:grid-cols-3">
            <DetailItem label="Disc Type" value={d.discType} />
            <DetailItem label="Director" value={d.director} />
            <DetailItem label="Runtime" value={`${d.runtimeMinutes} minutes`} />
            <DetailItem label="Studio" value={d.studio} />
            <DetailItem label="Language" value={d.language} />
            <DetailItem label="Subtitles" value={d.subtitles} />
            <DetailItem label="Release Date" value={new Date(d.releaseDate).toLocaleDateString()} />
            <DetailItem label="Genre" value={d.genre} />
          </div>
        );
      }
      case "NEWSPAPER": {
        const d = newspaper as NewspaperDetails | undefined;
        if (!d) return null;
        return (
          <div className="grid grid-cols-2 gap-6 py-4 md:grid-cols-3">
            <DetailItem label="Editor in Chief" value={d.editorInChief} />
            <DetailItem label="Publisher" value={d.publisher} />
            <DetailItem
              label="Publication Date"
              value={new Date(d.publicationDate).toLocaleDateString()}
            />
            <DetailItem label="Issue Number" value={d.issueNumber} />
            <DetailItem label="Frequency" value={d.frequency} />
            <DetailItem label="ISSN" value={d.issn} />
            <DetailItem label="Language" value={d.language} />
            <DetailItem label="Sections" value={d.sections} />
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Breadcrumb */}
      <nav className="text-muted-foreground mb-8 flex items-center gap-2 text-sm">
        <span className="hover:text-foreground">{breadcrumbCategoryByType[product.type]}</span>
        <span>›</span>
        <span className="text-foreground">{product.title}</span>
      </nav>

      {/* Main Product Section */}
      <div className="mb-12 grid grid-cols-1 gap-8 lg:grid-cols-2">
        {/* Product Image */}
        <div className="bg-secondary flex min-h-96 items-center justify-center overflow-hidden rounded-lg">
          <ImageWithFallback
            src={product.imageUrl || "/placeholder.svg"}
            alt={product.title}
            width={400}
            height={500}
            className="h-full w-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col justify-between">
          <div>
            <h1 className="mb-4 text-3xl font-bold text-balance">{product.title}</h1>

            {/* Rating */}
            <div className="mb-6 flex items-center gap-4">
              <div className="flex items-center gap-1">
                <div className="flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      size={20}
                      className={
                        i < Math.floor(product.averageRating)
                          ? "fill-orange-400 text-orange-400"
                          : "text-gray-300"
                      }
                    />
                  ))}
                </div>
                <span className="text-lg font-semibold">{product.averageRating.toFixed(1)}</span>
              </div>
              <span className="text-muted-foreground">210 Reviews</span>
            </div>

            {/* Price */}
            <div className="mb-6">
              <div className="mb-2 flex items-center gap-3">
                <span className="text-4xl font-bold">${priceToDisplay.toFixed(2)}</span>
                {product.originalValue > priceToDisplay && (
                  <>
                    <span className="text-muted-foreground text-lg line-through">
                      MRP ${product.originalValue.toFixed(2)}
                    </span>
                    <span className="rounded bg-green-100 px-2 py-1 text-sm font-semibold text-green-700">
                      {discount}% OFF
                    </span>
                  </>
                )}
              </div>
            </div>

            {/* Description */}
            <p className="text-foreground mb-8 leading-relaxed text-balance">
              {product.description}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="mb-8 flex gap-4">
            <Button
              onClick={handleAddToCart}
              className="bg-primary text-primary-foreground hover:bg-primary/90 w-60 transition-all duration-200 ease-in-out hover:scale-[1.02]"
              size="lg"
            >
              <ShoppingCart className="mr-2" size={20} />
              Add to Cart
            </Button>
            <Button
              onClick={() => {
                handleAddToCart();
                navigate({ to: "/checkout" });
              }}
              variant="outline"
              className="hover:scale-[1.1]"
              size="lg"
            >
              Buy Now!
            </Button>
          </div>

          {/* Delivery Info Cards */}
          <div className="grid grid-cols-2 gap-4 hover:scale-90">
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <Truck size={24} className="text-primary mt-1" />
                <div>
                  <h3 className="mb-1 font-semibold">Free Delivery</h3>
                  <p className="text-muted-foreground text-sm">
                    Enter your postal code for
                    <br />
                    delivery Availability
                  </p>
                </div>
              </div>
            </Card>
            <Card className="p-4">
              <div className="flex items-start gap-3">
                <RotateCcw size={24} className="text-primary mt-1" />
                <div>
                  <h3 className="mb-1 font-semibold">Return Delivery</h3>
                  <p className="text-muted-foreground text-sm">
                    Free 30 Days Delivery
                    <br />
                    <a href="#" className="underline">
                      Returns.
                    </a>{" "}
                    <a href="#" className="underline">
                      Details
                    </a>
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </div>

      {/* Product Details Accordion */}
      <div className="mb-12">
        <h2 className="mb-6 text-2xl font-bold">Product Details</h2>
        <Accordion type="single" collapsible className="w-full">
          {/* Specifications */}
          <AccordionItem value="specifications">
            <AccordionTrigger className="text-lg font-semibold">Specifications</AccordionTrigger>
            <AccordionContent>
              <div className="grid grid-cols-2 gap-6 py-4 md:grid-cols-3">
                <DetailItem label="Product ID" value={product.id} />
                <DetailItem label="Barcode" value={product.barcode} />
                <DetailItem
                  label="Stock Status"
                  value={`${product.stock} Available`}
                  valueClassName="text-green-600"
                />
                <DetailItem label="Height" value={`${product.height} cm`} />
                <DetailItem label="Width" value={`${product.width} cm`} />
                <DetailItem label="Length" value={`${product.length} cm`} />
                <DetailItem label="Weight" value={`${product.weight} kg`} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Product Type Details */}
          <AccordionItem value="details">
            <AccordionTrigger className="text-lg font-semibold">
              {detailTitleByType[product.type]}
            </AccordionTrigger>
            <AccordionContent>{renderTypeDetails()}</AccordionContent>
          </AccordionItem>

          {/* Ratings & Reviews */}
          <AccordionItem value="ratings">
            <AccordionTrigger className="text-lg font-semibold">
              Ratings & Reviews (210)
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-8 py-6">
                <RatingDistribution />
                <CustomerGallery photos={mockCustomerPhotos} />
                <ReviewSection reviews={mockReviews} />
              </div>
            </AccordionContent>
          </AccordionItem>

          {/* Shipping & Returns */}
          <AccordionItem value="shipping">
            <AccordionTrigger className="text-lg font-semibold">
              Shipping & Returns
            </AccordionTrigger>
            <AccordionContent>
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="mb-2 font-semibold">Free Delivery</h3>
                  <p className="text-muted-foreground">
                    Get free delivery on orders over $50. Standard delivery takes 5-7 business days.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Returns Policy</h3>
                  <p className="text-muted-foreground">
                    We offer free returns within 30 days of purchase. Items must be unused and in
                    original condition. Contact our support team to initiate a return.
                  </p>
                </div>
                <div>
                  <h3 className="mb-2 font-semibold">Express Shipping</h3>
                  <p className="text-muted-foreground">
                    Upgrade to express shipping for next-day delivery in select areas. Additional
                    charges apply.
                  </p>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>
    </div>
  );
}

interface DetailItemProps {
  label: string;
  value: string | number;
  valueClassName?: string;
}

function DetailItem({ label, value, valueClassName }: DetailItemProps) {
  return (
    <div>
      <p className="text-muted-foreground mb-1 text-sm">{label}</p>
      <p className={`font-semibold ${valueClassName ?? ""}`}>{value}</p>
    </div>
  );
}

import { createFileRoute, useNavigate } from "@tanstack/react-router";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious
} from "@/components/ui/carousel";
import { Button } from "@/components/ui/button";
import { SectionProducts } from "@/components/product/section-products";
import { ArrowRight, BookOpen, Disc3, Music, Newspaper, Star } from "lucide-react";
import Autoplay from "embla-carousel-autoplay";
import { useRef } from "react";
export const Route = createFileRoute("/_shop/")({
  component: HomePage
});
const HERO_SLIDES = [
  {
    id: 1,
    title: "Discover Stories",
    subtitle: "That Transform",
    description:
      "Explore curated collections of books, music, DVDs, and newspapers from around the world",
    image: "/beautiful-library-books-shelf-warm-lighting.jpg"
  },
  {
    id: 2,
    title: "Your Collection",
    subtitle: "Awaits",
    description: "Premium media and entertainment for the discerning collector",
    image: "/vinyl-records-collection-colorful-cd-dvds-display.jpg"
  },
  {
    id: 3,
    title: "Stay Connected",
    subtitle: "Stay Informed",
    description: "Fresh newspapers and magazines delivered with curated news and insights",
    image: "/newspaper-magazine-collection-stack-morning-coffee.jpg"
  }
];

const CATEGORY_FEATURES = [
  {
    icon: BookOpen,
    title: "Premium Books",
    description: "Bestsellers, classics, and rare editions",
    count: "5000+"
  },
  {
    icon: Disc3,
    title: "Movies & DVDs",
    description: "Latest releases and timeless cinema",
    count: "2000+"
  },
  {
    icon: Music,
    title: "Music CDs",
    description: "All genres, artists, and eras",
    count: "3500+"
  },
  {
    icon: Newspaper,
    title: "News & Media",
    description: "Daily newspapers and magazines",
    count: "100+"
  }
];

export default function HomePage() {
  const navigate = useNavigate();
  const shopRef = useRef<HTMLDivElement>(null);

  return (
    <main className="bg-background min-h-screen">
      {/* Hero Carousel */}
      <section className="relative w-full overflow-hidden">
        <Carousel
          opts={{
            loop: true,
            duration: 6000,
            align: "start"
          }}
          plugins={[
            Autoplay({
              active: true,
              delay: 0,
              playOnInit: true,
              stopOnInteraction: false,
              // stopOnMouseEnter: true,
              // stopOnFocusIn: true,
              jump: false
            })
          ]}
        >
          <CarouselContent>
            {HERO_SLIDES.map((slide) => (
              <CarouselItem key={slide.id}>
                <div
                  className="relative h-[500px] w-full bg-cover bg-center md:h-[600px]"
                  style={{ backgroundImage: `url(${slide.image.toString()})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

                  <div className="relative flex h-full flex-col items-start justify-center px-6 md:px-16">
                    <div className="max-w-2xl space-y-6">
                      <div className="flex items-center gap-2">
                        <div className="h-1 w-12 bg-gradient-to-r from-amber-400 to-amber-600"></div>
                        <span className="text-sm font-semibold tracking-widest text-amber-400 uppercase">
                          New Collection
                        </span>
                      </div>

                      <h1 className="font-serif text-5xl leading-tight font-bold text-white md:text-6xl">
                        {slide.title}
                        <br />
                        <span className="text-amber-400">{slide.subtitle}</span>
                      </h1>

                      <p className="max-w-lg text-lg leading-relaxed text-gray-200">
                        {slide.description}
                      </p>

                      <div className="flex flex-wrap gap-4 pt-4">
                        <Button
                          onClick={() => shopRef.current?.scrollIntoView({ behavior: "smooth" })}
                          className="bg-amber-600 px-8 py-6 text-base font-semibold text-white shadow-lg hover:bg-amber-700"
                        >
                          Shop Now
                          <ArrowRight className="ml-2 h-5 w-5" />
                        </Button>
                        <Button
                          onClick={() => navigate({ to: "/search" })}
                          variant="outline"
                          className="border-white bg-transparent px-8 py-6 text-base font-semibold text-white hover:bg-white/10"
                        >
                          Explore Collections
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </section>

      {/* Category Features */}
      <section className="from-background to-background w-full bg-gradient-to-b via-slate-50 px-4 py-20 md:px-10 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 space-y-4 text-center">
            <span className="text-sm font-semibold tracking-widest text-amber-600 uppercase">
              What We Offer
            </span>
            <h2 className="text-foreground font-serif text-4xl font-bold md:text-5xl">
              Curated Collections
            </h2>
            <p className="text-muted-foreground mx-auto max-w-2xl text-lg">
              A carefully selected range of media, entertainment, and information across multiple
              categories
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
            {CATEGORY_FEATURES.map((category, idx) => {
              const Icon = category.icon;
              return (
                <div
                  key={idx}
                  className="group border-border bg-card relative overflow-hidden rounded-xl border p-8 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
                >
                  <div className="absolute inset-0 bg-gradient-to-br from-amber-400/0 to-amber-600/0 transition-all group-hover:from-amber-400/5 group-hover:to-amber-600/10" />

                  <div className="relative space-y-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-600">
                      <Icon className="h-6 w-6 text-white" />
                    </div>

                    <div>
                      <h3 className="text-foreground mb-2 text-xl font-semibold">
                        {category.title}
                      </h3>
                      <p className="text-muted-foreground text-sm">{category.description}</p>
                    </div>

                    <div className="border-border border-t pt-4">
                      <span className="text-2xl font-bold text-amber-600">{category.count}</span>
                      <span className="text-muted-foreground ml-2 text-sm">products available</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
      <div ref={shopRef} />
      {/* Product Carousel Sections */}
      <SectionProducts title="BOOKS" types={["BOOK"]} />
      <SectionProducts title="DVD & MOVIES" types={["DVD"]} direction="ltr" />
      <SectionProducts title="MUSIC CDs" types={["CD"]} />
      <SectionProducts title="NEWS & MAGAZINES" types={["NEWSPAPER"]} direction="ltr" />

      {/* Featured Banner Section */}
      <section className="w-full bg-gradient-to-r from-amber-50 to-orange-50 px-4 py-20 md:px-10 dark:from-amber-950/20 dark:to-orange-950/20">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
            <div className="space-y-8">
              <div className="space-y-4">
                <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-semibold tracking-widest text-amber-600 uppercase dark:bg-amber-900/30">
                  Exclusive Offer
                </span>
                <h2 className="text-foreground font-serif text-4xl font-bold md:text-5xl">
                  Premium Member Benefits
                </h2>
                <p className="text-muted-foreground text-lg leading-relaxed">
                  Join our community of collectors and enthusiasts. Get exclusive access to rare
                  items, early releases, and special discounts on your favorite media.
                </p>
              </div>

              <ul className="space-y-3">
                {[
                  "Free shipping on orders over $50",
                  "Exclusive access to limited editions",
                  "15% discount on all purchases",
                  "Priority customer support"
                ].map((benefit, idx) => (
                  <li key={idx} className="flex items-center gap-3">
                    <Star className="h-5 w-5 fill-amber-500 text-amber-500" />
                    <span className="text-foreground font-medium">{benefit}</span>
                  </li>
                ))}
              </ul>

              <Button className="bg-amber-600 px-8 py-6 text-base font-semibold text-white hover:bg-amber-700">
                Join Premium Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </div>

            <div className="relative h-96 overflow-hidden rounded-2xl shadow-2xl md:h-full">
              <img
                src="/luxury-collection-rare-books-dvds-organized-booksh.jpg"
                alt="Premium collection"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent" />
            </div>
          </div>
        </div>
      </section>

      {/* Trust Section */}
      <section className="bg-background w-full px-4 py-16 md:px-10">
        <div className="mx-auto max-w-7xl">
          <div className="grid grid-cols-2 gap-8 text-center md:grid-cols-4">
            {[
              { number: "50K+", label: "Happy Customers" },
              { number: "10K+", label: "Products" },
              { number: "99%", label: "Satisfaction Rate" },
              { number: "24/7", label: "Customer Support" }
            ].map((stat, idx) => (
              <div key={idx} className="space-y-2">
                <p className="font-serif text-3xl font-bold text-amber-600 md:text-4xl">
                  {stat.number}
                </p>
                <p className="text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

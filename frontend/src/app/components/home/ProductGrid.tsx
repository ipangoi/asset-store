"use client";

import { useEffect, useRef, useState } from "react";
import ProductCard from "../ui/ProductCard";
import api from "@/services/api";
import { ProductResponse } from "@/types/type"; 
import Link from "next/link";
import Cookies from "js-cookie";
import { ArrowLeft, ArrowRight } from "lucide-react";

export default function ProductGrid() {
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);

  const carouselRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await api.get("/product?limit=6");
        setProducts(response.data || []); 

        const token = Cookies.get("token");
        if (token) {
          const savedRes = await api.get("/user/saved-ids");
          setSavedIds(savedRes.data.saved_ids || []);
        }
      } catch (error) {
        console.log("Failed to fetch product:", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const scroll = (direction: "left" | "right") => {
    if (carouselRef.current) {
      const scrollAmount = direction === "left" ? -320 : 320;
      carouselRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const handleScroll = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      const maxScroll = scrollWidth - clientWidth;
      
      if (maxScroll <= 0) {
        setActiveIndex(0);
      } else {
        const progress = scrollLeft / maxScroll;
        const newIndex = Math.round(progress * (products.length - 1));
        setActiveIndex(newIndex);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black border-t-pink-500"></div>
      </div>
    );
  }

  return (
    <section className="bg-blue-100 px-4 py-16 sm:px-6 sm:py-24">
      <div className="mx-auto max-w-7xl">
        <h2 className="mb-6 text-2xl font-black text-slate-800 tracking-tight sm:mb-10 sm:text-3xl md:text-5xl">
          Featured Products
        </h2>

        <div className="relative">
        
          <button 
            onClick={() => scroll("left")}
            className="absolute -left-20 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-14 w-14 items-center justify-center rounded-full cursor-pointer border-4 border-black bg-pink-400 shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-y-[60%] hover:shadow-[4px_4px_0px_0px_#000] active:-translate-y-1/2 active:shadow-[0px_0px_0px_0px_#000]"
          >
            <ArrowLeft className="h-7 w-7 stroke-[3px] text-black" />
          </button>

          <div 
            ref={carouselRef}
            onScroll={handleScroll}
            className="flex overflow-x-auto gap-6 pb-8 snap-x snap-mandatory px-4 md:px-0 [&::-webkit-scrollbar]:hidden  scroll-smooth"
          >
            {products.map((product) => (
              <div 
                key={product.id} 
                className="snap-center shrink-0 w-[85vw] sm:w-[320px]"
              >
                <ProductCard
                  id={product.id}
                  title={product.title}
                  creator={product.seller_name ? product.seller_name : "Verified Creator"}
                  price={product.price}
                  imageUrl={product.thumbnail_url || "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80"}
                  isInitiallySaved={savedIds.includes(product.id)}
                />
              </div>
            ))}
          </div>

          <button 
            onClick={() => scroll("right")}
            className="absolute -right-20 top-1/2 -translate-y-1/2 z-20 hidden md:flex h-14 w-14 items-center justify-center rounded-full cursor-pointer border-4 border-black bg-emerald-400 shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-y-[60%] hover:shadow-[4px_4px_0px_0px_#000] active:-translate-y-1/2 active:shadow-[0px_0px_0px_0px_#000]"
          >
            <ArrowRight className="h-7 w-7 stroke-[3px] text-black" />
          </button>

        </div>

        <div className="flex justify-center gap-3 mt-4">
          {products.map((_, index) => (
            <div 
              key={index}
              className={`h-4 rounded-full border-4 border-black transition-all duration-300 ${
                activeIndex === index 
                  ? "w-10 bg-amber-400 shadow-[2px_2px_0px_0px_#000]" 
                  : "w-4 bg-white"
              }`}
            />
          ))}
        </div>

        <div className="mt-16 flex justify-center">
            <Link 
              href="/search" 
              className="rounded-full bg-yellow-400 px-10 py-4 text-xl font-black text-black border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-2 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-2 active:shadow-[0px_0px_0px_0px_#000] transition-all uppercase"
            >
              VIEW ALL ASSETS
            </Link>
        </div>
          
      </div>
    </section>
  );
}
"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search as SearchIcon, SearchX } from "lucide-react";
import ProductCard from "@/app/components/ui/ProductCard";
import { ProductResponse } from "@/types/type";
import api from "@/services/api";
import Cookies from "js-cookie";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
    const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const fetchSearchResults = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/product?q=${encodeURIComponent(query)}`);
        setProducts(response.data || []);

        const token = Cookies.get("token");
        if (token) {
          const savedRes = await api.get("/user/saved-ids");
          setSavedIds(savedRes.data.saved_ids || []);
        }
      } catch (error) {
        console.log("Failed to fetch search results", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSearchResults();
  }, [query]);

  return (
    <div className="min-h-screen bg-amber-100 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/"
          className="inline-flex items-center gap-2 bg-pink-500 px-4 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all font-black text-white uppercase text-xs tracking-wider mb-6 w-fit"
        >
          <ArrowLeft className="h-4 w-4 stroke-[3px]" />
          BACK TO HOME
        </Link>

        <div className="bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_#000] p-5 md:p-6 mb-8 flex items-center gap-5">
          <div className="hidden sm:flex h-12 w-12 bg-sky-400 border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_#000] items-center justify-center rotate-3 shrink-0">
            <SearchIcon className="h-6 w-6 text-black stroke-[3px]" />
          </div>
          <div>
            <h1 className="text-2xl md:text-2xl font-black text-black uppercase tracking-tight mb-1">
              {query ? "SEARCH RESULTS" : "EXPLORE ASSETS"}
            </h1>
            <p className="text-sm font-bold text-gray-600 uppercase tracking-wider">
              {query ? (
                <>
                  SHOWING RESULTS FOR: <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 border-2 border-black rounded-md ml-1">"{query}"</span>
                </>
              ) : (
                "SHOWING ALL ASSETS."
              )}
            </p>
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_#000] p-8 min-h-75 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black border-t-pink-500"></div>
          </div>
        ) : products.length > 0 ? (
          <div className="bg-sky-100 rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_#000] p-5 md:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  id={product.id}
                  title={product.title}
                  creator={product.seller_name ? product.seller_name : "Unknown"} 
                  price={product.price}
                  imageUrl={product.thumbnail_url}
                  isInitiallySaved={savedIds.includes(product.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-3xl border-4 border-black shadow-[6px_6px_0px_0px_#000] p-8 min-h-75 flex flex-col items-center justify-center text-center">
            <SearchX className="h-16 w-16 text-gray-300 mb-4" />
            <h2 className="text-2xl font-black text-black uppercase mb-2">NO ASSETS FOUND</h2>
            <p className="font-bold text-gray-500 uppercase text-sm">We couldn't find anything matching "{query}".</p>
          </div>
        )}

      </div>
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-amber-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black border-t-pink-500"></div>
      </div>
    }>
      <SearchContent />
    </Suspense>
  );
}
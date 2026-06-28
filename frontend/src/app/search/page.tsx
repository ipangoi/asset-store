"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search as SearchIcon, SearchX, SlidersHorizontal, X } from "lucide-react";
import ProductCard from "@/app/components/ui/ProductCard";
import { CategoryResponse, ProductResponse } from "@/types/type";
import api from "@/services/api";
import Cookies from "js-cookie";

function SearchContent() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";

  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<string[]>([]);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [categoryID, setCategoryID] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [appliedFilters, setAppliedFilters] = useState({ categoryID: "", sortBy: "", minPrice: "", maxPrice: "" });

  const hasActiveFilter = !!(appliedFilters.categoryID || appliedFilters.sortBy || appliedFilters.minPrice || appliedFilters.maxPrice);

  useEffect(() => {
    api.get("/category").then((res) => setCategories(res.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const params = new URLSearchParams();
        if (query) params.set("q", query);
        if (appliedFilters.categoryID) params.set("category_id", appliedFilters.categoryID);
        if (appliedFilters.sortBy) params.set("sort", appliedFilters.sortBy);
        if (appliedFilters.minPrice) params.set("min_price", appliedFilters.minPrice);
        if (appliedFilters.maxPrice) params.set("max_price", appliedFilters.maxPrice);

        const response = await api.get(`/product?${params.toString()}`);
        setProducts(response.data || []);

        const token = Cookies.get("token");
        if (token) {
          const savedRes = await api.get("/user/saved-ids");
          setSavedIds(savedRes.data.saved_ids || []);
        }
      } catch {
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };
    fetchResults();
  }, [query, appliedFilters]);

  const handleApplyFilters = () => {
    setAppliedFilters({ categoryID, sortBy, minPrice, maxPrice });
    setShowFilters(false);
  };

  const handleResetFilters = () => {
    setCategoryID("");
    setSortBy("");
    setMinPrice("");
    setMaxPrice("");
    setAppliedFilters({ categoryID: "", sortBy: "", minPrice: "", maxPrice: "" });
    setShowFilters(false);
  };

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

        <div className="bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_#000] p-5 md:p-6 mb-4 flex items-center justify-between gap-5">
          <div className="flex items-center gap-5 min-w-0">
            <div className="hidden sm:flex h-12 w-12 bg-sky-400 border-4 border-black rounded-lg shadow-[4px_4px_0px_0px_#000] items-center justify-center rotate-3 shrink-0">
              <SearchIcon className="h-6 w-6 text-black stroke-[3px]" />
            </div>
            <div className="min-w-0">
              <h1 className="text-2xl font-black text-black uppercase tracking-tight mb-1">
                {query ? "SEARCH RESULTS" : "EXPLORE ASSETS"}
              </h1>
              <p className="text-sm font-bold text-gray-600 uppercase tracking-wider truncate">
                {query ? (
                  <>RESULTS FOR: <span className="text-emerald-600 bg-emerald-100 px-2 py-0.5 border-2 border-black rounded-md ml-1">"{query}"</span></>
                ) : (
                  "SHOWING ALL ASSETS."
                )}
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`relative flex items-center gap-2 px-4 py-2.5 rounded-xl border-4 border-black shadow-[3px_3px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[5px_5px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all font-black text-sm uppercase tracking-wider cursor-pointer shrink-0 ${showFilters ? "bg-amber-400" : "bg-white"}`}
          >
            <SlidersHorizontal className="h-4 w-4 stroke-[3px]" />
            <span className="hidden sm:inline">FILTERS</span>
            {hasActiveFilter && (
              <span className="absolute -top-2 -right-2 h-4 w-4 flex items-center justify-center bg-red-500 border-2 border-black rounded-full text-white text-[9px] font-black">!</span>
            )}
          </button>
        </div>

        {/* Filter panel */}
        {showFilters && (
          <div className="bg-white rounded-xl border-4 border-black shadow-[6px_6px_0px_0px_#000] p-5 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">Category</label>
                <select
                  value={categoryID}
                  onChange={(e) => setCategoryID(e.target.value)}
                  className="w-full border-4 border-black rounded-lg px-3 py-2 font-bold text-sm bg-white focus:outline-none focus:bg-sky-50"
                >
                  <option value="">All Categories</option>
                  {categories.map((cat) => (
                    <option key={cat.id} value={cat.id}>{cat.category_name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">Sort By</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full border-4 border-black rounded-lg px-3 py-2 font-bold text-sm bg-white focus:outline-none focus:bg-sky-50"
                >
                  <option value="">Newest First</option>
                  <option value="price_asc">Price: Low to High</option>
                  <option value="price_desc">Price: High to Low</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">Min Price (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  placeholder="0"
                  className="w-full border-4 border-black rounded-lg px-3 py-2 font-bold text-sm bg-white focus:outline-none focus:bg-sky-50"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-black mb-1.5">Max Price (Rp)</label>
                <input
                  type="number"
                  min="0"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  placeholder="No limit"
                  className="w-full border-4 border-black rounded-lg px-3 py-2 font-bold text-sm bg-white focus:outline-none focus:bg-sky-50"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-4 justify-end">
              <button
                onClick={handleResetFilters}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-4 border-black bg-white shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all font-black text-sm uppercase cursor-pointer"
              >
                <X className="h-4 w-4 stroke-[3px]" />
                RESET
              </button>
              <button
                onClick={handleApplyFilters}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl border-4 border-black bg-emerald-400 shadow-[2px_2px_0px_0px_#000] hover:-translate-y-0.5 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-0.5 active:shadow-none transition-all font-black text-sm uppercase cursor-pointer"
              >
                APPLY FILTERS
              </button>
            </div>
          </div>
        )}

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
                  creator={product.seller_name || "Unknown"}
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
            <p className="font-bold text-gray-500 uppercase text-sm">
              {query ? `We couldn't find anything matching "${query}".` : "No assets match your filters."}
            </p>
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

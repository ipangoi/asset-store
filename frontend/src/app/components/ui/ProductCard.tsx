"use client";

import Link from "next/link";
import { Bookmark, Star } from "lucide-react";
import api from "@/services/api";
import Cookies from "js-cookie";
import { useState } from "react";
import { useRouter } from "next/navigation";

interface ProductCardProps {
  id: string;
  title: string;
  creator: string;
  price: number;
  imageUrl: string;
  isInitiallySaved?: boolean;
  onRemove?: () => void;
}

export default function ProductCard({ id, title, creator, price, imageUrl, isInitiallySaved = false, onRemove }: ProductCardProps) {
  const router = useRouter();
  const [isSaved, setIsSaved] = useState(isInitiallySaved);

  const imageSource = imageUrl || "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80";

  const handleToggleSave = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const previousState = isSaved;
    setIsSaved(!previousState);

    try {
      await api.post(`/product/${id}/save`);

      if (previousState === true && onRemove) {
        onRemove();
      }
    } catch (error) {
      console.log("Failed to save product:", error);
      setIsSaved(previousState); 
      alert("Failed to save product. Please try again.");
    }
  };

  
  return (
    <Link href={`/product/${id}`} className="group block h-full">
      <div className="h-full overflow-hidden rounded-xl bg-white border-4 border-black shadow-[2px_2px_0px_0px_#000] transition-all  active:translate-y-2 active:shadow-[0px_0px_0px_0px_#000] flex flex-col">
        <div className="relative h-56 w-full bg-gray-100 border-b-4 border-black p-3">
          
          <button
            onClick={handleToggleSave}
            className="absolute top-5 right-5 z-10 flex h-10 w-10 items-center justify-center rounded-full cursor-pointer border-3 border-black bg-white shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000]"
          >
            <Bookmark
              className={`h-5 w-5 stroke-[3px] transition-colors ${
                isSaved
                  ? "fill-pink-500 text-pink-500"
                  : "fill-transparent text-black" 
              }`}
            />
          </button>
          <span className="absolute top-5 left-5 z-10 rounded-xl bg-amber-500 border-2 border-black px-3 py-1.5 sm:px-4 sm:py-2 text-base sm:text-lg font-black text-black shadow-[2px_2px_0px_0px_#000]">
            {price !== 0 ? "Rp  " + price.toLocaleString('id-ID') : "Free"}
          </span>

          <div className="relative h-full w-full overflow-hidden rounded-xl border-4 border-black">
            <img 
              src={imageSource} 
              alt={title} 
              className="object-cover h-full w-full transition-transform group-hover:scale-105" 
            />
          </div>
          
        </div>

        <div className="flex flex-col grow p-5 sm:p-6">
          <h3 className="line-clamp-2 text-xl font-black text-black uppercase leading-tight group-hover:underline">{title}</h3>
          <p className="mt-2 text-sm font-bold text-gray-500 grow">By {creator}</p>
          
          
          {/* <div className="mt-4 flex items-center justify-between">
            <span className="rounded-xl bg-amber-500 border-2 border-black px-3 py-1.5 sm:px-4 sm:py-2 text-base sm:text-lg font-black text-black shadow-[2px_2px_0px_0px_#000]">
              {price !== 0 ? "Rp  " + price.toLocaleString('id-ID') : "Free"}
            </span>
            <div className="flex items-center space-x-1 rounded-full border-2 border-black bg-white px-2 py-1 sm:px-3 sm:py-1 shadow-[2px_2px_0px_0px_#000]">
              <Star className="h-4 w-4 sm:h-5 sm:w-5 fill-yellow-400 text-black stroke-[2px]" />
              <span className="text-sm sm:text-base font-black text-black">{rating}</span>
            </div>
          </div> */}

          <div className="mt-5 w-full rounded-xl bg-cyan-400 border-4 border-black py-3 text-center text-sm font-black text-black uppercase tracking-widest shadow-[2px_2px_0px_0px_#000] group-hover:-translate-y-1 group-hover:shadow-[4px_4px_0px_0px_#000] transition-all">
            View Detail
          </div>
        </div>

      </div>
    </Link>
  );
}
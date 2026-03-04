"use client";

import Link from "next/link";
import {  CheckCircle, Download, Loader2, XCircle } from "lucide-react";
import api from "@/services/api";
import { useState } from "react";

interface PurchasedProductCardProps {
  id: string;
  title: string;
  price: number;
  creator: string;
  imageUrl: string;
  token: string;
}

export default function PurchasedProductCard({ 
  id, 
  title, 
  price, 
  creator,
  imageUrl,
  token, 
}: PurchasedProductCardProps) {
  const [popupState, setPopupState] = useState<"idle" | "loading" | "success" | "error">("idle");
  
  const imageSource = imageUrl || "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80";

    const handleDownload = async (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setPopupState("loading");
        setTimeout(() => {
            setPopupState("success"); 
            window.open(`http://localhost:8080/product/${id}/download?token=${token}`, "_self");
            
            setTimeout(() => {
                setPopupState("idle");
            }, 2000);
        }, 1000);
    };

  return (
    <div className="relative h-full flex flex-col overflow-hidden rounded-xl bg-white border-4 border-black shadow-[2px_2px_0px_0px_#000] transition-all">
      
      {popupState !== "idle" && (
        <div className="absolute inset-0 z-49 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-5 text-center transition-all animate-in fade-in zoom-in-95">
          

          {popupState === "loading" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 text-black stroke-[3px] animate-spin" />
              <p className="font-black text-black uppercase tracking-wider">Downloading...</p>
            </div>
          )}

          {popupState === "success" && (
            <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-2">
              <CheckCircle className="h-12 w-12 text-emerald-500 stroke-[3px]" />
              <h4 className="text-xl font-black text-black uppercase leading-tight">Downloaded</h4>
            </div>
          )}

          {popupState === "error" && (
            <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-2">
              <XCircle className="h-12 w-12 text-red-500 stroke-[3px]" />
              <h4 className="text-lg font-black text-black uppercase leading-tight">Failed to Download</h4>
              <p className="text-xs font-bold text-gray-500 uppercase">Try again.</p>
            </div>
          )}
        </div>
      )}

      <div className="relative h-56 w-full bg-pink-100 border-b-4 border-black p-3">
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
        <h3 className="line-clamp-2 text-xl font-black text-black uppercase leading-tight mb-2">{title}</h3>
        <p className="mb-2 text-sm font-bold text-gray-500 grow">BY {creator}</p>
        
        <div className="mb-4">
            <span className="text-xs font-black text-black border-2 border-black bg-emerald-300 px-2 py-1 rounded-md uppercase">
                Active
            </span>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
            <button
                onClick={handleDownload}
                className="flex px-3 py-4 h-10 w-auto items-center justify-center rounded-xl cursor-pointer border-4 border-black bg-sky-400 shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000]"
                >
                <Download className="h-5 w-5 text-black stroke-[3px]" /> 
                <span className="px-3 text-base sm:text-lg font-black text-black">Download</span>
            </button>

        </div>

      </div>
    </div>
  );
}
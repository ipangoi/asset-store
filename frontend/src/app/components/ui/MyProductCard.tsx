"use client";

import Link from "next/link";
import { AlertTriangle, CheckCircle, Loader2, Pencil, Trash2, XCircle } from "lucide-react";
import api from "@/services/api";
import { useState } from "react";

interface MyProductCardProps {
  id: string;
  title: string;
  price: number;
  imageUrl: string;
  onDelete?: () => void;
}

export default function MyProductCard({ 
  id, 
  title, 
  price, 
  imageUrl, 
  onDelete 
}: MyProductCardProps) {
  const [popupState, setPopupState] = useState<"idle" | "confirm" | "loading" | "success" | "error">("idle");
  
  const imageSource = imageUrl || "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80";

  const handleDelete = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPopupState("confirm");
  }

  const proceedDelete = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPopupState("loading");
    try {
      await api.delete(`/product/${id}`);
      
        setPopupState("success"); 
        setTimeout(() => {
          if (onDelete) onDelete();
        }, 1500);
        
      } catch (error) {
        console.log("Failed to delete product:", error);
        setPopupState("error");
        setTimeout(() => {
          setPopupState("idle");
        }, 2000);
      } 
  
  }

  return (
    <div className="relative h-full flex flex-col overflow-hidden rounded-xl bg-white border-4 border-black shadow-[2px_2px_0px_0px_#000] transition-all">
      
      {popupState !== "idle" && (
        <div className="absolute inset-0 z-50 flex flex-col items-center justify-center bg-white/95 backdrop-blur-sm p-5 text-center transition-all animate-in fade-in zoom-in-95">
          
          {popupState === "confirm" && (
            <>
              <AlertTriangle className="h-12 w-12 text-red-500 mb-3 stroke-[3px]" />
              <h4 className="text-xl font-black text-black uppercase leading-tight mb-4">
                Delete Asset?
              </h4>
              <div className="flex w-full gap-3">
                <button 
                  onClick={(e) => { e.stopPropagation(); setPopupState("idle"); }} 
                  className="flex-1 rounded-xl bg-gray-200 border-4 border-black py-2 font-black text-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  NO
                </button>
                <button 
                  onClick={proceedDelete} 
                  className="flex-1 rounded-xl bg-red-500 border-4 border-black py-2 font-black text-white shadow-[2px_2px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all cursor-pointer"
                >
                  YES
                </button>
              </div>
            </>
          )}

          {popupState === "loading" && (
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="h-10 w-10 text-black stroke-[3px] animate-spin" />
              <p className="font-black text-black uppercase tracking-wider">Deleting...</p>
            </div>
          )}

          {popupState === "success" && (
            <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-2">
              <CheckCircle className="h-12 w-12 text-emerald-500 stroke-[3px]" />
              <h4 className="text-xl font-black text-black uppercase leading-tight">Deleted</h4>
            </div>
          )}

          {popupState === "error" && (
            <div className="flex flex-col items-center gap-2 animate-in slide-in-from-bottom-2">
              <XCircle className="h-12 w-12 text-red-500 stroke-[3px]" />
              <h4 className="text-lg font-black text-black uppercase leading-tight">Failed to delete</h4>
              <p className="text-xs font-bold text-gray-500 uppercase">Try again later.</p>
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
        
        <div className="mb-4">
            <span className="text-xs font-black text-black border-2 border-black bg-emerald-300 px-2 py-1 rounded-md uppercase">
                Active
            </span>
        </div>

        <div className="flex flex-col gap-2 mt-auto">
            <Link
                href={`/edit-product/${id}`} 
                className="flex px-3 py-4 h-10 w-auto items-center justify-center rounded-xl border-4 border-black bg-sky-400 shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000]"
                >
                <Pencil className="h-5 w-5 text-black stroke-[3px]" /> 
                <span className="px-3 text-base sm:text-lg font-black text-black">Edit</span>
            </Link>

            <button
                onClick={handleDelete}
                className="flex px-3 py-4 h-10 w-auto cursor-pointer items-center justify-center rounded-xl border-4 border-black bg-red-400 shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000]"
                >
                <Trash2 className="h-5 w-5 text-black stroke-[3px]" />
                <span className="px-2 text-base sm:text-lg font-black text-black">Delete</span>
            </button>

        </div>

      </div>
    </div>
  );
}
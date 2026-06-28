"use client";

import Link from "next/link";
import { CheckCircle, Download, Loader2, XCircle, Clock, AlertTriangle } from "lucide-react";
import { useState } from "react";

interface PurchasedProductCardProps {
  id: string;
  title: string;
  price: number;
  creator: string;
  imageUrl: string;
  token: string;
  orderID?: string;
  status?: string;
  purchasedAt?: string;
}

export default function PurchasedProductCard({
  id,
  title,
  price,
  creator,
  imageUrl,
  token,
  orderID,
  status = "settlement",
  purchasedAt,
}: PurchasedProductCardProps) {
  const [popupState, setPopupState] = useState<"idle" | "loading" | "success" | "error">("idle");

  const imageSource = imageUrl || "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80";

  const handleDownload = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setPopupState("loading");
    setTimeout(() => {
      setPopupState("success");
      window.open(`/api/product/${id}/download?token=${token}`, "_blank");
      setTimeout(() => setPopupState("idle"), 2000);
    }, 1000);
  };

  const formattedDate = purchasedAt
    ? new Date(purchasedAt).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" })
    : null;

  const statusBadge = () => {
    switch (status) {
      case "settlement":
        return <span className="text-xs font-black text-black border-2 border-black bg-emerald-300 px-2 py-1 rounded-md uppercase flex items-center gap-1"><CheckCircle className="h-3 w-3 stroke-[3px]" />Paid</span>;
      case "pending":
        return <span className="text-xs font-black text-black border-2 border-black bg-amber-300 px-2 py-1 rounded-md uppercase flex items-center gap-1"><Clock className="h-3 w-3 stroke-[3px]" />Pending</span>;
      default:
        return <span className="text-xs font-black text-black border-2 border-black bg-red-300 px-2 py-1 rounded-md uppercase flex items-center gap-1"><AlertTriangle className="h-3 w-3 stroke-[3px]" />Failed</span>;
    }
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

      <Link href={`/product/${id}`} className="relative h-56 w-full bg-pink-100 border-b-4 border-black p-3 block">
        <span className="absolute top-5 left-5 z-10 rounded-xl bg-amber-500 border-2 border-black px-3 py-1.5 text-base font-black text-black shadow-[2px_2px_0px_0px_#000]">
          {price !== 0 ? "Rp " + price.toLocaleString("id-ID") : "Free"}
        </span>
        <div className="relative h-full w-full overflow-hidden rounded-xl border-4 border-black">
          <img src={imageSource} alt={title} className="object-cover h-full w-full" />
        </div>
      </Link>

      <div className="flex flex-col grow p-5">
        <h3 className="line-clamp-2 text-xl font-black text-black uppercase leading-tight mb-1">{title}</h3>
        <p className="mb-3 text-sm font-bold text-gray-500">BY {creator}</p>

        <div className="flex items-center justify-between mb-3">
          {statusBadge()}
          {formattedDate && (
            <span className="text-xs font-bold text-gray-400">{formattedDate}</span>
          )}
        </div>

        {orderID && (
          <p className="text-xs font-bold text-gray-400 mb-3 truncate" title={orderID}>
            #{orderID}
          </p>
        )}

        <div className="flex flex-col gap-2 mt-auto">
          {status === "settlement" ? (
            <button
              onClick={handleDownload}
              className="flex px-3 py-4 h-10 w-auto items-center justify-center rounded-xl cursor-pointer border-4 border-black bg-sky-400 shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none"
            >
              <Download className="h-5 w-5 text-black stroke-[3px]" />
              <span className="px-3 text-base font-black text-black">Download</span>
            </button>
          ) : status === "pending" ? (
            <a
              href={`/product/${id}`}
              className="flex px-3 py-4 h-10 w-auto items-center justify-center rounded-xl border-4 border-black bg-amber-300 shadow-[2px_2px_0px_0px_#000] transition-all hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000]"
            >
              <span className="text-base font-black text-black">Complete Payment</span>
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

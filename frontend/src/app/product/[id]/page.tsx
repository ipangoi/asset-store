"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Star, ShoppingCart, Bookmark, AlertTriangle, XCircle, Clock, CheckCircle, Loader2 } from "lucide-react";
import Cookies from "js-cookie";
import api from "@/services/api";
import { ProductResponse } from "@/types/type";

declare global {
  interface Window {
    snap: any;
  }
}

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaved, setIsSaved] = useState(false); // State untuk Bookmark

  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "loading" | "success" | "pending" | "error" | "closed">("idle");
  const [statusMessage, setStatusMessage] = useState("");

  const [showSimulator, setShowSimulator] = useState(false); // simulator state

  const [isZoomed, setIsZoomed] = useState(false);

  const handleCheckout = async () => {
    const token = Cookies.get("token");
    if (!token) {
      router.push(`/login?redirect=/product/${id}`);
      return;
    }

    setCheckoutStatus("loading");

    try {
      const response = await api.post("/transaction", {
        product_id: id 
      });

      const snapToken = response.data.snap_token;
      const isFree = response.data.is_free;

      setCheckoutStatus("idle");

      if (isFree || snapToken === "") {
        setCheckoutStatus("success");
        setTimeout(() => {
          router.push("/dashboard");
        }, 2000);
        return;
      }

      setShowSimulator(true);

      window.snap.pay(snapToken, {
        onSuccess: function (result: any) {
          setCheckoutStatus("success");
          setShowSimulator(false);
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        },
        onPending: function (result: any) {
          setCheckoutStatus("pending");
          setTimeout(() => {
            router.push("/dashboard");
          }, 2000);
        },
        onError: function (result: any) {
          setCheckoutStatus("error");
          setShowSimulator(false);
          setStatusMessage("Payment failed. Please try again.");
          setTimeout(() => {
            setCheckoutStatus("idle");
          }, 3000);
        },
        onClose: function () {
          setCheckoutStatus("closed");
          setShowSimulator(false);
          setTimeout(() => {
            setCheckoutStatus("idle");
          }, 3000);
        },
      });

    } catch (error: any) {
      setCheckoutStatus("error");
      setStatusMessage(error.response?.data?.error || "Failed to checkout. Please try again.");
      setShowSimulator(false);
      setTimeout(() => {
        setCheckoutStatus("idle");
      }, 3000);
    }
  };

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const response = await api.get(`/product/${id}`);
        setProduct(response.data);

        const token = Cookies.get("token");
        if (token) {
          const savedRes = await api.get("/user/saved-ids");
          const savedIds = savedRes.data.saved_ids || [];
          if (savedIds.includes(id as string)) {
            setIsSaved(true); 
          }
        }
      } catch (error) {
        console.log("Failed to fetch product:", error);
        router.push("/");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProductData();
  }, [id, router]);

  // Fungsi toggle Bookmark
  const handleToggleSave = async () => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login?redirect=/product/" + id);
      return;
    }

    const previousState = isSaved;
    setIsSaved(!previousState);

    try {
      await api.post(`/product/${id}/save`);
    } catch (error) {
      console.log("Failed to save product:", error);
      setIsSaved(previousState);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-sky-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black border-t-pink-500"></div>
      </div>
    );
  }

  if (!product) return null;

  const imageSource = product.thumbnail_url || "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80";

  return (
    <div className="min-h-screen bg-sky-50 py-10 px-4 md:px-8 font-sans">

      {/* handle transaction message status */}
      {checkoutStatus !== "idle" && (
        <div className="fixed inset-0 z-99 flex items-center justify-center bg-white/80 backdrop-blur-sm p-4 transition-all animate-in fade-in zoom-in-95">
          <div className="flex flex-col items-center justify-center bg-white border-4 border-black p-8 rounded-3xl shadow-[8px_8px_0px_0px_#000] text-center max-w-sm w-full">
            
            {checkoutStatus === "loading" && (
              <>
                <Loader2 className="h-16 w-16 text-black stroke-[3px] animate-spin mb-4" />
                <h4 className="text-2xl font-black text-black uppercase">Processing...</h4>
                <p className="font-bold text-gray-500 mt-2">Getting your payment...</p>
              </>
            )}
            
            {checkoutStatus === "success" && (
              <>
                <CheckCircle className="h-16 w-16 text-emerald-500 stroke-[3px] mb-4 animate-bounce" />
                <h4 className="text-2xl font-black text-black uppercase">Success</h4>
                <p className="font-bold text-gray-500 mt-2">Product successfully added to your library.</p>
              </>
            )}
            
            {checkoutStatus === "pending" && (
              <>
                <Clock className="h-16 w-16 text-amber-500 stroke-[3px] mb-4 animate-pulse" />
                <h4 className="text-2xl font-black text-black uppercase">Pending</h4>
                <p className="font-bold text-gray-500 mt-2">Waiting for payment confirmation...</p>
              </>
            )}
            
            {checkoutStatus === "error" && (
              <>
                <XCircle className="h-16 w-16 text-red-500 stroke-[3px] mb-4" />
                <h4 className="text-2xl font-black text-black uppercase">Failed</h4>
                <p className="font-bold text-gray-500 mt-2">{statusMessage}</p>
              </>
            )}
            
            {checkoutStatus === "closed" && (
              <>
                <AlertTriangle className="h-16 w-16 text-amber-500 stroke-[3px] mb-4" />
                <h4 className="text-2xl font-black text-black uppercase">Canceled</h4>
                <p className="font-bold text-gray-500 mt-2">Payment canceled.</p>
              </>
            )}

          </div>
        </div>
      )}
      
      <div className="max-w-6xl mx-auto">
        
        {/* back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mb-8 bg-amber-400 px-4 py-2 rounded-xl cursor-pointer border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all font-black text-black uppercase text-sm w-fit"
        >
          <ArrowLeft className="h-4 w-4 stroke-[3px]" />
          BACK
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          
          {/* left column */}
          <div className="lg:col-span-7 flex flex-col gap-8">
            <div onClick={() => setIsZoomed(true)} className="group w-full relative aspect-4/3 rounded-4xl cursor-pointer border-4 border-black shadow-[8px_8px_0px_0px_#000] overflow-hidden bg-white">
              <img
                src={imageSource}
                alt={product.title}
                className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"

              />
            </div>
            {isZoomed && (
              <div 
                className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm cursor-zoom-out"
                onClick={() => setIsZoomed(false)}
              >
                <img
                  src={imageSource}
                  alt={product.title}
                  className="max-w-full max-h-full object-contain rounded-xl border-4 border-black"
                />
              </div>
            )}

            <div className="bg-white rounded-4xl border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-8">
              <h2 className="text-2xl font-black text-black uppercase mb-4 tracking-wide border-b-4 border-black pb-2 inline-block">
                Description
              </h2>
              <div className="prose prose-black max-w-none font-bold text-gray-700 leading-relaxed whitespace-pre-wrap mt-4">
                {product.description || "The creator has not provided a description for this asset yet."}
              </div>
            </div>
          </div>

          {/* right column */}
          <div className="lg:col-span-5">
            <div className="sticky top-24 flex flex-col gap-6 bg-white rounded-4xl border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-8">
              
              <div>
                <h1 className="text-3xl md:text-4xl font-black text-black leading-tight mb-2 uppercase tracking-tight">
                  {product.title}
                </h1>
                <p className="text-base font-bold text-gray-500 uppercase">
                  BY <span className="underline decoration-4 underline-offset-4 decoration-pink-400 text-black">
                    {product.seller_name ? product.seller_name : "Unknown"} 
                  </span>
                </p>
              </div>

              {/* rating (not yet implemented) */}
              <div className="flex items-center gap-2 mt-2">
                <div className="flex items-center gap-1">
                  <Star className="h-5 w-5 fill-amber-400 text-black stroke-[2px]" />
                  <Star className="h-5 w-5 fill-amber-400 text-black stroke-[2px]" />
                  <Star className="h-5 w-5 fill-amber-400 text-black stroke-[2px]" />
                  <Star className="h-5 w-5 fill-amber-400 text-black stroke-[2px]" />
                  <Star className="h-5 w-5 fill-amber-400 text-black stroke-[2px]" />
                </div>
                <span className="text-sm font-black text-black border-2 border-black bg-amber-100 px-2 py-0.5 rounded-md shadow-[2px_2px_0px_0px_#000]">
                  {product.average_rating?.toFixed(1)} ({product.total_reviews})
                </span>
              </div>

              {/* price */}
              <div className="text-4xl font-black text-black mt-2 mb-2 bg-green-300 inline-block w-fit px-4 py-2 border-4 border-black shadow-[4px_4px_0px_0px_#000] -rotate-2">
                {product.price === 0 ? "FREE" : `Rp ${product.price.toLocaleString("id-ID")}`}
              </div>

              {/* buy and save button */}
              <div className="flex gap-4 mt-2">
                <button onClick={handleCheckout} disabled={isCheckingOut} className="flex-1 flex items-center justify-center gap-2 bg-pink-500 px-6 py-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed">
                  <span className="text-lg font-black text-white uppercase tracking-wider">
                    {isCheckingOut ? "PROCESSING..." : "BUY NOW"}
                  </span>
                  <ShoppingCart className="h-6 w-6 text-white stroke-[3px]" />
                </button>

                <button 
                  onClick={handleToggleSave}
                  className={`flex shrink-0 items-center justify-center h-16 w-16 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all cursor-pointer ${
                    isSaved ? "bg-amber-300" : "bg-white"
                  }`}
                >
                  <Bookmark className={`h-7 w-7 stroke-[3px] transition-colors ${
                    isSaved ? "fill-black text-black" : "fill-transparent text-black"
                  }`} />
                </button>
              </div>

              {/* product metadata (not yet implemented) */}
              <div className="border-t-4 border-black mt-4 pt-6 flex flex-col gap-4">
                <div className="flex justify-between items-center font-bold text-black text-sm">
                  <span className="text-gray-600 uppercase tracking-wide">Category</span>
                  <span className="bg-sky-200 border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#000]">{product.category_name}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-black text-sm">
                  <span className="text-gray-600 uppercase tracking-wide">File Type</span>
                  <span className="bg-purple-300 border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#000]">{product.asset_file_type}</span>
                </div>
                <div className="flex justify-between items-center font-bold text-black text-sm">
                  <span className="text-gray-600 uppercase tracking-wide">Size</span>
                  <span className="bg-yellow-300 border-2 border-black px-3 py-1 rounded-full shadow-[2px_2px_0px_0px_#000]">{product.asset_file_size} MB</span>
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
      {showSimulator && (
          <div style={{ zIndex: 2147483647 }} className="fixed bottom-5 right-2 md:right-5 w-100 animate-in slide-in-from-bottom-5 fade-in bg-white border-4 border-black rounded-xl p-5 shadow-[4px_4px_0px_0px_#000]">
            <h3 className="text-lg font-black uppercase text-black mb-2 border-b-2 border-black pb-2">
              Simulation Mode
            </h3>
            <p className="text-sm font-bold text-gray-700 mb-4">
              This feature is only for simulation purposes. <br /> (Click button below to simulate transaction.)
            </p>
            <div className="flex flex-col gap-2">
              <a 
                href="https://simulator.sandbox.midtrans.com/qris/index" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-center px-4 py-2 bg-emerald-400 border-2 border-black rounded-lg font-black text-sm uppercase transition-transform hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_#000]"
              >
                Open QRIS Simulator
              </a>
              <a 
                href="https://simulator.sandbox.midtrans.com/bca/va/index" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-center px-4 py-2 bg-sky-400 border-2 border-black rounded-lg font-black text-sm uppercase transition-transform hover:-translate-y-1 hover:shadow-[2px_2px_0px_0px_#000]"
              >
                Open BCA VA Simulator
              </a>
            </div>
          </div>
        )}
    </div>
  );
}
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { User, Share2, Package, Check } from "lucide-react";
import api from "@/services/api";
import ProductCard from "@/app/components/ui/ProductCard";
import { ProductResponse } from "@/types/type";
import Cookies from "js-cookie";

export default function PublicProfilePage() {
    const { id } = useParams();
    const [creator, setCreator] = useState<string>("");
    const [role, setRole] = useState<string>("");
    const [products, setProducts] = useState<ProductResponse[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [savedIds, setSavedIds] = useState<string[]>([]);
    const [isCopied, setIsCopied] = useState(false);

  
    const handleShare = () => {
        navigator.clipboard.writeText(window.location.href)
        .then(() => {
            setIsCopied(true)
            setTimeout(() => {
            setIsCopied(false)
            }, 2000)
        })
        .catch((error) => {
            alert("Failed to copy text: " + error);
        })
    };

    useEffect(() => {
        const fetchCreatorData = async () => {
        try {
            const response = await api.get(`/user/${id}`);
            setCreator(response.data.name); 
            setRole(response.data.role); 
            setProducts(response.data.products); 
            const token = Cookies.get("token");
            if (token) {
            const savedRes = await api.get("/user/saved-ids");
            setSavedIds(savedRes.data.saved_ids || []);
            }
        } catch (error) {
            console.log("Failed to fetch creator", error);
        } finally {
            setIsLoading(false);
        }
        };

        if (id) fetchCreatorData();
    }, [id]);

    if (isLoading) return (
        <div className="min-h-screen bg-sky-50 flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black border-t-pink-500"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-sky-100 p-4 md:p-8 font-sans">
        <div className="max-w-6xl mx-auto">
            
            {/* header section */}
            <div className="bg-white rounded-4xl border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-10 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-6">
                <div className="h-24 w-24 bg-purple-400 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_#000] flex items-center justify-center">
                <User className="h-12 w-12 text-black stroke-[3px]" />
                </div>
                <div>
                <h1 className="text-3xl md:text-4xl font-black text-black tracking-tighter mb-1 uppercase">
                    {creator || "Unknown Creator"}
                </h1>
                <div className="flex gap-2 items-center">
                    <span className="bg-amber-400 border-2 border-black px-3 py-1 rounded-full text-sm font-black text-black shadow-[2px_2px_0px_0px_#000] uppercase tracking-wider">
                    {role || "Seller"}
                    </span>
                    
                </div>
                </div>
            </div>
            
            {/* share button */}
            <button 
                onClick={handleShare}
                className="flex items-center gap-2 bg-pink-500 px-5 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all font-black text-white uppercase tracking-wider text-sm w-full md:w-auto justify-center cursor-pointer"
            >
                {isCopied ? (
                    <>
                        <Check className="h-5 w-5 stroke-[3px]" />
                        LINK COPIED!
                    </>
                ) : (
                    <>
                        <Share2 className="h-5 w-5 stroke-[3px]" />
                        SHARE PROFILE
                    </>
                )}
            </button>
            </div>

            {/* product section */}
            <div className="bg-white rounded-4xl border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-10">
                <div className="flex flex-row justify-between border-b-4 border-black pb-4 mb-6">

                    <h2 className="text-2xl font-black text-black uppercase flex items-center gap-2">
                        <Package className="h-6 w-6 stroke-[3px]" />
                        CREATOR'S PRODUCTS

                    </h2>
                    <span className="text-base font-bold text-white uppercase ml-4 py-2 px-4 bg-emerald-500 border-2 border-black rounded-full shadow-[2px_2px_0px_0px_#000]">
                        {products ? products.length : 0} PRODUCTS
                    </span>
                </div>
                
                
                {!products ? (
                    <div className="bg-sky-100 border-4 border-black rounded-xl p-6 text-center shadow-[4px_4px_0px_0px_#000]">
                    <p className="font-bold text-black uppercase tracking-wider">
                        This Creator hasn't uploaded any products yet.
                    </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                    {products.map((product) => (
                        <ProductCard
                        key={product.id}
                        id={product.id}
                        title={product.title}
                        creator={creator} 
                        price={product.price}
                        imageUrl={product.thumbnail_url}
                        isInitiallySaved={savedIds.includes(product.id)}
                        />
                    ))}
                    </div>
                )}
            </div>

        </div>
        </div>
    );
}
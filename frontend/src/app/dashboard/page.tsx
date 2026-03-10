"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Plus, Package, DownloadCloud, User, Settings, Search, ShoppingBag } from "lucide-react";
import Cookies from "js-cookie";
import api from "@/services/api";
import ProductCard from "@/app/components/ui/ProductCard";
import { ProductResponse } from "@/types/type";
import MyProductCard from "../components/ui/MyProductCard";
import PurchasedProductCard from "../components/ui/PurchasedProductCard";

export default function DashboardPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"selling" | "library" | "purchased">("selling");
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState("");
  const [role, setRole] = useState("");
  const [savedIds, setSavedIds] = useState<string[]>([]);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    // Fetch data based on activeTab
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        let endpoint = "/user/my-product";
        if (activeTab === "library") endpoint = "/user/saved";
        if (activeTab === "purchased") endpoint = "/transaction";

        const response = await api.get(endpoint);
        if (activeTab === "purchased") {
          const purchasedProducts = response.data.map((transaction: any) => transaction.product);
          setProducts(purchasedProducts);
        } else {
          setProducts(response.data || []);
        }

        if (token) {
          const savedRes = await api.get("/user/saved-ids");
          setSavedIds(savedRes.data.saved_ids || []);
        }
      } catch (error) {
        console.log("Failed to fetch data", error);
        setProducts([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, [activeTab, router]);

  // Fetch profile data
  useEffect(() => {
    const fetchProfileData = async () => {
      setIsLoading(true);
      try {
        const response = await api.get("/user/profile");
        const fetchedUsername = response.data.name; 
        const fetchedRole = response.data.role; 
        setRole(fetchedRole || "");
        setProfile(fetchedUsername || "");
      } catch (error) {
        console.log("Failed to fetch data", error);
        setProfile("");
      } finally {
        setIsLoading(false);
      }
    }
    fetchProfileData();
    
  }, []);

  // Function to handle removal from library tab
  const handleRemoveProduct = (productId: string) => {
    setProducts((prevProducts) => prevProducts.filter((p) => p.id !== productId));
  };

  return (
    <div className="min-h-screen bg-sky-100 p-4 md:p-8 font-sans">
      <div className="max-w-6xl mx-auto">
        
        {/* Profile Section */}
        <div className="bg-white rounded-4xl border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-10 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-24 w-24 bg-pink-400 border-4 border-black rounded-full shadow-[4px_4px_0px_0px_#000] flex items-center justify-center">
              <User className="h-12 w-12 text-black stroke-[3px]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-black text-black tracking-tighter mb-1">
                {profile}
              </h1>
              <span className="bg-amber-400 border-2 border-black px-3 py-1 rounded-full text-sm font-black text-black shadow-[2px_2px_0px_0px_#000] uppercase tracking-wider">
                {role}
              </span>
            </div>
          </div>
          <Link 
            href="/setting"
            className="flex items-center gap-2 bg-gray-100 px-5 py-3 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:bg-gray-200 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all font-black text-black uppercase tracking-wider text-sm w-full md:w-auto justify-center"
          >
            <Settings className="h-5 w-5 stroke-[3px]" />
            EDIT PROFILE
          </Link>
        </div>

        {/* Button tabs */}
        <div className="flex flex-row mb-8 overflow-x-auto py-2 justify-between">
            <div className="gap-4 flex flex-row">
                <button
                    onClick={() => setActiveTab("selling")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-4 border-black shadow-[2px_2px_0px_0px_#000] transition-all font-black uppercase tracking-wider whitespace-nowrap ${
                    activeTab === "selling"
                        ? "bg-pink-400 text-white translate-y-1 shadow-[0px_0px_0px_0px_#000]"
                        : "bg-white text-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] cursor-pointer"
                    }`}
                >
                    <Package className="h-5 w-5 stroke-[3px]" />
                    MY PRODUCT
                </button>
                
                <button
                    onClick={() => setActiveTab("library")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-4 border-black shadow-[2px_2px_0px_0px_#000] transition-all font-black uppercase tracking-wider whitespace-nowrap ${
                    activeTab === "library"
                        ? "bg-amber-400 text-black translate-y-1 shadow-[0px_0px_0px_0px_#000]"
                        : "bg-white text-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] cursor-pointer"
                    }`}
                >
                    <DownloadCloud className="h-5 w-5 stroke-[3px]" />
                    MY LIBRARY
                </button>
                
                <button
                    onClick={() => setActiveTab("purchased")}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl border-4 border-black shadow-[2px_2px_0px_0px_#000] transition-all font-black uppercase tracking-wider whitespace-nowrap ${
                    activeTab === "purchased"
                        ? "bg-blue-400 text-white translate-y-1 shadow-[0px_0px_0px_0px_#000]"
                        : "bg-white text-black hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] cursor-pointer"
                    }`}
                >
                    <ShoppingBag className="h-5 w-5 stroke-[3px]" />
                    MY PURCHASES
                </button>
            </div>
            
        </div>

        {/* Products Section */}
        <div className="bg-white rounded-4xl border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-10 min-h-100">
          {isLoading ? (
            <div className="h-full w-full flex items-center justify-center min-h-75">
              <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black border-t-pink-500"></div>
            </div>
          ) : products.length === 0 ? (
            <div className="h-full w-full flex flex-col items-center justify-center min-h-75 text-center border-4 border-dashed border-gray-300 rounded-2xl p-6">
              <Package className="h-16 w-16 text-gray-300 mb-4" />
              <h2 className="text-2xl font-black text-gray-400 uppercase mb-2">
                {activeTab === "selling" 
                  ? "NO ASSETS FOR SALE YET" 
                  : activeTab === "library" 
                  ? "YOUR LIBRARY IS EMPTY" 
                  : "YOU HAVEN'T BOUGHT ANYTHING YET"
                }
              </h2>
              {activeTab === "selling" && (
                <p className="font-bold text-gray-400 uppercase">
                  Click the ADD NEW button to start selling.
                </p>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
              {products.map((product) => (
                activeTab === "selling" ? (
                  <MyProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    price={product.price}
                    imageUrl={product.thumbnail_url || "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80"}
                    onDelete={() => handleRemoveProduct(product.id)}
                  />
                ) : activeTab === "library" ? (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    creator={product.seller_name ? product.seller_name : "Unknown"} 
                    price={product.price}
                    imageUrl={product.thumbnail_url || "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80"}
                    isInitiallySaved={savedIds.includes(product.id)}
                    onRemove={() => handleRemoveProduct(product.id)}
                  />
                ) : (
                  <PurchasedProductCard 
                    key={product.id}
                    id={product.id}
                    title={product.title}
                    creator={product.seller_name ? product.seller_name : "Unknown"} 
                    price={product.price}
                    imageUrl={product.thumbnail_url || "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80"}
                    token={Cookies.get("token") || ""}
                  />
                )
              ))}
            </div>
            
          )}
          { /* Add & explore Button */}
          <div className="flex mt-8 px-2 justify-center md:justify-end">
            {activeTab === "selling" ? (
              <Link
                href="/sell-product"
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-emerald-400 px-6 py-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all"
              >
                <Plus className="h-6 w-6 text-black stroke-[4px]" />
                <span className="text-base font-black text-black uppercase tracking-wider">
                  ADD NEW PRODUCT
                </span>
              </Link>
            ) : (
              <Link
                href="/search"
                className="w-full md:w-auto flex items-center justify-center gap-2 bg-purple-400 px-6 py-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all"
              >
                <Search className="h-6 w-6 text-black stroke-[4px]" />
                <span className="text-base font-black text-black uppercase tracking-wider">
                  EXPLORE MORE
                </span>
              </Link>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
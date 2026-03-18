"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Upload, Image as ImageIcon, FileArchive, DollarSign, Type, AlignLeft } from "lucide-react";
import Cookies from "js-cookie";
import api from "@/services/api";
import { CategoryResponse } from "@/types/type";

export default function EditProductPage() {
  const router = useRouter();
  const { id } = useParams();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // State Form
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState<number | string>("");
  
  // State Upload
  const [thumbnailPreview, setThumbnailPreview] = useState<string | null>(null);
  const [selectedThumbnail, setSelectedThumbnail] = useState<File | null>(null);
  const [selectedProductFile, setSelectedProductFile] = useState<File | null>(null);

  const thumbnailInputRef = useRef<HTMLInputElement>(null);
  const productFileInputRef = useRef<HTMLInputElement>(null);

  // category
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProductDetails = async () => {
      try {
        const response = await api.get(`/product/${id}`);
        const product = response.data;
        setCategoryId(product.category_id || "");
        setTitle(product.title || "");
        setDescription(product.description || "");
        setPrice(product.price || 0);

        // Set Preview Gambar Lama
        if (product.thumbnail_url) {
          const imageSource = product.thumbnail_url || "https://images.unsplash.com/photo-1618331835717-801e976710b2?w=800&q=80";
          setThumbnailPreview(imageSource);
        }
      } catch (error) {
        console.log("Failed to fetch product details:", error);
        router.push("/dashboard");
      } finally {
        setIsLoading(false);
      }
    };

    if (id) fetchProductDetails();
  }, [id, router]);

  // Handler Preview Thumbnail
  const handleThumbnailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedThumbnail(file);
      setThumbnailPreview(URL.createObjectURL(file));
      setMessage(null);
    }
  };

  const handleProductFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedProductFile(e.target.files[0]);
      setMessage(null);
    }
  };

  const handleUpdateProduct = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSaving(true);
    setMessage(null);

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price.toString());
      formData.append("category_id", categoryId);

      if (selectedThumbnail) {
        formData.append("thumbnail", selectedThumbnail);
      }
      if (selectedProductFile) {
        formData.append("product_file", selectedProductFile);
      }

      await api.patch(`/product/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setMessage({ type: "success", text: "Asset successfully updated." });
      
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);

    } catch (error: any) {
      console.log("Failed to update asset:", error);
      setMessage({ 
        type: "error", 
        text: error.response?.data?.message || "Failed to update asset. Please try again." 
      });
    } finally {
      setIsSaving(false);
    }
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await api.get("/category"); 
        setCategories(response.data); 
      } catch (err) {
        console.error("Failed to fetch categories:", err);
      }
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black border-t-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-100 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mb-8 bg-amber-400 px-4 py-2 rounded-xl cursor-pointer border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all font-black text-black uppercase text-sm w-fit"
        >
          <ArrowLeft className="h-4 w-4 stroke-[3px]" />
          BACK TO DASHBOARD
        </button>

        <div className="bg-white rounded-4xl border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-10">
          <div className="flex items-center gap-4 mb-8 border-b-4 border-black pb-4">
            <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tighter">
              Edit Asset
            </h1>
          </div>

          <form onSubmit={handleUpdateProduct} className="flex flex-col gap-8">
            
            {/* upload image*/}
            <div className="flex flex-col sm:flex-row gap-6 bg-emerald-100 p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_#000]">
              <div className="relative h-40 w-full sm:w-56 rounded-xl border-4 border-black bg-white shadow-[4px_4px_0px_0px_#000] overflow-hidden flex items-center justify-center shrink-0">
                {thumbnailPreview ? (
                  <img src={thumbnailPreview} alt="Thumbnail Preview" className="h-full w-full object-cover" />
                ) : (
                  <ImageIcon className="h-12 w-12 text-gray-300 stroke-[2px]" />
                )}
              </div>
              
              <div className="flex flex-col gap-3 justify-center w-full">
                <div>
                  <h3 className="text-xl font-black text-black uppercase">Cover Image</h3>
                  <p className="text-sm font-bold text-gray-500">Format: JPG/PNG. (Optional)</p>
                </div>
                
                <input 
                  type="file" 
                  accept="image/*" 
                  ref={thumbnailInputRef} 
                  onChange={handleThumbnailChange} 
                  className="hidden" 
                />
                <button
                  type="button"
                  onClick={() => thumbnailInputRef.current?.click()}
                  className="flex items-center w-fit gap-2 bg-amber-500 px-4 py-2 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all font-black text-black uppercase text-sm cursor-pointer"
                >
                  <Upload className="h-4 w-4 stroke-[3px]" />
                  CHANGE COVER
                </button>
              </div>
            </div>

            {/* text form */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-black uppercase flex items-center gap-2">
                    Asset Title
                </label>
                <input
                    type="text"
                    value={title}
                    onChange={(e) => { setTitle(e.target.value); setMessage(null); }}
                    required
                    className="w-full bg-white border-4 border-black rounded-xl px-5 py-4 font-bold text-black focus:outline-none focus:translate-y-1 focus:shadow-none shadow-[4px_4px_0px_0px_#000] transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-black uppercase flex items-center gap-2">
                    Price (IDR)
                </label>
                <div className="relative">
                    <span className="absolute left-4 top-4.5 font-black text-gray-500">Rp</span>
                    <input
                    type="number"
                    value={price}
                    onChange={(e) => { setPrice(e.target.value); setMessage(null); }}
                    min="0"
                    required
                    className="w-full bg-white border-4 border-black rounded-xl pl-10 pr-5 py-4 font-bold text-black focus:outline-none focus:translate-y-1 focus:shadow-none shadow-[4px_4px_0px_0px_#000] transition-all"
                    />
                </div>
              </div>
            </div>

            {/* description */}
            <div className="flex flex-col gap-2">
              <label className="text-sm font-black text-black uppercase flex items-center gap-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => { setDescription(e.target.value); setMessage(null); }}
                rows={5}
                required
                className="w-full bg-white border-4 border-black rounded-xl px-5 py-4 font-bold text-black focus:outline-none focus:translate-y-1 focus:shadow-none shadow-[4px_4px_0px_0px_#000] transition-all resize-none"
              />
            </div>

            <div className="md:col-span-2" ref={dropdownRef}>
              <label className="block text-sm font-black text-black uppercase mb-2">
                Category
              </label>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full bg-white border-4 border-black rounded-xl px-4 py-3 font-bold text-black flex justify-between items-center focus:outline-none focus:translate-y-1 focus:shadow-none shadow-[4px_4px_0px_0px_#000] transition-all cursor-pointer"
                >
                  <span>
                    {categoryId
                      ? categories.find((c) => c.id === categoryId)?.category_name
                      : "Select a category..."}
                  </span>
                  <span
                    className={`transform transition-transform duration-200 font-black ${
                      isDropdownOpen ? "" : "-rotate-90"
                    }`}
                  >
                    ▼
                  </span>
                </button>

                {isDropdownOpen && (
                  <ul className="absolute z-20 w-full mt-2 bg-white border-4 border-black rounded-xl shadow-[8px_8px_0px_0px_#000] max-h-60 overflow-y-auto overflow-x-hidden">
                    {categories.length === 0 ? (
                      <li className="px-4 py-3 font-bold text-gray-400 italic">
                        Loading categories...
                      </li>
                    ) : (
                      categories.map((category) => (
                        <li
                          key={category.id}
                          onClick={() => {
                            setCategoryId(category.id);
                            setIsDropdownOpen(false);
                          }}
                          className={`px-4 py-3 font-black text-black cursor-pointer transition-all border-b-4 border-black last:border-b-0 hover:bg-sky-300 hover:pl-6 ${
                            categoryId === category.id ? "bg-amber-400" : ""
                          }`}
                        >
                          {category.category_name}
                        </li>
                      ))
                    )}
                  </ul>
                )}
              </div>
            </div>

            {/* asset/file upload */}
            <div className="flex flex-col sm:flex-row gap-6 items-center bg-sky-100 p-6 rounded-2xl border-4 border-black shadow-[4px_4px_0px_0px_#000]">
              <div className="h-16 w-16 bg-white border-4 border-black rounded-full flex items-center justify-center shrink-0">
                <FileArchive className="h-8 w-8 text-black" />
              </div>
              <div className="flex flex-col gap-1 w-full text-center sm:text-left">
                <h3 className="text-xl font-black text-black uppercase">Asset File (Optional)</h3>
                <p className="text-sm font-bold text-gray-500">
                  {selectedProductFile ? `Selected: ${selectedProductFile.name}` : "Upload a new file. (Format: ZIP/PDF)"}
                </p>
              </div>
              
              <input 
                type="file" 
                accept=".zip,.rar,.pdf"
                ref={productFileInputRef} 
                onChange={handleProductFileChange} 
                className="hidden" 
              />
              <button
                type="button"
                onClick={() => productFileInputRef.current?.click()}
                className="flex shrink-0 items-center gap-2 bg-pink-500 px-4 py-3 rounded-xl border-4 border-black hover:-translate-y-1 shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all font-black text-white uppercase text-sm cursor-pointer"
              >
                <Upload className="h-4 w-4 stroke-[3px]" />
                REPLACE FILE
              </button>
            </div>

            {/* save button */}
            <div className="border-t-4 border-black pt-8 mt-2 flex flex-col gap-4">
              

              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-3 bg-emerald-400 px-6 py-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-none transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-4 border-black border-t-transparent"></div>
                ) : (
                  <>
                    <Save className="h-6 w-6 text-black stroke-[3px]" />
                    <span className="text-xl font-black text-black uppercase tracking-wider">
                      SAVE UPDATE
                    </span>
                  </>
                )}
              </button>
              
              {/* ui message */}
              {message && (
                <div 
                  className={`p-4 rounded-xl border-4 border-black font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] text-sm text-center transition-all animate-in fade-in slide-in-from-bottom-2 ${
                    message.type === "success" ? "bg-emerald-400 text-black" : "bg-red-500 text-white"
                  }`}
                >
                  {message.text}
                </div>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, UploadCloud } from "lucide-react";
import api from "@/services/api";
import { CategoryResponse } from "@/types/type";

export default function StartSellingPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [thumbnail, setThumbnail] = useState<File | null>(null);
  const [assetFile, setAssetFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!thumbnail || !assetFile) {
      setError("Thumbnail and asset file are required.");
      setIsLoading(false);
      return;
    }

    try {
      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("category_id", categoryId);
      formData.append("thumbnail", thumbnail);
      formData.append("asset_file", assetFile);

      await api.post("/product", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      router.push("/");
      router.refresh();
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to upload product.");
    } finally {
      setIsLoading(false);
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

  return (
    <div className="min-h-screen bg-amber-100 p-4 md:p-8 font-sans">
      <div className="max-w-3xl mx-auto">
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 bg-sky-300 px-4 py-2 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all font-black text-black uppercase text-sm w-fit mb-8 cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4 stroke-[3px]" />
          BACK
        </button>

        <div className="bg-white rounded-4xl border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-10">
          <div className="mb-8 border-b-4 border-black pb-4">
            <h1 className="text-4xl md:text-5xl font-black text-black uppercase tracking-tighter">
              UPLOAD NEW ASSET
            </h1>
            <p className="text-pink-500 font-bold uppercase tracking-wider mt-2">
              Share your work and get paid.
            </p>
          </div>

          {error && (
            <div className="mb-6 bg-red-500 border-4 border-black p-4 rounded-xl text-white font-black uppercase text-center shadow-[4px_4px_0px_0px_#000]">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-black text-black uppercase mb-2">
                  Asset Title
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-white border-4 border-black rounded-xl px-4 py-3 font-bold text-black focus:outline-none focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_#000] transition-all"
                  placeholder="E.g. Ultimate UI Kit 2026"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-black text-black uppercase mb-2">
                  Description
                </label>
                <textarea
                  required
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full bg-white border-4 border-black rounded-xl px-4 py-3 font-bold text-black focus:outline-none focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_#000] transition-all"
                  placeholder="Describe your asset."
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-black text-black uppercase mb-2">
                  Price (IDR)
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-3.5 font-black text-gray-500">Rp</span>
                  <input
                    type="number"
                    required
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    className="w-full bg-white border-4 border-black rounded-xl pl-12 pr-4 py-3 font-bold text-black focus:outline-none focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_#000] transition-all"
                    placeholder="50000"
                  />
                </div>
              </div>

              <div className="md:col-span-2" ref={dropdownRef}>
                <label className="block text-sm font-black text-black uppercase mb-2">
                  Category
                </label>
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-white border-4 border-black rounded-xl px-4 py-3 font-bold text-black flex justify-between items-center focus:outline-none focus:-translate-y-1 focus:shadow-[4px_4px_0px_0px_#000] transition-all cursor-pointer"
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

              <div className="bg-sky-100 border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_#000]">
                <label className="block text-sm font-black text-black uppercase mb-2">
                  Cover Image (JPG/PNG)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required
                  onChange={(e) => setThumbnail(e.target.files?.[0] || null)}
                  className="w-full font-bold text-sm text-gray-700 file:mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-4 file:border-black file:text-sm file:font-black file:bg-pink-500 file:text-white hover:file:-translate-y-1 hover:file:shadow-[2px_2px_0px_0px_#000] file:transition-all file:cursor-pointer"
                />
              </div>

              <div className="bg-emerald-100 border-4 border-black rounded-xl p-4 shadow-[4px_4px_0px_0px_#000]">
                <label className="block text-sm font-black text-black uppercase mb-2">
                  Asset File (ZIP/PDF)
                </label>
                <input
                  type="file"
                  accept=".zip,.rar,.pdf"
                  required
                  onChange={(e) => setAssetFile(e.target.files?.[0] || null)}
                  className="w-full font-bold text-sm text-gray-700 file:mt-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-4 file:border-black file:text-sm file:font-black file:bg-amber-400 file:text-black hover:file:-translate-y-1 hover:file:shadow-[2px_2px_0px_0px_#000] file:transition-all file:cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 mt-8 rounded-xl bg-pink-500 px-8 py-5 text-xl font-black text-white border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all uppercase cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <UploadCloud className="h-6 w-6 stroke-[3px]" />
              {isLoading ? "UPLOADING TO SERVER..." : "PUBLISH ASSET"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
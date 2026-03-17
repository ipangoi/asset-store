"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Upload, User, Image as ImageIcon } from "lucide-react";
import Cookies from "js-cookie";
import api from "@/services/api";

export default function SettingPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  // State untuk form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const [errorMessage, setErrorMessage] = useState("");
  
  // Referensi untuk input file tersembunyi
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const token = Cookies.get("token");
    if (!token) {
      router.push("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await api.get("/user/profile");
        setName(response.data.name || "");
        setEmail(response.data.email || "");
        // Kalau nanti di Golang kamu udah nyimpen URL avatar, pasang di sini
        // setAvatarPreview(response.data.avatar_url ? `http://localhost:8080/${response.data.avatar_url}` : null);
      } catch (error: any) {
        setErrorMessage(error.response?.data?.message || "Failed to fetch profile.")
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setSelectedFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  };

  const handleSaveProfile = async (e: React.SyntheticEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage("");

    try {
      const formData = new FormData();
      formData.append("name", name);
    //   if (selectedFile) {
    //     formData.append("avatar", selectedFile);
    //   }

      await api.patch("/user/profile", formData, {
        headers: { "Content-Type": "application/json" },
      });

      router.push("/dashboard");
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || "Failed to update profile.")
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-amber-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-4 border-black border-t-pink-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-amber-50 py-10 px-4 md:px-8 font-sans">
      <div className="max-w-3xl mx-auto">
        
        {/* back button */}
        <button
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 mb-8 bg-white px-4 py-2 rounded-xl cursor-pointer border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all font-black text-black uppercase text-sm w-fit"
        >
          <ArrowLeft className="h-4 w-4 stroke-[3px]" />
          BACK TO DASHBOARD
        </button>

        <div className="bg-white rounded-4xl border-4 border-black shadow-[8px_8px_0px_0px_#000] p-6 md:p-10">
          <h1 className="text-3xl md:text-4xl font-black text-black uppercase tracking-tighter mb-8 border-b-4 border-black pb-4">
            Edit Profile
          </h1>

          <form onSubmit={handleSaveProfile} className="flex flex-col gap-8">
            

            {/* form */}
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-black uppercase">
                  Username
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your display name"
                  required
                  className="w-full bg-white border-4 border-black rounded-xl px-5 py-4 font-bold text-black focus:outline-none focus:translate-y-1 focus:shadow-[0px_0px_0px_0px_#000] shadow-[4px_4px_0px_0px_#000] transition-all"
                />
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-sm font-black text-gray-500 uppercase">
                  Email Address (Cannot be changed)
                </label>
                <input
                  type="email"
                  value={email}
                  readOnly
                  className="w-full bg-gray-200 border-4 border-gray-400 rounded-xl px-5 py-4 font-bold text-gray-500 cursor-not-allowed"
                />
              </div>
            </div>

            {/* save button */}
            <div className="border-t-4 border-black pt-8 mt-2">
              <button
                type="submit"
                disabled={isSaving}
                className="w-full flex items-center justify-center gap-3 bg-emerald-400 px-6 py-4 rounded-xl border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all cursor-pointer disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {isSaving ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-4 border-black border-t-transparent"></div>
                ) : (
                  <>
                    <Save className="h-6 w-6 text-black stroke-[3px]" />
                    <span className="text-xl font-black text-black uppercase tracking-wider">
                      SAVE CHANGES
                    </span>
                  </>
                )}
              </button>
              {errorMessage && (
                <div 
                  className="p-4 my-4 rounded-xl border-4 border-black bg-red-500 text-white font-black uppercase tracking-wide shadow-[4px_4px_0px_0px_#000] text-sm text-center transition-all animate-in fade-in slide-in-from-bottom-2" >
                  {errorMessage}
                </div>
              )}
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}
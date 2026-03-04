"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, Menu, X, User, LayoutDashboard, LogOut } from "lucide-react";
import Cookies from "js-cookie";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef<HTMLDivElement>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  //handle login redirect to current page
  const currentQuery = searchParams.toString();
  const currentUrl = currentQuery ? `${pathname}?${currentQuery}` : pathname;
  const isAuthPage = pathname === "/login" || pathname === "/register";
  const loginHref = isAuthPage ? "/login" : `/login?redirect=${encodeURIComponent(currentUrl)}`;

  //get token login
  useEffect(() => {
    const token = Cookies.get("token");
    if (token) setIsLoggedIn(true);
  }, []);

  //ref for profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  // handle logout
  const handleLogout = () => {
    Cookies.remove("token");
    setIsLoggedIn(false);
    setIsOpen(false);
    setIsProfileOpen(false);
    router.push("/");
    router.refresh();
  };

  // handle search bar
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setIsOpen(false);
    }
  };

  // handle search query to clear
  useEffect(() => {
    if (pathname !== "/search") {
      setSearchQuery("");
    }
  }, [pathname]);

  // handle focus for explore button
  useEffect(() => {
    const handleFocusSearch = () => {
      if (window.innerWidth < 768) {
        document.getElementById("mobile-search-input")?.focus();
      } else {
        document.getElementById("desktop-search-input")?.focus();
      }
    };

    window.addEventListener("focus-search", handleFocusSearch);
    
    return () => window.removeEventListener("focus-search", handleFocusSearch);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full bg-white border-b-4 border-black transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href="/" className="text-xl md:text-2xl font-black text-black tracking-tighter flex items-center gap-2">
          <div className="h-6 w-6 rounded-lg md:h-8 md:w-8 md:rounded-xl bg-pink-500 border-2 border-black rotate-12 shadow-[2px_2px_0px_0px_#000]"></div>
          ASSETSTORE
        </Link>

        <div className="hidden flex-1 items-center justify-center px-8 lg:flex">
          <form onSubmit={handleSearch}  className="flex w-full max-w-lg items-center rounded-full bg-white border-4 border-black px-4 py-2 shadow-[2px_2px_0px_0px_#000] focus-within:translate-y-1 focus-within:shadow-[0px_0px_0px_0px_#000] transition-all">
            <Search className="h-6 w-6 text-black" />
            <input id="desktop-search-input" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} type="text" placeholder="Search assets..." className="ml-2 w-full bg-transparent font-bold text-black outline-none placeholder:text-gray-500" />
          </form>
        </div>

        <div className="hidden items-center space-x-4 font-black md:flex">
          <Link href="/sell-product" className="rounded-full bg-pink-500 px-6 py-2.5 text-white border-4 border-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all uppercase text-sm tracking-wider">
            Start Selling
          </Link>

          {isLoggedIn ? (
            <div className="relative" ref={profileRef}>
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)} 
                className="flex items-center justify-center gap-2 rounded-full bg-sky-400 px-3 py-2.5 text-black border-4 border-black shadow-[2px_2px_0px_0px_#000] cursor-pointer hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all"
              >
                <User className="h-5 w-5 stroke-[3px]" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 top-full mt-5 w-56 bg-white border-4 border-black shadow-[4px_4px_0px_0px_#000] rounded-2xl flex flex-col p-3 gap-2 z-50">
                  <Link 
                    href="/dashboard" 
                    onClick={() => setIsProfileOpen(false)}
                    className="flex items-center gap-3 px-4 py-3 font-black text-black hover:bg-sky-200 rounded-xl border-2 border-transparent hover:border-black transition-all uppercase text-sm"
                  >
                    <LayoutDashboard className="h-5 w-5 stroke-[3px]" />
                    Profile
                  </Link>
                  <button 
                    onClick={handleLogout} 
                    className="flex items-center gap-3 px-4 py-3 font-black text-white bg-red-500 hover:bg-red-600 rounded-xl border-2 border-black transition-all uppercase text-sm text-left cursor-pointer"
                  >
                    <LogOut className="h-5 w-5 stroke-[3px]" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href={loginHref} className="rounded-full bg-amber-400 px-6 py-2.5 text-black border-4 border-black shadow-[2px_2px_0px_0px_#000] hover:-translate-y-1 hover:shadow-[4px_4px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all uppercase text-sm tracking-wider">
              Login
            </Link>
          )}
        </div>

        <div className="flex items-center space-x-3 md:hidden">
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="flex h-11 w-11 items-center justify-center rounded-xl bg-white border-4 border-black shadow-[2px_2px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] z-50 overflow-hidden"
          >
            <div className="relative h-6 w-6">
              <Menu className={`absolute inset-0 h-6 w-6 stroke-[3px] transition-all duration-300 ease-in-out text-black ${isOpen ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100'}`} />
              <X className={`absolute inset-0 h-6 w-6 stroke-[3px] transition-all duration-300 ease-in-out text-black ${isOpen ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0'}`} />
            </div>
          </button>
        </div>
      </div>
      <div className="px-4 pb-3 md:hidden">
        <form onSubmit={handleSearch} className="flex items-center rounded-full bg-white border-4 border-black px-4 py-2.5 shadow-[2px_2px_0px_0px_#000] focus-within:translate-y-1 focus-within:shadow-[0px_0px_0px_0px_#000] transition-all">
          <Search className="h-5 w-5 text-black" />
          <input 
            id="mobile-search-input" 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
            type="text" 
            placeholder="Search assets..." 
            className="ml-2 w-full bg-transparent font-bold text-black outline-none placeholder:text-gray-500 text-sm" 
          />
        </form>
      </div>

      <div 
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white ${
          isOpen ? "max-h-125 border-black opacity-100" : "max-h-0 border-t-0 border-transparent opacity-0"
        }`}
      >
        <div className="flex flex-col px-4 py-6 gap-4">

          <Link 
            href="/sell-product" 
            onClick={() => setIsOpen(false)}
            className="rounded-2xl bg-pink-500 py-3 text-center font-black text-white border-4 border-black shadow-[2px_2px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all uppercase"
          >
            START SELLING
          </Link>

          {isLoggedIn ? (
            <>
              <Link 
                href="/dashboard" 
                onClick={() => setIsOpen(false)} 
                className="flex justify-center items-center gap-2 rounded-2xl bg-emerald-400 py-3 text-center font-black text-black border-4 border-black shadow-[2px_2px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all uppercase"
              >
                <LayoutDashboard className="h-5 w-5 stroke-[3px]" />
                PROFILE
              </Link>
              <button 
                onClick={handleLogout} 
                className="flex justify-center items-center gap-2 rounded-2xl bg-red-500 py-3 text-center font-black text-white border-4 border-black shadow-[2px_2px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all uppercase"
              >
                <LogOut className="h-5 w-5 stroke-[3px]" />
                LOGOUT
              </button>
            </>
          ) : (
            <Link 
              href={loginHref} 
              onClick={() => setIsOpen(false)} 
              className="rounded-2xl bg-amber-400 py-3 text-center font-black text-black border-4 border-black shadow-[2px_2px_0px_0px_#000] active:translate-y-1 active:shadow-[0px_0px_0px_0px_#000] transition-all uppercase"
            >
              LOGIN
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
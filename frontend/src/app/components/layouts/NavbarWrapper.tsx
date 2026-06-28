"use client";

import { usePathname } from "next/navigation";
import Navbar from "@/app/components/layouts/Navbar";

export default function NavbarWrapper() {
  const pathname = usePathname();
  
  const hideOnRoutes = ["/login", "/register", "/forgot-password", "/reset-password"];

  if (hideOnRoutes.includes(pathname)) {
    return null;
  }

  return <Navbar />;
}
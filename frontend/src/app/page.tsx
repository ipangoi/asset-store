
import Hero from "@/app/components/home/Hero";
import ProductGrid from "@/app/components/home/ProductGrid";

export default function Home() {
  return (
    <main className="min-h-screen bg-gray-50 text-black">
      <Hero />
      <ProductGrid />
    </main>
  );
}
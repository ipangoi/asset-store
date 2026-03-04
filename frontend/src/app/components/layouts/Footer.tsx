export default function Footer() {
  return (
    <footer className="border-t-2 border-black bg-pink-400 px-4 py-8 text-black sm:px-6 sm:py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 md:flex-row md:gap-0">
        <div>
          <span className="text-xl font-black tracking-tighter sm:text-2xl">ASSETSTORE.</span>
          <p>&copy; 2026 All rights reserved.</p>
          <p className="footer-tagline">Engelzimmer</p>
        </div>
        <div className="flex flex-wrap justify-center gap-4 font-bold sm:gap-6">
          <a href="#" className="hover:underline">Help</a>
          <a href="#" className="hover:underline">Terms</a>
          <a href="#" className="hover:underline">Privacy</a>
        </div>
      </div>
    </footer>
  );
}
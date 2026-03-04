"use client";

import { TypeAnimation } from "react-type-animation";

export default function Hero() {
  return (
    <section className="bg-emerald-400 px-4 py-16 text-center sm:px-6 md:py-28 border-b-4 border-black relative overflow-hidden group">
      {/* <div className="absolute top-10 left-10 h-24 w-24 rounded-full bg-emerald-500 border-4 border-black shadow-[2px_2px_0px_0px_#000] hidden md:block animate-bounce"></div> */}
      {/* <div className="absolute bottom-10 right-20 h-20 w-20 rounded-xl rotate-12 bg-cyan-400 border-4 border-black shadow-[2px_2px_0px_0px_#000] hidden md:block"></div> */}
      <div className="absolute top-10 left-10 h-24 w-24 rounded-full bg-sky-500 border-4 border-black shadow-[2px_2px_0px_0px_#000] hidden md:block
        transition-transform duration-700 ease-out group-hover:translate-x-10 group-hover:-translate-y-5">
      </div>
      <div className="absolute bottom-10 right-20 h-20 w-20 rounded-xl rotate-12 bg-sky-400 border-4 border-black shadow-[2px_2px_0px_0px_#000] hidden md:block 
        transition-transform duration-1000 ease-out group-hover:-translate-x-16 group-hover:-translate-y-8">
      </div>
      <div className="absolute bottom-1/2 left-1/4 h-16 w-16 bg-amber-500 border-4 border-black shadow-[2px_2px_0px_0px_#000] hidden md:block rotate-45 
        transition-transform duration-500 ease-out group-hover:rotate-90 group-hover:translate-x-5">
      </div>

      <div className="mx-auto max-w-4xl relative z-10">
        <h1 className="mb-6 text-5xl font-black text-black uppercase tracking-tighter sm:mb-8 sm:text-6xl md:text-7xl drop-shadow-[4px_4px_0px_#fff]">
          SHARE <br /> YOUR {" "}
          <span className="text-amber-500 drop-shadow-[2px_2px_0px_#000] md:drop-shadow-[4px_4px_0px_#000] underline">
            <TypeAnimation
              sequence={[
                "PRODUCTS.", 2000,      
                "GAMES.", 2000,    
                "ASSETS.", 2000,  
                "DESIGNS.", 2000,   
              ]}
              preRenderFirstString={true}
              wrapper="span"
              cursor={true}
              repeat={Infinity}
            />
          </span>
        </h1>
        <p className="mb-10 font-bold text-black sm:mb-12 text-[13px] md:text-xl border-x-4 border-b-4 border-black bg-white inline-block px-2 md:px-6 py-2 shadow-[4px_8px_0px_0px_#000] -rotate-1">
           The simplest place to discover and sell digital assets.
        </p>
        <br />
        <button
          onClick={() => {window.dispatchEvent(new Event("focus-search"));}}
          className="inline-block sm:w-auto w-auto text-sm md:text-xl px-6 py-3 md:px-10 md:py-5 rounded-full cursor-pointer bg-pink-500 font-black text-white border-4 border-black shadow-[4px_4px_0px_0px_#000] hover:-translate-y-2 hover:shadow-[6px_6px_0px_0px_#000] active:translate-y-2 active:shadow-[0px_0px_0px_0px_#000] transition-all"
        >
          START EXPLORING
        </button>
      </div>
    </section>
  );
}
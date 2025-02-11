"use client"

import SearchComponent from "@/components/search-form";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function Home() {

  const [hasSearched, setHasSearched] = useState<boolean>(false);

  return (
    <div className={`grid grid-rows-[20px_1fr_20px] ${hasSearched ? "items-start" : "items-center"} justify-items-center min-h-screen p-6 pb-20 gap-16 sm:pb-10 sm:pt-6 font-[family-name:var(--font-geist-sans)]`}>
      <main className={`flex flex-col gap-8 row-start-2 items-center w-full sm:w-fit`}>
        <div className="flex flex-col items-center gap-2">
          <div className="flex gap-x-[1px] ">
            <span className="text-2xl font-semibold">Hi, I am </span>
            <Image
              alt="logo"
              src="/logo.svg"
              className="mb-1"
              width={100}
              height={60}
            />
          </div>
          <span className="font-medium">Search for YC companies with AI</span>
        </div>
        <SearchComponent setHasSearched={setHasSearched} />
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
        <span>
          Built by{" "}
          <Link
            className="cursor-pointer hover:underline text-orange-500"
            href={"https://www.linkedin.com/in/maneeshkolli/"}
          >
            Maneesh Kolli
          </Link>
        </span>
      </footer>
    </div>
  );
}

"use client";

import SearchComponent from "@/components/search-form";
import { Company } from "@/lib/schema";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Home() {
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const [companies, setCompanies] = useState<Company[]>([]);

  return (
    <div
      className={`grid grid-rows-[20px_1fr_20px] ${
        hasSearched ? "items-start" : "items-center"
      } justify-items-center min-h-screen p-6 pb-20 gap-16 sm:pb-10 sm:pt-6 font-[family-name:var(--font-geist-sans)]`}
    >
      <main className={`flex flex-col gap-8 row-start-2 items-center w-full`}>
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
        <SearchComponent
          setCompanies={setCompanies}
          setHasSearched={setHasSearched}
        />

        <div className="grid sm:grid-cols-2 gap-6 w-fit">
          {Array.isArray(companies) &&
            companies.map((company, _) => {
              return (
                <Card key={company.name} className="lg:w-[29rem]">
                  <CardContent className="p-4 flex flex-col gap-2">
                    <div className="flex flex-row gap-x-4">
                      <div className="overflow-hidden">
                        <Image
                          alt={company.name}
                          src={company.logo_url}
                          width={70}
                          height={10}
                        />
                      </div>
                      <div className="flex flex-col gap-[1px] items-start text-wrap">
                        <span className="font-semibold">{company.name}</span>
                        <span className="text-sm">{company.header}</span>
                      </div>
                    </div>
                    <div className="text-xs text-gray-500">
                      {company.description}
                    </div>
                  </CardContent>
                  <CardFooter className="flex flex-wrap gap-2">
                    {company.tags.map((tag, _) => {
                      return <Badge key={tag} variant="outline" className="text-nowrap rounded-full">{tag}</Badge>;
                    })}
                  </CardFooter>
                </Card>
              );
            })}
        </div>
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

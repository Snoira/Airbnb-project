//Introsida. kanske nån enkel bild som förklarar att man kan både hyra och hyra ut lägenheter? 
"use client"
import { Listing } from "@prisma/client";
import { useState, useEffect } from "react";
import Link from "next/link";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/";

export default function Home() {
  const [listings, setListings] = useState<Listing[]>([])
  const [error, setError] = useState<string>("")

  useEffect(() => {
    const getListings = async () => {
      const url = new URL(`${BASE_URL}api/listings`);
      console.log(url)
      const options = {
        method: "GET"
      };

      try {
        //återkom för att lägga till queries
        const response = await fetch(url, options);

        if (response.ok) {
          const data: Listing[] = await response.json();
          console.log(data)
          setListings(data);
        }

      } catch (error: any) {
        setError(error.message)
      }
    };

    getListings();
  }, []);

  return (
    <div className="p-10">
      <main >
        <h1 className="text-lg pb-5">Listings</h1>
        {error ? (
          <p>{error} </p>
        ) : listings?.map(listing => (
            <div key={listing.id}
              className="pb-3">
              <Link href={`/listings/${listing.id}`}>
                <h3 className="text-md font-semibold">{listing.name}</h3>
                <p>{listing.location}</p>
                <p>{listing.pricePerNight} kr</p>
              </Link>
            </div>
          ))}
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  )
}

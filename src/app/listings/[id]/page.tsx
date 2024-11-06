"use client"
import { Listing as ListingType } from "@prisma/client"
import { useState, useEffect } from "react";

const BASE_URL = process.env.BASE_URL || "http://localhost:3000/";

export default function Listing(options: APIOptions) {
    const id = options.params.id;
    console.log(id)
    const [error, setError] = useState<string>("")
    const [listing, setListing] = useState<ListingType | null>(null)

    useEffect(() => {
        const getListing = async () => {
            const url = new URL(`${BASE_URL}api/listings/${id}`);
      console.log(url)

            const options = {
                method: "GET"
            };

            try {
                const response = await fetch(url, options);

                if (response.ok) {
                    const data = await response.json();
                    console.log(data)
                    setListing(data);
                }

            } catch (error: any) {
                setError(error.message)
            }
        };

        getListing();
    }, []);
    return (
        <div className="p-10">
            <h1 className="text-lg pb-5">Listing Detail Page</h1>
            {error ? (
                <p>{error}</p>
            ) : <div className="pb-3">
                <h3 className="text-md font-semibold pb-1">{listing?.name}</h3>
                <p className="pb-1">{listing?.location}</p>
                <p>{listing?.description}</p>
                <button className="border border-black p-1">Book Listing</button>
            </div>
            }
        </div>
    )
}
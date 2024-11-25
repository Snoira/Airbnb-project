import { getListings } from "@/actions/listings"
import { AuthNav } from "@/components/AuthNav";
import Link from "next/link";
import { verifySession, deleteCookie } from "@/lib/dal"
import {useState} from "react"

export default async function Home() {
  const listings = await getListings()
  const { isAuth } = await verifySession()

  const deleteHandler = async () => {
    "use server"
    await deleteCookie()
  }

  return (
    <div className="p-10">
      <main >
        <h1 className="text-lg pb-5">Listings</h1>
        <AuthNav isAuth={isAuth} deleteHandler={deleteHandler} />
        {
          listings && listings.map(listing => (
            <div key={listing.id}
              className="pb-3">
              <Link href={`/listings/${listing.id}`}>
                <h3 className="text-md font-semibold">{listing.name}</h3>
                <p>{listing.location}</p>
                <p>{listing.pricePerNight} kr</p>
              </Link>
            </div>
          ))
        }
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center">
      </footer>
    </div>
  )
}

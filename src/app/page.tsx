import { getListings } from "@/actions/listings"
import {Header} from "@/components/Header"
import Link from "next/link";

export default async function Home() {

  const listings = await getListings()
  return (
    <div className="p-10">
        <Header/>
      <main >
        <h1 className="text-lg pb-5">Listings</h1>
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

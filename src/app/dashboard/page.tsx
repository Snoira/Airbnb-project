import { getListingsWithBookingsByUserId } from "@/actions/listings";
import { ListingForm } from "@/components/ListingForm";
import Link from "next/link";
export default async function Dashboard() {
  // const listings = await getListingsWithBookingsByUserId();

  return (
    <div>
      <div className="flex justify-between p-2">
        <h2>Welcome back! </h2>
      </div>

      <ListingForm />

      <p>YOUR LISTINGS</p>
      {/* {listings &&
        listings.map((listing) => (
          <Link href={`/${listing.id}`}>
            <div key={listing.id} className="pb-3">
              <h3 className="text-md font-semibold">{listing.name}</h3>
              <p>{listing.location}</p>
            </div>
          </Link>
        ))} */}
    </div>
  );
}

import { getListingsWithBookingsByUserId } from "@/actions/listings";
import { ListingForm } from "@/components/ListingForm";
import ListingCard from "@/components/ListingCard";
import { getUserIdFromJWT } from "@/utils/jwt";
import { getUserById } from "@/utils/prisma";

export default async function Dashboard() {
  const listings = await getListingsWithBookingsByUserId();

  return (
    <div>
      <div className="flex justify-between p-2"></div>

      <ListingForm />
      <div className="flex flex-wrap gap-6">
        {listings &&
          listings.map((listing) => (
            <ListingCard key={listing.id} listing={listing} />
          ))}
      </div>
    </div>
  );
}

import { getListingsWithBookingsByUserId } from "@/actions/listings";
import { NewListingCard } from "@/components/NewListingCard";
import ListingCard from "@/components/ListingCard";
import { getUserIdFromJWT } from "@/utils/jwt";

export default async function Dashboard() {
  const userId = await getUserIdFromJWT();
  if (!userId) return <div>Unauthorized</div>;
  const listings = await getListingsWithBookingsByUserId(userId);

  return (
    <div>
      <div className="flex justify-between p-2">
        <h1 className="text-2xl font-semibold">Your listings</h1>
      </div>

      <div className="flex flex-wrap gap-6 py-6">
        {listings && (
          <>
            <NewListingCard />
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}

import { getListings } from "@/actions/listings";
import ListingCard from "@/components/ListingCard";

export default async function Home() {
  const listings = await getListings();

  return (
    <>
      <main>
        <div className="flex flex-wrap gap-6 justify-center pt-8 sm:pt-16">
          {listings &&
            listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </>
  );
}

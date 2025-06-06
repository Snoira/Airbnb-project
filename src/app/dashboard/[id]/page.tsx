import { getListingById } from "@/actions/listings";

export default async function Listing(options: { params: { id: string } }) {
  const id = options.params.id;

  const listing = await getListingById(id);

  return (
    <>
      <h1 className="text-lg pb-5">Listing Detail Page</h1>
      {listing && (
        <div className="pb-3">
          <h3 className="text-md font-semibold pb-1">{listing.name}</h3>
          <p>{listing.pricePerNight} kr per natt</p>
          <p className="pb-1">{listing.location}</p>
          <p>{listing.description}</p>
        </div>
      )}
    </>
  );
}

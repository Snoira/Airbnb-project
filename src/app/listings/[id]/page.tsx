import { getListingById } from "@/actions/listings";
import { getJWTFromCookie, decrypt } from "@/utils/jwt";
import { Skeleton } from "@/components/ui/skeleton";
import DeleteButton from "@/components/DeleteButton";
import { EditListing } from "@/components/EditListing";

type APIOptions = {
  params: {
    [key: string]: string;
  };
};

export default async function Listing(options: APIOptions) {
  const id = options.params.id;

  const listing = await getListingById(id);
  const JWT = await getJWTFromCookie();
  const user = await decrypt(JWT);
  const isCreator = user?.id === listing?.createdById;
  const isAdmin = user?.role === "ADMIN";

  return (
    <div className="p-10">
      {listing && (
        <div className="pb-3">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl text-stone-800">{listing.name}</h1>
            {isCreator ? (
              <EditListing listing={listing} />
            ) : isAdmin ? (
              <DeleteButton id={listing.id} />
            ) : null}
          </div>
          <div className="grid grid-cols-4 grid-rows-2 gap-4 h-[300px] py-6">
            <Skeleton className="bg-stone-200 col-span-2 row-span-2 h-full w-full" />
            <Skeleton className="bg-stone-200" />
            <Skeleton className="bg-stone-200" />
            <Skeleton className="bg-stone-200" />
            <Skeleton className="bg-stone-200" />
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p className="pb-1">{listing.location}</p>
              <p>{listing.description}</p>
              <p>{listing.pricePerNight} kr per natt</p>
            </div>
            {!isCreator && <div>book listing</div>}
          </div>
        </div>
      )}
    </div>
  );
}

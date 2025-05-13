import { getListingById } from "@/actions/listings";
import { getJWTFromCookie, decrypt } from "@/utils/jwt";
import {Skeleton} from "@/components/ui/skeleton";

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
          <h1 className="text-xl font-semibold pb-1">{listing.name}</h1>
          <p>{listing.pricePerNight} kr per natt</p>
          <p className="pb-1">{listing.location}</p>
          <p>{listing.description}</p>
        </div>
      )}
    </div>
  );
}

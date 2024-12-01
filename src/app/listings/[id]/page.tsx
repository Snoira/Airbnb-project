import { getListingById } from "@/actions/listings"
import { verifySession } from "@/lib/dal";

export default async function Listing(options: APIOptions) {
    const id = options.params.id;

    const listing = await getListingById(id)
    const {isAuth} = await verifySession()

    return (
        <div className="p-10">
            <h1 className="text-lg pb-5">Listing Detail Page</h1>
            {listing &&
                <div className="pb-3">
                    <h3 className="text-md font-semibold pb-1">{listing.name}</h3>
                    <p>{listing.pricePerNight} kr per natt</p>
                    <p className="pb-1">{listing.location}</p>
                    <p>{listing.description}</p>
                    
                </div>
            }
        </div>
    )
}
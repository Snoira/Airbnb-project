import { getListingsWithBookingsByUserId } from "@/actions/listings"
import {getSafeUser} from "@/lib/dal"

export default async function Dashboard() {
    const listings = await getListingsWithBookingsByUserId()
    const user = await getSafeUser()

    return (
        <div>
            <h1>
                DASHBOARD
            </h1>
            <h2>HEJ {user?.name} </h2>
            <p>CREATE LISTING</p>
            <p>YOUR LISTINGS</p>
            {
                listings && listings.map(listing => (
                    <div key={listing.id}
                        className="pb-3">
                        {/* <Link href={`/listings/${listing.id}`}> */}
                        <h3 className="text-md font-semibold">{listing.name}</h3>
                        <p>{listing.location}</p>

                        {listing.bookings && listing.bookings.map(booking => {

                            const startDate: string = booking.checkin_date.toDateString()
                            const endDate: string = booking.checkout_date.toDateString()

                            return (
                                <div key={booking.id}>
                                    <p> From {startDate} to {endDate} </p>
                                    <p>Status: {booking.status}</p>
                                </div>
                            )
                        })
                        }
                        {/* </Link> */}
                    </div>
                ))
            }
        </div>
    )
}
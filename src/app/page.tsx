import { getListings } from "@/actions/listings";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { checkAuth } from "@/utils/jwt";

export default async function Home() {
  const listings = await getListings();
  const isAuth = await checkAuth();

  console.log("\n!!!listings", listings, "\n");

  console.log("-------isAuth", isAuth);

  return (
    <>
      <main>
        <div className="mt-16 flex flex-wrap gap-6 justify-center border-t border-stone-200 pt-10 sm:pt-16">
          {listings &&
            listings.map((listing) => (
              <Link key={listing.id} href={`/listings/${listing.id}`}>
                <Card className="w-[350px]">
                  <div>
                    <CardHeader>
                      <Skeleton className="h-[300px] w-[300px] rounded-xl" />
                      <CardTitle>{listing.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <CardDescription>
                        <p>{listing.location}</p>
                        <p>{listing.pricePerNight} kr</p>
                      </CardDescription>
                    </CardContent>
                  </div>
                </Card>
              </Link>
            ))}
        </div>
      </main>
      <footer className="row-start-3 flex gap-6 flex-wrap items-center justify-center"></footer>
    </>
  );
}

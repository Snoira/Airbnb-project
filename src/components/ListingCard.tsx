import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Listing } from "@prisma/client";

type Props = {
  listing: Listing;
};

export default function ListingCard({ listing }: Props) {
  return (
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
  );
}

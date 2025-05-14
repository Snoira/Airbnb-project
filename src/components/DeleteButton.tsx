"use client";
import { Button } from "@/components/ui/button";
import { deleteListingById } from "@/actions/listings";
import { useRouter } from "next/navigation";

export default function DeleteButton({ id }: { id: string }) {
  const router = useRouter();
  return (
    <Button
      variant="destructive"
      onClick={() => {
        deleteListingById(id);
        router.refresh();
        router.push("/dashboard");
      }}
    >
      Delete Listing
    </Button>
  );
}

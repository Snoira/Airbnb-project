"use client";
import { Button } from "@/components/ui/button";
import { deleteListingById } from "@/actions/listings";

export default function DeleteButton({ id }: { id: string }) {
  return (
    <Button
      variant="destructive"
      size="lg"
      onClick={() => {
        deleteListingById(id);
      }}
    >
      Delete Listing
    </Button>
  );
}

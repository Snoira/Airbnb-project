"use client";
import { useState } from "react";
import { Button } from "./ui/button";
import { ListingForm } from "./ListingForm";
import { Listing } from "@prisma/client";

export function EditListing({ listing }: { listing: Listing }) {
  const [isActive, setIsActive] = useState<boolean>(false);

  const showForm = (boolean: boolean) => {
    setIsActive(boolean);
  };

  return (
    <>
      {isActive ? (
        <div className="fixed inset-0 z-10 gird place-items-center bg-stone-900/50">
          <div className="relative mt-10 p-5">
              <ListingForm showForm={showForm} oldListing={listing} />
          </div>
        </div>
      ) : (
        <Button onClick={() => setIsActive(true)}>Edit Listing</Button>
      )}
    </>
  );
}

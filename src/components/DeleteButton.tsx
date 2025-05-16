"use client";
import { Button } from "@/components/ui/button";
import { deleteListingById } from "@/actions/listings";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function DeleteButton({ id }: { id: string }) {
  const [showConfirm, setShowConfirm] = useState<boolean>(false);
  const router = useRouter();
  return (
    <>
      {showConfirm ? (
        <div className="fixed inset-0 z-10 gird place-items-center bg-stone-900/50">
          <div className="relative p-10">
            <Card>
              <CardHeader>
                <CardTitle>
                  Are you sure you want to delete this listing?
                </CardTitle>
              </CardHeader>
              <CardFooter>
                <div className="w-full flex justify-end gap-2">
                  <Button
                    variant="destructive"
                    onClick={async () => {
                      await deleteListingById(id);
                      router.push("/dashboard");
                      router.refresh();
                    }}
                  >
                    Delete
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowConfirm(false);
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </CardFooter>
            </Card>
          </div>
        </div>
      ) : (
        <Button
          variant="destructive"
          onClick={() => {
            setShowConfirm(true);
          }}
        >
          Delete Listing
        </Button>
      )}
    </>
  );
}

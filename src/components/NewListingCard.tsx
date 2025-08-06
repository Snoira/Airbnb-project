"use client";
import { useState } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardDescription,
  CardTitle,
} from "@/components/ui/card";
import { ListingForm } from "./ListingForm";
import { Skeleton } from "./ui/skeleton";

export function NewListingCard() {
  const [isActive, setIsActive] = useState<boolean>(false);

  const showForm = (boolean: boolean) => {
    setIsActive(boolean);
  };
  return (
    <>
      {isActive ? (
        <div className="fixed inset-0 z-10 gird place-items-center bg-stone-900/50">
          <div className="relative p-10">
            <Card className="w-[350px]">
              <div className="p-6">
                <ListingForm showForm={showForm} />
              </div>
            </Card>
          </div>
        </div>
      ) : (
        <div onClick={() => setIsActive(true)}>
          <Card className="w-[350px]">
            <div>
              <CardHeader>
                <Skeleton className="grid place-items-center h-[300px] w-[300px] rounded-xl">
                  <div className="text-9xl text-stone-400">+</div>
                </Skeleton>
                <CardTitle>
                  <Skeleton className="h-[20px]" />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  <Skeleton className="h-[20px] mb-1" />
                  <Skeleton className="h-[20px]" />
                </CardDescription>
              </CardContent>
            </div>
          </Card>
        </div>
      )}
    </>
  );
}

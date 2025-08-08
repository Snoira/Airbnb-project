"use client";
import { Listing } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { createListing, updateListingById } from "@/actions/listings";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";


type Props = {
  oldListing?: Listing;
  showForm: (boolean: boolean) => void;
};

const INIT_FORM_DATA = {
  name: "",
  description: "",
  location: "",
  pricePerNight: 0,
};

const listingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  pricePerNight: z.number().min(1, "Price per night is required"),
  reservedDates: z.array(z.date()).optional(),
});
type ListingData = z.infer<typeof listingSchema>;

export function ListingForm({ showForm, oldListing }: Props) {
  const router = useRouter();

  const form = useForm<ListingData>({
    resolver: zodResolver(listingSchema),
    defaultValues: oldListing ?? INIT_FORM_DATA
  });

  const onSubmit = async (formData: ListingData) => {
    const listing = oldListing
      ? await updateListingById(oldListing.id, formData)
      : await createListing(formData);
    if (!!listing) {
      router.refresh();
    } else {
      //redirect something went wrong
    }
  };

  return (
    <Card className="w-[350px]">
      <div className="p-6  space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-stone-900 text-lg font-medium">
            {" "}
            {oldListing ? "EDIT" : "CREATE"} LISTING
          </h1>
          <Button
            variant="destructive"
            size="icon-sm"
            className="text-stone-50"
            onClick={() => showForm(false)}
          >
            X
          </Button>
        </div>
        <div className="space-y-2">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input type="text" placeholder="Location" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pricePerNight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price Per Night</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Price Per Night" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit"
                className="w-full py-3 px-4 bg-stone-400 text-white font-semibold rounded-lg hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
              >Submit</Button>
            </form>
          </Form>
        </div>
      </div>
    </Card>
  );
}

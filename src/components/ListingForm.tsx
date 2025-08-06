"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Listing } from "@prisma/client";
import { z } from "zod";
import { Button } from "./ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";
import { createListing } from "@/actions/listings";
import { useRouter } from "next/navigation";

const listingSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  location: z.string().min(1, "Location is required"),
  pricePerNight: z.number().min(1, "Price per night is required"),
  reservedDates: z.array(z.date()).optional(),
});

const INIT_FORM_DATA = {
  name: "",
  description: "",
  location: "",
  pricePerNight: 0,
};

type ListingData = z.infer<typeof listingSchema>;

type Props = {
  oldListing?: Listing;
  showForm: (boolean: boolean) => void;
};

export function ListingForm({ oldListing, showForm }: Props) {
  const router = useRouter();

  const form = useForm<ListingData>({
    resolver: zodResolver(listingSchema),
    defaultValues: {
      name: oldListing?.name || "",
      description: oldListing?.description || "",
      location: oldListing?.location || "",
      pricePerNight: oldListing?.pricePerNight || 0,
    },
  });

  const onSubmit = async (formData: ListingData) => {
    const listing = await createListing(formData);
    if (listing) {
      form.reset(INIT_FORM_DATA);
      showForm(false);
      router.refresh();
    } //else redirect to something went wring page
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-2">
        <div className="flex justify-between items-center">
          <h1 className="text-stone-900 text-lg font-medium">
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

        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Name" {...field} />
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
                <Input placeholder="Description" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="location"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Location</FormLabel>
              <FormControl>
                <Input placeholder="Location" {...field} />
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
                <Input
                  type="number"
                  {...field}
                  value={field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button
          type="submit"
          className=" py-3 px-4 bg-stone-400 text-white font-semibold rounded-lg hover:bg-amber-400 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 focus:bg-amber-400 transition duration-200"
        >
          Submit
        </Button>
      </form>
    </Form>
  );
}
import { ListingData } from "@/types/listing";

export function listingValidation(data: ListingData): [boolean, string] {
  let errors: string[] = [];
  if (!data.name) errors.push("Name");
  if (!data.description) errors.push("Description");
  if (!data.location) errors.push("Location");
  if (!data.pricePerNight) errors.push("Price per night");

  const hasErrors = errors.length !== 0;
  const errorText: string = errors.join(", ") + " is required";

  return [hasErrors, errorText];
}

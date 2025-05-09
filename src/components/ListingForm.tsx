"use client";
import { useState } from "react";
import * as Yup from "yup";
import { createListing } from "@/actions/listings";
import { listingFormSchema } from "@/lib/definitions";
import { ListingFormData } from "@/types/listing";
import { ErrorObject } from "@/types/general";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
const INIT_FORM_DATA = {
  name: "",
  description: "",
  location: "",
  pricePerNight: 0,
};

export function ListingForm() {
  const router = useRouter();
  const [formData, setFormData] = useState<ListingFormData>(INIT_FORM_DATA);
  const [error, setError] = useState<ErrorObject>({});
  const [showForm, setShowForm] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = event.target;

    setFormData({
      ...formData,
      [name]: type === "number" ? parseFloat(value) : value,
    });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    try {
      await listingFormSchema.validate(formData, { abortEarly: false });
      setError({});
      const listing = await createListing(formData);
      console.log("!!!new listing: ", listing);
      if (!!listing) {
        setFormData(INIT_FORM_DATA);
        setShowForm(false);
        router.refresh();
      }
    } catch (error) {
      // återkommer med bättre errorhantering, form som ger feedback.
      if (error instanceof Yup.ValidationError) {
        error.inner.map((err) => {
          setError({
            ...error,
            [`${err.path}`]: `${err.message}`,
          });
        });
      }
      console.log("ERROR", error);
    }
  };

  return (
    <>
      <Button variant="outline" onClick={() => setShowForm(!showForm)}>
        {showForm ? "Hide Form" : "Add new listing"}
      </Button>
      {showForm && (
        <form
          onSubmit={handleSubmit}
          className="max-w-md mx-auto p-6 bg-white text-black rounded-lg shadow-md space-y-6"
        >
          <h1> CREATE LISTING</h1>
          <div className="space-y-2">
            <label
              htmlFor="listingName"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              className={`w-full px-4 py-2 border ${
                error.name ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
              type="text"
              id="listingName"
              name="name"
              placeholder="Name"
              value={formData.name}
              onChange={handleChange}
              required
              aria-required="true"
            />
            {error.name && <p>{error.name}</p>}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <input
              className={`w-full px-4 py-2 border ${
                error.description ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
              type="text"
              id="description"
              name="description"
              placeholder="Description"
              value={formData.description}
              onChange={handleChange}
              required
              aria-required="true"
            />
            {error.description && <p>{error.description}</p>}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="location"
              className="block text-sm font-medium text-gray-700"
            >
              Location
            </label>
            <input
              className={`w-full px-4 py-2 border ${
                error.location ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
              type="text"
              id="location"
              name="location"
              placeholder="Location"
              value={formData.location}
              onChange={handleChange}
              required
              aria-required="true"
            />
            {error.location && <p>{error.location}</p>}
          </div>
          <div className="space-y-2">
            <label
              htmlFor="pricePerNight"
              className="block text-sm font-medium text-gray-700"
            >
              Price Per Night
            </label>
            <input
              className={`w-full px-4 py-2 border ${
                error.pricePerNight ? "border-red-500" : "border-gray-300"
              } rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500`}
              type="number"
              name="pricePerNight"
              value={formData.pricePerNight}
              onChange={handleChange}
              required
              aria-required="true"
            />
            {error.pricePerNight && <p>{error.pricePerNight}</p>}
          </div>
          <button
            type="submit"
            className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
          >
            create listing
          </button>
        </form>
      )}
    </>
  );
}

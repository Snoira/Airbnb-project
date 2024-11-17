"use client";
import { useState } from "react";
import * as Yup from "yup"
import { createListing } from "@/actions/listings";
import { listingFormSchema } from "@/lib/definitions"
import { ListingFormData } from "@/types/listing";

export function ListingForm() {
    const [formData, setFormData] = useState<ListingFormData>({
        name: "",
        description: "",
        location: "",
        pricePerNight: 0
    })

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = event.target;
        setFormData({
            ...formData,
            [name]: value
        })
    }

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        try {
            await listingFormSchema.validate(formData, { abortEarly: false })
            const listing = await createListing(formData)

        } catch (error) {
            // återkommer med bättre errorhantering, form som ger feedback.
            if( error instanceof Yup.ValidationError) {
                const errors = (error.inner.map((err)=> {
                    return( `${err.path}: ${err.message}`)
                }))
                console.log(errors.join(", "))
            }
        }
    }

    return (
        <form onSubmit={handleSubmit}
            className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md space-y-6">
            <div className="space-y-2">
                <label htmlFor="listingName"
                    className="block text-sm font-medium text-gray-700">
                    Name</label>
                <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    type="text"
                    id="listingName"
                    name="name"
                    placeholder="Name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    aria-required="true"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="description"
                    className="block text-sm font-medium text-gray-700"
                >Description</label>
                <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    type="text"
                    id="description"
                    name="description"
                    placeholder="Description"
                    value={formData.description}
                    onChange={handleChange}
                    required
                    aria-required="true"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="location" className="block text-sm font-medium text-gray-700"
                >Location</label>
                <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    type="text"
                    id="location"
                    name="location"
                    placeholder="Location"
                    value={formData.location}
                    onChange={handleChange}
                    required
                    aria-required="true"
                />
            </div>
            <div className="space-y-2">
                <label htmlFor="pricePerNight"
                    className="block text-sm font-medium text-gray-700">
                    Price Per Night</label>
                <input
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                    type="number"
                    name="pricePerNight"
                    value={formData.pricePerNight}
                    onChange={handleChange}
                    required
                    aria-required="true"
                />
            </div>
            <button
                type="submit"
                className="w-full py-3 px-4 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-200"
            >
                create listing</button>
        </form>
    )
}

import { ListingRegisterData } from "@/types/listing"

export function registrationValidation(data: ListingRegisterData): [boolean, ErrorObject] {
    let errors: ErrorObject = {}
    if (!data.name) errors.name = "Name is required"
    if (!data.description) errors.description = "Description is required"
    if (!data.location) errors.location = "Location is required"
    if (!data.pricePerNight) errors.pricePerNight = "Price per night is required"
    if (!data.availability) errors.availability = "Availability is required"

    const hasErrors = Object.keys(errors).length !== 0
    
    return [hasErrors, errors]
}
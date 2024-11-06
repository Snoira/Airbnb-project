import { ListingData } from "@/types/listing"

export function listingValidation(data: ListingData): [boolean, string] {
    // let errors: ErrorObject = {}
    let errors: string[]= []
    if (!data.name) errors.push("Name")
    if (!data.description) errors.push("Description")
    if (!data.location) errors.push("Location")
    if (!data.pricePerNight) errors.push("Price per night")
    if (!data.reservedDates) errors.push("Reserved Dates")

    const hasErrors = errors.length !== 0
    const errorText: string = (errors.join(", ")+" is required")
    //skicka ErrorObject eller errorText beror på hur jag vill hantera error i frontend tror jag
    // inte kommit dit än men om error ska dyka upp i formulär kanske objektet är viktigt? får se
    // till dess text.
    
    return [hasErrors, errorText]
    //return [hasErrors, errors]
}
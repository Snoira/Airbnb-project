import * as Yup from "yup"
import { ListingData } from "@/types/listing"

export const registerFormSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email format')
        .required('Required'),
    password: Yup.string()
        .min(8, 'Must be at least 8 characters')
        .required('Required'),
    name: Yup.string()
        .min(2, 'Must be at least two characters long')
        .required('Required')
})

export const loginFormSchema = Yup.object().shape({
    email: Yup.string()
        .email('Invalid email format')
        .required('Required'),
    password: Yup.string()
        .min(8, 'Must be at least 8 characters')
        .required('Required'),
})

export const listingFormSchema = Yup.object().shape({
    name: Yup.string()
        .max(500, 'Invalid email format')
        .required('Required'),
    descriprion: Yup.string()
        .min(500, 'Must be less than 500 characters')
        .required('Required'),
    location: Yup.string()
        .required('Required'),
    pricePerNight: Yup.number()
        .required('Required'),

})

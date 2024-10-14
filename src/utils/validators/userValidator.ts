import { UserRegistrationData } from "@/types/user"

//bryt ut
type ErrorObject = {
    [key: string]: string;
  };

export function registrationValidation(data: UserRegistrationData): [boolean, ErrorObject] {
    let errors: ErrorObject = {}
    if (!data.email) errors.email = "Email is required"
    if (!data.name) errors.name = "Name is required"
    if (!data.password) errors.password = "password is required"

    const hasErrors = Object.keys(errors).length !== 0
    return [hasErrors, errors]
}
import * as Yup from "yup"

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


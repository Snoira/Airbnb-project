type ErrorObject = {
    [key: string]: any
}

type APIOptions = {
    params: {
        [key: string]: string
    }
}

type IncludeObj = {
    include: {
    [key: string]: boolean
    }
}
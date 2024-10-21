class AppError extends Error {
    public statusCode: number

    constructor(message: string, statusCode: number) {
        super(message)
        this.statusCode = statusCode
        this.name = this.constructor.name
        Error.captureStackTrace(this, this.constructor)
    }
}

export class ValidationError extends AppError {
    constructor(message = "Validation failed") {
        super(message, 400)
    }
}

export class NotFoundError extends AppError {
    constructor(message = "Resource not found") {
        super(message, 404)
    }
}

export class DatabaseError extends AppError {
    constructor(message = "Database error") {
        super(message, 500)
    }
}

export class ForbiddenError extends AppError {
    constructor(message = "You don't have permission to make this request"){
        super(message, 403)
    }
}

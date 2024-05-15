export enum AuthStatus {
    Validating,
    Validated,
    NotValidated
}

export interface User {
    id: number,
    email: string,
    username: string,
    firstName: string,
    lastName: string
}
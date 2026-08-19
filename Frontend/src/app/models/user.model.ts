export interface User {
    id: number;
    username: string;
    fullName: string;
}

export interface LoginRequest {
    username: string;
    password?: string; // Optional for the model, required for the API
}

export interface SignUpRequest {
    username: string;
    fullName: string;
    password?: string;
    confirmPassword?: string;
}

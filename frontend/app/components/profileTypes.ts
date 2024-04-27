export interface ProfileType {
    id: number,
    first_name: string,
    last_name: string,
    date_of_birth: string,
    email: string,
    created_at: string,
    updated_at: string,
    username: string,
    tags: string,
    bio: string,
    latitude: number,
    longitude: number,
    fame_rating: number,
    account_verified: boolean,
    gender: string,
    sexual_orientation: string,
    is_online: boolean,
    last_online: string,
    pictures: string[],
}

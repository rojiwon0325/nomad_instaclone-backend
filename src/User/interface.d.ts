export interface User {
    username: string
    account: string
    avatarUrl: string
}

export interface Profile extends User {
    bio: string
    numOfFollower?: number
    numOfFollowing?: number
}

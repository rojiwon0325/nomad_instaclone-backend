import { Post } from "Post/interface";

export interface User {
    username: string
    account: string
    avatarUrl: string
}

export interface Profile extends User {
    bio: string
    post?: Post[]
    numOfFollower?: number
    numOfFollowing?: number
}

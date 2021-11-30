
export interface User {
    account: string
    username: string
    avatarUrl: string

    isMe?: boolean
    isFollowing?: boolean
    isRequsting?: boolean

    profile?: {
        bio: string
        isPublic: boolean

        _count: {
            post: number
            follower: number
            following: number
        } | null
    }
}
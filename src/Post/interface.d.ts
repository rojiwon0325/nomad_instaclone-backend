
export interface Post {
    id: number
    photo: string[]
    _count: {
        like: number
        comment: number
        reComment: number
    } | null
    detail?: {
        comments: Comment[]
        account: string
        avatarUrl: string
        caption: string[]
        createdAt: Date

        isMine: boolean
        isLiked: boolean
    }
}

export interface Hashtag {
    name: string
    _count: {
        post: number
    } | null
}

export interface Comment {
    id: number,
    text: string[],
    account: string,
    createdAt: Date,

    _count: {
        reComment: number,
    } | null,

    isMine: boolean
}

export interface ReComment {
    id: number,
    text: string[],
    rootId: number,
    account: string,
    createdAt: Date,

    isMine: boolean
}

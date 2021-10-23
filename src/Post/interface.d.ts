export interface Post {
    id: number
    account: string
    caption: string
}

export interface PostResult {
    ok: boolean
    error?: string
    post?: Post
}
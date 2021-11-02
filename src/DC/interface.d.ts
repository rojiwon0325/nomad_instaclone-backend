import { User } from "User/interface";

export interface Chat {
    id: number
    text: string
    read: boolean
    roomId: number
    account: string
    createdAt: Date
}

export interface ChatRoom {
    id: number
    user: User[]
    chat: Chat[]
    updatedAt: Date
}
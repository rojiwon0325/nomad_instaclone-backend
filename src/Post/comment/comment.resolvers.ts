import { Comment, ReComment } from "Post/interface";
import { ifPermitted } from "Post/post.utils";
import client from "prismaClient";
import { Resolver, Resolvers, ResultToken } from "types";
import { ifLogin } from "User/user.utils";

const newComment: Resolver = async (_, { postId, text, rootId }: { postId: number, text: string, rootId: number | undefined }, { loggedInUser: account }): Promise<ResultToken & { comment?: Comment | ReComment }> => {
    try {
        const data = {
            text: text.split('\n'),
            user: { connect: { account } },
            post: { connect: { id: postId } },
        };
        const select = {
            id: true,
            text: true,
            account: true,
            createdAt: true,
        };
        if (rootId) {
            const cmt = await client.reComment.create({
                data: {
                    ...data,
                    root: { connect: { id: rootId } },
                }, select: {
                    ...select,
                    rootId: true,
                }
            });
            return { ok: true, comment: { ...cmt, isMine: true } };
        } else {
            const cmt = await client.comment.create({ data, select });
            return { ok: true, comment: { ...cmt, _count: null, isMine: true } };
        }
    } catch { }
    return { ok: false, error: "Fail to create comment" };
};
const deleteComment: Resolver = async (_, { id }: { id: number }, { loggedInUser: account }): Promise<ResultToken> => {
    try {
        const { count } = await client.comment.deleteMany({ where: { id, OR: [{ account }, { post: { account } },] } });
        if (count > 0) {
            await client.reComment.deleteMany({ where: { rootId: id } });
        } else {
            return { ok: false, error: "Comment not found" };
        }
        return { ok: true };
    } catch { }
    return { ok: false, error: "Fail to delete comment" };
};
const seeComment: Resolver = async (_, { postId, rootId, offset: skip = 0, take = 10 }: { postId: number, rootId: number | undefined, offset: number | undefined, take: number }, { loggedInUser }): Promise<Comment[] | ReComment[]> => {
    try {
        if (rootId) {
            const list = await client.reComment.findMany({ where: { postId, rootId }, take, skip, select: { id: true, text: true, account: true, createdAt: true, rootId: true } });
            return list.map(elem => { return { ...elem, isMine: elem.account === loggedInUser } });
        } else {
            const list = await client.comment.findMany({ where: { postId }, take, skip, select: { id: true, text: true, account: true, createdAt: true, _count: { select: { reComment: true } } } });
            return list.map(elem => { return { ...elem, isMine: elem.account === loggedInUser } });
        }
    } catch (e) { console.log(e) }
    return [];
};

const resolvers: Resolvers = {
    Query: {
        seeComment: ifPermitted(seeComment),
    },
    Mutation: {
        newComment: ifLogin(ifPermitted(newComment)),
        deleteComment,
    }
};

export default resolvers;
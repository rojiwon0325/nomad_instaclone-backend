import { Resolver, Resolvers } from "types";
import { ifLogin } from "User/user.utils";
import { PostResult } from "Post/interface";
import { FileUpload } from "graphql-upload";
import { uploadToS3 } from "Shared/shared.utils";

const newPost: Resolver = async (_, { photo, caption }: { photo: [FileUpload] | null, caption: string }, { client, loggedInUser }): Promise<PostResult> => {
    try {
        const photos = photo ? await Promise.all(photo.map(elem => uploadToS3(elem, loggedInUser, `post/${loggedInUser}`))) : [];
        const [{ id, account }] = await Promise.all([
            client.post.create({ data: { account: loggedInUser, caption, photo: photos } }),
            client.user.update({
                where: { account: loggedInUser },
                data: { numOfPost: { increment: 1 } }
            })
        ]);
        return { ok: true, post: { id, account, caption } };
    } catch { }
    return { ok: false, error: "Fail to new post" };
};

const editPost: Resolver = async (_, { id, caption }: { id: number, caption: string }, { client, loggedInUser }): Promise<PostResult> => {
    try {
        const { count } = await client.post.updateMany({
            where: { id, account: loggedInUser },
            data: { caption }
        });

        return count ? { ok: true } : { ok: false, error: "Post not Found" };
    } catch { }
    return { ok: false, error: "Fail to edit post" };
};

const deletePost: Resolver = async (_, { id }: { id: number }, { client, loggedInUser }) => {
    try {
        const [{ count }] = await Promise.all([
            client.post.deleteMany({ where: { id, account: loggedInUser } }),
            client.user.update({
                where: { account: loggedInUser },
                data: { numOfPost: { decrement: 1 } }
            })
        ]);
        return count ? { ok: true } : { ok: false, error: "Post not Found" };
    } catch { }
    return { ok: false, error: "Fail to delete post" };
};

const resolvers: Resolvers = {
    Mutation: {
        newPost: ifLogin(newPost),
        editPost: ifLogin(editPost),
        deletePost: ifLogin(deletePost)
    }
};

export default resolvers;
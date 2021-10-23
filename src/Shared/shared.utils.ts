import AWS from "aws-sdk";
import { FileUpload } from "graphql-upload";

export const uploadToS3 = async (file: FileUpload, account: string, folder: string): Promise<string> => {
    AWS.config.update({
        credentials: {
            accessKeyId: process.env.AWS_ID,
            secretAccessKey: process.env.AWS_SECRET
        }
    });
    const { filename, createReadStream } = await file;
    const readStream = createReadStream();
    const objectName = `${folder}/${account}-${Date.now()}-${filename}`;
    const { Location } = await new AWS.S3()
        .upload({
            Bucket: "instaclone-rojiwon",
            Key: objectName,
            ACL: "public-read",
            Body: readStream,
        })
        .promise();
    return Location;
}
import AWS from "aws-sdk";
import { FileUpload } from "graphql-upload";

declare var process: {
    env: {
        AWS_ID: string,
        AWS_SECRET: string,
    }
}

export const uploadToS3 = async (file: FileUpload, account: string, folder: string): Promise<string> => {
    try {
        AWS.config.update({
            region: 'ap-northeast-2',
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
    } catch { }
    return "";
}

export const deleteToS3 = async (url: string): Promise<void> => {
    try {
        if (url === "") {
            return;
        }
        AWS.config.update({
            region: 'ap-northeast-2',
            credentials: {
                accessKeyId: process.env.AWS_ID,
                secretAccessKey: process.env.AWS_SECRET
            }
        });
        const Key = url.replace("https://instaclone-rojiwon.s3.ap-northeast-2.amazonaws.com/", "");
        await new AWS.S3().deleteObject({ Bucket: "instaclone-rojiwon", Key }, (err, data) => err || data).promise().catch();
    } catch { }
    return;
}
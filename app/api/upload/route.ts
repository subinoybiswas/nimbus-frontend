import { NextRequest, NextResponse } from "next/server";
import { generateRandomFilename } from "@/app/helpers/generateRandomFilename";
import {
    S3Client,
    ListObjectsCommand,
    PutObjectCommand,
} from "@aws-sdk/client-s3";

const Bucket = process.env.BUCKET;
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});

export async function POST(request: NextRequest) {
    const formData = await request.formData();
    const files = [formData.getAll("file")[0]] as File[];
    const Key = generateRandomFilename(10) + "." + files[0].name.split('.')[1];
    try {

        await Promise.all(
            files.map(async (file) => {
                const Body = (await file.arrayBuffer()) as Buffer;
                s3.send(new PutObjectCommand({ Bucket, Key: Key, Body }));
            })
        );
    }
    catch (error) {
        console.error("Error uploading file:", error);
        return NextResponse.json({ error: "Error uploading file" }, { status: 500 });
    }

    return NextResponse.json("https://" + process.env.BACKEND_SERVER + "/" + Key);
}
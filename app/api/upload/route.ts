import { NextRequest, NextResponse } from "next/server";
import { generateRandomFilename } from "@/app/helpers/generateRandomFilename";
import {
    S3Client,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import { getSession } from "@/lib/auth"
import { db } from "@/lib/db";
import { User } from "@/schema/users";
import { eq } from "drizzle-orm";
import { error } from "console";

const Bucket = process.env.BUCKET;
const s3 = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID as string,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY as string,
    },
});

export async function POST(request: NextRequest) {
    const session = await getSession();
    if (!session) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    try {
        const result = await db
            .select()
            .from(User)
            .where(eq(User.email, session?.user?.email as string))

        if (result.length === 0) {
            db.insert(User)
                .values({ name: session?.user?.name as string, email: session?.user?.email as string, credits: 5 })
                .execute();
        } else {
            if (result[0].credits < 1) {
                return NextResponse.json({ error: "Insufficient credits" }, { status: 402 });
            }
            db.update(User)
                .set({ credits: result[0].credits - 1 })
                .where(eq(User.email, session?.user?.email as string))
                .execute();
        }

    }
    catch (error) {
        console.error("Error querying database:", error);
        return NextResponse.json({ error: "Error querying database" }, { status: 500 })
    };
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
    console.log("https://" + process.env.BACKEND_SERVER + "/" + Key);
    return NextResponse.json({ url: "https://" + process.env.BACKEND_SERVER + "/" + Key, error: null }, { status: 200 });
}
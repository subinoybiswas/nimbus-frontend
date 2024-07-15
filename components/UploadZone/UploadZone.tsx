import { _Object } from "@aws-sdk/client-s3";
import { Group, Text, rem, Loader } from "@mantine/core";
import { Button } from "../ui/button";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import { Dropzone, IMAGE_MIME_TYPE, FileWithPath } from "@mantine/dropzone";
import { CopyToClipboard } from "react-copy-to-clipboard";
import useSWRMutation from "swr/mutation";
import { useRef, useState } from "react";
import { useSession } from "next-auth/react";

import React from "react";
import { ClipboardCopy } from "lucide-react";
import { Login } from "../component/login";
import ReactLoading from "react-loading";

async function UploadZone(
  url: string,
  { arg }: { arg: { files: FileWithPath[] } }
): Promise<_Object[]> {
  const body = new FormData();
  arg.files.forEach((file) => {
    body.append("file", file, file.name);
  });

  const response = await fetch(url, { method: "POST", body });
  const res = await response.json();
  console.log(res);
  return res;
}

export function ImagePicker(props: {
  toast: (args: {
    duration: number;
    title: string;
    description: string;
  }) => void;
}) {
  const { status: signedIn } = useSession();
  const [loading, setLoading] = useState(false);
  const { trigger, data } = useSWRMutation("/api/upload", UploadZone);
  const input = useRef<HTMLInputElement>();

  if (signedIn !== "authenticated" && signedIn !== "loading") {
    return <Login />;
  } else {
    if (loading) {
      return (
        <div className="min-h-full flex flex-col items-center content-center justify-center gap-2">
          <ReactLoading type={"spin"} color="#fff" />
        </div>
      );
    }
    if (!data) {
      return (
        <Dropzone
          onDrop={async (files) => {
            setLoading(true);
            await trigger({ files });
            setLoading(false);
          }}
          maxSize={5 * 1024 ** 2}
          accept={IMAGE_MIME_TYPE}
        >
          <Group
            justify="center"
            gap="xl"
            mih={220}
            style={{ pointerEvents: "none" }}
            className="flex flex-row items-center justify-center gap-2 content-center"
          >
            <Dropzone.Accept>
              <IconUpload
                style={{
                  width: 100,
                  height: 100,
                  color: "#00c7b7",
                }}
                stroke={1.5}
              />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconX
                style={{
                  width: 100,
                  height: 100,
                  color: "#ff3860",
                }}
                stroke={1.5}
              />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconPhoto
                style={{
                  width: 100,
                  height: 100,
                  color: "#ffffff",
                }}
                stroke={1.5}
              />
            </Dropzone.Idle>

            <div>
              <Text size="xl" inline>
                Drag images here or click to select files
              </Text>
              <Text size="sm" c="dimmed" inline mt={7}>
                Attach as many files as you like, each file should not exceed
                5mb
              </Text>
            </div>
          </Group>
        </Dropzone>
      );
    } else {
      if ((data as { url?: string; error?: string | null }).error) {
        return (
          <div className="min-h-full flex flex-col items-center content-center justify-center gap-2">
            <div className="text-2xl m-3">Image Not Uploaded!</div>
            <div>You have reached your upload quota of 5 uploads</div>
          </div>
        );
      }
      return (
        <div className="min-h-full flex flex-col items-center content-center justify-center gap-2">
          <div className="text-2xl m-3">Image Uploaded</div>
          <CopyToClipboard
            text={
              (data as { url?: string; error?: string | null })
                .url as unknown as string
            }
            onCopy={() =>
              props.toast({
                duration: 2000,
                title: "Copied Link Successfully",
                description: (data as { url?: string; error?: string | null })
                  .url as unknown as string,
              })
            }
          >
            <div className="border-2 hover:border-gray-500 cursor-default text-center w-full rounded-lg px-2 py-1 flex flex-row gap-1">
              {
                (data as { url?: string; error?: string | null })
                  .url as unknown as string
              }
              <ClipboardCopy size={24} />
            </div>
          </CopyToClipboard>
        </div>
      );
    }
  }
}

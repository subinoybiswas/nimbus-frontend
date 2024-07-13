import { _Object } from "@aws-sdk/client-s3";
import { Group, Text, rem } from "@mantine/core";
import { IconUpload, IconPhoto, IconX } from "@tabler/icons-react";
import {
  Dropzone,
  DropzoneProps,
  IMAGE_MIME_TYPE,
  FileWithPath,
} from "@mantine/dropzone";

import useSWRMutation from "swr/mutation";

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
  return await res;
}

export function ImagePicker() {
  // when uploading a document, there seem to be a slight delay, so wait ~1s
  // before refreshing the list of documents `mutate("/api/documents")`.
  const { trigger } = useSWRMutation("/api/upload", UploadZone);

  return (
    <Dropzone
      onDrop={(files) => trigger({ files })}
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
              color: "#000000",
            }}
            stroke={1.5}
          />
        </Dropzone.Idle>

        <div>
          <Text size="xl" inline>
            Drag images here or click to select files
          </Text>
          <Text size="sm" c="dimmed" inline mt={7}>
            Attach as many files as you like, each file should not exceed 5mb
          </Text>
        </div>
      </Group>
    </Dropzone>
  );
}

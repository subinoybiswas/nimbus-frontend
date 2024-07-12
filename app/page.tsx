"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";

export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [formattedImage, setFormattedImage] = useState<string>("");
  const [status, setStatus] = useState<string>("normal");
  const input = useRef<HTMLInputElement>(null);

  const backend = process.env.NEXT_PUBLIC_BACKEND_SERVER;

  function handleSubmit() {
    console.log(input.current?.value);
    if (!input.current?.value) return;
    try {
      const url = new URL(input.current?.value);
      if (url.hostname !== backend) {
        console.log(url.hostname);
        setStatus("error");
        return;
      }
      setStatus("success");
      setUrl(input.current?.value);
    } catch {
      setStatus("error");
      console.error("Invalid URL");
      return;
    }
  }
  useEffect(() => {
    if (!url || url == "") return;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        setFormattedImage(url);
      })
      .catch((error) => {
        console.error("Error fetching image:", error);
        setStatus("error");
      });
  }, [url]);

  return (
    <main className="text-white flex min-h-screen flex-col items-center content-center justify-center p-24 bg-black/90 gap-5">
      <div className="text-6xl my-8">Nimbus.</div>
      <Input
        ref={input}
        placeholder="try  https://nimbus.com/image.png?quality=100&width=200&height=200"
        className={`w-1/2 rounded-xl h-10 placeholder:text-slate-600 bg-black/20 text-white ${
          status === "error"
            ? `border-red-400 border-2`
            : status === "success"
            ? `border-green-400 border-2`
            : ""
        }`}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            handleSubmit();
          }
        }}
      />
      <Button
        type="submit"
        className="text-black"
        variant={"outline"}
        onClick={handleSubmit}
      >
        Submit
      </Button>
      {formattedImage !== "" && (
        <>
          <Image
            src={formattedImage}
            alt="User provided"
            width={500}
            height={500}
            onError={() => {}}
          />
          <a href={formattedImage} download className="download-button">
            <Button variant={"secondary"} className="bg-gray-800 text-white">
              Download
            </Button>
          </a>
        </>
      )}
    </main>
  );
}

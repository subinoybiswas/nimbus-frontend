"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { ImagePicker } from "@/components/UploadZone/UploadZone";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
export default function Home() {
  const [url, setUrl] = useState<string>("");
  const [formattedImage, setFormattedImage] = useState<string>("");
  const [status, setStatus] = useState<string>("normal");
  const input = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const backend = process.env.NEXT_PUBLIC_BACKEND_SERVER;

  async function handleSubmit() {
    console.log(input.current?.value);
    try {
      if (!input.current?.value) throw new Error("No URL provided.");
      const lurl = new URL(input.current?.value);
      if (lurl.hostname !== backend) {
        console.log(lurl.hostname);
        setStatus("error");
        return;
      }
      setStatus("success");
      setUrl(input.current?.value);
      try {
        const response = await fetch(input.current?.value);
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const blob = await response.blob();
        const localUrl = URL.createObjectURL(blob as Blob);
        setFormattedImage(localUrl);
      } catch (e) {
        console.error("Error fetching image:", e);
        toast({
          duration: 2000,
          variant: "destructive",
          title: "Uh oh! Something went wrong.",
          description: "There was a problem with your request.",
        });
        setStatus("error");
      }
    } catch {
      setStatus("error");
      toast({
        duration: 2000,
        variant: "destructive",
        title: "You entered an invalid URL.",
        description: "There was a problem with your request.",
      });
      console.error("Invalid URL");
      return;
    }
  }

  return (
    <main className=" flex min-h-screen flex-col items-center content-center justify-center p-24 gap-5 border-2">
      <div className="text-6xl my-8 font-bold">Nimbus.</div>
      <Input
        ref={input}
        placeholder=" https://nimbus.com/image.png?quality=100"
        className={`text-lg md:w-3/4 lg:w-1/2 w-full rounded-xl h-10 border-2 ${
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
      <Button type="submit" variant={"outline"} onClick={handleSubmit}>
        Submit
      </Button>
      <div className="divider after::bg">OR</div>
      {formattedImage !== "" && (
        <>
          <Image
            className="rounded-xl"
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
      <Dialog>
        <DialogTrigger asChild>
          <Button>
            <Upload className="mr-2 h-4 w-4" />
            Upload Image
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="mb-5">Upload Image</DialogTitle>
            <div className="border-2 border-dashed rounded-xl p-2 m-2 min-h-[50vh] flex flex-col items-center content-center justify-center">
              <ImagePicker />
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Toaster />
    </main>
  );
}

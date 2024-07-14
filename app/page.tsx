"use client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RotateCcw } from "lucide-react";
import { useRef, useState } from "react";
import { useSession, signIn, signOut } from "next-auth/react";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/components/ui/use-toast";
import { ImagePicker } from "@/components/UploadZone/UploadZone";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { User } from "lucide-react";
export default function Home() {
  const [formattedImage, setFormattedImage] = useState<string>("");
  const [status, setStatus] = useState<string>("normal");
  const input = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  const { data: session, status: signedIn } = useSession();
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

      try {
        const response = await fetch(input.current?.value, {
          method: "GET",

          mode: "cors", // Ensure the request is made with CORS
        });
        if (!response.ok) {
          if (response.status === 429) {
            toast({
              duration: 2000,
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description:
                "You were making too many requests. Try again later.",
            });
            return;
          }
          if (response.status === 404) {
            toast({
              duration: 2000,
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: "Image not found.",
            });
            return;
          }
          if (response.status === 500) {
            toast({
              duration: 2000,
              variant: "destructive",
              title: "Uh oh! Something went wrong.",
              description: "Internal Server Error.",
            });
            return;
          }
          throw new Error(`HTTP error! Status: ${response.status}`);
        }
        const blob = await response.blob();
        const localUrl = URL.createObjectURL(blob as Blob);
        setFormattedImage(input.current?.value);
      } catch (e) {
        if (e instanceof Error) {
          toast({
            duration: 2000,
            variant: "destructive",
            title: "Uh oh! Something went wrong.",
            description: e.message,
          });
          console.error("Error fetching image:", e);
          setStatus("error");
        }
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
        placeholder={`https://${backend}/image.png?quality=100`}
        className={`text-lg md:w-3/4 lg:w-1/2 w-[90vw] m-2 rounded-xl h-10 border-2 ${
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

      {formattedImage !== "" ? (
        <>
          <img crossorigin="anonymous" src={formattedImage} alt="Image" />
          <a href={formattedImage} download className="download-button">
            <Button variant={"secondary"} className="bg-gray-800 text-white">
              Download
            </Button>
          </a>
          <Button
            type="submit"
            variant={"outline"}
            onClick={() => {
              setFormattedImage("");
            }}
            size="icon"
          >
            <RotateCcw />
          </Button>
        </>
      ) : (
        <>
          <Button type="submit" variant={"outline"} onClick={handleSubmit}>
            Submit
          </Button>
          <div className="divider after::bg">OR</div>
        </>
      )}
      <div className="fixed bottom-0 left-0 m-5">
        {session ? (
          <DropdownMenu>
            <DropdownMenuTrigger>
              <Avatar>
                <AvatarImage src={session?.user?.image as string} alt="User" />
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => {
                  signOut();
                }}
              >
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <Button
            size="icon"
            onClick={() => {
              signIn();
            }}
          >
            <User />
          </Button>
        )}
      </div>

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
              <ImagePicker toast={toast} />
            </div>
          </DialogHeader>
        </DialogContent>
      </Dialog>
      <Toaster />
    </main>
  );
}

"use client"

import prisma from "@/lib/client";
import { useUser } from "@clerk/nextjs";
import { auth } from "@clerk/nextjs/server";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image"
import { useState } from "react";
import AddPostButton from "./AddPostButton";
import { format } from "path";
import { addPost } from "@/lib/actions";

const AddPost = () => {

    const { user, isLoaded } = useUser();
    const [desc, setDesc] = useState("")
    const [img, setImg] = useState<any>()

    if (!isLoaded) return "Loading....."


    return (
        <div className="p-4 bg-white shadow-md rounded-lg flex gap-4 justify-between text-sm">
            {/* Avatar */}
            <Image
                src={user?.imageUrl || "/noAvatar.png"}
                alt=""
                width={48}
                height={48}
                className="w-12 h-12 object-cover rounded-full" />

            {/* Post */}
            <div className="flex-1">
                {/* Text Input */}
                <form action={(formData) => addPost(formData, img?.secure_url || "")} className="flex gap-4">
                    <textarea
                        placeholder="What's on your mind?"
                        className="bg-slate-100 rounded-lg flex-1 p-2"
                        name="desc"
                        onChange={(e) => setDesc(e.target.value)}
                    ></textarea>
                    <div className="">
                        <Image
                            src="/emoji.png"
                            alt=""
                            width={20}
                            height={20}
                            className="w-5 h-5 cursor-pointer self-end" />
                        {/* <button type="submit">Send</button> */}
                        <AddPostButton />
                    </div>
                </form>

                {/* Post Options */}
                <div className="flex items-center gap-4 mt-4 text-gray-400 flex-wrap">
                    <CldUploadWidget
                        uploadPreset="social"
                        onSuccess={(result, { widget }) => {
                            setImg(result.info);
                            widget.close();
                        }}
                    >
                        {({ open }) => {
                            return (
                                <div className="flex items-center gap-2 cursor-pointer" onClick={() => open()}>
                                    <Image
                                        src="/addimage.png"
                                        alt=""
                                        width={20}
                                        height={20} />
                                    Photo
                                </div>
                            );
                        }}
                    </CldUploadWidget>


                    <div className="flex items-center gap-2 cursor-pointer">
                        <Image
                            src="/addvideo.png"
                            alt=""
                            width={20}
                            height={20} />
                        Video
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer">
                        <Image
                            src="/poll.png"
                            alt=""
                            width={20}
                            height={20} />
                        Poll
                    </div>
                    <div className="flex items-center gap-2 cursor-pointer">
                        <Image
                            src="/addevent.png"
                            alt=""
                            width={20}
                            height={20} />
                        Event
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AddPost
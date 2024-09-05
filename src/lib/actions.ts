"use server"

import { auth } from "@clerk/nextjs/server"
import prisma from "./client"
import { boolean, z } from "zod"
import { revalidatePath } from "next/cache"



export const switchFollow = async (userId: string) => {
    const { userId: currentUserId } = auth()

    //The currentUserId is your ID, representing the authenticated user who is performing the follow or unfollow action.

    if (!currentUserId) {
        throw new Error("User is not authenticated!!")
    }

    try {
        const existingFollow = await prisma.follower.findFirst({
            where: {
                followerId: currentUserId,

                // the userId parameter in the switchFollow function represents the ID of the user you want to follow or unfollow.
                followingId: userId
            }
        });

        if (existingFollow) {
            await prisma.follower.delete({
                where: {
                    id: existingFollow.id,
                }
            })
        }
        // which means we are not following the user
        else {
            const existingFollowRequest = await prisma.followRequest.findFirst({
                where: {
                    senderId: currentUserId,
                    receiverId: userId
                }
            })

            // if follow request already sent
            if (existingFollowRequest) {
                await prisma.followRequest.delete({
                    where: {
                        id: existingFollowRequest.id,
                    }
                })
            }

            //else if we never sent a follow request before
            else {
                await prisma.followRequest.create({
                    data: {
                        senderId: currentUserId,
                        receiverId: userId
                    }
                })
            }
        }
    } catch (error) {
        console.log(error)
    }
}


export const switchBlock = async (userId: string) => {
    const { userId: currentUserId } = auth()

    if (!currentUserId) {
        throw new Error("User is not authenticated!!")
    }

    try {
        const existingBlock = await prisma.block.findFirst({
            where: {
                blockerId: currentUserId,
                blockedId: userId,
            }
        });

        if (existingBlock) {
            await prisma.block.delete({
                where: {
                    id: existingBlock.id,
                }
            })
        }

        //if no block was created before
        else {
            await prisma.block.create({
                data: {
                    blockerId: currentUserId,
                    blockedId: userId
                }
            })
        }
    } catch (error) {
        console.log(error)
        throw new Error("Something went wrong");

    }
}


// Action for accepting Friend Requests

export const acceptFollowRequests = async (userId: string) => {
    const { userId: currentUserId } = auth();

    if (!currentUserId) {
        throw new Error("User is not authenticated!!")
    }

    try {
        const existingFollowRequest = await prisma.followRequest.findFirst({
            where: {
                senderId: userId,
                receiverId: currentUserId,
            }
        });

        if (existingFollowRequest) {
            await prisma.followRequest.delete({
                where: {
                    id: existingFollowRequest.id,
                }
            })
        };

        await prisma.follower.create({
            data: {
                followerId: userId,
                followingId: currentUserId,
            }
        })
    }

    catch (err) {
        console.log(err)
        throw new Error("Something went wrong");
    }
}

// Action for Declining Friend Requests
export const declineFollowRequests = async (userId: string) => {
    const { userId: currentUserId } = auth();

    if (!currentUserId) {
        throw new Error("User is not authenticated!!")
    }

    try {
        const existingFollowRequest = await prisma.followRequest.findFirst({
            where: {
                senderId: userId,
                receiverId: currentUserId,
            }
        });

        if (existingFollowRequest) {
            await prisma.followRequest.delete({
                where: {
                    id: existingFollowRequest.id,
                }
            })
        };
    }

    catch (err) {
        console.log(err)
        throw new Error("Something went wrong");
    }
}


// Server actions to send input to update user profile
export const updateProfile = async (
    prevState: { success: boolean; error: boolean },
    payload: { formData: FormData, cover: string }
) => {

    const { formData, cover } = payload

    const fields = Object.fromEntries(formData)

    // if you have an emprty string in one field we are not gonna teke them
    const filteredFields = Object.fromEntries(
        Object.entries(fields).filter(([key, value]) => value !== "")
    )

    console.log(fields)

    const Profile = z.object({
        cover: z.string().optional(),
        name: z.string().max(60).optional(),
        surname: z.string().max(60).optional(),
        description: z.string().max(255).optional(),
        city: z.string().max(60).optional(),
        school: z.string().max(60).optional(),
        work: z.string().max(60).optional(),
        website: z.string().max(60).optional(),
    })

    const validatedFields = Profile.safeParse({ cover, ...filteredFields })

    if (!validatedFields.success) {
        console.log(validatedFields.error.flatten().fieldErrors)
        return { success: false, error: true }
    }

    const { userId } = auth();

    if (!userId) {
        return { success: false, error: true }
    }

    try {
        await prisma.user.update({
            where: {
                id: userId
            },
            data: validatedFields.data
        })

        //if all good
        return { success: true, error: false }

    } catch (error) {
        console.log(error)
        return { success: false, error: true }
    }

}

// Like Action

export const switchLike = async (postId: number) => {
    const { userId } = auth()

    if (!userId) throw new Error("User is not authenticated")

    try {
        // if we liked already we are removing it or we add it
        const existingLike = await prisma.like.findFirst({
            where: {
                postId,
                userId
            }
        })

        if (existingLike) {
            await prisma.like.delete({
                where: {
                    id: existingLike.id
                }
            })
        }

        //if doesnt exist
        else {
            await prisma.like.create({
                data: {
                    postId,
                    userId
                }
            })
        }
    } catch (error) {
        console.log(error)
        throw new Error("Something went wrong")
    }
}


// action for adding comment

export const addComment = async (postId: number, desc: string)=>{
    const {userId} = auth()

    if(!userId)
        throw new Error("User is not authenticated")

    try {
        const createdComment = await prisma.comment.create({
            data:{
                desc,
                userId,
                postId
            },
            include:{
                user: true
            },
        })

        return createdComment

    } catch (error) {
        console.log(error)
        throw new Error("Something went wrong")
    }
}



// action for adding post

export const addPost = async (formData: FormData, img: string) => {
    const desc = formData.get("desc") as string;
    
    const Desc = z.string().min(1).max(255)
    
    const validatedDesc = Desc.safeParse(desc)
    
    if(!validatedDesc.success){
        console.log("description is not valid!")
        return;

    }
    
    const {userId} = auth()
    if(!userId){
        throw new Error("User is not authenticated")
    }


    try {
        await prisma.post.create({
            data:{
                desc: validatedDesc.data,
                userId,
                img
            }
        })

        revalidatePath("/")
    } catch (error) {
        console.log(error)
    }
}


// action for adding story

export const addStory = async (img: string) => {
    
    const {userId} = auth()
    if(!userId){
        throw new Error("User is not authenticated")
    }


    try {
        const existingStory = await prisma.story.findFirst({
            where: {
                userId
            }
        })

        if(existingStory){
            await prisma.story.delete({
                where: {
                    id: existingStory.id
                }
            })
        }

        const createdStory = await prisma.story.create({
            data:{
                userId,
                img,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000),
            },
            include:{
                user: true 
            }
        })

        return createdStory;

        revalidatePath("/")
    } catch (error) {
        console.log(error)
    }
}


// delete post
export const deletePost = async (postId: number) => {
    const {userId} = auth()
    if(!userId){
        throw new Error("User is not authenticated")
    }

    try {
        await prisma.post.delete({
            where:{
                id: postId,
                userId
            }
        })
        revalidatePath("/");
    } catch (error) {
        console.log(error)
    }
}
import prisma from "@/lib/client"
import { auth } from "@clerk/nextjs/server"
import Image from "next/image"
import Link from "next/link"
import FriendRequestList from "./FriendRequestList"

const FriendRequests = async () => {

    const {userId} = auth()

    if(!userId) return null


    // as we are fetching something so we make it server component and create a new component "FriendRequestList" so that we can use hook and make it client component
    const requests = await prisma.followRequest.findMany({
        where:{
            receiverId: userId
        },
        include:{
            sender: true,
        },
    });

    if(requests.length === 0) return null

    return (
        <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
            {/* Top */}
            <div className="flex justify-between items-center font-medium">
                <span className="text-gray-500">Friend Requests</span>
                <Link href="/" className="text-blue-500 text-xs">See All</Link>
            </div>

            {/* User */}
            <FriendRequestList requests={requests} />
        </div>
    )
}

export default FriendRequests
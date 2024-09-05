"use client"

import { acceptFollowRequests, declineFollowRequests } from "@/lib/actions"
import { FollowRequest, User } from "@prisma/client"
import Image from "next/image"
import { useOptimistic, useState } from "react"

type RequestWithUser = FollowRequest & {
    sender: User
}

const FriendRequestList = ({ requests }: { requests: RequestWithUser[] }) => {

    //creating new state
    const [requestState, setRequestState] = useState(requests);

    //function for accepting
    const accept = async (requestId: number, userId: string) => {
        removeOptimisticRequests(requestId)
        try {
            await acceptFollowRequests(userId);
            setRequestState(prev => prev.filter((req) => req.id !== requestId))
        } catch (error) {

        }
    }

    //function fo declining
    const decline = async (requestId: number, userId: string) => {
        removeOptimisticRequests(requestId)
        try {
            await declineFollowRequests(userId);
            setRequestState(prev => prev.filter((req) => req.id !== requestId))
        } catch (error) {

        }
    }


    //optimistic hook
    const [optimisticRequests, removeOptimisticRequests] = useOptimistic(requestState,
        (state, value: number) => state.filter(req => req.id !== value))

    return (
        <div className="">
            {optimisticRequests.map((request) => (
                <div className="flex items-center justify-between" key={request.id}>
                    <div className="flex items-center gap-4">
                        <Image
                            src={request.sender.avatar || "/noAvatar.png"}
                            alt=""
                            width={40}
                            height={40}
                            className="w-10 h-10 rounded-full object-cover" />
                        <span className="font-semibold">{(request.sender.name && request.sender.surname) ? request.sender.name + " " + request.sender.surname : request.sender.username}</span>
                    </div>

                    <div className="flex gap-3 justify-end">
                        <form action={() => accept(request.id, request.sender.id)}>
                            <button>acc
                                <Image
                                    src="/accept.png"
                                    alt=""
                                    width={20}
                                    height={20}
                                    className="cursor-pointer" />
                            </button>
                        </form>

                        <form action={() => decline(request.id, request.sender.id)}>
                            <button> dec
                                <Image
                                    src="/reject.png"
                                    alt=""
                                    width={20}
                                    height={20}
                                    className="cursor-pointer" />
                            </button>
                        </form>

                    </div>
                </div>
            ))}
        </div>
    )
}

export default FriendRequestList
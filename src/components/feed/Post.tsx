import Image from "next/image"
import Comments from "./Comments"
import { Post as PostType, User } from "@prisma/client"
import PostInteraction from "./PostInteraction"
import { Suspense } from "react"
import PostInfo from "./PostInfo"
import { auth } from "@clerk/nextjs/server"

// type for post
type FeedPostType = PostType & { user: User } & { likes: [{ userId: string }] } & { _count: { comments: number } }


const Post = ({ post }: { post: FeedPostType }) => {
    const {userId} = auth();
    return (
        <div className="flex flex-col gap-4 rounded-md bg-gray-100 p-5">
            {/* User */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Image
                        src={post.user.avatar || "/noAvatar.png"}
                        alt=""
                        className="w-10 h-10 rounded-full"
                        width={40}
                        height={40} />
                    <span className="font-medium">
                        {(post.user.name && post.user.surname) ? post.user.name + " " + post.user.surname : post.user.username}
                    </span>
                </div>
                {userId === post.user.id 
                && <PostInfo postId={post.id}/>}
            </div>

            {/* Desc */}
            <div className="flex flex-col gap-4">
                {post.img && <div className="w-full min-h-96 relative">
                    <Image
                        src={post.img}
                        alt=""
                        fill
                        className="object-cover rounded-md" />
                </div>}
                <p>{post.desc}</p>
            </div>

            {/* Interaction */}
            {/* we have to create different components because it updates such as likes etc. */}
            <Suspense fallback="Loading...">
                <PostInteraction postId={post.id} likes={post.likes.map((like) => like.userId)} commentNumber={post._count.comments} />
            </Suspense>

            <Suspense fallback="Loading...">
                {/* Comments */}
                <Comments postId={post.id} />
            </Suspense>

        </div>
    )
}

export default Post
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

// by adding "/" we made it follow the case when user is logged out it cant see any post and goes to signup/login page
const isProtectedRoute = createRouteMatcher(["/settings(.*)", "/"])

export default clerkMiddleware((auth, req) => {
  // check the authentication if not authenticated 
  if (isProtectedRoute(req)) auth().protect();
});

export const config = {
  matcher: ["/((?!.*\\..*|_next).*)", "/", "/(api|trpc)(.*)"],
};
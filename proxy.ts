/**
 * Clerk proxy middleware that protects  the app 
 * anything under dashboard our default route shodul first pass the middleware to check if we logged in or not
 */
import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/dashboard",
  "/dashboard/:path*",
])


export default clerkMiddleware(async (auth, req) => {
  if (isProtectedRoute(req)) await auth.protect()
})

export const config = {

  
  //skill all the statis files like image and css fot the middleware
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|jpg|jpeg|png|woff|woff2|ico|csv|docx|xlsx|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

// Clerk proxy middleware that makes the signed-in user available to pages and API routes.
// Each protected page, layout and API route checks auth itself, as Clerk recommends,
// instead of matching paths here.
import { clerkMiddleware } from "@clerk/nextjs/server";

export default clerkMiddleware()

export const config = {
  //skill all the statis files like image and css fot the middleware
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html|css|js|gif|svg|jpg|jpeg|png|woff|woff2|ico|csv|docx|xlsx|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};

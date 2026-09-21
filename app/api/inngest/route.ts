/**
 * Inngest route handler that exposes scheduled background functions to Next.js.
 */
import { serve } from "inngest/next";
import { inngest } from "../../../inngest/client";

export const { GET, POST, PUT } = serve({
    client: inngest,
    //add injest fucntions here
    functions: [],
});

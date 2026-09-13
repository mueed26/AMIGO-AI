/**
 * API route that upserts the Clerk user into the local database and returns profile credits.
 */
import { db, users } from "@/db";
import { currentUser } from "@clerk/nextjs/server";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {

    const user = await currentUser();

    //check if user exits
    const userResult = await db.select().from(users)
        .where(eq(users.email, user?.primaryEmailAddress?.emailAddress ?? ''))

    //i cannt find then create one !
    if (userResult.length == 0) {
        const result = await db.insert(users).values({
            name: user?.fullName,
            email: user?.primaryEmailAddress?.emailAddress ?? '',
        }).returning();

        return NextResponse.json(result);
    }
// if alrady exist then return the list 
    return NextResponse.json(userResult[0]);

}

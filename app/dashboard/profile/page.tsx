"use client"

// Account page with the signed-in user's details.

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserDetailContext } from "@/context/UserDetailContext"
import { useUser } from "@clerk/nextjs"
import { CalendarDays, Mail, ShieldCheck, User2 } from "lucide-react"
import moment from "moment"
import React, { useContext } from "react"

function ProfilePage() {
    const { user } = useUser()
    const { userDetail } = useContext(UserDetailContext)
    const currentUser = Array.isArray(userDetail) ? userDetail[0] : userDetail
    const displayName = currentUser?.name || user?.fullName || "Amigo user"
    const email = currentUser?.email || user?.primaryEmailAddress?.emailAddress || "No email found"
    const initials = displayName
        .split(" ")
        .map((part: string) => part[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()

    return (
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
            <p className="label-mono">account</p>
            <h1 className="mt-2 font-heading text-4xl font-semibold tracking-tight">Who's running the show</h1>
            <p className="mt-2 text-sm text-muted-foreground">Your login details. Name, photo and password live in your Clerk account.</p>

            <section className="mt-8 overflow-hidden rounded-lg border bg-card">
                <div className="flex items-center gap-4 border-b p-5">
                    <Avatar className="size-14 border">
                        <AvatarImage src={user?.imageUrl} alt={displayName} />
                        <AvatarFallback>{initials}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                        <h2 className="truncate font-heading text-xl font-semibold">{displayName}</h2>
                        <p className="truncate font-mono text-xs text-muted-foreground">{email}</p>
                    </div>
                </div>
                <dl className="divide-y">
                    <ProfileInfo icon={<User2 className="size-4" />} label="Name" value={displayName} />
                    <ProfileInfo icon={<Mail className="size-4" />} label="Email" value={email} />
                    <ProfileInfo icon={<CalendarDays className="size-4" />} label="Member since" value={currentUser?.createdAt ? moment(currentUser.createdAt).format("MMM D, YYYY") : "Recently"} />
                    <ProfileInfo icon={<ShieldCheck className="size-4" />} label="Sign-in" value="Handled by Clerk" />
                </dl>
            </section>
        </div>
    )
}

function ProfileInfo({ icon, label, value }: { icon: React.ReactNode, label: string, value: string }) {
    return (
        <div className="flex items-center justify-between gap-4 px-5 py-4">
            <dt className="label-mono flex items-center gap-2">
                {icon}
                {label}
            </dt>
            <dd className="truncate text-sm">{value}</dd>
        </div>
    )
}

export default ProfilePage

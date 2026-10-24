// Shared layout for the sign-in and sign-up pages: brand panel on the left, Clerk form on the right.
import Image from 'next/image'
import Link from 'next/link'
import React from 'react'

function AuthShell({ title, subtitle, children }: { title: string, subtitle: string, children: React.ReactNode }) {
    return (
        <main className='grid min-h-screen bg-background lg:grid-cols-2'>
            <section className='relative hidden overflow-hidden border-r lg:flex lg:flex-col lg:justify-between lg:p-10'>
                <div className='bg-dots absolute inset-0' />
                <Image src='/hero-glow.svg' alt='' fill className='pointer-events-none object-cover' />
                <Link href='/' className='relative flex items-center gap-2.5'>
                    <Image src='/logo.svg' alt='AMIGO AI logo' width={30} height={30} />
                    <span className='font-heading text-xl font-semibold tracking-tight'>amigo</span>
                </Link>
                <div className='relative'>
                    <p className='label-mono'>{subtitle}</p>
                    <h1 className='mt-3 max-w-md font-heading text-4xl font-semibold leading-tight tracking-tight'>{title}</h1>
                </div>
                <p className='label-mono relative'>agents on the night shift</p>
            </section>

            <section className='flex items-center justify-center p-6'>
                {children}
            </section>
        </main>
    )
}

export default AuthShell

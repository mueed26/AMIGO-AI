"use client"

/**
 * Client provider layer for theme, sidebar state, user data, and toast rendering.
 */

//state manangemnet hook context to save 

import { useUser } from '@clerk/nextjs';
import axios from 'axios';
import React, { useEffect, useState } from 'react'
import { UserDetailContext } from './context/UserDetailContext';

function Provider({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {


    const { isLoaded, isSignedIn } = useUser();
    const [userDetail, setUserDetail] = useState();

    //create a use effect in client side so whwever the component mounts we verify if the use is saved in database or not after sign in once we start the app!
    useEffect(() => {
        if (isLoaded && isSignedIn) {
            createNewUser();
        }
    }, [isLoaded, isSignedIn])

    //just call the api once for all the details and then share across app using useDETAILCONETXT
    const createNewUser = async () => {
        const result = await axios.post('/api/users');
        console.log(result);
        setUserDetail(result.data);
    }

    return (
        //shares the logged in user to all resct components
        <div>
            <UserDetailContext.Provider value={{ userDetail, setUserDetail }}>
                {children}
            </UserDetailContext.Provider>
        </div>
    )
}

export default Provider

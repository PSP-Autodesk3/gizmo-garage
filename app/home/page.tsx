"use client";

// For Firebase Login Auth
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

//for redirect
import {redirect} from 'next/navigation'; // https://nextjs.org/docs/app/building-your-application/routing/redirecting - Jacob

import { useEffect } from 'react';
import Filters from './filters';

export default function homepage() {
  const [user, loading] = useAuthState(auth);

    //redirects if unauthenticated after the page has loaded
    useEffect(() => {
        if (!user && !loading) {
            redirect('/login');
        }
    }, [user, loading]);

    //loading
    if (loading) {
        return (
        <>
          <div>loading</div>
        </>
        )
    }
    
    //loaded
    return (
        <>
        <div className='flex flex-row'>
            <Filters/>
            <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-16 flex flex-row justify-between">
                <div>
                <p>Name: </p>
                <p>Version: </p>
                <p>Date: </p>
                </div>
                <div className='content-center'>
                <button className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">View</button>
                </div>
            </div>
        </div>
        </>
    )

}
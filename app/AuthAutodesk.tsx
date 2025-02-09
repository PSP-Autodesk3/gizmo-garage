import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function AuthAutodesk() {
    const [user, loading] = useAuthState(auth);
    const [codeChallenge, setCodeChallenge] = useState();
    const clientID = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID;
    

    const handleSignOut = async (e: any) => {
        sessionStorage.setItem('token', '');
        signOut(auth);
      }

    if (loading) {
        return (
            <>
            <SkeletonTheme baseColor='#0f172a' highlightColor='#1e293b' enableAnimation duration={0.5} borderRadius={8}>
                <div className='h-screen content-center'>
                    <div className="flex justify-center content-center">
                        <div className="flex flex-col content-center text-white p-6 rounded-lg  h-[40%] max-w-[40%]">
                            <Skeleton height={250} width={250}/>
                        </div>
                    </div>
                </div>
            </SkeletonTheme>
            </> 
        )
    }

    return (
        <>
          <div className='h-screen content-center'>
                <div className="flex justify-center content-center">
                     <div className="flex flex-col content-center text-white p-6 rounded-lg bg-slate-800 h-[40%] max-w-[40%]">
                        <h1 className="text-3xl text-center p-2 font-semibold">Authenticate to continue</h1>
                        <Link href={`https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${clientID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&nonce=1232132&scope=data:read&prompt=login&state=12321321&code_challenge=${codeChallenge}&code_challenge_method=S256`} className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 text-center mt-2 self-center">Login through AutoDesk</Link>
                        <button onClick={() => handleSignOut(auth)} className="px-6 self-center py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 mt-2">Sign Out</button>
                    </div>
                </div>
            </div>
        </>
    )
}
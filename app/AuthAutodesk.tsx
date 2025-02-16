import Link from 'next/link';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';
import { signOut } from 'firebase/auth';
import { useEffect, useState } from 'react';
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useRouter } from 'next/navigation';

export default function AuthAutodesk() {
    const [user, loading] = useAuthState(auth);
    const [codeChallenge, setCodeChallenge] = useState();
    const [loginErrorMessage, setLoginErrorMessage] = useState('');
    const clientID = process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID;
    const router = useRouter();
    

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
            <div className="float-right my-2 mx-4 space-x-4">
        <button
          onClick={() => router.push(`https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&scope=${encodeURIComponent("data:read bucket:create bucket:read")}`)}
          className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
        >
          Authenticate with AutoDesk
        </button>
        {loginErrorMessage && (
          <div id="error-message">
            <p>{loginErrorMessage}</p>
            <p>Open the console to view more details</p>
          </div>
        )}
        <Link href="/signout" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
          Sign Out
        </Link>
      </div>
        </>
    )
}
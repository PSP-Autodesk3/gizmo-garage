import Link from 'next/link';

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';

export default function SigningIn() {

    const [user, loading] = useAuthState(auth);

    if (loading) {
        return (
            <>
            <SkeletonTheme  baseColor='#0f172a' highlightColor='#1e293b' enableAnimation duration={0.5} borderRadius={8} >
                <div className=" p-4 w-[30%] m-auto rounded-lg shadow-lg mt-16">
                    <div className="flex flex-col items-center space-y-6">
                       <Skeleton height={150} width={300}/>
                    </div>
                </div>
            </SkeletonTheme>
            </>
        )
    }

    if (!user) {
        return (
            <>
              <div className="bg-slate-900 p-4 w-[30%] m-auto rounded-lg shadow-lg mt-16">
                  <div className="flex flex-col items-center space-y-6">
                      <h1 className="text-4xl text-center font-semibold">
                          Gizmo Garage
                      </h1>
                      <Link href="/login" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
                          Sign in to your account
                      </Link>
                  </div>
              </div>
            </>
          )
    }
}
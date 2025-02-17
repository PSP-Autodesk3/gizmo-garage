import Link from 'next/link';

import 'react-loading-skeleton/dist/skeleton.css'
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '@/app/firebase/config';

export default function SigningIn() {

  const [user, loading] = useAuthState(auth);

  if (!user) {
    return (
      <>
        <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-16">
          <div className="flex flex-col items-center space-y-6">
            <h1 className="text-4xl text-center font-semibold">
              Gizmo Garage
            </h1>
            <Link href="/login" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
              Sign in to your account
            </Link>
            <Link href="/register" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
              Create an account
            </Link>
          </div>
        </div>
      </>
    )
  }
}
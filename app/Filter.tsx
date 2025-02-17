import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebase/config';
import Image from "next/image"

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import { useAuthState } from 'react-firebase-hooks/auth';

interface FiltersProps {
  onQueryChange: React.Dispatch<React.SetStateAction<string>>;
}

export default function Filters({ onQueryChange }: FiltersProps) {
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const admin = useState(true);

  if (loading) {
    return (
      <>
        <SkeletonTheme baseColor='#0f172a' highlightColor='#1e293b' enableAnimation duration={0.5}>
          <div>
            <div id="side-bar" className='bg-slate-900 p-6 rounded-lg shadow-lg h-screen'>
              <div className='flex flex-row justify-center pb-4' >
                <Skeleton height={75} width={280} />
              </div>
              <div className='pb-4'>
                <Skeleton height={120} />
              </div>
              <div id="filters">
                <div className='pb-4'>
                  <Skeleton height={100} />
                </div>
                <div className='pb-4'>
                  <Skeleton height={100} />
                </div>

                <div className='pb-4'>
                  <Skeleton height={50} />
                </div>

                <div className='pb-4'>
                  <Skeleton height={150} />
                </div>
              </div>
            </div>

          </div>
        </SkeletonTheme>
      </>
    )
  }

  return (

    <>
      <div id="side-bar" className='bg-slate-900 p-6 rounded-lg shadow-lg h-screen flex flex-col justify-between'>

        <div>
          <div className='flex flex-row justify-between pb-4' >
            <Image
              src="Gizmo.svg"
              alt="Sample Image"
              width={75}
              height={75}
            />
            <div className='flex text-3xl items-center'>Gizmo Garage</div>
          </div>

          <div id="search" className='p-4'>
            <label htmlFor="search=bar">Search</label>
            <input
              className='text-white w-full p-2 my-2 rounded-lg bg-slate-800'
              type="text"
              placeholder="Search"
              name="search"
              onChange={(e) => onQueryChange(e.target.value)}
            />
          </div>
        </div>

        <div className='flex flex-col justify-between'>
          <div id="options" className='flex flex-col p-6 mt-auto'>
            {admin ? (
              <>
                <button className='p-1 text-white transition-colors duration-300 hover:text-gray-400' onClick={() => router.push("/admin-settings")}>Admin Settings</button>
              </>
            ) : (
              <></>
            )}
            <button className='p-1 text-white transition-colors duration-300 hover:text-gray-400' onClick={() => router.push("/account-settings")}>Account Settings</button>
            <button className='p-1 text-white transition-colors duration-300 hover:text-gray-400' onClick={() => router.push('/signout')}>Sign Out</button>
          </div>
        </div>


      </div>
    </>
  )
}

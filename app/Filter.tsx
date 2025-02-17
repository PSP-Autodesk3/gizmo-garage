import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { auth } from '@/app/firebase/config'; 
import Image from "next/image"

import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

import { useAuthState } from 'react-firebase-hooks/auth';

interface NavItemProps {
  name: string,
  link: string
}

function NavItems({name, link}:NavItemProps) {
  const router = useRouter();
  return (
    <button className='p-1 text-white transition-colors duration-300 hover:text-gray-400' onClick={() => router.push(link)}>{name}</button>
  )
}

export default function Filters({ navItems }: { navItems: NavItemProps[] }) {
  const [query, updateQuery] = useState('');
  const [user, loading] = useAuthState(auth);
  const router = useRouter();
  const admin = useState(true);

  return (
    <>
      <div id="side-bar" className='bg-slate-900 p-6 rounded-lg shadow-lg h-screen flex flex-col justify-between'>
        <div>
          <div className='flex flex-row justify-between pb-4'>
            <Image
              src="Gizmo.svg"
              alt="Sample Image"
              width={75}
              height={75}
            />
            <div className='flex text-3xl items-center'>Gizmo Garage</div>
          </div>

          <div id="search" className='p-4'>
            <label htmlFor="search-bar">Search</label>
            <input
              className='text-white w-full p-2 my-2 rounded-lg bg-slate-800'
              type="text"
              placeholder="Search"
              name="search"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
            />
          </div>
        </div>

        <div className='flex flex-col justify-between'>
          <div id="options" className='flex flex-col p-6 mt-auto'>
            {navItems.map((item, index) => (
              <NavItems key={index} name={item.name} link={item.link} />
            ))}
            {admin ? (
              <button className='p-1 text-white transition-colors duration-300 hover:text-gray-400' onClick={() => router.push("/admin-settings")}>Admin Settings</button>
            ) : null}
          </div>
        </div>
      </div>
    </>
  )
}

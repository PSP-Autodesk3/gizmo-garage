import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image"
import Link from 'next/link';

// Firebase
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

interface FiltersProps {
  query?: string;
  onQueryChange?: React.Dispatch<React.SetStateAction<string>>;
  onValuesChange?: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function Filters({ query, onQueryChange }: FiltersProps) {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [user] = useAuthState(auth);

  useEffect(() => {
    if (user) {
      const checkAdmin = async () => {
        try {
          const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/users/checkAdmin`, {
            method: "POST",
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              email: user.email
            })
          });
          
          const data = await response.json();
          setIsAdmin(data.isAdmin);
        } catch (error) {
          console.error('Error checking admin:', error);
          setIsAdmin(false);
        }
      };
      checkAdmin();
    }
  }, [user]);

  return (
    <>
      <div id="side-bar" className='bg-indigo-200/50 dark:bg-slate-800/50 border border-slate-700/50 text-slate-900 dark:text-slate-200 f p-6 h-screen flex flex-col justify-between max-w-fit'>
        <div>
          <Link href="/">
            <div className='flex flex-row justify-between pb-4' >
              <Image
                src="/Gizmo.svg"
                alt="Sample Image"
                width={75}
                height={75}
              />
              <div className='flex text-3xl font-semibold items-center pr-6'>Gizmo Garage</div>
            </div>
          </Link>
          {onQueryChange && (
            <div id="search" className='pt-4 '>
              <label htmlFor="search=bar">Search Projects</label>
              <input
                className='w-full p-2 my-2 rounded-lg bg-indigo-100 border border-slate-700/50 text-gray-800 
                  dark:bg-slate-800 dark:border-slate-700 dark:text-white'
                type="text"
                placeholder="Search"
                name="search"
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
              />
            </div>
          )}
        </div>
        <div className='flex flex-col justify-between'>
          <div id="options" className='flex flex-col p-6 mt-auto text-slate-900 dark:text-slate-200'>
            <button
              className='p-1 transition-colors duration-300 hover:text-indigo-800 dark:hover:text-indigo-400 hover:font-semibold'
              onClick={() => router.push("/notifications")}
            >
              Notifications
            </button>
            {isAdmin && (
              <>
                <button
                  className='p-1 transition-colors duration-300 hover:text-indigo-800 dark:hover:text-indigo-400 hover:font-semibold'
                  onClick={() => router.push("/admin-settings")}
                >
                  Admin Settings
                </button>
              </>
            )}
            <button
              className='p-1 transition-colors duration-300 hover:text-indigo-800 dark:hover:text-indigo-400 hover:font-semibold'
              onClick={() => router.push("/account-settings")}
            >
              Account Settings
            </button>
            <button
              className='p-1 transition-colors duration-300 hover:text-indigo-800 dark:hover:text-indigo-400 hover:font-semibold'
              onClick={() => router.push('/signout')}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

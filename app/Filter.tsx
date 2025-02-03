import { Range } from 'react-range';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { auth } from '@/app/firebase/config'; 



export default function Filters() {
    const [values, setValues] = useState([20, 80]);
    const [tagQuery, updateTagQuery] = useState('');
    const [query, updateQuery] = useState('');
    const router = useRouter();
    const admin = useState(true);

      // Displays if all information is valid
       const handleSignOut = async (e: any) => {
          sessionStorage.setItem('token', '');
          signOut(auth);
        }
      
        const handleAccountSettings = async (e: any) => {
          console.log("Pushed");
          router.push("/account-settings");
          console.log("Pushed");
        }
  return (
    
    <>
    <div>
    <div id="side-bar" className='bg-slate-900 p-6 rounded-lg shadow-lg h-screen'>
      <div className='flex flex-row justify-between' >
      { /* svg here */ }
      <p className='flex justify-end text-3xl mb-10 items-center'>Gizmo Garage</p>
      </div>
        <div id="filters">
          <div id="file-size-filter" className='m-10 self-center flex flex-row justify-center'>
            {/* https://www.geeksforgeeks.org/how-to-add-slider-in-next-js/ - Rob*/}
            
            <Range
              step={0.1}
              min={0}
              max={100}
              values={values}
              onChange={(newValues) => setValues(newValues)}
              renderTrack={({ props, children }) => (
                <div
                  {...props}
                  style={{
                      ...props.style,
                      height: '6px',
                      width: '100%',
                  }}
                  className='bg-indigo-200'
                >
                  {children}
                </div>
              )}
              renderThumb={({ props }) => (
                <div
                  {...props}
                  style={{
                    ...props.style,
                    height: '22px',
                    width: '22px',
                  }}
                  className="rounded-full bg-indigo-300 border-indigo-500 border-[4px] hover:shadow-md shadow-indigo-600"
                />
              )}
              onFinalChange={() => console.log(values)}
            />

          </div>
          <div id="tags" className='p-4'>
            <label htmlFor="tag-search">Tags</label>
            <input
              className='text-white w-full p-2 my-2 rounded-lg bg-slate-800'
              type="text"
              placeholder="Search"
              name="tag-search"
              value={tagQuery}
              onChange={(e) => updateTagQuery(e.target.value)}
            />
            <div id="applied-tags" className='p-4'>

            </div>
          </div>
          <div id="search" className='p-4'>
            <label htmlFor="search=bar">Search</label>
            <input
            className='text-white w-full p-2 my-2 rounded-lg bg-slate-800'
              type="text"
              placeholder="Search"
              name="search"
              value={query}
              onChange={(e) => updateQuery(e.target.value)}
            />
          </div>
          <div className="flex justify-center">
                      <button className='px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50 flex justify-center'>Submit</button>
          </div>
        </div>
        <div id="options" className='flex flex-col p-6'>
          {admin ? (
            <>
              <button  className='p-1 text-white transition-colors duration-300 hover:text-gray-400' onClick={() => router.push("/users")}>Admin Settings</button>
            </>
          ) : (
            <></>
          )}
          <button className='p-1 text-white transition-colors duration-300 hover:text-gray-400' onClick={() => handleAccountSettings(auth)}>Account Settings</button>
          <button  className='p-1 text-white transition-colors duration-300 hover:text-gray-400' onClick={() => handleSignOut(auth)}>Sign Out</button>
        </div>
      </div>
      
      </div>
     
    </>
  )
 }

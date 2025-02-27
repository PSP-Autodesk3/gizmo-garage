import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from "next/image"
import { Range } from 'react-range';

interface FiltersProps {
  query?: string;
  onQueryChange?: React.Dispatch<React.SetStateAction<string>>;
  values?: number[];
  onValuesChange?: React.Dispatch<React.SetStateAction<number[]>>;
}

export default function Filters({ query, onQueryChange, values, onValuesChange }: FiltersProps) {
  const router = useRouter();
  const admin = useState(true);

  const handleRangeValues = async () => {
    if (values) {
      const lower = document.getElementById("lower");
      const higher = document.getElementById("Higher");

      if (lower && higher) {
        lower.innerHTML = values[0].toFixed(1);
        higher.innerHTML = values[1].toFixed(1);
      }
    }
  }
  return (
    <>
      <div id="side-bar" className='bg-slate-900 p-6 rounded-lg shadow-lg h-screen flex flex-col justify-between'>
        <div>
          <div className='flex flex-row justify-between pb-4' >
            <Image
              src="/Gizmo.svg"
              alt="Sample Image"
              width={75}
              height={75}
            />
            <div className='flex text-3xl items-center'>Gizmo Garage</div>
          </div>
          {values && onValuesChange && (
            <div id='Filters'>
              <div className='flex flex-row justify-between pl-5 pr-5 text-xl'>
                <p id="lower">{values[0]}</p>
                <p id="higher">{values[1]}</p>
              </div>

              <div id="file-size-filter" className='m-10 self-center flex flex-row justify-center'>
                {/* https://www.geeksforgeeks.org/how-to-add-slider-in-next-js/ - Rob*/}
                <Range
                  step={0.1}
                  min={0}
                  max={100}
                  values={values}
                  onChange={(newValues) => onValuesChange(newValues)}
                  renderTrack={({ props, children }) => (
                    <div
                      {...props}
                      style={{
                        ...props.style,
                        height: '6px',
                        width: '100%',
                      }}
                      className='bg-slate-800'
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
                      className="rounded-full bg-indigo-500 border-indigo-500 border-[4px] "
                    />
                  )}
                  onFinalChange={() => handleRangeValues()}
                />
              </div>
            </div>
          )}
          {onQueryChange && (
            <div id="search" className='p-4'>
              <label htmlFor="search=bar">Search</label>
              <input
                className='text-white w-full p-2 my-2 rounded-lg bg-slate-800'
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
          <div id="options" className='flex flex-col p-6 mt-auto'>
            <button
              className='p-1 text-white transition-colors duration-300 hover:text-gray-400'
              onClick={() => router.push("/notifications")}
            >
              Notifications
            </button>
            {admin && (
              <>
                <button
                  className='p-1 text-white transition-colors duration-300 hover:text-gray-400'
                  onClick={() => router.push("/admin-settings")}
                >
                  Admin Settings
                </button>
              </>
            )}
            <button
              className='p-1 text-white transition-colors duration-300 hover:text-gray-400'
              onClick={() => router.push("/account-settings")}
            >
              Account Settings
            </button>
            <button
              className='p-1 text-white transition-colors duration-300 hover:text-gray-400'
              onClick={() => router.push('/signout')}
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

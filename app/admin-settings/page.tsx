"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";
import Filter from '../Filter';

// Other
import { useState, useEffect } from 'react'
import Link from 'next/link';

function Home() {
  const [databaseExists, setDatabaseExists] = useState(2);
  const [confirmModule, setConfirmModule] = useState(false);

  useEffect(() => {
    if (databaseExists === 2) {
      const getDatabaseExists = async () => {
        const response = await fetch("/api/getDatabaseExists");
        const exists = await response.json();
        if (exists[0].DatabaseExists != null) {
          setDatabaseExists(exists[0].DatabaseExists);
        }
      }
      getDatabaseExists();
    }
  }, [databaseExists])


  const setupDatabase = async () => {
    console.log("Exists:", databaseExists);
    switch (databaseExists) {
      case 0:
        confirmSetupDatabase();
        break;
      case 1:
        setConfirmModule(true);
        break;
    }
  }

  const confirmSetupDatabase = async () => {
    const response = await fetch("/api/createDatabase", {
      method: "POST"
    });
    setConfirmModule(false);
    if (response.ok) {
      // Display message
      const popupAlert = document.querySelector('.popup')
      popupAlert?.classList.add('show');
      popupAlert?.classList.remove('hidden');
      setTimeout(() => {
          popupAlert?.classList.remove('show');
          popupAlert?.classList.add('hidden');
      }, 3000); // Hide after 3 seconds
    }
  }

  return (
    <>
    
    <div className="flex m-auto">
  {/* Sidebar */}
  <div id="side-bar">
    <div id="filters">
      <Filter />
    </div>
  </div>

  {/* Main Content Centered */}
  <div className="flex flex-1 justify-center items-center min-h-screen">
    <div className="flex flex-col space-y-4 items-center">
      <Link
        className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
        href="/signout"
      >
        Sign Out
      </Link>

      {databaseExists == 1 ? (
        <button
          className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
          onClick={() => setupDatabase()}
        >
          Reset Database Content
        </button>
      ) : (
        <button
          className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
          onClick={() => setupDatabase()}
        >
          Initialise Database
        </button>
      )}
    </div>
  </div>
</div>

      <div id="search"> </div>
      <div id="users"> </div>
      
      
      {(confirmModule) && (
        <>
        {/* Still needs styling, this is just a rough representation of what I was looking to do */}
          <div className="fixed inset-0 flex items-center justify-center bg-opacity-50 bg-slate-900 p-4 w-[40%] h-[40%] m-auto rounded-3xl shadow-lg mt-16">
            <div className="text-center">
              <h1 className='text-3xl'>This will clear all data.</h1> 
              <strong>This action is irreversible.</strong> <p>Are you sure you want to continue?</p>
              <div className="mt-4">
                <button className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50" onClick={confirmSetupDatabase}>Yes</button>
                <button className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50" onClick={() => setConfirmModule(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

export default withAuth(Home);
"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";
import BackBtnBar from '../backBtnBar';

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
      <BackBtnBar/>
      <h1 className="text-3xl font-bold text-slate-200 text-center mt-8">
        Admin Settings
      </h1>
      <div className="fixed bottom-0 left-50 right-0 m-4 rounded-lg bg-indigo-500 p-2 text-white text-center text-sm popup hidden">
        {(databaseExists == 1) ? ( <h1 className="text-xl font-bold">Database Reset.</h1> ) : ( <h1 className="text-xl font-bold">Database Created.</h1> )}
      </div>
      
        <div className="fixed bottom-0 left-50 right-0 m-4 rounded-lg bg-indigo-500 p-2 text-white text-center text-sm popup hidden">
            {(databaseExists == 1) ? ( <h1 className="text-xl font-bold">Database Reset.</h1> ) : ( <h1 className="text-xl font-bold">Database Created.</h1> )}
        </div>
      {/* General Settings */}
      <h2 className="text-xl font-semibold text-slate-200 w-[40%] m-auto mb-2 mt-16">
        General Settings
      </h2>
      <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-4">
        <Link className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50" href="/signout">Sign Out</Link>
      </div>
      {/* Database Management */}
      <h2 className="text-xl font-semibold text-slate-200 w-[40%] m-auto mb-2 mt-16">
        Database Management
      </h2>
      <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-4">
        {(databaseExists == 1) ? (
          <button className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50" onClick={() => setupDatabase()}>Reset Database Content</button>
        ) : (
          <button className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50" onClick={() => setupDatabase()}>Initialise Database</button>
        )}
      </div>
      {/* User Management */}
      <h2 className="text-xl font-semibold text-slate-200 w-[40%] m-auto mb-2 mt-16">
        User Management
      </h2>
      <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-4">
        <div id="search">
        </div>
      </div>
      <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-4">
        <div id="users">
        </div>
      </div>
      {(confirmModule) && (
        <>
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
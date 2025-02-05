"use client";

import { useEffect, useState } from 'react'

// For Firebase Login Auth
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';

export default function Home() {
  const [user, loading] = useAuthState(auth);
  const [databaseExists, setDatabaseExists] = useState(2);
  const [confirmModule, setConfirmModule] = useState(false);

  if (databaseExists === 2 && !loading) {
    const getDatabaseExists = async () => {
      const response = await fetch("/api/getDatabaseExists");
      const exists = await response.json();
      if (exists[0].DatabaseExists != null) {
        setDatabaseExists(exists[0].DatabaseExists);
      }
    }
    getDatabaseExists();
  }

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
    }
  }

  // Displays if the page is still loading
  if (loading) {
    // Can be used for lazy loading?
    return (
      <>
        <div>
          <p>Loading...</p>
        </div>
      </>
    )
  }

  // Displays if all information is valid
  return (
    <>
      {(databaseExists == 1) ? (
        <button onClick={() => setupDatabase()}>Reset Database content</button>
      ) : (
        <button onClick={() => setupDatabase()}>Initialise Database</button>
      )}
      <div id="search">

      </div>
      <div id="users">

      </div>
      {(confirmModule) && (
        <>
        {/* Still needs styling, this is just a rough representation of what I was looking to do */}
          <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
            <div className="text-center">
              <p>This will clear all data. <strong>This action is irreversible.</strong> Are you sure you want to continue?</p>
              <div className="mt-4">
                <button onClick={confirmSetupDatabase}>Yes</button>
                <button onClick={() => setConfirmModule(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

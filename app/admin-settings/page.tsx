"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useState, useEffect } from 'react'

// Components
import BackBtnBar from '@/app/components/backBtnBar';;

// Firebase
import { auth } from '@/app/firebase/config';
import { sendPasswordResetEmail } from 'firebase/auth';

interface User {
  uid: string;
  email: string;
  disabled: boolean;
}

function Home() {
  const [databaseExists, setDatabaseExists] = useState(2);
  const [confirmModule, setConfirmModule] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [resetEmail, setResetEmail] = useState<string>(''); // Tracking which email is going to be reset

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

    // Fetch users
    const fetchUsers = async () => {
      try {
        const response = await fetch('/api/getAllUsers');
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`); // Was for debugging a silly error i was getting.
        const data = await response.json();
        setUsers(data.users || []); 
      } catch (error) {
        console.error('Error fetching users:', error);
      }
    };
    fetchUsers();
  }, []);

  // Reusing Adam's password reset function.
  function resetPassword(email: string) {
    setResetEmail(email);
    sendPasswordResetEmail(auth, email)
      .then(() => {
        const popupPasswordResAlert = document.querySelector('.password-reset-popup');
        popupPasswordResAlert?.classList.add('show');
        popupPasswordResAlert?.classList.remove('hidden');
        setTimeout(() => {
          popupPasswordResAlert?.classList.remove('show');
          popupPasswordResAlert?.classList.add('hidden');
        }, 3000); // Hide after 3 seconds
      })
      .catch((err) => {
        alert(err.message);
      });
  }

  const filteredUsers = users.filter((user: User) => 
    user.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
  
  // Disabling a user
  const handleDisableUser = async (uid: string) => {
    try {
      // Get the current user status
      const user = users.find(u => u.uid === uid)
      if (!user) return;

      // Call the api route to update the user status
      await fetch("/api/manageUserStatus", {
        method: "POST",
        headers:{
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          uid,
          disabled: !user.disabled
        })
      })
      // Changing what is appearing on the user interface
      setUsers(users.map(u => u.uid === uid ? // If the user is the one being updated, change the disabled status
        {...u, disabled: !u.disabled} : u)) // Otherwise, keep the user as is
    } catch (error) {
      console.error('Error disabling user:', error);
    }
  };


  return (
    <>
      <BackBtnBar/>
      <h1 className="text-3xl font-semibold text-slate-200 w-[40%] m-auto mb-2 mt-16">
        Admin Settings
      </h1>
      {/* Database Reset Popup */}
      <div className="fixed bottom-0 left-50 right-0 m-4 rounded-lg bg-indigo-500 p-2 text-white text-center text-sm popup hidden">
        {(databaseExists == 1) ? ( <h1 className="text-xl font-bold">Database Reset.</h1> ) : ( <h1 className="text-xl font-bold">Database Created.</h1> )}
      </div>
      <div className="fixed bottom-0 left-50 right-0 m-4 rounded-lg bg-indigo-500 p-2 text-white text-center text-sm popup hidden">
        {(databaseExists == 1) ? ( <h1 className="text-xl font-bold">Database Reset.</h1> ) : ( <h1 className="text-xl font-bold">Database Created.</h1> )}
      </div>
      {/* Password Reset Popup */}
      <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 m-4 rounded-lg bg-indigo-500 p-2 text-white text-center text-sm password-reset-popup hidden">
        <h1 className="text-xl font-bold">Password Reset</h1>
        <p className="mx-2">We have sent an email to {resetEmail}.</p>
      </div>
      {/* Database Management */}
      <h2 className="text-xl font-semibold text-slate-200 w-[40%] m-auto mb-2 mt-6">
        Database Management
      </h2>
      <div className="bg-slate-900 p-4 w-[40%] mx-auto rounded-lg shadow-lg mt-4">
        <p className="mb-2">Reset the content of the database, to fix potential database related problems.</p>
        {(databaseExists == 1) ? (
          <button className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50" onClick={() => setupDatabase()}>Reset Database Content</button>
        ) : (
          <button className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50" onClick={() => setupDatabase()}>Initialise Database</button>
        )}
      </div>
      {/* User Management */}
      <h2 className="text-xl font-semibold text-slate-200 w-[40%] mx-auto mb-2 mt-6">
        User Management
      </h2>
      {/* User Filter */}
      <div className="bg-slate-900 p-4 w-[40%] mx-auto rounded-lg shadow-lg mt-2">
        <div id="search" className='p-1'>
          <input
            className='text-white w-full p-2 my-2 rounded-lg bg-slate-800'
            type="text"
            placeholder="Filter by email"
            name="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>
      {/* User List */}
      <h3 className="text-l font-semibold text-slate-200 w-[40%] m-auto mb-2 mt-4">
        List of Users
      </h3>
      <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-4 mb-5">
        <div id="users" className="space-y-4">
          {/* Displaying Each User */}
          {filteredUsers.map((user: User) => (
            <div key={user.uid} className="bg-slate-800 p-4 rounded-lg">
              <div className="flex flex-col">
                <p className="text-slate-400 text-sm">{user.email}</p>
                <p className="text-slate-500 text-xs">{user.uid}</p>
              </div>
              <div className="flex justify-between items-center">
                <p className="text-indigo-500 hover:underline cursor-pointer mt-3"
                onClick={() => resetPassword(user.email)}
                > Reset Password</p>
                {/* Disabling Accounts Toggle*/}
                {/* Link where I got the button: https://flowbite.com/docs/forms/toggle/ */}
                <label className="inline-flex items-center cursor-pointer"> 
                  <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={!user.disabled} 
                  onChange={() => handleDisableUser(user.uid)}
                  />
                  <div className="relative w-11 h-6 bg-gray-200 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:bg-gray-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600"></div>
                  <span className="ms-3 text-sm font-medium text-gray-900 dark:text-gray-300">
                    {user.disabled ? 'Disabled' : 'Enabled'}
                  </span>
                </label>
              </div>
            </div>
          ))}
        </div>
      </div>
      {/* Pop up message for db reset*/}
      {(confirmModule) && (
        <>
          <div className="fixed inset-0 flex items-center justify-center bg-opacity-95 bg-slate-900 w-[40%] h-[40%] m-auto rounded-3xl shadow-lg p-8">
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
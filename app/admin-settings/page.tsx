"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useState, useEffect } from 'react'

// Components
import BackBtnBar from '@/app/shared/components/backBtnBar';;

// Firebase
import { auth } from '@/app/firebase/config';
import { reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { EmailAuthProvider } from "firebase/auth/web-extension";

// Interfaces
import { User } from '@/app/shared/interfaces/user';

function Home() {
  const [databaseExists, setDatabaseExists] = useState(2);
  const [confirmModule, setConfirmModule] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState<string>(''); 
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (databaseExists === 2) {
      const getDatabaseExists = async () => {
        const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/database/exists`, {
          method: "GET",
          headers: { 'Content-Type': 'application/json' }
        });
        const exists = await response.json();
        setDatabaseExists(exists?.DatabaseExists);
      }
      getDatabaseExists();
    }

    const fetchUsers = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/users/getUsers`);
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        setUsers(data.users || []);
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [databaseExists]);

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
        }, 3000); 
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
    const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/database/create`, {
      method: "GET",
      headers: { 'Content-Type': 'application/json' }
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

  const handleDisableUser = async (uid: string) => {
    try {
      // Get the current user status
      const user = users.find(u => u.uid === uid)
      if (!user) return;

      await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/users/updateStatus`, {
        method: "PUT",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          uid,
          disabled: !user.disabled
        })
      })

      setUsers(users.map(u => u.uid === uid ? 
        { ...u, disabled: !u.disabled } : u))
    } catch (error) {
      console.error('Error disabling user:', error);
    }
  };

  const validatePasswordAndReset = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser?.email || !password){
      alert('Please enter your password');
      return;
    }
    try {
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        password
      );
      await reauthenticateWithCredential(currentUser, credential);
      await confirmSetupDatabase();
      setPassword('');
    }
    catch{
      alert('Incorrect password');
    }
  }


  return (
    <>
      <div className={`min-h-screen bg-white dark:bg-slate-950 ${confirmModule ? 'blur-xl bg-opacity-40' : ''}`}>
        <BackBtnBar/>
        {/* Header */}
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-200 w-[40%] m-auto mb-2 mt-16">
          Admin Settings
        </h1>
        {/* Database Reset Popup */}
        <div className="fixed bottom-0 left-50 right-0 m-4 rounded-lg bg-indigo-500 p-2 text-white text-center text-sm popup hidden">
          {(databaseExists == 1) ? ( <h1 className="text-xl font-bold">Database Reset.</h1> ) : ( <h1 className="text-xl font-bold">Database Created.</h1> )}
        </div>
        {/* Password Reset Popup */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 m-4 rounded-lg bg-indigo-500 p-2 text-white text-center text-sm password-reset-popup hidden">
          <h1 className="text-xl font-bold">Password Reset</h1>
          <p className="mx-2">We have sent an email to {resetEmail}.</p>
        </div>
        {/* Database Management */}
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-200 w-[40%] m-auto mb-2 mt-8">
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
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-200 w-[40%] mx-auto mb-2 mt-8">
          User Management
        </h2>
        <h3 className="text-l font-semibold text-slate-900 dark:text-slate-200 w-[40%] m-auto mb-2 mt-4">
          User Filter
        </h3>
        {/* User Filter */}
        <div className="bg-slate-900 p-4 w-[40%] mx-auto rounded-lg shadow-lg mt-2">
          <p>Filter through user emails here.</p>
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
        <h3 className="text-l font-semibold text-slate-900 dark:text-slate-200 w-[40%] m-auto mb-2 mt-4">
          Users
        </h3>
        <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-4 mb-5">
          <div id="users" className="space-y-4">
            {isLoading ? (
              // Skeleton loading while data is fetching
              [...Array(3)].map((_, index) => (
                <div key={index} className="bg-slate-800 p-4 rounded-lg animate-pulse">
                  <div className="flex flex-col">
                    <div className="h-4 bg-slate-700 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-3 bg-slate-700 rounded-lg w-1/2"></div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="h-4 bg-slate-700 rounded-lg w-24"></div>
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-6 bg-slate-700 rounded-full"></div>
                      <div className="h-4 bg-slate-700 rounded-lg w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredUsers.length > 0 ? (
              // Display users when data is loaded
              filteredUsers.map((user: User) => (
                <div key={user.uid} className="bg-slate-800 p-4 rounded-lg">
                  <div className="flex flex-col">
                    <p className="text-slate-400 text-sm">{user.email}</p>
                    <p className="text-slate-500 text-xs">{user.uid}</p>
                  </div>
                  <div className="flex justify-between items-center">
                    <p 
                      className="text-indigo-500 hover:underline cursor-pointer mt-3"
                      onClick={() => resetPassword(user.email)}
                    >
                      Reset Password
                    </p>
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
              ))
            ) : (
              <div className="text-center text-slate-400 py-4">
                No users found
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Pop up message for db reset*/}
      {(confirmModule) && (
        <>
          <div className="fixed inset-0 flex items-center justify-center bg-opacity-95 bg-slate-900 w-[40%] h-[40%] m-auto rounded-3xl shadow-lg p-8">
            <div className="text-center">
              <h1 className='text-3xl'>This will clear all data.</h1> 
              <strong>This action is irreversible.</strong> <p> Your password is needed to complete this action.</p>
              <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
                <input 
                  className="text-white w-full bg-slate-800 p-2 my-2 rounded-lg" 
                  type="password" 
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck="false"
                  data-form-type="other"
                  aria-autocomplete="none"
                />
              </form>
              {/* Buttons */}
              <div className="mt-4">
                <button 
                  className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                  onClick={validatePasswordAndReset}
                >
                  Reset
                </button>
                <button 
                  className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50" 
                  onClick={() => {
                    setConfirmModule(false);
                    setPassword('');
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
}

export default withAuth(Home);
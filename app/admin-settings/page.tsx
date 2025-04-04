"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation';

// Components
import BackBtnBar from '@/app/shared/components/backBtnBar';;

// Firebase
import { auth } from '@/app/firebase/config';
import { useAuthState } from 'react-firebase-hooks/auth';
import { reauthenticateWithCredential, sendPasswordResetEmail } from 'firebase/auth';
import { EmailAuthProvider } from "firebase/auth/web-extension";

// Interfaces
import { User } from '@/app/shared/interfaces/user';
import { Tag } from '@/app/shared/interfaces/tag';

function Home() {
  const [user] = useAuthState(auth);
  const [databaseExists, setDatabaseExists] = useState(2);
  const [confirmModule, setConfirmModule] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [resetEmail, setResetEmail] = useState<string>(''); // Tracking which email is going to be reset
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [tagName, setTagName] = useState('');
  const [filteredTags, setFilteredTags] = useState<Tag[]>([]);
  const [searchQuery, setSearchQuery] = useState(''); //used for searching tags
  const [error, setError] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

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

          const isAdmin = (await response.json()).isAdmin;

          if (!isAdmin) {
            router.push("/");
          }
        } catch (error) {
          console.error('Error checking admin:', error);
          router.push("/");
        }
      };
     checkAdmin();
    }
  }, [user, router]);

  //fetch all tags
  const fetchTags = async () => {
    try {
      const response = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/tags/getAll`);
      const data = await response.json();
      setAllTags(data || []);
      setFilteredTags(data || []);
    } catch (error) {
      console.error('Error fetching tags:', error);
    }
  };

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
    fetchTags();

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
      const user = users.find(u => u.uid === uid) // Changed from user_id to uid
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

      setUsers(users.map(u => u.uid === uid ? // Changed from user_id to uid
        { ...u, disabled: !u.disabled } : u))
    } catch (error) {
      console.error('Error disabling user:', error);
    }
  };

  const validatePasswordAndReset = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser?.email || !password) {
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
    catch {
      alert('Incorrect password');
    }
  }

  //deletes tag from tag list
  const handleDeleteTag = async (event: number) => {
    const tag_id = event;

    const index = allTags.findIndex(tag => tag.tag_id == tag_id);
    if (index > -1) {
      //remove tag from the db
      await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/tags/delete`, {
        method: "DELETE",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tag_id
        })
      })
      fetchTags();
    }
    else {
      setError("Tag not found");
    }
  }

  //adds tag to tag list
  const addTag = async (event: string) => {
    // make api call to create a tag
    const tagName = event;
    if (tagName.length > 0 && !allTags.some(tag => tag.tag.toLowerCase().trim() === tagName.toLowerCase().trim())) {
      await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/tags/create`, {
        method: "POST",
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          tagName
        })
      })

      fetchTags();
      setTagName('');
    }
    else {
      setError("Tag name is invalid or already exists");
    }
  }

  useEffect(() => {
    //for searching tags
    if (searchQuery.trim() == '') {
      setFilteredTags(allTags);
    }
    else {
      //display where the search equals the query or matches at least one of the tags
      setFilteredTags(allTags.filter(allTags => allTags.tag.toLowerCase().includes(searchQuery.trim())));
    }
  }, [searchQuery, allTags]);


  //3 second timer for the errors
  useEffect(() => {
    if (error.length > 0) {
      setTimeout(() => {
        setError("");
      }, 3000);
    }
  }, [error])

  return (
    <>
      <div className={`min-h-screen ${confirmModule ? 'blur-xl bg-opacity-40' : ''}`}>
        <BackBtnBar />
        {/* Header */}
        <h1 className="text-4xl font-semibold text-slate-900 dark:text-slate-200 w-[40%] m-auto mb-2 mt-16">
          Admin Settings
        </h1>
        {/* Database Reset Popup */}
        <div className="fixed bottom-0 left-50 right-0 m-4 rounded-lg bg-indigo-500 dark:bg-indigo-600 p-2 text-white text-center text-sm popup hidden">
          {(databaseExists == 1) ? (<h1 className="text-xl font-bold">Database Reset.</h1>) : (<h1 className="text-xl font-bold">Database Created.</h1>)}
        </div>
        {/* Password Reset Popup */}
        <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 m-4 rounded-lg bg-indigo-500 p-2 text-gray-200 dark:text-white text-center text-sm password-reset-popup hidden">
          <h1 className="text-xl font-bold">Password Reset</h1>
          <p className="mx-2">We have sent an email to {resetEmail}.</p>
        </div>
        {/* Database Management */}
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-200 w-[40%] m-auto mb-2 mt-8">
          Database Management
        </h2>
        <div className="bg-indigo-200/50 dark:bg-slate-900 p-4 w-[40%] mx-auto rounded-lg border border-slate-700/50 mt-4">
          <p className="text-slate-900 dark:text-gray-300 mb-2">Reset the content of the database, to fix potential database related problems.</p>
          {(databaseExists == 1) ? (
            <button className="px-6 py-3 text-lg font-medium bg-indigo-600 dark:bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50" onClick={() => setupDatabase()}>Reset Database Content</button>
          ) : (
            <button className="px-6 py-3 text-lg font-medium bg-indigo-600 dark:bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50" onClick={() => setupDatabase()}>Initialise Database</button>
          )}
        </div>
        {/* Create, delete and search tags */}
        <div>
          <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-200 w-[40%] m-auto mb-2 mt-8">
            Tag Management
          </h2>
          <div>
            <div className='bg-indigo-200/50 dark:bg-slate-900 p-4 w-[40%] mx-auto rounded-lg border border-slate-700/50 mt-4 ' >
              <div>
                <div id="Create" className='p-1'>
                  <label className="text-slate-900 dark:text-gray-300 text-lg font-semibold">Create Tags Here</label>
                  <input
                    className='text-slate-900 dark:text-slate-200 w-full p-2 my-2 rounded-lg bg-indigo-100 dark:bg-slate-800 border border-slate-700/50'
                    type="text"
                    placeholder="Create New Tag"
                    name="search"
                    value={tagName}
                    onChange={(e) => setTagName(e.target.value)}
                  />
                </div>
                <button type="submit" className="px-6 m-1 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                  onClick={() => addTag(tagName)}>
                  Create
                </button>
              </div>
              <div>
                <div id="Search" className='p-2'>
                  <label htmlFor="search=bar" className="text-slate-900 dark:text-gray-300 text-lg font-semibold">Search</label>
                  <input
                    className='text-slate-900 dark:text-slate-200 w-full p-2 my-2 rounded-lg bg-indigo-100 dark:bg-slate-800 border border-slate-700/50'
                    type="text"
                    placeholder="Search Tags"
                    name="search"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              <div className='bg-indigo-100 dark:bg-slate-800 rounded-lg flex flex-wrap gap-2 border border-slate-700/50 p-3'>
                {filteredTags.length > 0 ? (
                  filteredTags.map((tag: Tag) => (
                    <button
                      type="button"
                      className="rounded-full bg-indigo-700 text-slate-200 dark:text-slate-200 text-sm px-4 py-2 flex items-center text-center"
                      onClick={() => handleDeleteTag(tag.tag_id)} key={tag.tag_id}
                    >
                      <svg
                        className="w-4 h-4 flex-shrink-0 text-slate-200 hover:font-bold mr-2"
                        aria-hidden="true"
                        xmlns="http://www.w3.org/2000/svg"
                        width="15"
                        height="15"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <path
                          stroke="currentColor"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M6 18 17.94 6M18 18 6.06 6" />
                      </svg>{tag.tag}</button>
                  ))
                ) : <p className='m-auto text-sm text-slate-200'>No tags found</p>}
              </div>
              {error.length > 0 ? (
                <p className='text-red-500 p-2 flex justify-center items-center'>{error}</p>
              ) : ""}
            </div>
          </div>
        </div>
        {/* User Management */}
        <h2 className="text-2xl font-semibold text-slate-900 dark:text-slate-200 w-[40%] mx-auto mb-2 mt-8">
          User Management
        </h2>
        <h3 className="text-l font-semibold text-slate-900 dark:text-slate-200 w-[40%] m-auto mb-2 mt-4">
          User Filter
        </h3>
        {/* User Filter */}
        <div className="bg-indigo-200/50 dark:bg-slate-900 p-4 w-[40%] mx-auto rounded-lg border border-slate-700/50 mt-2">
          <p className="text-slate-900 dark:text-gray-300 mb-2">Filter through user emails here.</p>
          <div id="search" className='p-1'>
            <input
              className='text-slate-900 dark:text-slate-200 w-full p-2 my-2 rounded-lg bg-indigo-100 dark:bg-slate-800 border border-slate-700/50'
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
        <div className="bg-indigo-200/50 dark:bg-slate-900 p-4 w-[40%] m-auto rounded-lg border border-slate-700/50 mt-4 mb-5">
          <div id="users" className="space-y-4">
            {isLoading ? (
              // Skeleton loading while data is fetching
              [...Array(3)].map((_, index) => (
                <div key={index} className="bg-indigo-100 dark:bg-slate-800 p-4 rounded-lg animate-pulse">
                  <div className="flex flex-col">
                    <div className="h-4 bg-gray-400 dark:bg-slate-700 rounded-lg w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-400 dark:bg-slate-700 rounded-lg w-1/2"></div>
                  </div>
                  <div className="flex justify-between items-center mt-3">
                    <div className="h-4 bg-gray-400 dark:bg-slate-700 rounded-lg w-24"></div>
                    <div className="flex items-center space-x-3">
                      <div className="w-11 h-6 bg-gray-400 dark:bg-slate-700 rounded-full"></div>
                      <div className="h-4 bg-gray-400 dark:bg-slate-700 rounded-lg w-16"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : filteredUsers.length > 0 ? (
              // Display users when data is loaded
              filteredUsers.map((user: User) => (
                <div key={user.uid} className="bg-indigo-100 dark:bg-slate-800 p-4 rounded-lg border border-slate-700/50">
                  <div className="flex flex-col">
                    <p className="text-gray-700 dark:text-slate-400 text-m">{user.email}</p>
                    <p className="text-gray-600 dark:text-slate-500 text-xs">{user.uid}</p>
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
                      <div className="relative w-11 h-6 bg-red-600 rounded-full peer peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 dark:red-900 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-green-600 dark:peer-checked:bg-green-600"></div>
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
          <div className="fixed inset-0 flex items-center justify-center bg-indigo-200 border border-slate-700/50 dark:bg-slate-900 w-[40%] h-[40%] m-auto rounded-3xl p-8">
            <div className="text-center text-slate-900 dark:text-slate-200">
              <h1 className='text-3xl'>This will clear all data.</h1>
              <strong>This action is irreversible.</strong> <p> Your password is needed to complete this action.</p>
              <form onSubmit={(e) => e.preventDefault()} autoComplete="off">
                <input
                  className="w-full p-2 my-2 rounded-lg border border-gray-700/50 text-gray-800
                    bg-indigo-100 dark:bg-slate-800 dark:border-slate-700 dark:text-white"
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
                  className="px-6 m-1 py-3 text-lg font-medium text-white bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                  onClick={validatePasswordAndReset}
                >
                  Reset
                </button>
                <button
                  className="px-6 m-1 py-3 text-lg font-medium text-white bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
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
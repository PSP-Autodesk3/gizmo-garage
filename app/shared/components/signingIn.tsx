// Other
import Link from 'next/link';

export default function SigningIn() {
  return (
    <>
      <div className="bg-gray-300 dark:bg-slate-800 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-16">
        <div className="flex flex-col items-center space-y-6">
          <h1 className="text-4xl text-center font-semibold text-slate-900 dark:text-slate-200">
            Gizmo Garage
          </h1>
          <Link href="/login" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
            Sign in to your account
          </Link>
          <Link href="/register" className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50">
            Create an account
          </Link>
        </div>
      </div>
    </>
  );
}
"use client";

import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function BackBtnBar() {
    const router = useRouter();
    
    return(
        <div className="w-full bg-slate-900 p-4 mb-8 shadow-lg">
        <div className="mx-auto flex items-center">
          <Link 
            href="/"
            className="px-4 py-2 text-sm font-medium bg-indigo-600 rounded-lg 
                       transition-all duration-300 hover:bg-indigo-500 
                       hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
          >
            Back to Home
          </Link>
        </div>
      </div> 
    )
}

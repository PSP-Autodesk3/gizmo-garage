"use client";

import Link from 'next/link';

export default function BackBtnBar() {
	return (
		<div className="w-full border border-slate-700/50 bg-indigo-200/50 dark:bg-slate-900 p-3 mb-8 shadow-lg">
			<div className="w-full flex justify-between items-center text-white">
				<Link
					href="/"
					className="px-4 py-2 text-sm font-medium bg-indigo-600 rounded-lg 
							   transition-all duration-300 hover:bg-indigo-500 
							   hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
				>
					<svg className="w-6 h-6 text-white inline-block mr-2"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M5 12h14M5 12l4-4m-4 4 4 4"
						/>
					</svg>
					Home
				</Link>
				<Link
					href="/signout"
					className="flex items-center px-4 py-2 text-sm font-medium bg-indigo-600 rounded-lg 
							   transition-all duration-300 hover:bg-indigo-500 
							   hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
				>
					Sign Out
					<svg className="w-6 h-6 text-white ml-1"
						aria-hidden="true"
						xmlns="http://www.w3.org/2000/svg"
						width="24"
						height="24"
						fill="none"
						viewBox="0 0 24 24"
					>
						<path
							stroke="currentColor"
							strokeLinecap="round"
							strokeLinejoin="round"
							strokeWidth="2"
							d="M16 12H4m12 0-4 4m4-4-4-4m3-4h2a3 3 0 0 1 3 3v10a3 3 0 0 1-3 3h-2"
						/>
					</svg>
				</Link>
			</div>
		</div>
	)
}

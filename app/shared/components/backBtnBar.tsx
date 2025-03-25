"use client";

// Other
import Link from 'next/link';
import { useRouter } from 'next/navigation';

// Interfaces
import { Folder } from "@/app/shared/interfaces/folder";

interface ButtonProps {
	back?: boolean;
	projectID?: string | null;
	folderID?: number | null;
	projectName?: string | null;
}

export default function BackBtnBar({ back, projectID, folderID, projectName }: ButtonProps) {
	const router = useRouter();

	const backButton = async () => {
        const details = await fetch(`http://${process.env.NEXT_PUBLIC_SERVER_HOST}:3001/folders/get`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: projectID })
        });
        const results = await details.json();
        const currentFolder = results.find((folder: Folder) => folder.folder_id === folderID);

        const folders: Folder[] = [];
        if (currentFolder) {
            folders.push(currentFolder);
            let con = false;

            while (!con) {
                const currentFolder = results.find((folder: Folder) => folder.folder_id === folders[folders.length - 1].parent_folder_id);

                if (currentFolder) {
                    folders.push(currentFolder);
                } else {
                    con = true;
                }
            }
        }
        let route = '';
        folders.slice().reverse().map((folder: Folder) => route += `/${folder.name}`);
        if (route === '')
            route = '/'
        
        router.push(`../project/${projectID}+${projectName?.replace(/ /g, '+')}/${route}`);
    }

	return (
		<div className="w-full bg-slate-900 p-3 mb-8 shadow-lg">
			<div className="w-full flex justify-between items-center">
				{back ? (
					<button
						className="px-4 py-2 text-sm font-medium bg-indigo-600 rounded-lg 
								transition-all duration-300 hover:bg-indigo-500 
								hover:scale-105 shadow-lg hover:shadow-indigo-500/50 ml-8"
						onClick={backButton}
					>
						<svg className="w-6 h-6 text-gray-800 dark:text-white inline-block mr-2"
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
						Back
					</button>
				) : (
					<Link
						href="/"
						className="px-4 py-2 text-sm font-medium bg-indigo-600 rounded-lg 
								transition-all duration-300 hover:bg-indigo-500 
								hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
					>
						<svg className="w-6 h-6 text-gray-800 dark:text-white inline-block mr-2"
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
				)}
				
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

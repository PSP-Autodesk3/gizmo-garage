"use client";

// Interfaces
import { Folder } from "@/app/shared/interfaces/folder";

// Other
import { usePathname, useRouter } from 'next/navigation';

export default function FolderList({ folders }: { folders: Folder[] }) {
    const pathname = usePathname();
    const router = useRouter();
    
    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
            {Array.isArray(folders) && folders.length > 0 && (
                folders.map((folder) => (
                    <div key={folder.folder_id}>
                        <button
                            className="bg-slate-900 rounded-lg text-xl my-4 px-4 py-2"
                            onClick={() => { router.push(pathname + `/${folder.name.replace(/ /g, '+')}`); }}
                        >
                            {folder.name}
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}
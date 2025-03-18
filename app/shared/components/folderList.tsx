"use client";

// Interfaces
import { Folder } from "@/app/shared/interfaces/folder";

// Other
import { usePathname, useRouter } from 'next/navigation';

// Skeleton Loading
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function FolderList({ folders }: { folders: Folder[] }) {
    const pathname = usePathname();
    const router = useRouter();

    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
            {!folders ? (
                <SkeletonTheme baseColor='#0f172a' highlightColor='#1e293b' enableAnimation duration={0.5}>
                    <Skeleton width={600} height={125} count={4} style={{ marginBottom: '16px' }} />
                </SkeletonTheme>
            ) : (
                Array.isArray(folders) && folders.length > 0 && (
                    folders.map((folder) => (
                        <div key={folder.folder_id}>
                            <button
                                className="bg-slate-900 rounded-lg text-xl my-4 px-4 py-2"
                                onClick={() => { router.push(pathname + `/${folder.name.replace(/ /g, '+')}`); }}
                            >
                                {folder.name}
                            </button>
                            <span>{folder.dateOfCreation.toLocaleDateString()} {folder.dateOfCreation.toLocaleTimeString()}</span>                            
                            {Array.isArray(folder.tags) && folder.tags.length > 0 && (
                                folder.tags.map((tag) => (
                                    <span className='rounded-full m-2 p-2 bg-blue-600 self-center' key={tag.tag_id}>
                                        {tag.tag}
                                    </span>
                                ))
                            )}
                        </div>
                    ))
                ))}
        </div>
    );
}
"use client";

// Interfaces
import { Folder } from "@/app/shared/interfaces/folder";

// Other
import { useRouter } from 'next/navigation';
import { usePathname } from 'next/navigation';
import Link from "next/link";

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
                            <Link
                                className="bg-slate-900 rounded-lg text-xl my-4 px-4 py-2 gap-2 items-center flex"
                                href={`${pathname}/${folder.name.replace(/ /g, '+')}`}
                            >
                                <svg className="w-5 h-5 text-slate-400 flex-shrink-0"
                                    fill="none"
                                    stroke="currentColor"
                                    viewBox="0 0 24 24">
                                    <path strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
                                </svg>
                                {folder.name}
                            </Link>
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
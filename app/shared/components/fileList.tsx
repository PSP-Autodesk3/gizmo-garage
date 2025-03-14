"use client";

// Interfaces
import { File } from "@/app/shared/interfaces/file";

// Skeleton Loading
import Skeleton, { SkeletonTheme } from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'

export default function FileList({ files }: { files: File[] }) {
    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
            {!files ? (
                <>
                    <div>
                        <SkeletonTheme baseColor='#0f172a' highlightColor='#1e293b' enableAnimation duration={0.5}>
                            <Skeleton width={100} height={100} style={{ margin: '5px' }} />
                        </SkeletonTheme>
                    </div>
                </>
            ) : (
                Array.isArray(files) && files.length > 0 && (
                    files.map((file) => (
                        <div key={file.object_id}>
                            <button
                                className="bg-slate-900 rounded-lg text-xl my-4 px-4 py-2"
                                onClick={() => { }}
                            >
                                {file.name}
                            </button>
                            <span>{file.dateOfCreation.toLocaleDateString()} {file.dateOfCreation.toLocaleTimeString()}</span>
                            {Array.isArray(file.tags) && file.tags.length > 0 && (
                                file.tags.map((tag) => (
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
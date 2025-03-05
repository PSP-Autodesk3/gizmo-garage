"use client";

import { File } from "@/app/shared/interfaces/file";

export default function FileList({ files }: { files: File[] }) {
    return (
        <div className="grid lg:grid-cols-4 md:grid-cols-2 gap-4">
            {Array.isArray(files) && files.length > 0 && (
                files.map((file) => (
                    <div key={file.object_id}>
                        <button
                            className="bg-slate-900 rounded-lg text-xl my-4 px-4 py-2"
                            onClick={() => { }}
                        >
                            {file.name}
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}
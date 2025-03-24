"use client";

// Types
import { Project } from "@/app/shared/interfaces/project";

// Other
import { useRouter } from "next/navigation";

export default function ProjectPreview({ project, query }: { project: Project, query: string }) {
    const router = useRouter();

    return (
        <div className="bg-gray-300 dark:bg-slate-800 p-4 m-auto rounded-lg shadow-lg mx-8 my-4 flex flex-row justify-between">
            <div className='p-2 pr-10'>
                <div className="mb-2 text-slate-900 dark:text-slate-200"">
                    <p className="text-xl font-bold">Name: {project.name} </p>
                    <p>Version: </p>
                    <p>Date: {project.dateOfCreation.toLocaleDateString()} {project.dateOfCreation.toLocaleTimeString()} </p>
                </div>
                <div className="mt-1 mb-5">
                    {query.trim() && project.editors.length > 0 &&
                        (query.trim().length > 3 &&
                            project.editors.some(editor => editor.email?.toLowerCase().includes(query.trim().toLowerCase()))) && (
                            <p>Editor: {project.editors.map((editor, index) => (
                                <span className='rounded-full m-2 p-2 bg-blue-600' key={index}>{editor.email}</span>
                            ))}</p>
                        )}
                </div>
                {project.tags.length > 0 && (
                    <p>{project.tags.map((tag, index) => (
                        <span className='rounded-full m-2 p-2 bg-blue-600' key={index}>{tag.tag}</span>
                    ))}</p>
                )}
            </div>
            <div className='content-center'>
                <button
                    className="px-6 py-3 mr-4 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                    onClick={() => router.push(`/project/${project.project_id}+${project.name.replace(/ /g, '+')}`)}
                >
                    View
                </button>
                <button
                    className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                    onClick={() => router.push(`/edit-project/${project.project_id}`)}
                >
                    Edit
                </button>
            </div>
        </div>
    );
}
"use client";

// Types
import { Project } from "@/app/shared/interfaces/project";

// Other
import { useRouter } from "next/navigation";

export default function ProjectPreview({ project }: { project: Project }) {
    const router = useRouter();

    return (
        <div className="bg-slate-900 p-4 m-auto rounded-lg shadow-lg mx-8 my-4 flex flex-row justify-between">
            <div className='p-2 pr-10'>
                <p>Name: {project.name} </p>
                <p>Version: </p>
                <p>Date: </p>
                {project.tags.length > 0 && (
                    <p>Tags: {project.tags.map((tag, index) => (
                        <span className='rounded-full m-2 p-2 bg-blue-600' key={index}>{tag.tag}</span>
                    ))}</p>
                )}
            </div>
            <div className='content-center'>
                <button
                    className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
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
"use client";

import { useRouter } from "next/navigation";

interface BreadcrumbsProps {
    projectID: number;
    project: string;
    routes: string[];
}

export default function Breadcrumbs({projectID, project, routes}: BreadcrumbsProps) {
    const router = useRouter();

    const goneBack = async (num: number) => {
        const selectedFolders = routes.slice(0, (num + 1)).join('/');
        const route = `/project/${projectID}+${project.replace(/%2B/g, '+')}/${selectedFolders.replace(/%2B/g, '+')}`;
        router.push(route);
    }

    return (
        <div id="breadcrumbs" className="text-slate-900 dark:text-slate-200 font-semibold flex flex-row text-2xl p-4 rounded-lg mx-8 my-4 ">
            <button
                onClick={() => { router.push(`/`); }}
                className="transition-colors duration-300 hover:text-indigo-800 dark:hover:text-indigo-400"
            >
                Home
            </button>
            <h1>&nbsp;&nbsp;&gt;&nbsp;&nbsp;</h1>
            <button
                className="transition-colors duration-300 hover:text-indigo-800 dark:hover:text-indigo-400"
                onClick={() => { router.push(`/project/${projectID}+${project.replace(/%2B/g, '+')}`); }}
            >
                {project.replace(/%2B/g, ' ')}
            </button>
            {Array.isArray(routes) && routes.length > 0 && (
                routes.map((route, index) => (
                    <div key={index} className="flex flex-row ">
                        <h1>&nbsp;&nbsp;&gt;&nbsp;&nbsp;</h1>
                        <button
                            onClick={() => goneBack(index)}
                            className="transition-colors duration-300 hover:text-indigo-800 dark:hover:text-indigo-400"
                        >
                            {route.replace(/%2B/g, ' ')}
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}
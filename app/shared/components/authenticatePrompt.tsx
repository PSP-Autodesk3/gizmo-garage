// Other
import { useRouter } from 'next/navigation';

interface AuthenticateProps {
    loginErrorMessage: string
}

export default function AuthenticatePrompt({loginErrorMessage}: AuthenticateProps) {
    const router = useRouter();

    return (
        <>
            <div className="bg-slate-900 p-4 w-[40%] m-auto rounded-lg shadow-lg mt-16">
                <div className="flex flex-col items-center space-y-6">
                    <h1 className="text-4xl text-center font-semibold">
                        Gizmo Garage
                    </h1>

                    <button
                        onClick={() => router.push(`https://developer.api.autodesk.com/authentication/v2/authorize?response_type=code&client_id=${process.env.NEXT_PUBLIC_AUTODESK_CLIENT_ID}&redirect_uri=http%3A%2F%2Flocalhost%3A3000%2Fredirect&scope=${encodeURIComponent("data:read bucket:create bucket:read")}`)}
                        className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                    >
                        Authenticate with AutoDesk
                    </button>


                    {loginErrorMessage && (
                        <div id="error-message">
                            <p>{loginErrorMessage}</p>
                            <p>Open the console to view more details</p>
                        </div>
                    )}

                    <button
                        onClick={() => router.push("/signout")}
                        className="px-6 py-3 text-lg font-medium bg-indigo-600 rounded-lg transition-all duration-300 hover:bg-indigo-500 hover:scale-105 shadow-lg hover:shadow-indigo-500/50"
                    >
                        Sign Out
                    </button>
                </div>
            </div>
        </>
    )
}
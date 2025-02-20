"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";
 
// Other
import { useRouter, usePathname } from 'next/navigation';
import { use, useCallback, useState, useEffect } from "react";
// Auth
import { auth } from "@/app/firebase/config"
import { useAuthState } from "react-firebase-hooks/auth";

//Filter component
import BackBtnBar from "../../backBtnBar";

interface PageProps {
  params: { slug: string[] };
}

interface Item {
    object_id: number;
    name: string;
}

function Home({ params }: PageProps) {
     const router = useRouter();
     const [item, setItem] = useState<Item | null>(null);
     const [itemId, setItemId] = useState<number | null>(null);
     const [itemName, setItemName] = useState<string | null>(null);
     const [author, setAuthor] = useState<string | null>(null);

     useEffect(() => {
        const resolveParams = async () => {
            const resp = await params;
            setItemId(Number(resp.slug[0]));
        }
        resolveParams();
     }, [])
     useEffect(() => {
        const fetchInfo = async () => {
            if (itemId !== null) {
                const response = await fetch ("/api/getObjectInfo", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ id: itemId }),
                });
                const itemData = await response.json();
                console.log(itemData);
                setItemName(itemData[0]?.name);
                setAuthor(itemData[0]?.fname + " " + itemData[0]?.lname);
            }
        }
        fetchInfo();
    }, [itemId]);
    
     return (
        <>
        <BackBtnBar />
        <div className="lg:grid lg:grid-cols-3 w-full p-8">
            {/*/ Row 1 */}
            <div>
                <div className="bg-slate-800 rounded-lg p-4">
                    <h1 className="text-2xl text-center">
                        Item Details
                    </h1>
                    <div className="flex flex-col items-center">
                        <p>ID: {itemId}</p>
                        <p>Name: {itemName}</p>
                        <p>Author: {author}</p>
                    </div>
                </div>
            </div>
            {/*/ Row 2 */}
        </div>

       {/* 
            <p>ID: {itemId}</p>
            <p>Name: {itemName}</p>
            <p>Author: {author}</p> */}
        </>
     )
}

export default withAuth(Home);
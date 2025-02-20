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
import Filters from "../../Filter"

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

     useEffect(() => {
        const resolveParams = async () => {
            const resp = await params;
            setItemId(Number(resp.slug[0]));
        }
        resolveParams();
     }, [])
     useEffect(() => {
        const fetchInfo = async () => {
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
        }
        fetchInfo();
    }, [itemId]);
     return (
        <>
            <p>ID: {itemId}</p>
            <p>Name: {itemName}</p>
        </>
     )
}

export default withAuth(Home);
"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

// Other
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { Range } from 'react-range';

//Filter component
import Filters from "./Filter"

interface PageProps {
  params: Promise<{ slug: string[] }>;
}

function Home({ params }: PageProps) {
  const router = useRouter();
  const admin = useState(true);
  const [query, updateQuery] = useState('');
  const [tagQuery, updateTagQuery] = useState('');
  const [values, setValues] = useState([20, 80]);
  const [slugs, setSlugs] = useState<string[]>([]);

  // Resolve slugs
  useEffect(() => {
    const resolveParams = async () => {
      const resolvedParams = await params;
      setSlugs(resolvedParams.slug);
    };

    resolveParams();
  }, [params]);

  useEffect(() => {
    // This works, but is just testing. These should be reworked into the actual application.

    // Checks if the AutoDesk Auth token is set in session storage before accessing APIs
    if (sessionStorage.getItem('token') != '') {
      // Fetches data, needs moving to apis and is temporary for testing
      const fetchData = async () => {
        // POSTs bucket
        let data = await fetch("https://developer.api.autodesk.com/oss/v2/buckets", {
          method: "POST",
          //         From docs                           Auth token from AutoDesk                                      Must be same as all other requests
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionStorage.getItem("token")}`, "region": "US" },
          body: JSON.stringify({ "bucketKey": "testbucketno1", "policyKey": "persistent" })
        })
        let json = await data.json();
        console.log("Bucket insert:", json);
        
        // GETs all buckets
        data = await fetch("https://developer.api.autodesk.com/oss/v2/buckets", {
          method: "GET",
          //         From docs                           Auth token from AutoDesk                                      Must be same as all other requests
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${sessionStorage.getItem("token")}`, "region": "US" }
        })
        json = await data.json();
        console.log("Bucket response:", json);
      }
      fetchData();
    }
  }, []);

  // Directs to account settings page
  const handleAccountSettings = async () => {
    router.push("/account-settings");
  }

  return (
    <>
    <div id='Filter' className='flex'>
    <Filters/>
        <div id="data">
          <div id="folders">
            
          </div>
          <div id="files">
            
          </div>
        </div>
        <p>Slugs: {slugs.join("/")}</p>
    </div>
    </>
  )
}

export default withAuth(Home);
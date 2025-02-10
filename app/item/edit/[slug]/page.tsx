"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

function Home() {
  return (
    <>
        <p>Item Name</p>
        <div id="object-details">

        </div>
        <div id="objects">

        </div>
        <div id="versions">

        </div>
        <div id="object-preview">

        </div>
    </>
  )
}

export default withAuth(Home);
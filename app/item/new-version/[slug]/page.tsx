"use client";

// Middleware
import withAuth from "@/app/lib/withAuth";

function Home() {
  return (
    <>
        <p>Item Name</p>
        <p>New Version 25.1.1</p>
        <div id="objects">

        </div>
        <div id="options">
          <button>Upload New Object</button>
          <button>Submit Version</button>
        </div>
    </>
  )
}

export default withAuth(Home);
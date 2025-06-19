"use client"
import { auth, db } from "@/lib/firebase"
import { useEffect } from "react"

export default function DebugPage() {
  useEffect(() => {
    console.log("Firebase Auth:", auth)
    console.log("Firestore DB:", db)
  }, [])

  return <div className="p-4">Debug Page</div>
}

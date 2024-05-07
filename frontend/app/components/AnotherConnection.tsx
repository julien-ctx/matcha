"use client"

import { useState } from "react";
import { useAuth } from "../auth/AuthProvider"
import { useUI } from "../contexts/UIContext";
import './AnotherConnection.css'

export default function AnotherConnection() {
    const { socket } = useAuth();
    const { toggleAnotherConnection } = useUI();
    const [loading, setLoading] = useState(false);

    return (
        <div className="relative flex flex-col justify-center items-center w-full h-full"
          style={{
            backgroundImage: "url('/girl_waiting.webp')",
            backgroundSize: "cover",
            backgroundPosition: "50% -2%",
            backgroundRepeat: "no-repeat",
          }}
        >
        <h1 className="text-5xl text-white absolute top-32">You are connected somewhere else!</h1>
    
          <div
            className="border-1 rounded-xl p-8 py-12 flex flex-col gap-4 items-center justify-around absolute top-1/2 -translate-y-1/2 border-rose-200"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.5)",
            }}
          >
            <h2 className="text-xl w-72 text-slate-900">Matcha is open in another window. Click "Use here" to use Matcha in this window.</h2>
            {loading ? (
                    <div className="loader"></div>
                ) :

            <button
              className="px-4 py-2 text-xl border-rose-500 bg-white text-rose-500 rounded-md border-2 duration-150"
              onClick={() => {
                setLoading(true);
                socket.emit("useHere", {}, (response: any) => {
                    console.log(response)
                    if (response.success) {
                        toggleAnotherConnection(false);
                    }
                })
              }}
            >Use here</button>
            }
          </div>
        </div>
      )
    
}
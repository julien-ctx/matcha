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
        <h1 className="text-5xl text-white absolute top-32 text-center w-full">You are connected somewhere else!</h1>
    
          <div
            className="border-1 rounded-xl p-8 py-12 flex flex-col gap-4 items-center justify-around absolute top-1/2 -translate-y-1/2 border-rose-200"
            style={{
              backgroundColor: "rgba(255, 255, 255, 0.5)",
            }}
          >
            <h2 className="text-xl w-72 text-slate-900">Matcha is open in another window. Click "Use Here" to use Matcha in this window.</h2>
            <div className="flex gap-1">
                {loading ? (
                        <div className="loader mx-6"></div>
                    ) :

                <button
                className="px-4 py-2 text-xl border-rose-500 bg-white text-rose-500 rounded-md border-2 hover:brightness-95 duration-100"
                onClick={() => {
                    setLoading(true);
                    socket.emit("useHere", {}, (response: any) => {
                        console.log(response)
                        if (response.success) {
                            toggleAnotherConnection(false);
                        }
                    })
                }}
                >Use Here</button>
                }
                <button
                    className="px-4 py-2 text-xl border-slate-400 bg-white text-slate-400 rounded-md border-2 hover:brightness-95 duration-100"
                    onClick={() => window.close()}
                >Close Tab</button>
            </div>
          </div>
        </div>
      )
    
}
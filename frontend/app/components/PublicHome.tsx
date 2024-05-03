"use client"

import React, { useEffect, useState } from 'react'
import Cookies from "js-cookie"
import { useRouter } from 'next/navigation';
import { useAuth } from "../auth/AuthProvider"
import './PublicHome.css'

export default function PublicHome() {
    const images = ['/front1.webp', '/front2.webp', '/front3.webp', '/front4.webp', '/front5.webp', '/front6.webp', '/front7.webp', '/front8.webp', '/front9.webp'];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const router = useRouter();
    const { login } = useAuth()

    useEffect(() => {
        const cookieToken = Cookies.get("token")
        if (cookieToken) {
          login(cookieToken)
          Cookies.remove("token")
          router.replace("/")
        }
      }, [])
    
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prevIndex => {
                return (prevIndex + 1) % images.length;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="overflow-y-scroll w-full min-h-full h-full relative page-container">
            <div className="h-full w-full overflow-hidden relative">
                <div className="w-full h-full" style={{ transform: `translateX(-${currentImageIndex * 100}%)`, transition: 'transform 1s ease-out' }}>
                    {images.map((src, index) => (
                        <div className="image-container absolute w-full h-full inset-0 " style={{ left: `${index * 100}%` }}>
                            <img key={index} src={src} alt={`front ${index + 1}`} className=" w-full h-full object-cover"  />
                        </div>
                    ))}
                </div>
                <div className="flex flex-col justify-center items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                    <h1 className=" text-white text-8xl text-nowrap font-jersey10">&nbsp;Find your love with us&nbsp;</h1>
                    <button className="bg-gradient-to-r-main px-8 py-3 text-4xl shadow-2xl shadow-black border-slate-400 text-white rounded-xl hover:scale-105 hover:brightness-90  border-2 duration-150"
                        onClick={() => router.push('/register')}
                    >Join us</button>
                </div>
            </div>
        </div>
    );
}
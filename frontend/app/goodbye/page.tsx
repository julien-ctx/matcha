"use client"

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { AuthStatus } from "../types/authTypes";

export default function GoodBye() {
    const { authStatus, user } = useAuth();
    const [show, setShow] = useState(false);
    const images = ['/front1.webp', '/front2.webp', '/front3.webp', '/front4.webp', '/front5.webp', '/front6.webp', '/front7.webp', '/front8.webp', '/front9.webp'];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const router = useRouter();

    useEffect(() => {
        if (authStatus === AuthStatus.Validating) return;
        if (user) router.push('/');
        else setShow(true);
    }, [authStatus, user])

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentImageIndex(prevIndex => {
                return (prevIndex + 1) % images.length;
            });
        }, 4000);

        return () => clearInterval(interval);
    }, []);

    return (show ??
        <div className="overflow-y-scroll w-full min-h-full h-full relative page-container">
            <div className="h-full w-full overflow-hidden relative">
                <div className="w-full h-full" style={{ transform: `translateX(-${currentImageIndex * 100}%)`, transition: 'transform 1s ease-out' }}>
                    {images.map((src, index) => (
                        <div key={index} className="image-container absolute w-full h-full inset-0 " style={{ left: `${index * 100}%` }}>
                            <img src={src} alt={`front ${index + 1}`} className=" w-full h-full object-cover"  />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );

}
"use client"

import React, { useEffect, useState } from 'react'
import Cookies from "js-cookie"
import { useRouter } from 'next/navigation';
import { useAuth } from "../contexts/AuthContext"
import './PublicHome.css'
import Register from './Register';
import Login from './Login';
import { useUI } from '../contexts/UIContext';
import RecoverPassword from './RecoverPassword';

enum PublicHomeState {
    Home,
    Register,
    Login,
    RecoverPassword
}

export default function PublicHome() {
    const images = ['/front1.webp', '/front2.webp', '/front3.webp', '/front4.webp', '/front5.webp', '/front6.webp', '/front7.webp', '/front8.webp', '/front9.webp'];
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const router = useRouter();
    const { login } = useAuth()
    const [homeState, setHomeState] = useState<PublicHomeState>(PublicHomeState.Home);
    const { showLogin, toggleLogin } = useUI();

    useEffect(() => {
        const userData = Cookies.get("userData")
        if (userData) {
            login(JSON.parse(userData))
            Cookies.remove("userData")
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

    useEffect(() => {
        if (showLogin === true) setHomeState(PublicHomeState.Login);
    }, [showLogin])

    return (
        <div className="overflow-y-scroll w-full min-h-full h-full relative page-container">
            <div className="h-full w-full overflow-hidden relative">
                <div className="w-full h-full" style={{ transform: `translateX(-${currentImageIndex * 100}%)`, transition: 'transform 1s ease-out' }}>
                    {images.map((src, index) => (
                        <div key={index} className="image-container absolute w-full h-full inset-0 " style={{ left: `${index * 100}%` }}>
                            <img src={src} alt={`front ${index + 1}`} className=" w-full h-full object-cover"  />
                        </div>
                    ))}
                </div>
                {homeState === PublicHomeState.Home ? (
                    <div className="flex flex-col justify-center items-center absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 gap-3">
                        <h1 className=" text-white text-4xl sm:text-8xl text-nowrap font-jersey10 w-full">Find your love with us</h1>
                        <button className="px-8 py-2 text-3xl shadow-2xl shadow-black border-rose-500 text-rose-500 rounded-lg hover:scale-105 hover:brightness-110 border-2 duration-150" style={{backgroundColor: 'rgba(255, 255, 255, 0.9)'}}
                            onClick={() => setHomeState(PublicHomeState.Register)}
                        >Join us</button>
                    </div>    
                ) : homeState === PublicHomeState.Register ? (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Register goBackHome={() => setHomeState(PublicHomeState.Home)}/>
                    </div>
                ) : homeState === PublicHomeState.Login ? (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <Login 
                            goBackHome={() => {
                                setHomeState(PublicHomeState.Home)
                                toggleLogin(false)
                            }}
                            goRegister={() => {
                                setHomeState(PublicHomeState.Register)
                                toggleLogin(false)
                            }}
                            goRecover={() => {
                                setHomeState(PublicHomeState.RecoverPassword)
                                toggleLogin(false)
                            }}
                        />
                    </div>
                ) : homeState === PublicHomeState.RecoverPassword ? (
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                        <RecoverPassword goBackHome={() => setHomeState(PublicHomeState.Home)}/>
                    </div>
                ) : null}
            </div>
        </div>
    );
}

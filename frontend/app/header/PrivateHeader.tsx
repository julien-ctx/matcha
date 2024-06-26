"use client"

import './PrivateHeader.css';
import { useAuth } from '../contexts/AuthContext';
import { useEffect, useRef, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useUI } from '../contexts/UIContext';
import InteractionPopup from '../components/InteractionPopup';
import { useSocial } from '../contexts/SocialContext';
import { useChat } from '../contexts/ChatContext';

export default function PrivateHeader() {
    const { logout, user, socket } = useAuth();
    const { toggleLikesList, toggleVisitsList, anotherConnection } = useUI();
    const router = useRouter();
    const {visits, likes, visitNotification, likeNotification, toggleVisitNotification, toggleLikeNotification} = useSocial();
    const pathname = usePathname()

    const menuToggleRef = useRef(null);
    const accountBtnRef = useRef(null);
    const logoutBtnRef = useRef(null);
    const likeListRef = useRef(null);
    const visitListRef = useRef(null);

    const [unlikeAnimations, setUnlikeAnimations] = useState([]);
    const { newMessageArrived, setNewMessageArrived } = useChat();

    useEffect(() => {
        const accountBtn = accountBtnRef.current;
        const logoutBtn = logoutBtnRef.current;

        const uncheckMenu = () => {
            if (menuToggleRef.current) {
                menuToggleRef.current.checked = false;
            }
        };

        if (accountBtn && logoutBtn) {
            accountBtn.addEventListener('click', uncheckMenu);
            logoutBtn.addEventListener('click', uncheckMenu);
        }

        return () => {
            if (accountBtn && logoutBtn) {
                accountBtn.removeEventListener('click', uncheckMenu);
                logoutBtn.removeEventListener('click', uncheckMenu);
            }
        };
    }, []);

    useEffect(() => {
        if (!socket) return;

        socket.on('profileUnliked', (data) => {
            setUnlikeAnimations(current => [...current, { id: Date.now() }]);
        })

        return (() => {
            socket.off('profileUnliked')
        })
    }, [socket])

    useEffect(() => {
        const interval = setInterval(() => {
            setUnlikeAnimations(current =>
                current.filter(a => Date.now() - a.id < 1500)  // Remove after 1.5 seconds
            );
        }, 100);

        return () => clearInterval(interval);
    }, []);


    return (
        <div className="w-full h-full bg-gradient-to-r-main">
            <h1 className="absolute top-1/2 -translate-y-1/2 left-5 text-5xl cursor-pointer" onClick={() => {
                if (pathname === '/')
                    window.location.reload();
                else
                    router.push('/');
            }}>Matcha</h1>

            {
                user?.date_of_birth && !anotherConnection && (
                    <div className="flex justify-center gap-1 gap-2 sm:gap-8 absolute top-0 right-0 h-full items-center">
                        { pathname !== '/' && (
                            <button className="relative" onClick={() => {
                                window.location.href = '/'
                            }}>
                                <img className="w-12 h-12 mr-4 sm:mr-0" src="/message2.svg" alt="message" />
                                {newMessageArrived && <div className="w-2 h-2 bg-rose-500 rounded-full absolute top-2 left-9"></div>}
                            </button>
                        )}
                        { pathname === '/' && (
                            <>
                                <div ref={visitListRef} className="popup-container">
                                    {visitNotification && <div className="absolute w-2 h-2 border-1 rounded-full bg-rose-500 right-2 top-2"></div>}
                                    <button className="popup-button" onClick={() => {
                                        visitNotification && toggleVisitNotification();
                                    }}>
                                        u
                                    </button>
                                    <div className="popup-content">
                                        <InteractionPopup typeStr="visit" profiles={visits} onClickOpenListButton={() => {
                                            toggleVisitsList(true);
                                            const activeElement = document.activeElement;
                                            if (visitListRef.current && visitListRef.current.contains(activeElement))
                                                activeElement.blur();
                                        }} isThisOpen={visitListRef.current?.contains(document.activeElement) || false}/> 
                                    </div>
                                </div>
                                <div ref={likeListRef} className="popup-container">
                                    {likeNotification && <div className="absolute w-2 h-2 border-1 rounded-full bg-rose-500 right-2 top-2"></div>}
        
                                    <button className="popup-button" onClick={() => {
                                        likeNotification && toggleLikeNotification();
                                    }}>
                                        y
                                    </button>
                                    <div className="popup-content">
                                        <InteractionPopup typeStr="like" profiles={likes} onClickOpenListButton={() => {
                                            toggleLikesList(true);
                                            const activeElement = document.activeElement;
                                            if (likeListRef.current && likeListRef.current.contains(activeElement))
                                                activeElement.blur();
                                        }} isThisOpen={likeListRef.current?.contains(document.activeElement) || false} />
                                    </div>
                                    {unlikeAnimations.map(animation => (
                                        <span key={animation.id} className="like-animation">
                                            -1
                                        </span>
                                    ))}
                                </div>
                            
                            </>
                            

                        ) }
    
                        <div className="relative h-full flex-wrap flex py-1 ">
                            <input ref={menuToggleRef} className="hidden" id="menu-toggle" type="checkbox" />
                            <label className='menu-toggle duration-200 flex flex-wrap h-full w-full px-2 mr-3 sm:mr-4 sm:ml-6 rounded-3xl cursor-pointer' htmlFor="menu-toggle">
                                <div className="flex items-center">
                                    <img className="w-14 h-14 object-cover rounded-full select-none" src={`${process.env.NEXT_PUBLIC_API_URL}/${user.pictures[0]}`} alt="profile" />
                                </div>
                            </label>
                            <div className="menu-items">
                                <button ref={accountBtnRef} onClick={() => router.push('/account')}>Account</button>
                                <button ref={logoutBtnRef} className="rounded-b-lg" onClick={logout}>Logout</button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div>
    )
}
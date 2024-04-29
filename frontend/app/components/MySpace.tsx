"use client"

import React, { useState, useEffect } from 'react'

import Chat from "./Chat"
import Match from "./Match"
import ChatRoom from './ChatRoom'
import Profile from './Profile'
import { useAuth } from "../auth/AuthProvider"
import Details from './Details'
import "./MySpace.css"

const testChat = [
    {
        id: 1,
        users: [
            {
                id: 42,
                name: "Toto",
                img: "/toto.jpg"
            }, {
                id: 7,
                name: "Michelle",
                img: "/girl.jpeg"
            }
        ],
        messages: [
            {
                id: 1,
                content: "Salut",
                senderId: 7,
                receiverId: 42
            }, {
                id: 2,
                content: "Tu fais quoi ce soir?",
                senderId: 7,
                receiverId: 42
            }
        ]
    }, {
        id: 2,
        users: [
            {
                id: 42,
                name: "Toto",
                img: "/toto.jpg"
            }, {
                id: 7,
                name: "Léna",
                img: "/lena.png"
            }
        ],
        messages: [
            {
                id: 405,
                content: 'asodijaisodjaosdjioasdjiosioadoiasdoajoidjadasdsadsasadadasdasd',
                senderId: 7,
                receiverId: 42
            }
        ]
    }
]

export default function MySpace() {
    const { user } = useAuth();
    const [isProfileReady, setProfileReady] = useState(false);

    const [currentChatRoom, setCurrentChatRoom] = useState<number | null>(null);
    const [currentProfile, setCurrentProfile] = useState<any | null>(null); // set type later

    useEffect(() => {
        // TODO should fix authprovider
        console.log('here we go', user)
        if (!user?.date_of_birth) return;
        setProfileReady(true);
    }, [user])

    return isProfileReady ? (
        <div className="w-full h-full flex fixed overflow-hidden">
            <div className="w-1/4 relative">
                <Chat rooms={testChat} setCurrentRoom={setCurrentChatRoom} setCurrentProfile={setCurrentProfile}/>
            </div>
            <div className="w-3/4 relative">
                <Match setCurrentProfile={setCurrentProfile} />
            </div>

            {currentChatRoom !== null && (
                <div className="absolute top-0 right-0 w-[72.5%] h-full bg-white z-10 slide-in-right">
                    <ChatRoom room={testChat.filter(room => room.id === currentChatRoom)[0]} 
                        setCurrentRoom={setCurrentChatRoom} setCurrentProfile={setCurrentProfile}/>
                </div>
            )}
            {currentProfile !== null && (
                <div className="absolute top-0 right-0 w-[72.5%] h-full bg-white z-10 flex justify-center slide-in-right">
                    <Profile profile={currentProfile} setCurrentProfile={setCurrentProfile}/>
                </div>
            )}
        </div>
    ) : (
        <div className="w-full h-full">
            <Details />
        </div>
    )
}
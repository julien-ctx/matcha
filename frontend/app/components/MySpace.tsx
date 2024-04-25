"use client"

import React, { useState, useEffect } from 'react'

import Chat from "./Chat"
import Match from "./Match"
import ChatRoom from './ChatRoom'
import Profile from './Profile'
import { useAuth } from "../auth/AuthProvider"
import Details from './Details'

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
        messages: []
    }
]

export default function MySpace() {
    const { user } = useAuth();
    const [isProfileReady, setProfileReady] = useState(false);

    const [currentChatRoom, setCurrentChatRoom] = useState<number | null>(null);
    const [currentProfile, setCurrentProfile] = useState<any | null>(null); // set type later

    useEffect(() => {
        if (!user?.date_of_birth) return;
        setProfileReady(true);
    }, [user])

    return isProfileReady ? (
        <div className="w-full h-full flex">
            <Chat rooms={testChat} setCurrentRoom={setCurrentChatRoom} setCurrentProfile={setCurrentProfile}/>
            <Match setCurrentProfile={setCurrentProfile} />

            {currentChatRoom !== null && (
                <div className="absolute top-0 right-0 w-3/4 h-full bg-white z-10">
                    <ChatRoom room={testChat.filter(room => room.id === currentChatRoom)[0]} 
                        setCurrentRoom={setCurrentChatRoom} setCurrentProfile={setCurrentProfile}/>
                </div>
            )}
            {currentProfile !== null && (
                <div className="absolute top-0 right-0 w-3/4 h-full bg-white z-10 flex justify-center">
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
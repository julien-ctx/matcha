"use client"

import React, { useState } from 'react'

import Chat from "./Chat"
import Match from "./Match"
import ChatRoom from './ChatRoom'


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
                name: "oui",
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
                name: "oui",
                img: "/oui.jpg"
            }
        ],
        messages: []
    }
]

export default function MySpace() {
    const [currentChatRoom, setCurrentChatRoom] = useState<number | null>(null);

    return (
        <div className="w-full h-full flex">
            <Chat rooms={testChat} setCurrentRoom={setCurrentChatRoom}/ >
            <Match />

            {currentChatRoom !== null && (
                <div className="absolute top-0 right-0 w-3/4 h-full bg-white">
                    <ChatRoom room={testChat.filter(room => room.id === currentChatRoom)} setCurrentRoom={setCurrentChatRoom}/>
                </div>
            )}
        </div>
    )
}
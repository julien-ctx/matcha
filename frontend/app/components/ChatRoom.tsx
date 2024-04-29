'use client'

import React, { useEffect, useRef, useState } from 'react';
import './ChatRoom.css';
import Modal from './Modal';

interface ChatRoomProp {
    room: any[],
    setCurrentRoom: (roomId: number | null) => void,
    setCurrentProfile: (profile: any) => void
}

const currentUserId = 42; //TODO redux

export default function ChatRoom({ room, setCurrentRoom, setCurrentProfile }: ChatRoomProp) {
    const [isModalOpen, setModalOpen] = useState(false);

    const [newMessage, setNewMessage] = useState('');
    const endOfMessagesRef = useRef(null);

    const sendMessage = () => {
        if (newMessage.trim()) {
            console.log("Sending message:", newMessage); // Implement your send message logic here
            setNewMessage('');
        }
    };

    const handleKeyDown = (event: React.KeyboardEvent) => {        
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            if (newMessage.trim() === '') return;
            sendMessage();
        }
    };

    useEffect(() => {
        endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [room.messages.length]); // This ensures the view scrolls down every time a new message is added

    return (
        <div className="flex flex-col h-full w-full pt-20">
            <div className="relative w-full h-14 bg-blue-50 flex items-center z-30 shadow-lg p-1">
                <div className="bg-blue-50 hover:brightness-95 rounded-full w-10 h-10">
                    <button onClick={() => setCurrentRoom(null)} className="w-full hover:brightness-90 h-full bg-gradient-to-r-main text-transparent bg-clip-text">
                        {/* &#8592; */}
                        &lt;
                    </button>

                </div>
                <div className="flex items-center h-full hover:brightness-95 bg-blue-50 pl-2 pr-4 cursor-pointer gap-1 rounded-2xl"
                    // TODO onClick={() => setCurrentProfile(room.users.find(user => user.id !== currentUserId))}
                >
                    <img className="h-10 w-10 object-cover rounded-full" src={room.users.find(user => user.id !== currentUserId)?.img} alt="mini-chat-profile" />
                    <h1 className="ml-2 bg-gradient-to-r-main text-transparent bg-clip-text text-2xl">{room.users.find(user => user.id !== currentUserId)?.name}</h1>
                </div>
                <button className="absolute right-6 h-10 w-10 bg-blue-50 hover:brightness-95 rounded-full aspect-square flex justify-center items-center"
                    onClick={() => setModalOpen(true)}>
                    <img className="h-5 w-5" src="three-dots.svg" alt="menu" />
                </button>
            </div>
            <div className="flex flex-col bg-slate-50 w-full" style={{height: "calc(100% - 3.5rem)"}}>
                <div className="flex flex-col gap-1 overflow-y-auto h-4/5 px-4 py-5 bg-white">
                    {room.messages.map(message => (
                        <div key={message.id} className={`message ${message.senderId === currentUserId ? 'own' : 'other'}`}>
                            {message.content}
                        </div>
                    ))}
                    <div ref={endOfMessagesRef} />
                </div>
                <div className="h-1/5 w-full p-4 flex gap-1">
                    <textarea
                        value={newMessage}
                        onChange={e => setNewMessage(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Type your message..."
                        className="h-full w-11/12 p-2 resize-none rounded-md"
                    />
                    <div className="h-full w-1/12 p-2 flex justify-center items-center">
                        <button onClick={sendMessage} className="bg-gradient-to-r-main px-5 py-2 rounded-lg text-lg hover:brightness-95 border-2 text-white">
                            Send
                        </button>
                    </div>
                </div>
            </div>

            <Modal
                isOpen={isModalOpen}
                onClose={() => setModalOpen(false)}
                >
                    <div className="flex flex-col">
                        <button>Report User</button>
                        <button>Leave Chat</button>
                    </div>
            </Modal>
        </div>
    )
}
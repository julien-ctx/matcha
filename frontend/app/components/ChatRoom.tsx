'use client'

import React, { useEffect, useRef, useState } from 'react';
import './ChatRoom.css';
import Modal from './Modal';

interface ChatRoomProp {
    room: any[],
    setCurrentRoom: (roomId: number | null) => void
}

const currentUserId = 42; //TODO redux

export default function ChatRoom({ room, setCurrentRoom }: ChatRoomProp) {
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
            <div className="relative w-full h-14 bg-blue-200 flex items-center">
                <button onClick={() => setCurrentRoom(null)} className="mr-4 p-3 px-4 hover:brightness-75 h-full bg-blue-500">
                    &#8592;
                </button>
                <img className="h-10 w-10 object-cover rounded-full" src={room.users.find(user => user.id !== currentUserId)?.img} alt="mini-chat-profile" />
                <h1 className="ml-2">{room.users.find(user => user.id !== currentUserId)?.name}</h1>
                <button className="absolute right-4 h-full"
                    onClick={() => setModalOpen(true)}>
                    <img className="h-5 w-5" src="three-dots.svg" alt="menu" />
                </button>
            </div>
            <div className="flex flex-col bg-red-300 w-full" style={{height: "calc(100% - 3.5rem)"}}>
                <div className="overflow-y-auto h-4/5 bg-yellow-500">
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
                        placeholder="Type a message..."
                        className="h-full w-11/12"
                    />
                    <div className="h-full w-1/12 p-2 flex justify-center items-center">
                        <button onClick={sendMessage} className="bg-white w-full h-full">
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
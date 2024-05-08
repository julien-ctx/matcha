'use client'

import React, { useEffect, useRef, useState } from 'react';
import './ChatRoom.css';
import Modal from './Modal';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';

interface ChatRoomProp {
    room: any[],
    typing: boolean,
    setTypingMap: (typingMap: any) => void,
    setCurrentRoom: (roomId: number | null) => void,
    setCurrentProfile: (profile: any) => void
}

enum ModalState {
    ReportOrLeave,
    ReportDetail,
    AreYouSure,
    Confirmation
}

const reportReasons = [
    'Inappropriate content',
    'Spam',
    'Harassment',
    'Fake Profile',
    'Other'
];
export default function ChatRoom({ room, typing, setTypingMap, setCurrentRoom, setCurrentProfile }: ChatRoomProp) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [otherProfile, setOtherProfile] = useState(null);
    const { user, httpAuthHeader, socket } = useAuth();
    const [modalState, setModalState] = useState(ModalState.ReportOrLeave);
    const [reportRes, setReportRes] = useState('');

    function fetchProfile(userId: number) {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profile/details/${userId}`, httpAuthHeader)
            .then(response => {
                console.log("Profile fetched successfully", response.data);
                setOtherProfile(response.data);
            }).catch(error => {
                console.error(error)
            })
    }

    useEffect(() => {
        fetchProfile(room.other_user.id)
    }, [])

    const [newMessage, setNewMessage] = useState('');
    const endOfMessagesRef = useRef(null);

    useEffect(() => {
        console.log(typing, newMessage)
        if (typing === false && newMessage.trim().length > 0) {
            socket.emit('typing', {
                chatroomId: room.id
            })
            setTypingMap(prev => {
                const newMap = new Map(prev);
                newMap.set(room.id, true);
                return newMap;
            })
        }
        if (typing === true && newMessage.trim().length === 0) {
            socket.emit('stopTyping', {
                chatroomId: room.id
            })
            setTypingMap(prev => {
                const newMap = new Map(prev);
                newMap.set(room.id, false);
                return newMap;
            })
        }

    }, [newMessage, typing])

    const sendMessage = () => {
        if (!socket) return;
        if (newMessage.trim()) {
            console.log("Sending message:", newMessage);
            socket.emit('sendMessage', {
                senderId: user.id,
                recipientId: room.other_user.id,
                content: newMessage
            }, (res) => {
                console.log('message sent', res);
            })
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

    function handleReport(reportType: string) {
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/social/report/${room.other_user.id}`, {
            reason: reportType
        }, httpAuthHeader)
            .then((res) => {
                console.log('report res', res.data);
                setReportRes(res.data.message);
                setModalState(ModalState.Confirmation);
            }).catch((err) => {
                if (err.response) {
                    setReportRes(err.response.data.message);
                    setModalState(ModalState.Confirmation);
                }
            })
    }

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
                    onClick={() => setCurrentProfile(otherProfile)}
                >
                    <img className="h-10 w-10 object-cover rounded-full" src={`${process.env.NEXT_PUBLIC_API_URL}/${room.other_user.profile_picture}`} alt="mini-chat-profile" />
                    <h1 className="ml-2 bg-gradient-to-r-main text-transparent bg-clip-text text-2xl">{room.other_user.first_name}</h1>
                </div>
                <button className="absolute right-6 h-10 w-10 bg-blue-50 hover:brightness-95 rounded-full aspect-square flex justify-center items-center"
                    onClick={() => setModalOpen(true)}>
                    <img className="h-5 w-5" src="three-dots.svg" alt="menu" />
                </button>
            </div>
            <div className="flex flex-col bg-slate-50 w-full" style={{height: "calc(100% - 3.5rem)"}}>
                <div className="flex flex-col gap-1 overflow-y-auto h-4/5 px-4 py-5 bg-white">
                    {room.messages.map(message => (
                        <div key={message.id} className={`message ${message.sender_id === user.id ? 'own' : 'other'}`}>
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
                onClose={() => {
                    setModalOpen(false)
                    setModalState(ModalState.ReportOrLeave)
                }}
                >
                    <div className="p-4">
                    {modalState === ModalState.ReportOrLeave ? (
                        <div className="flex flex-col">
                            <button className="modal-button"
                                onClick={() => setModalState(ModalState.ReportDetail)}
                            >Report User</button>
                            <button className="modal-button"
                                onClick={() => setModalState(ModalState.AreYouSure)}
                            >Leave Chat</button>
                        </div>
                    ) : modalState === ModalState.ReportDetail ? (
                        <div className="flex flex-col">
                            {reportReasons.map(reason => (
                                <button 
                                    key={reason} 
                                    className="modal-button" 
                                    onClick={() => handleReport(reason)}
                                >
                                    {reason}
                                </button>
                            ))}
                        </div>
                    ) : modalState === ModalState.Confirmation ? ( 
                        <div className="flex flex-col">
                            <h2 className="w-full text-center text-lg">{reportRes}</h2>
                        </div>
                    ) : modalState === ModalState.AreYouSure ? (
                        <div className="flex flex-col justify-center items-center gap-3">
                            <p className="text-center text-lg">You will not be able to recover this chat and match if you leave. Are you sure?</p>
                            <div className="flex gap-1">
                                <button 
                                    onClick={() => {
                                        
                                    }}
                                className="px-4 rounded-md bg-white duration-100 hover:brightness-95 border-2 border-rose-500 text-rose-500">Yes</button>
                                <button 
                                    onClick={() => {
                                        setModalState(ModalState.ReportOrLeave)
                                        setModalOpen(false);
                                    }}
                                className="px-4 rounded-md bg-white duration-100 hover:brightness-95 border-2 border-rose-500 text-rose-500">No</button>
                            </div>
                        </div>
                    ) : null}
                    </div>
            </Modal>
        </div>
    )
}
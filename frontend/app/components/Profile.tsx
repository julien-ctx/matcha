'use client'

import { useEffect, useState } from 'react';
import { ProfileType } from './profileTypes'
import './Profile.css'
import Modal from './Modal';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import { calculAge, getTimeAgo } from '../utils';
import { useChat } from '../contexts/ChatContext';

interface ProfileProps {
    profile: ProfileType; 
    matchList: any[];
    setMatchList: (matchList: any[]) => void;
    setCurrentProfile: (profile: ProfileType | null) => void; 
    setCurrentChatRoom: (chatRoomId: number | null) => void;
    setChatRoomList: (chatRoomList: any) => void;
    setProfiles: (profiles: any) => void;
}

export default function Profile({ profile, matchList, setMatchList, setCurrentProfile, setCurrentChatRoom, setChatRoomList, setProfiles }: ProfileProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);
    const [firstMessageModalOpen, setFirstMessageModalOpen] = useState<boolean>(false);
    const [deleteConfirmModalOpen, setDeleteConfirmModalOpen] = useState<boolean>(false);
    const [blockConfirmModalOpen, setBlockConfirmModalOpen] = useState<boolean>(false);
    const { socket, user, httpAuthHeader, token } = useAuth();
    const [message, setMessage] = useState<string>('');

    const { setChatRoomErrorModalOpen } = useChat();

    function prevImage() {
        if (currentImageIndex === 0) return;

        setCurrentImageIndex((prevIndex) => (prevIndex - 1));
    }

    function nextImage() {
        if (currentImageIndex === profile.pictures.length - 1) return;

        setCurrentImageIndex((prevIndex) => (prevIndex + 1));
    };

    return (
        <div className="relative w-full h-full lg:pl-14 px-5 pt-40 lg:pt-20 profil-container overflow-y-auto flex flex-col lg:flex-row items-center gap-4">
            <div className="absolute top-24 duration-100 w-12 h-12 rounded-full left-1 text-4xl font-jersey20 hover:brightness-90 bg-white border-2">
                <button onClick={() => setCurrentProfile(null)} className="w-full h-full bg-gradient-to-r-main text-transparent bg-clip-text">
                    &lt;
                </button>
            </div>
            <button 
                onClick={() => {
                    setBlockConfirmModalOpen(true);
                }}
                className="border-2 flex justify-center items-center absolute top-24 right-2 lg:top-[92%] lg:left-1 bg-slate-50 duration-150 hover:brightness-105 rounded-full w-12 h-12">
                <img className="w-8 h-8" src="/block.svg" alt="block" />
            </button>

            <div className="flex w-full h-[28rem] lg:w-[35%] lg:h-[80%] justify-center rounded-xl bg-slate-900 ">

                <div className="relative w-full h-[28rem] lg:h-full border-4 border-orange-50 rounded-xl cursor-pointer"
                    onClick={() => {
                        setCurrentProfile(profile);
                    }}>
                    {
                    profile.pictures.map((img, index) => {
                        return (<img 
                            key={index} 
                            src={`${process.env.NEXT_PUBLIC_API_URL}/${img}`} 
                            alt={profile.first_name}
                            className={`absolute top-0 w-full rounded-2xl h-[28rem] lg:h-full object-cover duration-250 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} 
                        />)
                    })}
                    <button
                        onClick={prevImage}
                        className="photoButton left-1"
                    >
                        &lt;
                    </button>

                    <button 
                        onClick={nextImage}
                        className="photoButton right-1"
                    >
                        &gt;
                    </button>

                    {matchList.find(match => match.id === profile.id) &&
                        <div className="flex gap-2 absolute bottom-4 left-1/2 -translate-x-1/2">
                            <button 
                                onClick={() => setFirstMessageModalOpen(true)}
                                className="bg-rose-400 rounded-full w-16 flex justify-center items-center aspect-square border-2 hover:brightness-90">
                                <img className="w-9 h-9" src="/message.svg" alt="message" />
                            </button>
                            <button 
                                onClick={() => setDeleteConfirmModalOpen(true)}
                                className="bg-rose-400 rounded-full flex p-3 border-2 hover:brightness-90 justify-center items-center">
                                <p className="font-mono text-3xl text-white w-9 h-9">X</p>
                            </button>
                        </div>
                    }
                </div>
            </div>

            <div className="bg-gradient-to-r-main lg:h-[98%] w-full lg:w-3/5 rounded-xl flex p-4">
                <div className="bg-slate-50 p-2 rounded-xl lg:p-2 w-full min-h-full overflow-y-auto flex flex-wrap gap-1 border-2">
                    <div className="flex h-24 gap-1 w-full">
                        <div className="infoBox w-1/4">
                            <h1 className="infoTitle">Name</h1>
                            {profile.first_name}
                        </div>
                        <div className="infoBox w-1/4">
                            <h1 className="infoTitle">Gender</h1>
                            {profile.gender}
                        </div>
                        <div className="infoBox w-1/4">
                            <h1 className="infoTitle">Age</h1>
                            {calculAge(profile.date_of_birth)}
                        </div>
                        <div className="infoBox w-1/4">
                            <h1 className="infoTitle">Status</h1>
                            <p className={`text-sm text-nowrap ${profile.is_online && "text-green-400"}`}>
                            {profile.is_online ? 'Online Now' : getTimeAgo(profile.last_login)}
                            </p>
                        </div>
                    </div>
                    <div className="flex-wrap min-h-44 border-4 rounded-md relative pb-20 py-7 px-4 text-lg w-full">
                        <h1 className="infoTitle ">Bio</h1>
                        <p className="break-normal w-full break-all">
                            {profile.bio}

                        </p>
                    </div>
                    <div className="flex h-32 gap-1 w-full">
                        <div className="infoBox w-3/5 h-full">
                            <h1 className="infoTitle">Fame Rating</h1>
                            <div className="flex w-full">
                            {[...Array(5)].map((_, i) => {
                                const imagePath = i < Math.floor(profile.fame_rating / 20) + 1 ? "/star_color.svg" : "/star_gray.svg";
                                return <img className="w-1/5" key={i} src={imagePath} alt={i < profile.fame_rating ? "Color Star" : "Gray Star"} />;
                            })}
                            </div>
                        </div>
                        <div className="flex flex-col w-2/5 h-full gap-1 items-center justify-center">
                            <div className="infoBox-2 w-full">
                                <h1 className="infoTitle-2">City</h1>
                                {profile.city}, {profile.country}
                            </div>
                            <div className="infoBox-2 w-full">
                                <h1 className="infoTitle-2">Distance</h1>
                                {Math.round(profile.distance)} km
                            </div>
                        </div>
                    </div>
                    <div className="flex h-24 w-full border-4 relative rounded-md items-center">
                        <h1 className="infoTitle">tags</h1>
                        <div className="flex flex-wrap gap-1 px-2">
                            {profile.tags.map((tag, index) => (
                                <div key={`tag-${index}`} className="bg-gradient-to-r-main rounded-lg text-white py-0 px-2">
                                    {tag}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <Modal isOpen={firstMessageModalOpen}
                onClose={() => setFirstMessageModalOpen(false)}>
                <div className="w-full flex flex-col">
                    <h1 className="text-3xl">Send the first message!</h1>
                    <form className="flex gap-1" action="">
                        <input 
                            type="textarea"
                            className="w-full rounded-md bg-slate-100 p-2"
                            placeholder="Type your message here..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                        />
                        <button className=" bg-gradient-to-r-main text-white rounded-md px-3 border-1 "
                            onClick={(e) => {
                                e.preventDefault();
                                if (message.trim() === '') return;
                                socket?.emit('sendMessage', {
                                    content: message,
                                    senderId: user?.id,
                                    recipientId: profile.id
                                }, (res) => {
                                    if (res.success) {
                                        setCurrentProfile(null);
                                        setMatchList(list => list.filter(match => match.id !== profile.id));
                                    }
                                    else if (!res.success && res.errorCode === 'NO_MATCH_FOUND') {
                                        setChatRoomErrorModalOpen(true);
                                    }

                                })
                            }}
                        >Send</button>
                    </form>
                </div>
            </Modal>
                            
            <Modal
                isOpen={deleteConfirmModalOpen}
                onClose={() => setDeleteConfirmModalOpen(false)}
            >
                <div className="w-full flex flex-col items-center">
                    <h1 className="text-2xl w-full text-center">Are you sure you want to delete this profile from match?</h1>
                    <div className="flex gap-1">
                        <button className="bg-white text-rose-500 border-rose-500 rounded-md px-3 hover:brightness-95 duration-100 border-1"
                            onClick={() => {
                                axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/social/match/`, {
                                    data: {
                                        firstUserId: user?.id,
                                        secondUserId: profile.id
                                    },
                                    headers: {
                                        Authorization: `Bearer ${token}`
                                    }
                                })
                                .then(response => {
                                    setCurrentProfile(null);
                                    setMatchList(matchList.filter(match => match.id !== profile.id));
                                    setCurrentChatRoom(null);
                                    setChatRoomList((prevChatRoomList) => prevChatRoomList.filter(chatRoom => chatRoom.other_user.id !== profile.id))
                                    setDeleteConfirmModalOpen(false);
                                }).catch(error => {
                                    console.error(error)
                                }
                                )
                                
                            }}
                        >Yes</button>
                        <button className="bg-white text-rose-500 border-rose-500 rounded-md px-3 hover:brightness-95 duration-100 border-1"
                            onClick={() => setDeleteConfirmModalOpen(false)}
                        >No</button>
                    </div>
                </div>
            </Modal>

            <Modal
                isOpen={blockConfirmModalOpen}
                onClose={() => setBlockConfirmModalOpen(false)}
            >
                <div className="w-full flex flex-col items-center">
                    <h1 className="text-2xl w-full text-center">Are you sure you want to block this profile?</h1>
                    <div className="flex gap-1 mt-3">
                        <button className="bg-white text-rose-500 border-rose-500 rounded-md px-3 hover:brightness-95 duration-100 border-1"
                            onClick={() => {
                                axios.post(`${process.env.NEXT_PUBLIC_API_URL}/social/block/${profile.id}`, {}, httpAuthHeader)
                                .then(response => {
                                    setCurrentProfile(null);
                                    setMatchList(matchList.filter(match => match.id !== profile.id));
                                    setCurrentChatRoom(null);
                                    setChatRoomList((prevChatRoomList) => prevChatRoomList.filter(chatRoom => chatRoom.other_user.id !== profile.id))
                                    setProfiles((prevProfiles) => prevProfiles.filter(p => p.id !== profile.id))
                                    setBlockConfirmModalOpen(false);
                                }).catch(error => {
                                    console.error(error)
                                })                                            
                            }}
                        >Yes</button>
                        <button className="bg-white text-rose-500 border-rose-500 rounded-md hover:brightness-95 duration-100 px-3 border-1"
                            onClick={() => setBlockConfirmModalOpen(false)}
                        >No</button>
                    </div>
                </div>
            </Modal>

        </div>
    )
}
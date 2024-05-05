"use client"

import React, { useState } from 'react'
import { useAuth } from "../auth/AuthProvider"
import Modal from "./Modal";

interface InteractionPopupProps {
    typeStr: string,
    profiles: any[], //TODO
    onClickButton: (open: boolean) => void
}

export default function InteractionPopup({ typeStr, profiles, onClickButton }: InteractionPopupProps) {
    const { user } = useAuth();
    const [isPremiumModalOpen, setPremiumModalOpen] = useState(false);

    return (
        <div>
            { user ? 
                <>
                    <h1 className="flex w-full text-2xl pl-2 border-b-2 border-slate-200">{typeStr}s</h1>
                    <div className="flex items-center h-20 border-2 bg-slate-50 px-2 gap-1 mt-2 rounded-xl">
                        <div className="bg-gradient-to-r-main rounded-fullhover:brightness-95 px-4 py-1 text-white rounded-2xl flex items-center justify-center ">
                            <p className="text-xl">
                                {profiles.length < 10 ? profiles.length : Math.min(Math.ceil(profiles.length / 5) * 5, 99)}
                            </p>
                            <p className="font-yarndings12 ">
                                y
                            </p>
                        </div>
                        <div className="relative w-full h-full flex items-center">
                            {profiles.slice(0, 5).map((profile, index) => (
                                <img 
                                    key={profile.id} 
                                    src={profile.pictures[0]} 
                                    alt="profile" 
                                    className="w-12 h-12 object-cover rounded-full absolute top-1/2 -translate-y-1/2 border-2 border-red-200"
                                    style={{
                                        left: `${index * 20}px`,
                                        zIndex: `${profiles.length - index}`,
                                        filter: `blur(${Math.min(Math.round(index) * 0.5 + (user.isPremium ? 0 : 5), 5)}px)`,
                                        
                                    }}
                                />
                            ))}
                            {profiles.length === 0 && <p className="text-lg py-3 ml-5">No {typeStr.toLowerCase()} yet!</p>}
                        </div>
                    </div>
                    <button className="mt-2 bg-gradient-to-r-main rounded-full hover:brightness-95 w-16 h-10 text-white right-0 border-2"
                        onClick={() => {
                            user.isPremium ? onClickButton(true) : setPremiumModalOpen(true);
                        }}>See all</button>
                </>
                : null
            }
            <Modal isOpen={isPremiumModalOpen} onClose={() => setPremiumModalOpen(false)}>
                <div className="flex flex-col p-5 min-h-64">
                    <h1>Join Premium ! TODO</h1> 

                    <div className="flex flex-col gap-1">
                        <button className="bg-gradient-to-r-main text-white px-4 py-2 text-lg rounded-lg" onClick={() => {
                            // TODO isPremiumOn and refresh the page
                        }}>Try Premium</button>
                        <button className="border-rose-500 text-rose-500 border-2 px-4 py-2 text-lg rounded-lg" onClick={() => setPremiumModalOpen(false)}>Maybe later</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
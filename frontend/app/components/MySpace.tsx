"use client"

import React, { useState, useEffect } from 'react'

import Chat from "./Chat"
import Match from "./Match"
import ChatRoom from './ChatRoom'
import Profile from './Profile'
import { useAuth } from "../auth/AuthProvider"
import Details from './Details'
import "./MySpace.css"
import { useUI } from '../contexts/UIContext'
import InteractionList from './InteractionList'
import axios from 'axios'
import Verify from './Verify'

enum SpaceState {
    LOADING,
    READY,
    DETAIL,
    VERIFY
}

export default function MySpace() {
    const { httpAuthHeader, user } = useAuth();
    const { showLikesList, showVisitsList, toggleLikesList, toggleVisitsList } = useUI();
    const [spaceState, setSpaceState] = useState(SpaceState.LOADING);

    const [currentChatRoom, setCurrentChatRoom] = useState<number | null>(null);
    const [currentProfile, setCurrentProfile] = useState<any | null>(null); // set type later
    const [matchList, setMatchList] = useState<any[]>([]);
    const [chatRoomList, setChatRoomList] = useState<any[]>([]);

    useEffect(() => {
        console.log('user', user)
        if (!user) return;
        // if (!user.account_verified)
        //     setSpaceState(SpaceState.VERIFY);
        //else 
        if (!user?.date_of_birth)
            setSpaceState(SpaceState.DETAIL)
        else
            setSpaceState(SpaceState.READY);
    }, [user])

    function fetchMatches() {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/social/matches`, httpAuthHeader).then(response => {
            console.log('matches', response.data)
            setMatchList(response.data)
        }).catch(error => {
            console.error(error)
        })
    }

    function fetchChatRooms() {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/social/chatrooms`, httpAuthHeader).then(response => {
            console.log('chats', response.data)
            setChatRoomList(response.data)
        }).catch(error => {
            console.error(error)
        })
    }

    useEffect(() => {
        if (!user) return;

        fetchMatches();
        fetchChatRooms();
    }, [user])

    return spaceState === SpaceState.READY ? (
        <div className="w-full h-full flex fixed overflow-hidden">
            <div className="w-1/4 relative">
                <Chat rooms={chatRoomList} matchList={matchList} setCurrentRoom={setCurrentChatRoom} setCurrentProfile={setCurrentProfile}/>
            </div>
            <div className="w-3/4 relative">
                <Match setCurrentProfile={setCurrentProfile} />
            </div>

            {showLikesList && (
                <div className="h-full absolute right-0 top-0 pt-24 w-[72.5%] flex justify-center" style={{zIndex: 999}}>
                    <InteractionList isLike={true} toggleShow={toggleLikesList} setCurrentProfile={setCurrentProfile} />
                </div>    
            )}

            {showVisitsList && (
                <div className="h-full absolute right-0 top-0 pt-24 w-[72.5%] flex justify-center" style={{zIndex: 999}}>
                    <InteractionList isLike={false} toggleShow={toggleVisitsList} setCurrentProfile={setCurrentProfile} />
                </div>    
            )}

            {currentChatRoom !== null && (
                <div className="absolute top-0 right-0 w-[72.5%] h-full bg-white z-10 slide-in-right">
                    <ChatRoom room={testChat.filter(room => room.id === currentChatRoom)[0]} 
                        setCurrentRoom={setCurrentChatRoom} setCurrentProfile={setCurrentProfile}/>
                </div>
            )}
            {currentProfile !== null && (
                <div className="absolute top-0 right-0 w-[72.5%] h-full bg-white z-10 flex justify-center slide-in-right">
                    <Profile profile={currentProfile} matchList={matchList} setMatchList={setMatchList} setCurrentProfile={setCurrentProfile}/>
                </div>
            )}
        </div>
    ) : spaceState === SpaceState.DETAIL ? (
        <div className="w-full h-full">
            <Details />
        </div>
    // ) : spaceState === SpaceState.VERIFY ? (
    //     <div className="w-full h-full flex justify-center">
    //         <Verify />
    //     </div>
    ) : null
}
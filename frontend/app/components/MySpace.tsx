"use client"

import React, { useState, useEffect } from 'react'

import Chat from "./Chat"
import Match from "./Match"
import ChatRoom from './ChatRoom'
import Profile from './Profile'
import { useAuth } from "../contexts/AuthContext"
import Details from './Details'
import "./MySpace.css"
import { useUI } from '../contexts/UIContext'
import InteractionList from './InteractionList'
import axios from 'axios'
import Verify from './Verify'
import AnotherConnection from './AnotherConnection'
import { useChat } from '../contexts/ChatContext'
import { useTab } from '../contexts/TabContext'

enum SpaceState {
    LOADING,
    READY,
    DETAIL,
    VERIFY
}

export default function MySpace() {
    const { chatRoomList, matchList, newMessageMap, setChatRoomList, setMatchList, setNewMessageMap, currentChatRoom, setCurrentChatRoom } = useChat();
    const { httpAuthHeader, user, socket } = useAuth();
    const { showLikesList, showVisitsList, toggleLikesList, toggleVisitsList } = useUI();
    const { tabActivated } = useTab();
    const [spaceState, setSpaceState] = useState(SpaceState.LOADING);
    const [typingMap, setTypingMap] = useState(new Map());
    const [profiles, setProfiles] = useState([]);
    
    const [currentProfile, setCurrentProfile] = useState<any | null>(null); // set type later

    const [showChatResponsive, setShowChatResponsive] = useState(false);

    function initTypingMap() {
        const initialTypingMap = new Map();
        chatRoomList.forEach(room => {
            initialTypingMap.set(room.id, false);
        });
    
        setTypingMap(initialTypingMap);
    }

    function initNewMessageMap(chatrooms) {
        const initialNewMessageMap = new Map();
        chatrooms.forEach(room => {
            initialNewMessageMap.set(room.id, room.unread_messages.length && room.unread_messages.some(msg => msg.recipient_id === user.id));
        });
        setNewMessageMap(initialNewMessageMap);
    }

    useEffect(() => {
        if (!user) return;
        if (!user.account_verified)
            setSpaceState(SpaceState.VERIFY);
        else if (!user?.date_of_birth)
            setSpaceState(SpaceState.DETAIL)
        else
            setSpaceState(SpaceState.READY);
    }, [user])

    function fetchMatches() {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/social/matches`, httpAuthHeader).then(response => {
            setMatchList(response.data)
        }).catch(error => {
            console.error(error)
        })
    }

    function fetchChatRooms() {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/social/chatrooms`, httpAuthHeader).then(response => {
            console.log('chatroom: ', response.data)
            // TODO sort by last message 
            const chatRoomSorted = response.data.sort((a, b) => {
                return new Date(b.updated_at) - new Date(a.updated_at);
            });
            setChatRoomList(chatRoomSorted)
            initTypingMap();
            initNewMessageMap(response.data);
        }).catch(error => {
            console.error(error)
        })
    }

    useEffect(() => {
        if (!user) return;

        fetchMatches();
        fetchChatRooms();
    }, [user])

    useEffect(() => {
        if (!socket) return;

        socket.on('userIsTyping', (data) => {
            if (data.userId === user.id) return;
            setTypingMap(prev => {
                const newMap = new Map(prev);
                newMap.set(data.chatroomId, true);
                return newMap;
            })

        })

        socket.on('userStoppedTyping', (data) => {
            if (data.userId === user.id) return;
            setTypingMap(prev => {
                const newMap = new Map(prev);
                newMap.set(data.chatroomId, false);
                return newMap;
            })

        })

        return (() => {
            socket.off('userIsTyping')
            socket.off('userStoppedTyping')
        })
    }, [socket, currentChatRoom])

    return !tabActivated ? (
           <AnotherConnection /> 
        )
        : spaceState === SpaceState.READY ? (
        <div className="w-full h-full flex relative overflow-hidden">
            <div className={`md:w-[27.5%] absolute left-0 top-0 md:block z-10 h-full w-full ${showChatResponsive ? 'block' : 'hidden'}`}>
                <Chat rooms={chatRoomList} typingMap={typingMap} newMessageMap={newMessageMap} matchList={matchList} setCurrentProfile={setCurrentProfile} setNewMessageMap={setNewMessageMap} setShowChatResponsive={setShowChatResponsive}/>
            </div>
            <div className="absolute w-full md:w-[72.5%] h-full right-0 top-0 z-0">
                <Match setCurrentProfile={setCurrentProfile} setMatchList={setMatchList} setShowChatResponsive={setShowChatResponsive} profiles={profiles} setProfiles={setProfiles} newMessageMap={newMessageMap}/>
            </div>

            {showLikesList && (
                <div className="h-full absolute right-0 top-0 pt-24 w-full md:w-[72.5%] flex justify-center" style={{zIndex: 999}}>
                    <InteractionList isLike={true} toggleShow={toggleLikesList} setCurrentProfile={setCurrentProfile} />
                </div>
            )}

            {showVisitsList && (
                <div className="h-full absolute right-0 top-0 pt-24 w-[72.5%] flex justify-center z-20" style={{zIndex: 999}}>
                    <InteractionList isLike={false} toggleShow={toggleVisitsList} setCurrentProfile={setCurrentProfile} />
                </div>    
            )}

            {currentChatRoom !== null && (
                <div className="absolute top-0 right-0 md:w-[72.5%] h-full bg-white z-10 w-full">
                    <ChatRoom room={chatRoomList.filter(room => room.id === currentChatRoom)[0]} 
                        otherTyping={typingMap.get(currentChatRoom)}
                        setCurrentRoom={setCurrentChatRoom} setCurrentProfile={setCurrentProfile}
                        setChatRoomList={setChatRoomList}    
                    />
                </div>
            )}
            {currentProfile !== null && (
                <div className="absolute top-0 right-0 w-full md:w-[72.5%] h-full bg-white z-10 flex justify-center z-30">
                    <Profile profile={currentProfile} matchList={matchList} setMatchList={setMatchList} setCurrentProfile={setCurrentProfile}
                        setCurrentChatRoom={setCurrentChatRoom} setChatRoomList={setChatRoomList} setProfiles={setProfiles}
                    />
                </div>
            )}
        </div>
    ) : spaceState === SpaceState.DETAIL ? (
        <div className="w-full h-full">
            <Details />
        </div>
    ) : spaceState === SpaceState.VERIFY ? (
        <div className="w-full h-full flex justify-center">
            <Verify />
        </div>
    ) : null
}
"use client"

import React, { useState, useEffect, createContext, useContext } from 'react'
import { useAuth } from '../auth/AuthProvider'

interface ChatContextType {
    chatRoomList: any,
    matchList: any,
    newMessageMap: any,
    currentChatRoom: number | null,
    setChatRoomList: any,
    setMatchList: any,
    setNewMessageMap: any,
    setCurrentChatRoom: any,
    newMessageArrived: boolean,
    setNewMessageArrived: any,
}

const ChatContext = createContext<ChatContextType | null>(null)

export const useChat = () => useContext(ChatContext)

export const ChatProvider = ({ children }: { children: React.ReactNode }) => {
    const { socket, user } = useAuth();

    const [chatRoomList, setChatRoomList] = useState<any>([])
    const [matchList, setMatchList] = useState<any>([])
    const [newMessageMap, setNewMessageMap] = useState<any>(new Map())
    const [currentChatRoom, setCurrentChatRoom] = useState<number | null>(null)
    const [newMessageArrived, setNewMessageArrived] = useState(false)

    useEffect(() => {
        if (!socket) return

        socket.on('newMessage', (data) => {
            setChatRoomList(prev => {
                setNewMessageArrived(true);
                if (data.isNewRoom) {
                    setMatchList(prev => prev.filter(match => match.id !== data.chatroomInfo.other_user.id))
                    return [...prev, data.chatroomInfo]
                } else {
                    const targetRoom = prev.find(room => room.id === data.chatroomId);
                    const otherRooms = prev.filter(room => room.id !== data.chatroomId);
        
                    if (!targetRoom) return prev;
                    
                    const updatedMessages = [...targetRoom.messages, data.message];
                    const updatedTargetRoom = { ...targetRoom, messages: updatedMessages };
      
                    return [updatedTargetRoom, ...otherRooms];
                }
            });
      
            if (data.chatroomId !== currentChatRoom && data.message.sender_id !== user.id) {
                setNewMessageMap(prev => {
                    const newMap = new Map(prev);
                    newMap.set(data.chatroomId, true);
                    return newMap;
                })
            }
        })

        return (() => {
            socket.off('newMessage');
        })
    }, [socket, currentChatRoom])

    return (
        <ChatContext.Provider value={{
            chatRoomList,
            matchList,
            newMessageMap,
            currentChatRoom,
            setChatRoomList,
            setMatchList,
            setNewMessageMap,
            setCurrentChatRoom,
            newMessageArrived,
            setNewMessageArrived,

        }}>
            {children}
        </ChatContext.Provider>
    )
}

import { useState, useEffect } from 'react';
import { useAuth } from '../auth/AuthProvider';
import './Chat.css';
import MatchList from './MatchList';
import { useChat } from '../contexts/ChatContext';

interface ChatRoomProp {
    rooms: any[],
    typingMap: any,
    newMessageMap: any,
    matchList: any[],
    setCurrentProfile: (profile: any) => void
    setNewMessageMap: (newMessageMap: any) => void
    setShowChatResponsive: (show: boolean) => void
}

export default function Chat({ rooms, typingMap, newMessageMap, matchList, setCurrentProfile, setNewMessageMap, setShowChatResponsive }: ChatRoomProp) {
    const { user } = useAuth();

    const { setCurrentChatRoom } = useChat();

    return (
        <div className="chat-container" style={{backgroundColor: "rgba(255, 255, 255, 0.8)"}}>
            <button className="md:hidden absolute right-5 text-3xl text-rose-400" style={{top: "5.6rem"}}
                onClick={() => setShowChatResponsive(false)}
            >X</button>
            {user && (
                <>
                <MatchList matches={matchList} setCurrentProfile={setCurrentProfile}/>
                <div className="w-full flex flex-col h-full">
                    <h1 className="bg-gradient-to-r-main text-transparent bg-clip-text px-4 py-3 text-3xl">Your messages</h1>
                    {
                        rooms.length > 0 ?
                            <ul className="flex flex-col overflow-y-scroll h-full">
                                {rooms.map(room => {
                                    const lastMessage = room.messages[room.messages.length - 1];

                                    return (
                                        <li key={room.id} className="chat-list relative"
                                            onClick={() => {
                                                setCurrentProfile(null);
                                                setCurrentChatRoom(room.id);
                                                if (newMessageMap.get(room.id) === true) {
                                                    setNewMessageMap(prev => {
                                                        const newMap = new Map(prev);
                                                        newMap.set(room.id, false);
                                                        return newMap;
                                                    });
                                                }
                                            }}>
                                            <img src={`${process.env.NEXT_PUBLIC_API_URL}/${room.other_user.profile_picture}`} alt={room.other_user.name} className="w-16 h-16 object-cover rounded-full mr-2"/>
                                            <div className="flex flex-col font-jersey15 w-3/5">
                                                <h2 className="text-xl">{room.other_user.first_name}</h2>
                                                    {typingMap.get(room.id) ? <p className="text-sm text-rose-500">Typing...</p> 
                                                    : <p className="text-md text-ellipsis text-nowrap max-w-full overflow-hidden">{lastMessage?.content}</p>
                                                }
                                            </div>
                                            {newMessageMap.get(room.id) &&
                                                <div className="w-3 h-3 absolute top-3 right-3 rounded-full bg-rose-500 border-1 border-red-200"></div>
                                            }    
                                        </li>
                                    );
                                })}
                            </ul>
                        :
                            <h1 className="text-center w-full text-neutral-400 mt-4">No chatrooms yet</h1>
                    }
                    
                </div>
                </>
            )}
        </div>
    )
}
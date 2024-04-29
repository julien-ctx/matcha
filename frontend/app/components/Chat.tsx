import './Chat.css';
import MatchList from './MatchList';

interface ChatRoomProp {
    rooms: any[],
    matchList: any[],
    setCurrentRoom: (roomId: number) => void
    setCurrentProfile: (profile: any) => void
}

const currentUserId = 42;

export default function Chat({ rooms, matchList, setCurrentRoom, setCurrentProfile }: ChatRoomProp) {
    return (
        <div className="chat-container" style={{backgroundColor: "rgba(255, 255, 255, 0.8)"}}>
            <MatchList matches={matchList} setCurrentMatch={setCurrentRoom} setCurrentProfile={setCurrentProfile}/>
            <div className="w-full flex flex-col">
                <h1 className="bg-gradient-to-r-main text-transparent bg-clip-text px-4 py-3 text-3xl">Your messages</h1>
                <ul className="flex flex-col ">
                    {rooms.map(room => {
                        const otherUser = room.users.find(user => user.id !== currentUserId);
                        const lastMessage = room.messages[room.messages.length - 1];

                        return (
                            <li key={room.id} className="chat-list"
                                onClick={() => {
                                    setCurrentProfile(null);
                                    setCurrentRoom(room.id);
                                }}>
                                <img src={otherUser?.img} alt={otherUser?.name} className="w-16 h-16 object-cover rounded-full mr-2"/>
                                <div className="flex flex-col font-jersey15 w-3/5">
                                    <h2 className="text-xl">{otherUser?.name}</h2>
                                    <p className="text-md text-ellipsis text-nowrap max-w-full overflow-hidden">{lastMessage?.content}</p>
                                </div>
                            </li>
                        );
                    })}
                </ul>
            </div>
        </div>
    )
}
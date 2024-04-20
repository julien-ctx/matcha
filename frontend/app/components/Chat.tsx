
interface ChatRoomProp {
    rooms: any[],
    setCurrentRoom: (roomId: number) => void
}

const currentUserId = 42;

export default function Chat({ rooms, setCurrentRoom }: ChatRoomProp) {
    return (
        <div className="h-full bg-green-300 w-1/4 min-w-48 pt-28">
            <ul>
                {rooms.map(room => {
                    const otherUser = room.users.find(user => user.id !== currentUserId);
                    const lastMessage = room.messages[room.messages.length - 1];

                    return (
                        <li key={room.id} className="flex items-center p-2 cursor-pointer hover:bg-green-200"
                            onClick={() => setCurrentRoom(room.id)}>
                            <img src={otherUser?.img} alt={otherUser?.name} className="w-10 h-10 rounded-full mr-2"/>
                            <div>
                                <h2 className="text-lg">{otherUser?.name}</h2>
                                <p className="text-sm">{lastMessage ? lastMessage.content : "No messages"}</p>
                            </div>
                        </li>
                    );
                })}
            </ul>

        </div>
    )
}
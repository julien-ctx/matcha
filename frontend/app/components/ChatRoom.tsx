interface ChatRoomProp {
    room: any[],
    setCurrentRoom: (roomId: number | null) => void
}

export default function ChatRoom({ room, setCurrentRoom }: ChatRoomProp) {
    return (
        <>
            <button onClick={() => setCurrentRoom(null)}>
                &#8592;
            </button>
            <h1>Chat Room</h1>
        </>
    )
}
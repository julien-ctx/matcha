import Chat from "./Chat"
import Match from "./Match"

export default function MySpace() {
    return (
        <div className="w-full h-full flex">
            <Chat />
            <Match />
        </div>
    )
}
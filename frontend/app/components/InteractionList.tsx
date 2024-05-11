import { useSocial } from "../contexts/SocialContext";
import './InteractionList.css';

interface InteractionListProps {
    isLike: boolean,
    toggleShow: (show: boolean) => void,
    setCurrentProfile: (profile: any) => void
}

export default function InteractionList({ isLike, toggleShow, setCurrentProfile }: InteractionListProps) {
    const { visits, likes } = useSocial();

    const profiles = isLike ? likes : visits;


    return ( 
        <div className="relative w-[95%] h-full overflow-y-auto rounded-t-2xl bg-white flex flex-col p-8 pt-16">
            <button className="text-gradient-main text-4xl sm:text-6xl absolute right-6 top-4 sm:top-2 font-jersey10" onClick={() => {
                toggleShow(false);
            }}>X</button>
            <div className="text-4xl sm:text-6xl flex gap-1 w-full justify-center mb-12 text-gradient-main">
                <h1>Your {isLike ? "Like" : "Visit"} List</h1>
                <p className="font-yarndings12">y</p>
            </div>
            <div className="grid grid-cols-4 w-full gap-4 relative">
                {
                    profiles.length === 0 ? <p className="text-xl text-center left-1/2 -translate-x-1/2 absolute text-gradient-main top-12">You have no {isLike ? "likes" : "visits"} yet!</p> :
                    profiles.map((profile) => (
                        <div className="w-full">
                            <div className="w-full cursor-pointer" onClick={() => {
                                setCurrentProfile(profile);
                            }}>
                                <img 
                                    key={profile.id} 
                                    src={profile.pictures[0]} 
                                    alt="profile" 
                                    className="w-full object-cover rounded-md border-2 border-red-200"
                                    style={{
                                        aspectRatio: '9/16'
                                    }}
                                />
                                {/* TODO name, age and distance */}
                            </div>
                        </div>
                ))}
            </div>
        </div>
    )
}
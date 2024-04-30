'use client'

import { useState } from 'react';
import { ProfileType } from './profileTypes'
import './Profile.css'
import InteractiveMap from './InteractiveMap';

interface ProfileProps {
    profile: ProfileType; 
    setCurrentProfile: (profile: ProfileType | null) => void; 
}

const initialTestProfiles = [
    {
        id: 1,
        name: "Danielle",
        age: 20,
        bio: 'je cherche un plan chaud',
        fameRating: 3,
        interests: ["Gaming", "Reading", "Coding"],
        distance: 10,
        pictures: [
            "/danielle1.jpeg",
            "/danielle2.jpeg"
        ]
    }, {
        id: 3,
        name: "Wonyoung",
        age: 20,
        bio: 'je cherche un plan serieux',
        fameRating: 4,
        interests: ["Gaming", "Reading", "Coding"],
        distance: 20,
        pictures: [
            "/wonyoung1.jpeg",
            "/wonyoung2.jpeg",
            "/wonyoung3.webp"
        ]
    }
]

export default function Profile({ profile, setCurrentProfile }: ProfileProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    console.log('here', profile)


    function prevImage() {
        if (currentImageIndex === 0) return;

        setCurrentImageIndex((prevIndex) => (prevIndex - 1));
    }

    function nextImage() {
        // if (currentImageIndex === profile.pictures.length - 1) return;
        if (currentImageIndex === initialTestProfiles[profile.id % 2].pictures.length - 1) return;

        setCurrentImageIndex((prevIndex) => (prevIndex + 1));
    };

    return (
        <div className="relative w-full h-full pl-14 px-5 pt-20 bg-white gap-2 overflow-y-auto flex items-center gap-4">
            <div className="absolute top-24 duration-100 w-12 h-12 rounded-full left-1 text-4xl font-jersey20 hover:brightness-90 bg-white border-2">
                <button onClick={() => setCurrentProfile(null)} className="w-full h-full bg-gradient-to-r-main text-transparent bg-clip-text">
                    &lt;
                </button>
            </div>

            <div className="flex w-2/5 h-[95%] justify-center rounded-xl bg-slate-900 ">

                <div className="relative w-full h-full border-[1rem] border-orange-200 rounded-xl cursor-pointer"
                    onClick={() => {
                        setCurrentProfile(profile);
                    }}>
                    {
                    //profile.pictures.map((img, index) => { // TODO when we get random images
                    initialTestProfiles[profile.id % 2].pictures.map((img, index) => (
                        <img 
                            key={index} 
                            src={img} 
                            alt={profile.first_name}
                            className={`absolute top-0 w-full rounded-2xl h-full object-cover duration-250 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} 
                        />
                    ))}
                    <button
                        onClick={prevImage}
                        className="photoButton left-1"
                    >
                        &lt;
                    </button>

                    <button 
                        onClick={nextImage}
                        className="photoButton right-1"
                    >
                        &gt;
                    </button>
                </div>
            </div>

            <div className="bg-gradient-to-r-main h-[98%] w-3/5 rounded-xl flex p-4">
                <div className="bg-slate-50 rounded-xl p-12 w-full min-h-full overflow-y-auto flex flex-wrap gap-1 border-2">
                    <div className="flex h-24 gap-1 w-full">
                        <div className="infoBox w-1/2">
                            <h1 className="infoTitle">Name</h1>
                            {profile.first_name}
                        </div>
                        <div className="infoBox w-1/4">
                            <h1 className="infoTitle">Age</h1>
                            {profile.age} TODO
                        </div>
                        <div className="infoBox w-1/4">
                            <h1 className="infoTitle">Status</h1>
                            {profile.is_online ? 'Online' : 'Offline'}
                        </div>
                    </div>
                    <div className="flex-wrap min-h-44 border-4 rounded-md relative pb-20 py-7 px-4 text-lg w-full">
                        <h1 className="infoTitle">Bio</h1>
                        {profile.bio}
                    </div>
                    <div className="flex h-32 gap-1 w-full">
                        <div className="infoBox w-3/5 h-full">
                            <h1 className="infoTitle">Fame Rating</h1>
                            {profile.fame_rating} // TODO
                        </div>
                        <div className="flex flex-col w-2/5 h-full gap-1 items-center justify-center">
                            <div className="infoBox-2 w-full">
                                <h1 className="infoTitle-2">City</h1>
                                {profile.city}, {profile.country}
                            </div>
                            <div className="infoBox-2 w-full">
                                <h1 className="infoTitle-2">Distance</h1>
                                {Math.round(profile.distance)} km
                            </div>
                        </div>
                    </div>
                    <div className="flex h-24 w-full border-4 relative rounded-md">
                        <h1 className="infoTitle">tags</h1>
                        <div className="flex flex-wrap gap-2 ">
                            {/* {profile.tags.map((interest, index) => (
                                <div key={index} className="bg-gradient-to-r-main rounded-full p-2 text-white">
                                    {interest}
                                </div>
                            ))} */}
                        </div>
                    </div>
                    <div className="w-full h-64 border-4 relative rounded-md">
                        <h1 className="infoTitle">User's position</h1>
                        <InteractiveMap />
                    </div>
                </div>
            </div>



        </div>
    )
}
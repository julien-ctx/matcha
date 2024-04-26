'use client'

import { useState } from 'react';
import { ProfileType } from './profileTypes'

interface ProfileProps {
    profile: ProfileType; 
    setCurrentProfile: (profile: ProfileType | null) => void; 
}


export default function Profile({ profile, setCurrentProfile }: ProfileProps) {
    const [currentImageIndex, setCurrentImageIndex] = useState<number>(0);

    function prevImage() {
        if (currentImageIndex === 0) return;

        setCurrentImageIndex((prevIndex) => (prevIndex - 1));
    }

    function nextImage() {
        if (currentImageIndex === profile.pictures.length - 1) return;

        setCurrentImageIndex((prevIndex) => (prevIndex + 1));
    };

    return (
        <div className="w-4/5 h-full px-8 pt-28 bg-green-500 gap-2 overflow-y-auto ">
            <button onClick={() => setCurrentProfile(null)} className="w-5 h-5 hover:brightness-75 bg-blue-500">
                &#8592;
            </button>

            <div className="flex w-full justify-center py-1 bg-black">

                <div className="relative max-h-[80%]  w-4/5 hover:brightness-90 cursor-pointer" style={{height: "32rem"}}
                    onClick={() => {
                        setCurrentProfile(profile);
                    }}>
                    {profile.pictures.map((img, index) => (
                        <img 
                            key={index} 
                            src={img} 
                            alt={profile.first_name}
                            className={`absolute top-0 w-full h-full object-cover duration-250 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} 
                        />
                    ))}
                    <button
                        onClick={prevImage}
                        className="absolute left-0 top-1/2 transform -translate-y-1/2 z-100 p-3 bg-blue-500"
                    >
                        &#9664;
                    </button>

                    <button 
                        onClick={nextImage}
                        className="absolute right-0 top-1/2 transform -translate-y-1/2 z-100 p-3 bg-blue-500"
                    >
                        &#9654;
                    </button>

                </div>
            </div>
            <div className="flex">
                <h1 className="text-2xl text-start w-full">{profile.first_name}, {profile.age}</h1>
            </div>
            <p>{profile.bio}</p>

            <div className="flex">
                <h1 className="text-2xl text-start w-full">{profile.first_name}, {profile.age}</h1>
            </div>
            <p>{profile.bio}</p>

            <div className="flex">
                <h1 className="text-2xl text-start w-full">{profile.first_name}, {profile.age}</h1>
            </div>
            <p>{profile.bio}</p>




        </div>
    )
}
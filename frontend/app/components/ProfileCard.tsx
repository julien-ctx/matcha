"use client"

import { useState } from 'react';

interface Profile {
    id: number,
    name: string;
    age: number;
    bio: string;
    fameRating: number,
    interests: string[],
    distance: number,
    img: string[];
}

export default function ProfileCard({ profile }: { profile: Profile }) {
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    function prevImage() {
        if (currentImageIndex === 0) return;

        setCurrentImageIndex((prevIndex) => (prevIndex - 1));
    }

    function nextImage() {
        if (currentImageIndex === profile.img.length - 1) return;

        setCurrentImageIndex((prevIndex) => (prevIndex + 1));
    };

    return (
        <div className="w-80 left-1/2 -translate-x-1/2 absolute h-full bg-white shadow-md rounded-lg p-2">
            <div className="relative w-full h-full">
                {profile.img.map((img, index) => (
                    <img 
                        key={index} 
                        src={img} 
                        alt={profile.name}
                        className={`absolute w-full h-full object-cover transition-opacity duration-250 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} 
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
                <div className="text-white absolute bottom-0 p-2 w-full bg-black h-1/6">
                    <h1 className="text-xl font-semibold">{profile.name}, {profile.age}</h1>
                    <p>{profile.bio}</p>
                </div>
            </div>
        </div>
    )
}
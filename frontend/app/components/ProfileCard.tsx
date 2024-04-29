"use client"

import { useState } from 'react';
import { ProfileType } from './profileTypes';
import axios from 'axios';
import './ProfileCard.css';

interface Props {
    profile: ProfileType,
    setCurrentProfile: (profile: ProfileType) => void;
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

export default function ProfileCard({ profile, setCurrentProfile }: Props){
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    function prevImage() {
        if (currentImageIndex === 0) return;

        setCurrentImageIndex((prevIndex) => (prevIndex - 1));
    }

    function nextImage() {
        // if (currentImageIndex === profile.pictures.length - 1) return; /// TODO when we get random images
        if (currentImageIndex === initialTestProfiles[profile.id % 2].pictures.length - 1) return;

        setCurrentImageIndex((prevIndex) => (prevIndex + 1));
    };

    return (
        <div className="w-80 left-1/2 -translate-x-1/2 absolute h-full bg-white shadow-md rounded-lg p-2 overflow-y-auto border-8">
            <div className="relative w-full h-full">
                <div className="w-full h-full hover:brightness-90 cursor-pointer duration-150 "
                    onClick={() => {
                        setCurrentProfile(profile);
                        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/social/view/${profile.id}`, {
                            headers: {
                                Authorization: `Bearer ${localStorage.getItem('jwt')}`
                            }
                        }).then(res => {
                            console.log(res.data);
                        }).catch(err => {
                            console.error(err);
                        }
                        )
                    }}>
                    {
                    //profile.pictures.map((img, index) => { // TODO when we get random images
                    initialTestProfiles[profile.id % 2].pictures.map((img, index) => (
                        <img 
                            key={index} 
                            src={img} 
                            alt={profile.first_name}
                            className={`absolute w-full h-full object-cover duration-250 ease-in-out ${index === currentImageIndex ? 'opacity-100' : 'opacity-0'}`} 
                        />
                    ))}
                </div>
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
                <div className="text-white absolute bottom-0 p-2 w-full bg-black h-1/6">
                    <h1 className="text-xl font-semibold">{profile.first_name}, {profile.age}</h1>
                    <p>{profile.bio}</p>
                </div>
            </div>
        </div>
    )
}
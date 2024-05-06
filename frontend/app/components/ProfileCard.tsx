"use client"

import { useState } from 'react';
import { ProfileType } from './profileTypes';
import axios from 'axios';
import './ProfileCard.css';
import { useAuth } from '../auth/AuthProvider';
import { calculAge } from '../utils';

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
        distance: 20,
        pictures: [
            "/wonyoung1.jpeg",
            "/wonyoung2.jpeg",
            "/wonyoung3.webp"
        ]
    }
]

export default function ProfileCard({ profile, setCurrentProfile }: Props){
    const { httpAuthHeader } = useAuth();
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
                <div className="w-full h-full hover:brightness-90 cursor-pointer duration-150 relative"
                    onClick={() => {
                        setCurrentProfile(profile);
                        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/social/view/${profile.id}`, {}, httpAuthHeader).then(res => {
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
                    <div className="text-white absolute bottom-0 p-2 explanationBox h-1/6 overflow-hidden w-full flex flex-col gap-2 justify-center">
                        <h1 className="text-2xl font-semibold text-ellipsis px-1 w-4/5">{profile.first_name}, {calculAge(profile.date_of_birth)}, {Math.round(profile.distance)}km</h1>
                    </div>
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
            </div>
        </div>
    )
}
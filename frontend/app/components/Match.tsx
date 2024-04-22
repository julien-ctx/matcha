"use client"

import React, { useState } from 'react'

import Modal from "./Modal"
import ProfileCard from "./ProfileCard"

const initialTestProfiles = [
    {
        id: 1,
        name: "Danielle",
        age: 20,
        bio: 'je cherche un plan chaud',
        fameRating: 3,
        interests: ["Gaming", "Reading", "Coding"],
        distance: 10,
        img: [
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
        img: [
            "/wonyoung1.jpeg",
            "/wonyoung2.jpeg",
            "/wonyoung3.webp"
        ]
    }
]

interface Props {
    setCurrentProfile: (profile: any) => void // bring profile type here later
}

export default function Match({ setCurrentProfile }: Props) {
    const [isModalOpen, setModalOpen] = useState(false);
    const [ageRange, setAgeRange] = useState({ min: 18, max: 99 });
    const [kmWithin, setKmWithin] = useState(50); // Default 50 km
    const [fameRating, setFameRating] = useState(1); // Default rating 1
    const [sameInterests, setSameInterests] = useState(false);

    const [profiles, setProfiles] = useState(initialTestProfiles);
    const [currentProfileIndex, setCurrentProfileIndex] = useState(initialTestProfiles.length - 1);

    const handleAgeMinChange = (event) => {
        setAgeRange({ ...ageRange, min: parseInt(event.target.value) });
    };

    const handleAgeMaxChange = (event) => {
        setAgeRange({ ...ageRange, max: parseInt(event.target.value) });
    };

    const handleDecision = (accept: boolean) => {
        // TODO send decision to backend

        setProfiles(currentProfiles => currentProfiles.filter((_, index) => index !== currentProfileIndex));
        setCurrentProfileIndex(prev => Math.max(0, prev - 1));
    };


    return (
        <div className="relative h-full bg-white w-3/4 min-w-48 flex justify-center items-center z-0 pt-20">
            <button className="absolute top-28 right-12" onClick={() => setModalOpen(true)}>
                <img className="w-14 h-14" src="parameters.svg" alt="parameters" />
            </button>
           
            <div className="h-4/5 relative bg-none" style={{width: "28rem"}}>
                <div className="absolute rounded-full bg-white w-40 h-40 -left-16 top-1/2 flex justify-center items-center">
                    <button className="text-7xl text-red-400" onClick={() => handleDecision(false)}>X</button>
                </div>
                <div className="absolute rounded-full bg-white w-40 h-40 -right-16 top-1/2 flex justify-center items-center">
                    <button className="text-7xl text-green-300" onClick={() => handleDecision(true)}>O</button>
                </div>
                {profiles.length > 0 ? (
                    <ProfileCard profile={profiles[currentProfileIndex]} setCurrentProfile={setCurrentProfile} />
                ) : (
                    <p>No more profiles</p>
                )}

            </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <div>
                    <h1>Parameters allo</h1>
                    <div>
                        <label>Age Range: {ageRange.min} - {ageRange.max}</label>
                        <input type="range" min="18" max="99" value={ageRange.min} onChange={handleAgeMinChange} />
                        <input type="range" min="18" max="99" value={ageRange.max} onChange={handleAgeMaxChange} />
                    </div>
                    <div>
                        <label>KM Within: {kmWithin} km</label>
                        <input type="range" min="1" max="500" value={kmWithin} onChange={(e) => setKmWithin(parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label>Fame Rating: {fameRating}</label>
                        <input type="range" min="1" max="5" value={fameRating} onChange={(e) => setFameRating(parseInt(e.target.value))} />
                    </div>
                    <div>
                        <label>
                            <input type="checkbox" checked={sameInterests} onChange={(e) => setSameInterests(e.target.checked)} />
                            Same Interests as Mine
                        </label>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={() => setModalOpen(false)}>Save</button>
                        <button onClick={() => setModalOpen(false)}>Close</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
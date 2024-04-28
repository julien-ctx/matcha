"use client"

import React, { useState, useEffect } from 'react'
import { ProfileType } from './profileTypes'

import Modal from "./Modal"
import ProfileCard from "./ProfileCard"
import axios from 'axios'

import './Match.css'


interface Props {
    setCurrentProfile: (profile: ProfileType) => void
}

export default function Match({ setCurrentProfile }: Props) {
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [ageRange, setAgeRange] = useState({ min: 18, max: 99 });
    const [kmWithin, setKmWithin] = useState(50); // Default 50 km
    const [fameRating, setFameRating] = useState(1); // Default rating 1
    const [sameInterests, setSameInterests] = useState(false);

    const [profiles, setProfiles] = useState([]);
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

    function browseProfile() {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/explore/browse`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }
            
        })
        .then((response) => {
            console.log('profiles: ', response.data)
            setProfiles(response.data);
        })
        .catch((error) => {
            console.error(error);
        });
    }

    useEffect(() => {
        sendLocation();
        browseProfile();
    }, [])

    function sendLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/details`, {
                        latitude,
                        longitude
                    }, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('jwt')}`
                        }
                    }).then(response => {
                        console.log("Location updated successfully", response.data);
                    }).catch(error => {
                        console.error("Error updating location", error);
                    });
                },
                error => {
                    console.error('Error getting location:', error);
                    axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/details`, {
                        latitude: 999,
                        longitude: 999
                    }, {
                        headers: {
                            Authorization: `Bearer ${localStorage.getItem('jwt')}`
                        }
                    }).then(response => {
                        console.log("Null location updated successfully", response.data);
                    }).catch(error => {
                        console.error("Error updating null location", error);
                    });

                }
            );
        } else {
            console.error('Geolocation is not supported by this browser.');
        }
    }

    const handleAgeMinChange = (event) => {
        setAgeRange({ ...ageRange, min: parseInt(event.target.value) });
    };

    const handleAgeMaxChange = (event) => {
        setAgeRange({ ...ageRange, max: parseInt(event.target.value) });
    };

    const handleDecision = (accept: boolean) => {
        // TODO Protection needed
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/social/${accept ? 'like' : 'unlike'}/${profiles[currentProfileIndex]?.id}`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }}).then(res => {
                console.log(res.data);
            }).catch(err => {
                console.error(err);
            }
        )

        setProfiles(currentProfiles => currentProfiles.filter((_, index) => index !== currentProfileIndex));
        setCurrentProfileIndex(prev => Math.max(0, prev - 1));
    };


    return (
        <div className="container h-full bg-white w-full flex justify-center items-center z-0 pt-20">
           
            <div className="h-4/5 relative bg-none" style={{width: "28rem"}}>
                <button className="absolute -top-8 right-20 bg-gray-200 hover:bg-red-300 duration-200 py-1 px-4 rounded-t-2xl" onClick={() => setModalOpen(true)}>
                    <div className="text-white flex gap-2 items-center justify-center">
                        <img className="w-5 h-5" src="parameters.svg" alt="parameters" />
                        <p>Settings</p>
                    </div>
                </button>
                <button className="likeOrNotButton text-red-400 bg-red-50 -left-16" onClick={() => handleDecision(false)}>X</button>
                <button className="likeOrNotButton text-green-300 bg-green-50 -right-16" onClick={() => handleDecision(true)}>O</button>
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
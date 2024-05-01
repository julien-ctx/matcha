"use client"

import React, { useState, useEffect } from 'react'
import { ProfileType } from './profileTypes'
import { Range, getTrackBackground } from 'react-range';


import Modal from "./Modal"
import ProfileCard from "./ProfileCard"
import axios from 'axios'

import './Match.css'
import { useAuth } from '../auth/AuthProvider';


interface Props {
    setCurrentProfile: (profile: ProfileType) => void
}

export default function Match({ setCurrentProfile }: Props) {
    const { user } = useAuth();
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [ageRange, setAgeRange] = useState([18, 99]);
    const [kmWithin, setKmWithin] = useState([20]);
    const [fameRatingRange, setFameRatingRange] = useState([1, 5]);
    const [tagsList, setTagsList] = useState([]);

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

    const handleDecision = (accept: boolean) => {
        // TODO Protection needed
        const token = localStorage.getItem('jwt');
        console.log('token:', token);
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/social/${accept ? 'like' : 'unlike'}/${profiles[currentProfileIndex]?.id}`, {}, {
            headers: {
                Authorization: `Bearer ${token}`
            }}).then(res => {
                console.log(res.data);
            }).catch(err => {
                console.error(err);
            }
        )

        setProfiles(currentProfiles => currentProfiles.filter((_, index) => index !== currentProfileIndex));
        setCurrentProfileIndex(prev => Math.max(0, prev - 1));
    };

    const handleTagChange = (tag: string) => {
        if (tagsList.includes(tag)) {
            setTagsList(tagsList.filter(t => t !== tag));
        } else {
            setTagsList([...tagsList, tag]);
        }
    }


    return (
        <div className="fixed top-0 right-0 container h-full w-[72.5%] z-0 pt-20 flex justify-center items-center">
                <div className="h-4/5 relative bg-none" style={{width: "28rem"}}>
                    <button className="absolute -top-8 right-20 bg-gray-200 hover:bg-red-300 duration-200 py-1 px-4 rounded-t-2xl" onClick={() => setModalOpen(true)}>
                        <div className="text-white flex gap-2 items-center justify-center">
                            <img className="w-5 h-5" src="parameters.svg" alt="parameters" />
                            <p>Settings</p>
                        </div>
                    </button>
                    <button className="likeOrNotButton text-red-400 bg-red-50 hover:brightness-105 -left-16" onClick={() => handleDecision(false)}>X</button>
                    <button className="likeOrNotButton text-green-300 bg-green-50 hover:brightness-105 -right-16" onClick={() => handleDecision(true)}>O</button>
                    {profiles.length > 0 ? (
                        <ProfileCard profile={profiles[currentProfileIndex]} setCurrentProfile={setCurrentProfile} />
                    ) : (
                        <p>No more profiles</p>
                    )}

                </div>

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <div className="flex flex-col items-center gap-2">
                    <h1 className="text-5xl mb-4 text-slate-800">Advanced Settings</h1>
                    <div className="parameter-section">
                        <h1 className="text-xl w-full text-left text-gradient-main">By Age</h1>
                        <div className="range-slider-wrapper ">
                            <Range
                                step={1}
                                min={18}
                                max={99}
                                values={ageRange}
                                onChange={(e) => setAgeRange(e)}
                                renderTrack={({ props, children }) => (
                                    <div
                                        {...props}
                                        className="range-slider"
                                    >
                                        {children}
                                    </div>
                                )}
                                renderThumb={({ props, index }) => (
                                    <div
                                        {...props}
                                        className="range-thumb"
                                    >
                                        <div className="range-value">
                                            {ageRange[index]}
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                    <div className="parameter-section">
                        <h1 className="text-xl text-nowrap text-gradient-main">By distance (km)</h1>
                        <div className='w-full h-full flex items-center'>
                            <Range
                                step={1}
                                min={1}
                                max={100}
                                values={kmWithin}
                                onChange={(e) => setKmWithin(e)}
                                renderTrack={({ props, children }) => (
                                    <div
                                        {...props}
                                        className="range-slider"
                                    >
                                        {children}
                                    </div>
                                )}
                                renderThumb={({ props }) => (
                                    <div
                                        {...props}
                                        className='range-thumb'
                                    >
                                        <div className='range-value text-nowrap'>
                                            {kmWithin[0] < 100 ? kmWithin[0] : '100 ~'} km
                                        </div>
                                    </div>
                                )}
                            />

                        </div>

                    </div>
                    <div className="parameter-section">
                        <h1 className="text-xl text-gradient-main">By Rating</h1>
                        <div className='w-full h-full flex items-center'>
                            <Range
                                step={1}
                                min={1}
                                max={5}
                                values={[fameRatingRange[0], fameRatingRange[1]]}
                                onChange={(e) => setFameRatingRange(e)}
                                renderTrack={({ props, children }) => (
                                    <div
                                        {...props}
                                        className="range-slider"
                                    >
                                        {children}
                                    </div>
                                )}
                                renderThumb={({ props, index }) => (
                                    <div
                                        {...props}
                                        className='range-thumb'
                                    >
                                        <div className="range-value">
                                            {fameRatingRange[index]}
                                        </div>
                                    </div>
                                )}
                            />
                        </div>
                    </div>
                    <div className="parameter-section">
                        <h1 className="text-xl text-gradient-main">By Tags</h1>
                        <div className="flex flex-wrap gap-1 w-full h-full items-center gap-y-5 content-center">
                        {user?.tags.map(tag => (
                            <div key={tag}>
                                <input
                                    type="checkbox"
                                    id={`interest-${tag}`}
                                    className="checkbox-input"
                                    checked={tagsList.includes(tag)}
                                    onChange={() => handleTagChange(tag)}
                                />
                                <label htmlFor={`interest-${tag}`} className="checkbox-label px-1 text-sm rounded-lg">
                                #{tag}
                                </label>
                            </div>
                        ))}

                    </div>

                    </div>
                    <div className="flex gap-2">
                        <button className="bg-gradient-to-r-main text-white border-2 border-slate-300 rounded-lg px-4 py-2 hover:brightness-95" onClick={() => {
                            axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/filter`, {
                                ageMin: ageRange[0],
                                ageMax: ageRange[1],
                                locationRadius: kmWithin[0],
                                minFameRating: fameRatingRange[0],
                                maxFameRating: fameRatingRange[1],
                                tags: tagsList
                            }, {
                                headers: {
                                    Authorization: `Bearer ${localStorage.getItem('jwt')}`
                                }
                            }).then(response => {
                                console.log("Filter applied successfully", response.data);
                                setModalOpen(false);
                            }).catch(error => {
                                console.error("Error applying filter", error);
                            });
                        }}>Save</button>
                        <button className="bg-white text-slate-600 border-2 border-slate-600 rounded-lg px-4 py-2 hover:brightness-95" onClick={() => setModalOpen(false)}>Close</button>
                    </div>
                </div>
            </Modal>
        </div>
    )
}
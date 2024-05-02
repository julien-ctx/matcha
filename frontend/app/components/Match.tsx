"use client"

import React, { useState, useEffect } from 'react'
import { ProfileType } from './profileTypes'
import Modal from "./Modal"
import ProfileCard from "./ProfileCard"
import axios from 'axios'

import './Match.css'
import SearchParam from './SearchParam';

enum LoadState {
    Loading,
    Loaded,
    Error
}

interface Props {
    setCurrentProfile: (profile: ProfileType) => void
}

export default function Match({ setCurrentProfile }: Props) {
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [ageRange, setAgeRange] = useState([18, 99]);
    const [kmWithin, setKmWithin] = useState([20]);
    const [fameRatingRange, setFameRatingRange] = useState([1, 5]);
    const [tagsList, setTagsList] = useState([]);

    const [profiles, setProfiles] = useState([]);
    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

    const [loadState, setLoadState] = useState(LoadState.Loading);

    function fetchFilter() {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profile/filter`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }
        }).then(response => {
            console.log("Filter fetched successfully", response.data);
            setAgeRange([response.data.ageMin, response.data.ageMax]);
            setKmWithin([response.data.locationRadius]);
            setFameRatingRange([response.data.minFameRating, response.data.maxFameRating]);
            setTagsList(response.data.tags);
        }).catch(error => {
            console.error("Error fetching filter", error);
        
        })
    }

    function browseProfile() {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/explore/browse`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }
            
        })
        .then((response) => {
            console.log('profiles: ', response.data)
            setProfiles(response.data);
            setTimeout(() => {
                setLoadState(LoadState.Loaded);
            }, 1000)
        })
        .catch((error) => {
            console.error(error);
        });
    }

    useEffect(() => {
        sendLocation();
        browseProfile();
        fetchFilter();
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

    return (
        <div className="fixed top-0 right-0 container h-full w-[72.5%] z-0 pt-20 flex justify-center items-center">
            {loadState === LoadState.Loading ? (
                <div className="w-[18%] aspect-square bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="loader"></div>
                </div>
            ) : loadState === LoadState.Loaded ? (
                <div className="h-4/5 relative bg-none" style={{width: "28rem"}}>
                    <button className="absolute -top-8 right-20 bg-gray-200 hover:bg-red-300 duration-200 py-1 px-4 rounded-t-2xl" onClick={() => setModalOpen(true)}>
                        <div className="text-white flex gap-2 items-center justify-center">
                            <img className="w-5 h-5" src="parameters.svg" alt="parameters" />
                            <p>Settings</p>
                        </div>
                    </button>
                    <button className="likeOrNotButton text-red-400 bg-red-50 hover:brightness-105 -left-16" onClick={() => handleDecision(false)}>X</button>
                    <button style={{backgroundColor: 'rgb(250, 254, 250)'}} className="likeOrNotButton text-green-300 hover:brightness-105 -right-16" onClick={() => handleDecision(true)}>O</button>
                    {profiles.length > 0 ? (
                        <ProfileCard profile={profiles[currentProfileIndex]} setCurrentProfile={setCurrentProfile} />
                    ) : (
                        <p>No more profiles</p>
                    )}
                </div>
            ) : loadState === LoadState.Error ? (
                <p>Error loading profiles</p>
            ) : null}

            <Modal isOpen={isModalOpen} onClose={() => setModalOpen(false)}>
                <SearchParam 
                    setLoadState={setLoadState}
                    ageRange={ageRange}
                    setAgeRange={setAgeRange}
                    kmWithin={kmWithin}
                    setKmWithin={setKmWithin}
                    fameRatingRange={fameRatingRange}
                    setFameRatingRange={setFameRatingRange}
                    tagsList={tagsList}
                    setTagsList={setTagsList}
                    setModalOpen={setModalOpen}
                />
            </Modal>
        </div>
    )
}
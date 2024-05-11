"use client"

import React, { useState, useEffect } from 'react'
import { ProfileType } from './profileTypes'
import Modal from "./Modal"
import ProfileCard from "./ProfileCard"
import axios from 'axios'

import './Match.css'
import SearchParam from './SearchParam';
import { useAuth } from '../auth/AuthProvider'
import { capitalize } from '../utils'
import { LoadState } from './types'

interface Props {
    setCurrentProfile: (profile: ProfileType) => void
    setMatchList: any //TODO
    setShowChatResponsive: (show: boolean) => void
    profiles: ProfileType[]
    setProfiles: (profiles: any) => void
    newMessageMap: Map<number, boolean>
}

export default function Match({ setCurrentProfile, setMatchList, setShowChatResponsive, profiles, setProfiles, newMessageMap }: Props) {
    const { httpAuthHeader, socket, user, token } = useAuth();
    
    const [isModalOpen, setModalOpen] = useState(false);
    const [ageRange, setAgeRange] = useState([18, 99]);
    const [kmWithin, setKmWithin] = useState([20]);
    const [fameRatingRange, setFameRatingRange] = useState([1, 5]);
    const [tagsList, setTagsList] = useState([]);

    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

    const [loadState, setLoadState] = useState(LoadState.Loading);

    const [matchModalOpen, setMatchModalOpen] = useState(false);
    const [matchProfile, setMatchProfile] = useState(null);
    const [message, setMessage] = useState('');

    function fetchFilter() {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profile/filter`, httpAuthHeader)
            .then(response => {
                if (response.data.message) {
                    setAgeRange([18, 99]);
                    setKmWithin([30]);
                    setFameRatingRange([1, 5]);
                    setTagsList([]);
                } else {
                    console.log("Filter fetched successfully", response);
                    setAgeRange([response.data.ageMin, response.data.ageMax]);
                    setKmWithin([response.data.locationRadius]);
                    setFameRatingRange([response.data.minFameRating, response.data.maxFameRating]);
                    setTagsList(response.data.tags);
                }
        }).catch(error => {
            console.log('filter err', error)
        })
    }

    function browseProfile() {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/explore/browse`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            data: {
                ageMin: ageRange[0],
                ageMax: ageRange[1],
                locationRadius: kmWithin[0],
                minFameRating: fameRatingRange[0],
                maxFameRating: fameRatingRange[1],
                tags: tagsList
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
        if (!profiles) return;
        if (profiles.length > 0) return;
        console.log('reload!!')
        setLoadState(LoadState.Loading);
        browseProfile();
    }, [profiles])

    useEffect(() => {
        if (!httpAuthHeader) return;
        sendLocation();
        browseProfile();
        fetchFilter();
    }, [httpAuthHeader])

    function sendLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                position => {
                    const latitude = position.coords.latitude;
                    const longitude = position.coords.longitude;

                    axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/details`, {
                        latitude,
                        longitude
                    }, httpAuthHeader).then(response => {
                        console.log("Location updated successfully", response.data);
                    }).catch(error => {
                        console.error("Error updating location", error);
                    });
                },
                error => {
                    axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/details`, {
                        latitude: 999,
                        longitude: 999
                    }, httpAuthHeader).then(response => {
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
        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/social/${accept ? 'like' : 'unlike'}/${profiles[currentProfileIndex]?.id}`, {}, httpAuthHeader).then(res => {
                console.log(res.data);
                socket.emit(accept ? 'like' : 'unlike', {
                    recipientId: profiles[currentProfileIndex]?.id,
                })
                if (accept && res.data.isMatch) {
                    setMatchList((currentMatches) => [profiles[currentProfileIndex], ...currentMatches]);
                    setMatchProfile(profiles[currentProfileIndex]);
                    setMatchModalOpen(true);
                }
            }).catch(err => {
                console.error(err);
            }
        )

        setProfiles(currentProfiles => currentProfiles.filter((_, index) => index !== currentProfileIndex));
        setCurrentProfileIndex(prev => Math.max(0, prev - 1));
    };

    return (
        <div className="w-full match-container h-full pt-20 flex flex-col justify-center items-center ">
            <button className="chat-button md:hidden absolute top-20 -translate-y-[45%] right-0 translate-x-[45%] rounded-full w-48 border-1 h-48 shadow-md"
                style={{backgroundColor: "rgba(255, 255, 255, 0.25)"}}
                onClick={() => setShowChatResponsive(true)}
            >
                <div className="w-full h-full relative">
                    <img className="w-14 h-14 bottom-[20%] left-[20%] absolute" src="/message2.svg" alt="chat" />
                    {Array.from(newMessageMap.values()).includes(true) && (
                        <div className="absolute bg-rose-500 w-3 h-3 rounded-full bottom-1/4 translate-x-7 left-1/4 border-1"></div>
                    )}
                </div>
            </button>
            {loadState === LoadState.Loading ? (
                <div className="w-[18%] aspect-square bg-white rounded-full flex items-center justify-center shadow-lg">
                    <div className="loader"></div>
                </div>
            ) : loadState === LoadState.Loaded ? (
                <div className="h-4/5 relative bg-none" style={{width: "28rem"}}>
                    <button className="absolute -top-8 left-20 bg-gray-200 hover:bg-rose-400 duration-200 py-1 px-4 rounded-t-xl" onClick={() => setModalOpen(true)}>
                        <div className="text-white flex gap-2 items-center justify-center">
                            <img className="w-5 h-5" src="parameters.svg" alt="parameters" />
                            <p>Settings</p>
                        </div>
                    </button>
                    <button className="likeOrNotButton text-red-400 bg-red-50 hover:brightness-105 left-20 sm:-left-16" onClick={() => handleDecision(false)}>X</button>
                    <button style={{backgroundColor: 'rgb(250, 254, 250)'}} className="likeOrNotButton text-green-300 hover:brightness-105 right-20 sm:-right-16" onClick={() => handleDecision(true)}>O</button>
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
                    setProfiles={setProfiles}
                />
            </Modal>

            <Modal isOpen={matchModalOpen} onClose={() => setMatchModalOpen(false)}>
                <div className="w-full flex flex-col items-center">
                    <h1 className="text-4xl">Congratulations!</h1>
                    <h2 className="text-3xl">You got match with {capitalize(matchProfile?.first_name)}</h2>
                    <div className="flex flex-col w-full mt-2 items-center">
                        <h2 className="text-lg">Send the first message!</h2>
                        <form className="flex gap-1 w-full" action="">
                            <input 
                                type="textarea"
                                className="w-full rounded-md bg-slate-100 p-2"
                                placeholder="Type your message here..."
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                            />
                            <button className=" bg-gradient-to-r-main text-white rounded-md px-3 border-1 "
                                onClick={(e) => {
                                    e.preventDefault();
                                    if (message.trim() === '') return;
                                    socket?.emit('sendMessage', {
                                        content: message,
                                        recipientId: matchProfile.id
                                    }, (res) => {
                                        if (res.success) {
                                            console.log('success: ', res);
                                            setMatchModalOpen(false);
                                        }
                                    })
                                }}
                            >Send</button>
                        </form>
                    </div>
                </div>

            </Modal>
        </div>
    )
}
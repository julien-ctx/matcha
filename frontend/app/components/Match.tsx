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
    const [ageRange, setAgeRange] = useState([null, null]);
    const [kmWithin, setKmWithin] = useState([null]);
    const [fameRatingRange, setFameRatingRange] = useState([null, null]);
    const [tagsList, setTagsList] = useState(null);

    const [currentProfileIndex, setCurrentProfileIndex] = useState(0);

    const [loadState, setLoadState] = useState(LoadState.Loading);

    const [matchModalOpen, setMatchModalOpen] = useState(false);
    const [matchProfile, setMatchProfile] = useState(null);
    const [message, setMessage] = useState('');

    const [filterLoaded, setFilterLoaded] = useState(false);
    const [browseFetched, setBrowseFetched] = useState(false);

    const [premiumModalOpen, setPremiumModalOpen] = useState(false);

    function fetchFilter() {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/profile/filter`, httpAuthHeader)
            .then(response => {
                if (response.data.message === undefined) {
                    setAgeRange([response.data.age_min, response.data.age_max]);
                    setKmWithin([response.data.location_radius]);
                    setFameRatingRange([response.data.min_fame_rating, response.data.max_fame_rating]);
                    setTagsList(response.data.tags);
                }
                setFilterLoaded(true);
        }).catch(error => {
            console.log('filter err', error)
        })
    }

    function browseProfiles(ageRange, kmWithin, fameRatingRange, tagsList) {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/explore/browse`, {
            headers: {
                Authorization: `Bearer ${token}`
            },
            params: {
                ageMin: ageRange[0],
                ageMax: ageRange[1],
                locationRadius: kmWithin[0],
                minFameRating: fameRatingRange[0],
                maxFameRating: fameRatingRange[1],
                tags: tagsList
            }
        })
        .then((response) => {
            setProfiles(response.data);
            setTimeout(() => {
                setLoadState(LoadState.Loaded);
            }, 1000)
        })
        .catch((error) => {
            console.error(error);
        });

        setBrowseFetched(true);        
    }

    useEffect(() => {
        if (browseFetched && profiles.length > 0) {
            setBrowseFetched(false);
        }
    }, [profiles, browseFetched]);

    useEffect(() => {
        if (profiles.length === 0 && !browseFetched && filterLoaded) {
            setLoadState(LoadState.Loading);
            browseProfiles(ageRange, kmWithin, fameRatingRange, tagsList);
        }
    }, [profiles, filterLoaded]);
    
    useEffect(() => {
        if (!profiles || browseFetched || loadState === LoadState.Loading) return;
        if (profiles.length > 0) return;
        setLoadState(LoadState.Loading);
        browseProfiles(ageRange, kmWithin, fameRatingRange, tagsList);
    }, [profiles, browseFetched, loadState])

    useEffect(() => {
        if (!httpAuthHeader) return;
        fetchFilter();
        sendLocation();
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
                        // console.log("Location updated successfully", response.data);
                    }).catch(error => {
                        console.error("Error updating location", error);
                    });
                },
                error => {
                    axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/details`, {
                        latitude: 999,
                        longitude: 999
                    }, httpAuthHeader).then(response => {
                        // console.log("Null location updated successfully", response.data);
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
                setProfiles(currentProfiles => currentProfiles.filter((_, index) => index !== currentProfileIndex));
                setCurrentProfileIndex(prev => Math.max(0, prev - 1));
    
                socket.emit(accept ? 'like' : 'unlike', {
                    recipientId: profiles[currentProfileIndex]?.id,
                })
                if (accept && res.data.isMatch) {
                    setMatchList((currentMatches) => [profiles[currentProfileIndex], ...currentMatches]);
                    setMatchProfile(profiles[currentProfileIndex]);
                    setMatchModalOpen(true);
                }
            }).catch(err => {
                if (err.response?.data.errorCode === 'LIKE_LIMIT_REACHED') {
                    setPremiumModalOpen(true);
                } else {
                    console.error(err);
                }
            }
        )

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
                    <button disabled={profiles.length === 0} className="likeOrNotButton text-red-400 bg-red-50 hover:brightness-105 left-20 sm:-left-16" onClick={() => handleDecision(false)}>X</button>
                    <button disabled={profiles.length === 0} className="likeOrNotButton bg-[#fafefa] text-green-300 hover:brightness-105 right-20 sm:-right-16" onClick={() => handleDecision(true)}>O</button>
                    {profiles.length > 0 ? (
                        <ProfileCard profile={profiles[currentProfileIndex]} setCurrentProfile={setCurrentProfile} />
                    ) : (
                        <div className="w-80 left-1/2 -translate-x-1/2 absolute h-4/5 sm:h-full bg-slate-50 shadow-md flex justify-center items-center rounded-lg p-2 overflow-y-auto border-8">
                            <p className="text-center text-slate-400 text-2xl">We have no more profile to show :-/ please try again later</p>
                            <button>
                                <img src="" alt="" />
                            </button>
                        </div>
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
                    browseProfiles={browseProfiles}
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
                                            setMatchList(prev => prev.filter(match => match.id !== matchProfile.id))
                                            setMatchModalOpen(false);
                                        }
                                    })
                                }}
                            >Send</button>
                        </form>
                    </div>
                </div>

            </Modal>

            <Modal isOpen={premiumModalOpen} onClose={() => setPremiumModalOpen(false)}>
                <div className="flex flex-col p-4 min-h-64 gap-6 items-center">
                    <h1 className="w-full text-center text-rose-500 text-3xl border-rose-500 rounded-lg p-3">You reached the maximum number of likes for the day!</h1> 
                    <div className="flex flex-col gap-1">
                        <button className="bg-gradient-to-r-main text-white px-4 py-2 text-lg rounded-lg" onClick={() => {
                            axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/details`, {
                                isPremium: true
                            }, httpAuthHeader).then((res) => {
                                window.location.reload();
                            }).catch((err) => {
                                console.error(err);
                            })
                        }}>Try Premium</button>
                        <button className="border-rose-500 text-rose-500 border-2 px-4 py-2 text-lg rounded-lg" onClick={() => setPremiumModalOpen(false)}>Maybe later</button>
                    </div>
                </div>

            </Modal>
        </div>
    )
}
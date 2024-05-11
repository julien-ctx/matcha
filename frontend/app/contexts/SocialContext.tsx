"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';

interface SocialContextType {
    visits: any[];
    likes: any[];
    visitNotification: boolean;
    likeNotification: boolean;
    toggleVisitNotification: () => void;
    toggleLikeNotification: () => void;
}

const SocialContext = createContext<SocialContextType | null>(null);

export const useSocial = () => useContext(SocialContext);

export const SocialProvider = ({ children }) => {
    const { user, httpAuthHeader, socket } = useAuth();

    const [visits, setVisits] = useState([]);
    const [likes, setLikes] = useState([]);

    useEffect(() => {
        if (!socket) return;

        socket.on('profileLiked', (data) => {
            setLikes((prevLikes) => [data, ...prevLikes]);
            setLikeNotification(true); // TODO on the popup, if it is already open, toggle it to false
        })

        socket.on('profileViewed', (data) => {
            // setVisits((prevVisits) => [data, ...prevVisits]);
            // TODO it's to get rid of the console error for now
            setVisits(prevVisits => {
                const exists = prevVisits.some(visit => visit.id === data.id);
                if (!exists) {
                    return [data, ...prevVisits];
                }
                return prevVisits;
            });
            setVisitNotification(true);
        })

        return (() => {
            socket.off('profileLiked')
            socket.off('profileViewed')
        })

    }, [socket, visits, likes])

    useEffect(() => {
        if (!user) return;

        const fetchVisits = async () => {
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/social/views`, httpAuthHeader)
                .then(response => {
                    // TODO For now, to get rid of the console error
                    const uniqueVisits = new Map();
                    response.data.forEach(visit => {
                        uniqueVisits.set(visit.id, visit);
                    });
                    setVisits(Array.from(uniqueVisits.values()));
            
                    //setVisits(response.data); //TODO reset
            
                })
                .catch(error => {
                    console.error(error);
            })
        };
        const fetchLikes = async () => {
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/social/likes`, httpAuthHeader)
            .then(response => {
                setLikes(response.data);
            })
            .catch(error => {
                console.error(error);
            })
        };

        fetchVisits();
        fetchLikes();
    }, [user]);

    const [visitNotification, setVisitNotification] = useState(false);
    const [likeNotification, setLikeNotification] = useState(false);

    const toggleVisitNotification = () => setVisitNotification(!visitNotification);
    const toggleLikeNotification = () => setLikeNotification(!likeNotification);

    return (
        <SocialContext.Provider value={{ visits, likes, visitNotification, likeNotification, toggleLikeNotification, toggleVisitNotification }}>
            {children}
        </SocialContext.Provider>
    );
};

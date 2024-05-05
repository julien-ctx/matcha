"use client"

import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../auth/AuthProvider';

interface SocialContextType {
    visits: any[];
    likes: any[];
}

const SocialContext = createContext<SocialContextType | null>(null);

export const useSocial = () => useContext(SocialContext);

export const SocialProvider = ({ children }) => {
    const { logout, user, httpAuthHeader } = useAuth();

    const [visits, setVisits] = useState([]);
    const [likes, setLikes] = useState([]);

    useEffect(() => {
        if (!user) return;

        const fetchVisits = async () => {
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/social/views`, httpAuthHeader)
                .then(response => {
                    setVisits(response.data);
                    console.log('visit', response.data)
                })
                .catch(error => {
                    console.error(error);
            })
        };
        const fetchLikes = async () => {
            axios.get(`${process.env.NEXT_PUBLIC_API_URL}/social/likes`, httpAuthHeader)
            .then(response => {
                setLikes(response.data);
                console.log('like', response.data)
            })
            .catch(error => {
                console.error(error);
            })
        };

        fetchVisits();
        fetchLikes();
    }, [user]);

    return (
        <SocialContext.Provider value={{ visits, likes }}>
            {children}
        </SocialContext.Provider>
    );
};

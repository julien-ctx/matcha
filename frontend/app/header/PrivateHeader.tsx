import './PrivateHeader.css';
import { useAuth } from '../auth/AuthProvider';
import axios from 'axios';
import { useEffect, useState } from 'react';

export default function PrivateHeader() {
    const { logout, user } = useAuth();
    const [visits, setVisits] = useState([]);
    const [likes, setLikes] = useState([]);

    useEffect(() => {
        console.log('user', user)
    }, [])

    function getVisits() {

    }

    function getLikes() {

    }

    return (
        <div className="w-full h-full">
            <h1 className="absolute top-1/2 -translate-y-1/2 left-5 text-5xl cursor-pointer" onClick={() => window.location.reload()}>Matcha</h1>

            <div className="flex justify-center gap-8 absolute top-0 right-0 h-full items-center">
                <div className="popup-container">
                    <button className="popup-button">
                        u
                    </button>
                    <div className="popup-content">
                        <h1 className="flex w-full text-2xl pl-2 border-b-2 border-slate-200">Visits</h1>
                        <div className="text-lg py-3">You don't have visits yet!</div>
                    </div>
                </div>
                <div className="popup-container">
                    <button className="popup-button">
                        y
                    </button>
                    <div className="popup-content">
                        <h1 className="flex w-full text-2xl pl-2 border-b-2 border-slate-200">Likes</h1>
                        <div className="text-lg py-3">You don't have likes yet!</div>
                    </div>
                </div>
                <div className="relative h-full flex-wrap flex py-1 ">
                    <input className="hidden" id="menu-toggle" type="checkbox" />
                    <label className='menu-toggle duration-200 flex flex-wrap h-full w-full px-2 mr-4 ml-6 rounded-3xl cursor-pointer' htmlFor="menu-toggle">
                        <div className="flex items-center">
                            {/* Optional: <img src={user.pictures[0]} alt="profile" /> */}
                            <img className="w-14 h-14 object-cover rounded-full" src="/tchoupi.jpg" alt="profile" />
                        </div>
                    </label>
                    <div className="menu-items">
                        <button>Account</button>
                        <button className="rounded-b-lg">Logout</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
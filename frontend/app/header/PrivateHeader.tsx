import './PrivateHeader.css';
import { useAuth } from '../auth/AuthProvider';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';

export default function PrivateHeader() {
    const { logout, user } = useAuth();
    const router = useRouter();
    const [visits, setVisits] = useState([]);
    const [likes, setLikes] = useState([]);

    const menuToggleRef = useRef(null); // For the checkbox
    const accountBtnRef = useRef(null); // For the account button
    const logoutBtnRef = useRef(null); // For the logout button

    useEffect(() => {
        const accountBtn = accountBtnRef.current;
        const logoutBtn = logoutBtnRef.current;

        const uncheckMenu = () => {
            if (menuToggleRef.current) {
                menuToggleRef.current.checked = false;
            }
        };

        if (accountBtn && logoutBtn) {
            accountBtn.addEventListener('click', uncheckMenu);
            logoutBtn.addEventListener('click', uncheckMenu);
        }

        // Cleanup function to remove event listeners
        return () => {
            if (accountBtn && logoutBtn) {
                accountBtn.removeEventListener('click', uncheckMenu);
                logoutBtn.removeEventListener('click', uncheckMenu);
            }
        };
    }, []); // Empty dependency array ensures this effect runs only once after the initial render

    function getVisits() {

    }

    function getLikes() {

    }

    return (
        <div className="w-full h-full">
            <h1 className="absolute top-1/2 -translate-y-1/2 left-5 text-5xl cursor-pointer" onClick={() => router.push('/')}>Matcha</h1>

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
                    <input ref={menuToggleRef} className="hidden" id="menu-toggle" type="checkbox" />
                    <label className='menu-toggle duration-200 flex flex-wrap h-full w-full px-2 mr-4 ml-6 rounded-3xl cursor-pointer' htmlFor="menu-toggle">
                        <div className="flex items-center">
                            {/* Optional: <img src={user.pictures[0]} alt="profile" /> */}
                            <img className="w-14 h-14 object-cover rounded-full select-none pointer-events-none" src="/tchoupi.jpg" alt="profile" />
                        </div>
                    </label>
                    <div className="menu-items">
                        <button ref={accountBtnRef} onClick={() => router.push('/account')}>Account</button>
                        <button ref={logoutBtnRef} className="rounded-b-lg" onClick={logout}>Logout</button>
                    </div>
                </div>
            </div>
        </div>
    )
}
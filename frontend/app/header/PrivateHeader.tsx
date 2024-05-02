import './PrivateHeader.css';
import { useAuth } from '../auth/AuthProvider';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useUI } from '../UIContext';
import InteractionList from '../components/InteractionList';

const likesTest = [
    {
        id: 1,
        pictures: ['/bingo.png']
    },
    {
        id: 2,
        pictures: ['/bingo.png']
    },
    {
        id: 3,
        pictures: ['/bingo.png']
    },
    {
        id: 4,
        pictures: ['/bingo.png']
    },
    {
        id: 5,
        pictures: ['/bingo.png']
    },
    {
        id: 6,
        pictures: ['/bingo.png']
    },
    {
        id: 7,
        pictures: ['/bingo.png']
    },
    {
        id: 8,
        pictures: ['/bingo.png']
    },
    {
        id: 9,
        pictures: ['/bingo.png']
    },
    {
        id: 10,
        pictures: ['/bingo.png']
    }
]

export default function PrivateHeader() {
    const { logout, user } = useAuth();
    const { toggleLikesList, toggleVisitsList } = useUI();
    const router = useRouter();
    const [visits, setVisits] = useState([]);
    const [likes, setLikes] = useState([]);

    const menuToggleRef = useRef(null);
    const accountBtnRef = useRef(null);
    const logoutBtnRef = useRef(null);

    useEffect(() => {
        if (!user) return;
        getVisits();
        getLikes();
    }, [user])

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
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/social/views`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }
        })
            .then(response => {
                setVisits(response.data);
                console.log('visit', response.data)
            })
            .catch(error => {
                console.error(error);
        })
    }

    function getLikes() {
        axios.get(`${process.env.NEXT_PUBLIC_API_URL}/social/likes`, {
            headers: {
                Authorization: `Bearer ${localStorage.getItem('jwt')}`
            }
        })
            .then(response => {
                setLikes(response.data);
                console.log('like', response.data)
            })
            .catch(error => {
                console.error(error);
            })
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
                        <InteractionList typeStr="Visits" profiles={visits} toggleShow={toggleVisitsList} /> 
                    </div>
                </div>
                <div className="popup-container">
                    <button className="popup-button">
                        y
                    </button>
                    <div className="popup-content">
                        <InteractionList typeStr="Likes" profiles={likesTest} toggleShow={toggleLikesList} />
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
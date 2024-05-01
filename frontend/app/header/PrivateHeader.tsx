import './PrivateHeader.css';
import { useAuth } from '../auth/AuthProvider';
import axios from 'axios';
import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Modal from '../components/Modal';

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
    const router = useRouter();
    const [visits, setVisits] = useState([]);
    const [likes, setLikes] = useState([]);

    const menuToggleRef = useRef(null); // For the checkbox
    const accountBtnRef = useRef(null); // For the account button
    const logoutBtnRef = useRef(null); // For the logout button

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
                        <h1 className="flex w-full text-2xl pl-2 border-b-2 border-slate-200">Visits</h1>
                        {visits.map(visit => (
                            <div key={visit.id} className="flex items-center justify-between p-2">
                                <img className="w-10 h-10 object-cover rounded-full" src={visit.pictures[0]} alt="profile" />
                            </div>
                        ))}
                        {visits.length === 0 && <p className="text-lg py-3">You don't have visits yet!</p>}
                    </div>
                </div>
                <div className="popup-container">
                    <button className="popup-button">
                        y
                    </button>
                    <div className="popup-content">
                        <h1 className="flex w-full text-2xl pl-2 border-b-2 border-slate-200">Likes</h1>
                        <div className="flex items-center h-20 border-2 bg-slate-50 px-2 gap-1 mt-2 rounded-xl">
                            <div className="bg-gradient-to-r-main rounded-fullhover:brightness-95 duration-150 px-4 py-1 text-white rounded-2xl flex items-center justify-center ">
                                <p className="text-xl">
                                    {likesTest.length < 10 ? likesTest.length : Math.min(Math.ceil(likesTest.length / 5) * 5, 99)}
                                </p>
                                <p className="font-yarndings12 ">
                                    y
                                </p>
                            </div>
                            <div className="relative w-full h-full">
                                {likesTest.slice(0, 5).map((like, index) => (
                                    <img 
                                        key={like.id} 
                                        src={like.pictures[0]} 
                                        alt="profile" 
                                        className="w-12 h-12 object-cover rounded-full absolute top-1/2 -translate-y-1/2 border-2 border-red-200"
                                        style={{
                                            left: `${index * 20}px`,
                                            zIndex: `${likesTest.length - index}`,
                                            filter: `blur(${Math.round(index) * 0.5}px)`,
                                            
                                        }}
                                    />
                                ))}
                            </div>
                        </div>
                        <button className="mt-2 bg-gradient-to-r-main rounded-full hover:brightness-95 duration-150 w-16 h-10 text-white right-0 border-2">See all</button>
                        {likes.length === 0 && <p className="text-lg py-3">You don't have likes yet!</p>}
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

            <Modal >

            </Modal>
        </div>
    )
}
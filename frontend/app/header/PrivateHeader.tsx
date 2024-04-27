import './PrivateHeader.css';
import { useAuth } from '../auth/AuthProvider';
import axios from 'axios';

export default function PrivateHeader() {
    const { logout } = useAuth();

    function getVisits() {

    }

    function getLikes() {

    }

    return (
        <div className="w-full h-full">
            <h1 className="absolute top-1/2 -translate-y-1/2 left-5 text-5xl cursor-pointer" onClick={() => window.location.reload()}>Matcha</h1>

            <div className="flex justify-center gap-8 absolute top-0 right-12 h-full items-center">
                <div className="popup-container">
                    <button>
                        <img className="w-9 h-9" src="/door-open.svg" alt="visits" />
                    </button>
                    <div className="popup-content">
                        
                    </div>
                </div>
                <div className="popup-container">
                    <button>
                        <img className="w-8 h-8" src="/heart.svg" alt="likes" />
                    </button>
                    <div className="popup-content">
                        
                    </div>
                </div>
                <button onClick={logout}>
                    logout
                </button>
            </div>
        </div>
    )
}
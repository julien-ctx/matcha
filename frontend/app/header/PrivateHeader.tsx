import './PrivateHeader.css';

export default function PrivateHeader() {
    return (
        <nav className="relative w-full">
            <div className="profile-menu-container -translate-x-7 ">
                <button className="profile-image w-24 h-24">
                    <img className="object-cover rounded-full aspect-square" src="girl.jpeg" alt="test"/>
                </button>
                <div className="menu-content">
                    <a href="/settings">Settings</a>
                    <a href="/logout">Logout</a>
                </div>
            </div>

            <div className="flex justify-center gap-8 absolute top-0 right-12 h-full items-center">
                <div className="popup-container">
                    <button>
                        <img className="w-9 h-9" src="/door-open.svg" alt="visits" />
                    </button>
                    <div className="popup-content">
                        {/* Here list of visiters */}
                    </div>
                </div>
                <div className="popup-container">
                    <button>
                        <img className="w-8 h-8" src="/heart.svg" alt="likes" />
                    </button>
                    <div className="popup-content">
                        {/* Here list of likes */}
                    </div>
                </div>

            </div>
        </nav>
    )
}
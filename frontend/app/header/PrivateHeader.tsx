import './PrivateHeader.css';

export default function PrivateHeader() {
    return (
        <div className="w-full h-full">
            <div className="profile-menu-container">
                <button className="profile-image w-24 h-24">
                    <img className="object-cover rounded-full aspect-square" src="tchoupi.jpg" alt="test"/>
                </button>
                {/* <div className="menu-content">
                    <a href="/settings">Settings</a>
                    <a href="/logout">Logout</a>
                </div> */}
            </div>

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

            </div>
        </div>
    )
}
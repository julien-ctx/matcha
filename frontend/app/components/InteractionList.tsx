interface InteractionListProps {
    typeStr: string,
    profiles: any[], //TODO
    onClick: (open: boolean) => void
}

export default function InteractionList({ typeStr, profiles, onClick }: InteractionListProps) {
    return (
        <>
            <h1 className="flex w-full text-2xl pl-2 border-b-2 border-slate-200">{typeStr}</h1>
            <div className="flex items-center h-20 border-2 bg-slate-50 px-2 gap-1 mt-2 rounded-xl">
                <div className="bg-gradient-to-r-main rounded-fullhover:brightness-95 px-4 py-1 text-white rounded-2xl flex items-center justify-center ">
                    <p className="text-xl">
                        {profiles.length < 10 ? profiles.length : Math.min(Math.ceil(profiles.length / 5) * 5, 99)}
                    </p>
                    <p className="font-yarndings12 ">
                        y
                    </p>
                </div>
                <div className="relative w-full h-full">
                    {profiles.slice(0, 5).map((profile, index) => (
                        <img 
                            key={profile.id} 
                            src={profile.pictures[0]} 
                            alt="profile" 
                            className="w-12 h-12 object-cover rounded-full absolute top-1/2 -translate-y-1/2 border-2 border-red-200"
                            style={{
                                left: `${index * 20}px`,
                                zIndex: `${profiles.length - index}`,
                                filter: `blur(${Math.round(index) * 0.5}px)`,
                                
                            }}
                        />
                    ))}
                </div>
            </div>
            <button className="mt-2 bg-gradient-to-r-main rounded-full hover:brightness-95 w-16 h-10 text-white right-0 border-2"
                onClick={onClick}>See all</button>
            {profiles.length === 0 && <p className="text-lg py-3">You don't have {typeStr.toLowerCase()} yet!</p>}
        </>
    )
}
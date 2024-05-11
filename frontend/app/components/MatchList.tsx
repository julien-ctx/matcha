interface MatchListProp {
    matches: any[],
    setCurrentProfile: (profile: any) => void
}

export default function MatchList({ matches, setCurrentProfile }: MatchListProp) {
    console.log('matches', matches)
    return (
        <div className="overflow-y-auto">
            <h1 className="text-3xl flex flex-col py-3 px-4 bg-gradient-to-r-main text-transparent bg-clip-text">Your matches</h1>
            <div className="w-full border-b-2 h-24 flex items-center overflow-x-auto">
                {
                    matches.length > 0 ?
                    <div className="w-full flex gap-3 px-5">
                        {matches.map(match => {
                            return (
                                <div key={match.id} className="flex flex-col items-center justify-center border-gray-200 hover:brightness-110 cursor-pointer"
                                    onClick={() => {
                                        setCurrentProfile(match);
                                    }}>
                                    <img src={`${process.env.NEXT_PUBLIC_API_URL}/${match.pictures[0]}`} alt={match.name} className="w-16 h-16 object-cover rounded-full border-2 border-red-100" />
                                    <h2 className="text-md text-gradient-main w-full text-center">{match.first_name}</h2>
                                </div>
                            );
                        }
                        )}
                    </div>
                    :
                    <h1 className="text-center w-full text-neutral-400 pb-6">No matches yet</h1>
                }
            </div>
        </div>
    )

}
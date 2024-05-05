import { Range } from 'react-range';
import axios from 'axios'
import { useAuth } from '../auth/AuthProvider';

interface SearchParamProps {
    setLoadState: (loading: boolean) => void,
    setModalOpen: (open: boolean) => void,
    ageRange: [number, number],
    setAgeRange: (range: [number, number]) => void,
    kmWithin: [number],
    setKmWithin: (range: [number]) => void,
    fameRatingRange: [number, number],
    setFameRatingRange: (range: [number, number]) => void,
    tagsList: string[],
    setTagsList: (tags: string[]) => void
}

export default function SearchParam({ setLoadState, setModalOpen, ageRange, setAgeRange, kmWithin, setKmWithin, fameRatingRange, setFameRatingRange, tagsList, setTagsList }: SearchParamProps) {
    const { user, httpAuthHeader } = useAuth();

    const handleTagChange = (tag: string) => {
        if (tagsList.includes(tag)) {
            setTagsList(tagsList.filter(t => t !== tag));
        } else {
            setTagsList([...tagsList, tag]);
        }
    }

    return (
        <div className="flex flex-col items-center gap-2">
            <h1 className="text-5xl mb-4 text-slate-800">Advanced Settings</h1>
            <div className="parameter-section">
                <h1 className="text-xl w-full text-left text-gradient-main">By Age</h1>
                <div className="range-slider-wrapper ">
                    <Range
                        step={1}
                        min={18}
                        max={99}
                        values={ageRange}
                        onChange={(e) => setAgeRange(e)}
                        renderTrack={({ props, children }) => (
                            <div
                                {...props}
                                className="range-slider"
                            >
                                {children}
                            </div>
                        )}
                        renderThumb={({ props, index }) => (
                            <div
                                {...props}
                                className="range-thumb"
                            >
                                <div className="range-value">
                                    {ageRange[index]}
                                </div>
                            </div>
                        )}
                    />
                </div>
            </div>
            <div className="parameter-section">
                <h1 className="text-xl text-nowrap text-gradient-main">By distance (km)</h1>
                <div className='w-full h-full flex items-center'>
                    <Range
                        step={1}
                        min={1}
                        max={100}
                        values={kmWithin}
                        onChange={(e) => setKmWithin(e)}
                        renderTrack={({ props, children }) => (
                            <div
                                {...props}
                                className="range-slider"
                            >
                                {children}
                            </div>
                        )}
                        renderThumb={({ props }) => (
                            <div
                                {...props}
                                className='range-thumb'
                            >
                                <div className='range-value text-nowrap'>
                                    {kmWithin[0] < 100 ? kmWithin[0] : '100 ~'} km
                                </div>
                            </div>
                        )}
                    />

                </div>

            </div>
            <div className="parameter-section">
                <h1 className="text-xl text-gradient-main">By Rating</h1>
                <div className='w-full h-full flex items-center'>
                    <Range
                        step={1}
                        min={1}
                        max={5}
                        values={[fameRatingRange[0], fameRatingRange[1]]}
                        onChange={(e) => setFameRatingRange(e)}
                        renderTrack={({ props, children }) => (
                            <div
                                {...props}
                                className="range-slider"
                            >
                                {children}
                            </div>
                        )}
                        renderThumb={({ props, index }) => (
                            <div
                                {...props}
                                className='range-thumb'
                            >
                                <div className="range-value">
                                    {fameRatingRange[index]}
                                </div>
                            </div>
                        )}
                    />
                </div>
            </div>
            <div className="parameter-section">
                <h1 className="text-xl text-gradient-main">By Tags</h1>
                <div className="flex flex-wrap gap-1 w-full h-full items-center gap-y-5 content-center">
                {user?.tags.map(tag => (
                    <div key={tag}>
                        <input
                            type="checkbox"
                            id={`interest-${tag}`}
                            className="checkbox-input"
                            checked={tagsList.includes(tag)}
                            onChange={() => handleTagChange(tag)}
                        />
                        <label htmlFor={`interest-${tag}`} className="checkbox-label px-1 text-sm rounded-lg">
                        #{tag}
                        </label>
                    </div>
                ))}

            </div>

            </div>
            <div className="flex gap-2">
                <button className="bg-gradient-to-r-main text-white border-2 border-slate-300 rounded-lg px-4 py-2 hover:brightness-95" onClick={() => {
                    axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/filter`, {
                        ageMin: ageRange[0],
                        ageMax: ageRange[1],
                        locationRadius: kmWithin[0],
                        minFameRating: fameRatingRange[0],
                        maxFameRating: fameRatingRange[1],
                        tags: tagsList
                    }, httpAuthHeader).then(response => {
                        console.log("Filter applied successfully", response.data);
                        setModalOpen(false);
                    }).catch(error => {
                        console.error("Error applying filter", error);
                    });
                }}>Save</button>
                <button className="bg-white text-slate-600 border-2 border-slate-600 rounded-lg px-4 py-2 hover:brightness-95" onClick={() => setModalOpen(false)}>Close</button>
            </div>
        </div>

    )
}
"use client"

import { Range } from 'react-range';
import axios from 'axios'
import { useAuth } from '../contexts/AuthContext';
import { LoadState } from './types';
import { useEffect, useState } from 'react';
import './SearchParam.css';

interface SearchParamProps {
    setLoadState: (loadState: LoadState) => void,
    setModalOpen: (open: boolean) => void,
    ageRange: [number, number],
    setAgeRange: (range: [number, number]) => void,
    kmWithin: [number],
    setKmWithin: (range: [number]) => void,
    fameRatingRange: [number, number],
    setFameRatingRange: (range: [number, number]) => void,
    tagsList: string[],
    setTagsList: (tags: string[]) => void
    sortBy: string,
    setSortBy: (sortBy: string) => void,
    orderBy: string,
    setOrderBy: (orderBy: string) => void,
    browseProfiles: Function
}

export default function SearchParam({ setLoadState, setModalOpen, ageRange, setAgeRange, 
    kmWithin, setKmWithin, fameRatingRange, setFameRatingRange, tagsList, setTagsList, sortBy, setSortBy, orderBy, setOrderBy, 
    browseProfiles
}: SearchParamProps) {
    const { user, httpAuthHeader } = useAuth();
    const [hasModified, setHasModified] = useState(false);
    const [modalData, setModalData] = useState({
        ageRange: ageRange[0] ? [...ageRange] : [18, 99],
        kmWithin: kmWithin[0] ? [...kmWithin] : [500],
        fameRatingRange: fameRatingRange[0] ? [...fameRatingRange] : [1, 5],
        tagsList: tagsList ? [...tagsList] : [],
        sortBy: sortBy ? sortBy : "distance",
        orderBy: orderBy ? orderBy : "asc"
    });

    useEffect(() => {
        const hasModified = JSON.stringify({
            ageRange: ageRange,
            kmWithin: kmWithin,
            fameRatingRange: fameRatingRange,
            tagsList: tagsList,
            sortBy: sortBy,
            orderBy: orderBy
        }) !== JSON.stringify(modalData);
        setHasModified(hasModified);
    }, [modalData]);

    const handleAgeRangeChange = (range) => {
        setModalData(prev => ({ ...prev, ageRange: range }));
    };

    const handleKmWithinChange = (range) => {
        setModalData(prev => ({ ...prev, kmWithin: range }));
    };

    const handleFameRatingRangeChange = (range) => {
        setModalData(prev => ({ ...prev, fameRatingRange: range }));
    };

    const handleSortByChange = (sortBy) => {
        setModalData(prev => ({ ...prev, sortBy: sortBy }));
    }

    const handleOrderByChange = (orderBy) => {
        setModalData(prev => ({ ...prev, orderBy: orderBy }));
    }

    const handleTagChange = (tag) => {
        setModalData(prev => {
            const updatedTags = prev.tagsList.includes(tag) ? prev.tagsList.filter(t => t !== tag) : [...prev.tagsList, tag];
            return { ...prev, tagsList: updatedTags };
        });
    };

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
                        values={modalData.ageRange}
                        onChange={(e) => handleAgeRangeChange(e)}
                        renderTrack={({ props, children }) => {
                            const { key, ...restProps } = props;
                            return (
                                <div {...restProps} key={key} className="range-slider">
                                    {children}
                                </div>
                            );
                        }}
                        renderThumb={({ props, index }) => {
                            const { key, ...restProps } = props;
                            return (
                                <div {...restProps} key={key} className="range-thumb">
                                    <div className="range-value">
                                        {modalData.ageRange[index]}
                                    </div>
                                </div>
                            );
                        }}
                    />
                </div>
            </div>
            <div className="parameter-section">
                <h1 className="text-xl text-nowrap text-gradient-main">By distance (km)</h1>
                <div className='w-full h-full flex items-center'>
                    <Range
                        step={5}
                        min={5}
                        max={500}
                        values={modalData.kmWithin}
                        onChange={(e) => handleKmWithinChange(e)}
                        renderTrack={({ props, children }) => {
                            const { key, ...restProps } = props;
                            return (
                                <div {...restProps} key={key} className="range-slider">
                                    {children}
                                </div>
                            );
                        }}
                        renderThumb={({ props, index }) => {
                            const { key, ...restProps } = props;
                            return (
                                <div {...restProps} key={key} className='range-thumb'>
                                    <div className='range-value text-nowrap'>
                                        {modalData.kmWithin[0] < 500 ? `${modalData.kmWithin[0]} km` : '500+ km'}
                                    </div>
                                </div>
                            );
                        }}
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
                        values={[modalData.fameRatingRange[0] , modalData.fameRatingRange[1]]}
                        onChange={(e) => handleFameRatingRangeChange(e)}
                        renderTrack={({ props, children }) => {
                            const { key, ...restProps } = props;
                            return (
                                <div {...restProps} key={key} className="range-slider">
                                    {children}
                                </div>
                            );
                        }}
                        renderThumb={({ props, index }) => {
                            const { key, ...restProps } = props;
                            return (
                                <div {...restProps} key={key} className='range-thumb'>
                                    <div className="range-value">
                                        {modalData.fameRatingRange[index]}
                                    </div>
                                </div>
                            );
                        }}
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
                            id={`tag-${tag}`}
                            className="checkbox-input"
                            checked={modalData.tagsList.includes(tag)}
                            onChange={() => handleTagChange(tag)}
                        />
                        <label htmlFor={`tag-${tag}`} className="checkbox-label px-1 text-sm rounded-lg">
                        #{tag}
                        </label>
                    </div>
                ))}
            </div>

            </div>
            <div className="parameter-section2">
                <h1 className="text-xl text-gradient-main">Sort by</h1>
                <div className="flex gap-1 w-full justify-center items-center">
                    <div>
                        <input
                            type="radio"
                            id={`sort-by-distance`}
                            className="radio-input"
                            checked={modalData.sortBy === "distance"}
                            onChange={() => handleSortByChange("distance")}
                        />
                        <label htmlFor={`sort-by-distance`} className="radio-label2">
                            Distance
                        </label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            id={`sort-by-age`}
                            className="radio-input"
                            checked={modalData.sortBy === "age"}
                            onChange={() => handleSortByChange("age")}
                        />
                        <label htmlFor={`sort-by-age`} className="radio-label2">
                            Age
                        </label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            id={`sort-by-fr`}
                            className="radio-input"
                            checked={modalData.sortBy === "fameRating"}
                            onChange={() => handleSortByChange("fameRating")}
                        />
                        <label htmlFor={`sort-by-fr`} className="radio-label2">
                            Fame Rating
                        </label>
                    </div>
                </div>
            </div>

            <div className="parameter-section2">
                <h1 className="text-xl text-gradient-main">Order by</h1>
                <div className="flex gap-1 w-full justify-center items-center">
                    <div>
                        <input
                            type="radio"
                            id={`order-asc`}
                            className="radio-input"
                            checked={modalData.orderBy === "asc"}
                            onChange={() => handleOrderByChange("asc")}
                        />
                        <label htmlFor={`order-asc`} className="radio-label2">
                            ASC
                        </label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            id={`order-desc`}
                            className="radio-input"
                            checked={modalData.orderBy === "desc"}
                            onChange={() => handleOrderByChange("desc")}
                        />
                        <label htmlFor={`order-desc`} className="radio-label2">
                            DESC
                        </label>
                    </div>
                    <div>
                        <input
                            type="radio"
                            id={`order-rand`}
                            className="radio-input"
                            checked={modalData.orderBy === "rand"}
                            onChange={() => handleOrderByChange("rand")}
                        />
                        <label htmlFor={`order-rand`} className="radio-label2">
                            RANDOOM
                        </label>
                    </div>
                </div>
            </div>

            <div className="flex gap-2 mt-2">
                <button className="bg-gradient-to-r-main text-white border-2 border-slate-300 rounded-lg px-4 py-2 hover:brightness-95" onClick={() => {
                    if (!hasModified) {
                        setModalOpen(false);
                        return;
                    }
                    
                    const data = {
                        ageMin: modalData.ageRange[0],
                        ageMax: modalData.ageRange[1],
                        locationRadius: modalData.kmWithin[0],
                        minFameRating: (modalData.fameRatingRange[0] - 1) * 20,
                        maxFameRating: modalData.fameRatingRange[1] * 20,
                        tags: modalData.tagsList,
                        sortBy: modalData.sortBy,
                        orderBy: modalData.orderBy
                    }

                    function updateFilterAndBrowse() {
                        setLoadState(LoadState.Loading)
                        browseProfiles(modalData.ageRange, modalData.kmWithin, modalData.fameRatingRange, modalData.tagsList, modalData.sortBy, modalData.orderBy);
                        setAgeRange(modalData.ageRange);
                        setKmWithin(modalData.kmWithin);
                        setFameRatingRange(modalData.fameRatingRange);
                        setTagsList(modalData.tagsList);
                        setSortBy(modalData.sortBy);
                        setOrderBy(modalData.orderBy);
                        setModalOpen(false);
                    }

                    if (ageRange[0]) {
                        axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/filter`, data, httpAuthHeader)
                            .then(() => updateFilterAndBrowse())
                            .catch(error => {
                                console.error("Error applying filter", error);
                            });
                    } else {
                        axios.post(`${process.env.NEXT_PUBLIC_API_URL}/profile/filter`, data, httpAuthHeader)
                            .then(() => updateFilterAndBrowse())
                            .catch(error => {
                                console.error("Error applying filter", error);
                            });
                    }
                }}>Save</button>
                <button className="bg-white text-slate-600 border-2 border-slate-600 rounded-lg px-4 py-2 hover:brightness-95" onClick={() => {
                    setModalOpen(false);
                }}>Close</button>
            </div>
        </div>

    )
}
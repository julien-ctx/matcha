"use client"

import React, { ReactNode, useState } from 'react';
import './Details.css';

const enum CurrentDetail {
    Gender,
    Orientation,
    Photos,
    Bio,
    Interests
}

const enum Gender {
    Male,
    Female,
    Other
}

const interestsList = [
    'piercing', 'geek', 'biker', 'athlete', 'adventurer', 'artist',
    'musician', 'foodie', 'gamer', 'nature lover', 'fitness enthusiast',
    'traveler', 'bookworm', 'movie buff', 'science nerd', 'fashionista',
    'social butterfly', 'homebody', 'pet lover', 'diy enthusiast'
]

export default function Details() {
    const [currentDetail, setCurrentDetail] = useState<CurrentDetail>(CurrentDetail.Gender)

    const [gender, setGender] = useState<Gender | null>(null);
    const [orientation, setOrientation] = useState<Gender[]>([]);
    const [photos, setPhotos] = useState<any>([]); // TODO type set
    const [bio, setBio] = useState<string>('');
    const [interests, setInterests] = useState<string[]>([]);

    function nextDetail() { setCurrentDetail((prev) => (prev < CurrentDetail.Interests ? prev + 1 : prev)); }
    function prevDetail() { setCurrentDetail((prev) => (prev > CurrentDetail.Gender ? prev - 1 : prev)); }
    
    function handleOrientationChange(gender: Gender) : void{
        setOrientation((prev) => 
            prev.includes(gender) ? prev.filter(item => item !== gender) : [...prev, gender]
        );
    }

    function handlePhotoChange(event) {
        const newPhotos = Array.from(event.target.files).slice(0, 6 - photos.length); // Ensure not to exceed six photos
        const validPhotos = newPhotos.filter(file => {
            const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
            const maxSize = 5 * 1024 * 1024; // 5MB max size
            return validTypes.includes(file.type) && file.size <= maxSize;
        });
        if (validPhotos.length !== newPhotos.length) {
            alert("Some files were omitted due to size or type constraints.");
        }
        setPhotos(prev => [...prev, ...validPhotos]);
    };

    const removePhoto = index => {
        setPhotos(photos.filter((_, i) => i !== index));
    };

    function handleInterestChange(interest: string) : void {
        if (interests.includes(interest)) {
          setInterests(interests.filter(i => i !== interest));
        } else if (interests.length < 10) {
          setInterests([...interests, interest]);
        }
      };

    const canMoveNext = () => {
        switch (currentDetail) {
            case CurrentDetail.Gender:
                return gender !== null;
            case CurrentDetail.Orientation:
                return orientation.length > 0;
            case CurrentDetail.Photos:
                return photos.length > 0;
            case CurrentDetail.Bio:
                return bio.trim().length > 0;
            case CurrentDetail.Interests:
                return interests.length > 0;
            default:
                return false;
        }
    };

    const isFirstDetail = currentDetail === CurrentDetail.Gender;
    const isLastDetail = currentDetail === CurrentDetail.Interests;

      
    return (
        <div className="relative w-full h-full bg-white flex items-center justify-center flex-col fadeInAnimation"
        >
            <div className="relative w-3/5 max-h-full h-2/3 flex justify-center items-center">
                {/* <p className="absolute top-0 left-3 text-2xl text-black font-yarndings12">adehijlmnqSTadehijlmnq</p>
                <p className="rotate-90 -translate-x-1/2 translate-y-32 absolute top-2 left-2 text-2xl text-black font-yarndings12">adehijlmnqSTa</p>
                <p className="absolute bottom-2 left-2 text-2xl text-black font-yarndings12">adehijlmnqSTadehijlmnq</p> */}
                {/* <div className="bg-red-200 w-full absolute top-0 left-0">l</div> */}
                {currentDetail === CurrentDetail.Gender && <div>
                    <h1 className="detail-title mb-8">You are...</h1>
                    <div className="flex flex-col gap-1 items-center">
                        <input
                        type="radio"
                        id="male"
                        name="gender"
                        value={Gender.Male}
                        className="radio-input"
                        checked={gender === Gender.Male}
                        onChange={() => setGender(Gender.Male)}
                    />
                    <label htmlFor="male" className="radio-label">
                        Male
                    </label>

                    <input
                        type="radio"
                        id="female"
                        name="gender"
                        value={Gender.Female}
                        className="radio-input"
                        checked={gender === Gender.Female}
                        onChange={() => setGender(Gender.Female)}
                    />
                    <label htmlFor="female" className="radio-label">
                        Female
                    </label>

                    <input
                        type="radio"
                        id="other"
                        name="gender"
                        value={Gender.Other}
                        className="radio-input"
                        checked={gender === Gender.Other}
                        onChange={() => setGender(Gender.Other)}
                    />
                    <label htmlFor="other" className="radio-label">
                        Other
                    </label>
                    </div>
                </div>}
                {currentDetail === CurrentDetail.Orientation && <div>
                    <h2 className="detail-title mb-8">I'm looking for...</h2>
                    <div className="flex flex-col gap-1 items-center">
                        <input
                            type="checkbox"
                            id="orientation-male"
                            className="checkbox-input"
                            checked={orientation.includes(Gender.Male)}
                            onChange={() => handleOrientationChange(Gender.Male)}
                        />
                        <label htmlFor="orientation-male" className="checkbox-label">
                            Male
                        </label>

                        <input
                            type="checkbox"
                            id="orientation-female"
                            className="checkbox-input"
                            checked={orientation.includes(Gender.Female)}
                            onChange={() => handleOrientationChange(Gender.Female)}
                        />
                        <label htmlFor="orientation-female" className="checkbox-label">
                            Female
                        </label>

                        <input
                            type="checkbox"
                            id="orientation-other"
                            className="checkbox-input"
                            checked={orientation.includes(Gender.Other)}
                            onChange={() => handleOrientationChange(Gender.Other)}
                        />
                        <label htmlFor="orientation-other" className="checkbox-label">
                            Other
                        </label>
                    </div>
                </div>}
                {currentDetail === CurrentDetail.Photos && <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="detail-title mb-6">Let them see your beautiful smile :)</h2>
                    <div className="photo-grid bg-gradient-to-r-main p-2">
                        {Array.from({ length: 6 }).map((_, index) => (
                            <div key={index} className={`photo-grid-item ${index === 0 ? 'large' : ''}`}>
                                {photos[index] ? (
                                    <>
                                        <img src={URL.createObjectURL(photos[index])} alt={`Photo ${index}`} />
                                        <button onClick={() => removePhoto(index)} className="photo-remove">X</button>
                                    </>
                                ) : (
                                    <span>
                                        {index === photos.length ? (
                                            <div>
                                                <label htmlFor="file-upload" className="custom-file-upload">+</label>
                                                <input id="file-upload" type="file" multiple onChange={handlePhotoChange} className="file-input" />
                                            </div>
                                        ) : (
                                            <p className="text-6xl font-yarndings12">t</p>
                                        )}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>}
                {currentDetail === CurrentDetail.Bio && <div className="w-4/5 h-3/5 flex flex-col items-center justify-center">
                    <h2 className="detail-title mb-4">Bio</h2>
                    <div className="w-full h-full relative flex items-center justify-center p-0 m-0">
                        <textarea
                            className="w-full h-4/5 bg-slate-100 resize-none overflow-auto px-3 py-1"
                            value={bio}
                            onChange={(e) => setBio(e.target.value)}
                            placeholder="What kind of person are you?"
                            maxLength={500}
                        />
                        <p className="absolute right-2 text-slate-400" style={{bottom: "10%"}}>{bio.length} / 500</p>
                    </div>
                </div>}
                {currentDetail === CurrentDetail.Interests && <div className="w-full h-4/5 flex flex-col items-center justify-center">
                    <h2 className="detail-title">Tags</h2>
                    <div className="flex flex-wrap gap-1 w-full h-full justify-center items-center gap-y-5 content-center">
                        {interestsList.map(interest => (
                            <div key={interest}>
                                <input
                                    type="checkbox"
                                    id={`interest-${interest}`}
                                    className="checkbox-input"
                                    checked={interests.includes(interest)}
                                    onChange={() => handleInterestChange(interest)}
                                />
                                <label htmlFor={`interest-${interest}`} className="checkbox-label px-2 rounded-xl">
                                #{interest}
                                </label>
                            </div>
                        ))}

                    </div>
                    <button className="bg-gradient-to-r-main text-white px-4 py-2 rounded-xl duration-500
                        disabled:bg-none disabled:text-slate-400 disabled:cursor-not-allowed disabled:opacity-50 disabled:border-slate-400 disabled:border-2"
                    onClick={() => {
                        console.log('send to server');
                    }}
                    disabled={!canMoveNext()}
                    >Start your journey with Matcha</button>
                </div>}

            
                {!isFirstDetail &&
                <button
                    className="detailButton top-0 left-2 disabled:opacity-50 "
                    onClick={prevDetail}
                    disabled={isFirstDetail}
                >
                    &lt;
                </button>
                }

                {!isLastDetail &&
                <button
                    className="detailButton top-0 right-2 disabled:opacity-50 "
                    onClick={nextDetail}
                    disabled={!canMoveNext() || isLastDetail}
                >
                    &gt;
                </button>
                } 
            </div>
        </div>
    )
}
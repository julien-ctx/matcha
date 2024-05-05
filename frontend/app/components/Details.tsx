"use client"

import React, { ReactNode, useState } from 'react';
import { useRouter } from 'next/navigation';
import axios from "axios"
import './Details.css';
import { useAuth } from '../auth/AuthProvider';

const enum CurrentDetail {
    Birthday,
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

const GenderList = ['Male', 'Female', 'Other'] //TODO make it simpler

const enum Orientation {
    Male,
    Female,
    Both,
    Other
}

const OrientationList = ['Male', 'Female', 'Both', 'Other']

const interestsList = [
    'piercing', 'geek', 'biker', 'athlete', 'adventurer', 'artist',
    'musician', 'foodie', 'gamer', 'nature lover', 'fitness enthusiast',
    'traveler', 'bookworm', 'movie buff', 'science nerd', 'fashionista',
    'social butterfly', 'homebody', 'pet lover', 'diy enthusiast'
]

export default function Details() {
    const { httpAuthHeader } = useAuth();
    const router = useRouter();

    const [currentDetail, setCurrentDetail] = useState<CurrentDetail>(CurrentDetail.Birthday)

    const [birthday, setBirthday] = useState<Date | null>(null);
    const [gender, setGender] = useState<Gender | null>(null);
    const [orientation, setOrientation] = useState<Orientation | null>(null);
    const [photos, setPhotos] = useState<any>([]); // TODO type set
    const [bio, setBio] = useState<string>('');
    const [interests, setInterests] = useState<string[]>([]);

    function nextDetail() { setCurrentDetail((prev) => (prev < CurrentDetail.Interests ? prev + 1 : prev)); }
    function prevDetail() { setCurrentDetail((prev) => (prev > CurrentDetail.Birthday ? prev - 1 : prev)); }
    
    function handleSubmit() {
        axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/details`, {
            dateOfBirth: birthday,
            gender: GenderList[gender],
            sexualOrientation: OrientationList[orientation],
            bio: bio,
            tags: interests,
            pictures: photos
        }, httpAuthHeader).then(res => {
            console.log('details return', res.data);
            // TODO loading then reedirect (timeOut 1500 for example)
            window.location.reload();
        }).catch(e => {
            console.log('error:', e);
        })
    }

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
            case CurrentDetail.Birthday:
                return birthday !== null;
            case CurrentDetail.Gender:
                return gender !== null;
            case CurrentDetail.Orientation:
                return orientation !== null;
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

    const isFirstDetail = currentDetail === CurrentDetail.Birthday;
    const isLastDetail = currentDetail === CurrentDetail.Interests;


    const orientationOptions = [
        { id: 'male', value: Orientation.Male, label: 'Male' },
        { id: 'female', value: Orientation.Female, label: 'Female' },
        { id: 'both', value: Orientation.Both, label: 'Both' },
        { id: 'other', value: Orientation.Other, label: 'Other' }
    ];

    const renderOrientationOption = (option) => (
        <React.Fragment key={`orientation-option-${option.id}`}>
            <input
                type="radio"
                id={`orientation-${option.id}`}
                name="orientation"
                className="radio-input"
                checked={orientation === option.value}
                onChange={() => setOrientation(option.value)}
            />
            <label htmlFor={`orientation-${option.id}`} className="radio-label">
                {option.label}
            </label>
        </React.Fragment>
    );

    const genderOptions = [
        { id: 'male', value: Gender.Male, label: 'Male' },
        { id: 'female', value: Gender.Female, label: 'Female' },
        { id: 'other', value: Gender.Other, label: 'Other' }
    ];

    const renderGenderOption = (option) => (
        <React.Fragment key={`gender-option-${option.id}`}>
            <input
                type="radio"
                id={`gender-${option.id}`}
                name="gender"
                className="radio-input"
                checked={gender === option.value}
                onChange={() => setGender(option.value)}
            />
            <label htmlFor={`gender-${option.id}`} className="radio-label">
                {option.label}
            </label>
        </React.Fragment>
    );
      
    return (
        <div className="relative w-full h-full bg-white flex items-center justify-center flex-col fadeInAnimation"
        >
            <div className="relative w-3/5 max-h-full h-2/3 flex justify-center items-center">
                {/* <p className="absolute top-0 left-3 text-2xl text-black font-yarndings12">adehijlmnqSTadehijlmnq</p>
                <p className="rotate-90 -translate-x-1/2 translate-y-32 absolute top-2 left-2 text-2xl text-black font-yarndings12">adehijlmnqSTa</p>
                <p className="absolute bottom-2 left-2 text-2xl text-black font-yarndings12">adehijlmnqSTadehijlmnq</p> */}
                {/* <div className="bg-red-200 w-full absolute top-0 left-0">l</div> */}
                {currentDetail === CurrentDetail.Birthday && <div className="flex flex-col items-center">
                        <h1 className="detail-title mb-8">When were you born?</h1>
                        <input
                            type="date"
                            className="text-2xl"
                            value={birthday ? birthday.toISOString().split('T')[0] : ''}
                            onChange={(e) => setBirthday(new Date(e.target.value))}
                            max={new Date().toISOString().split('T')[0]}
                        />
                    </div>
                }
                
                {currentDetail === CurrentDetail.Gender && <div>
                    <h1 className="detail-title mb-8">You are...</h1>
                    <div className="flex flex-col gap-1 items-center">
                    {genderOptions.map(option => renderGenderOption(option))}
                    </div>
                </div>}
                {currentDetail === CurrentDetail.Orientation && <div>
                    <h2 className="detail-title mb-8">I'm looking for...</h2>
                    <div className="flex flex-col gap-1 items-center">
                    {orientationOptions.map(option => renderOrientationOption(option))}
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
                    onClick={handleSubmit}
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
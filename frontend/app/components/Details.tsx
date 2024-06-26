"use client"

import React, { useState } from 'react';
import axios from "axios"
import './Details.css';
import { useAuth } from '../contexts/AuthContext';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

const customIcon = new L.Icon({
    iconUrl: '/marker.svg',
    iconSize: [38, 38],
    iconAnchor: [19, 38], 
    popupAnchor: [0, -38],
});

const DraggableMarker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) {
        setPosition(e.latlng);
        },
    });

    return (
        <Marker position={position} draggable={true} icon={customIcon}
        eventHandlers={{
        dragend: (e) => {
            setPosition(e.target.getLatLng());
        }
        }} />
    );
};

const enum CurrentDetail {
    Birthday,
    Gender,
    Orientation,
    Photos,
    Position,
    Bio,
    Tags
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

const tagsList = [
    'piercing', 'geek', 'biker', 'athlete', 'adventurer', 'artist',
    'musician', 'foodie', 'gamer', 'nature lover', 'fitness enthusiast',
    'traveler', 'bookworm', 'movie buff', 'science nerd', 'fashionista',
    'social butterfly', 'homebody', 'pet lover', 'diy enthusiast'
]

export default function Details() {
    const { token, httpAuthHeader } = useAuth();

    const [currentDetail, setCurrentDetail] = useState<CurrentDetail>(CurrentDetail.Birthday)

    const [birthday, setBirthday] = useState<Date | null>(null);
    const [gender, setGender] = useState<Gender | null>(null);
    const [orientation, setOrientation] = useState<Orientation | null>(null);
    const [photos, setPhotos] = useState<any>([]); // TODO type set
    const [bio, setBio] = useState<string>('');
    const [tags, setTags] = useState<string[]>([]);
    const [position, setPosition] = useState([48.856614, 2.352222]); // Paris: 48.856614, 2.352222

    function nextDetail() { setCurrentDetail((prev) => (prev < CurrentDetail.Tags ? prev + 1 : prev)); }
    function prevDetail() { setCurrentDetail((prev) => (prev > CurrentDetail.Birthday ? prev - 1 : prev)); }
    
    function handleSubmit() {
        const formData = new FormData();
        const date = new Date(birthday);
        formData.append('dateOfBirth', date.toISOString().split('T')[0]);
        formData.append('gender', GenderList[gender]);
        formData.append('sexualOrientation', OrientationList[orientation]);
        formData.append('bio', bio);
        formData.append('tags', tags.join(','));
        formData.append('latitude', position[0]);
        formData.append('longitude', position[1]);
        
        photos.forEach((photo, index) => {
            formData.append(`pictures`, photo, `photo${index}.jpg`);
        });
    
        axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/details`, formData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data'
            }
        }).then(res => {
            window.location.reload();
        }).catch(e => {
            console.log('error:', e);
        })
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

    function handleTagChange(tag: string) : void {
        if (tags.includes(tag)) {
          setTags(tags.filter(i => i !== tag));
        } else if (tags.length < 10) {
          setTags([...tags, tag]);
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
            case CurrentDetail.Position:
                return position[0] !== null;
            case CurrentDetail.Bio:
                return bio.trim().length > 0;
            case CurrentDetail.Tags:
                return tags.length > 0;
            default:
                return false;
        }
    };

    const isFirstDetail = currentDetail === CurrentDetail.Birthday;
    const isLastDetail = currentDetail === CurrentDetail.Tags;

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
            <div className="relative w-full md:w-4/5 max-h-full h-full py-24 md:py-0 md:h-2/3 flex justify-center items-center">
                {currentDetail === CurrentDetail.Birthday && <div className="flex flex-col items-center">
                        <h1 className="detail-title mb-8 text-center ">When were you born?</h1>
                        <input
                            type="date"
                            className="text-2xl"
                            value={birthday ? birthday.toISOString().split('T')[0] : ''}
                            onChange={(e) => setBirthday(new Date(e.target.value))}
                            max={new Date(new Date().setFullYear(new Date().getFullYear() - 18)).toISOString().split('T')[0]}
                            min={new Date(new Date().setFullYear(new Date().getFullYear() - 100)).toISOString().split('T')[0]}
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
                    <h2 className="detail-title mb-8 text-center">I'm looking for...</h2>
                    <div className="flex flex-col gap-1 items-center">
                    {orientationOptions.map(option => renderOrientationOption(option))}
                    </div>
                </div>}
                {currentDetail === CurrentDetail.Photos && <div className="flex flex-col items-center justify-center h-full">
                    <h2 className="detail-title mb-6 text-center md:mt-0 mt-24">Let them see your beautiful smile :)</h2>
                    <p className=" text-slate-400 text-center w-full bottom-24">Only .jpeg, .jpg, and .png image formats are accepted.</p>
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
                {currentDetail === CurrentDetail.Position && <div>
                    <h1 className="text-4xl">Show us where you are!</h1>
                    <MapContainer center={position} zoom={13} className="w-full aspect-square">
                        <TileLayer
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <DraggableMarker position={position} setPosition={(e) => setPosition([e.lat, e.lng])} />
                    </MapContainer>
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
                {currentDetail === CurrentDetail.Tags && <div className="w-full h-4/5 flex flex-col items-center justify-center">
                    <h2 className="detail-title">Tags</h2>
                    <div className="flex flex-wrap gap-1 w-full h-full justify-center items-center gap-y-5 content-center">
                        {tagsList.map(tag => (
                            <div key={tag}>
                                <input
                                    type="checkbox"
                                    id={`tag-${tag}`}
                                    className="checkbox-input"
                                    checked={tags.includes(tag)}
                                    onChange={() => handleTagChange(tag)}
                                />
                                <label htmlFor={`tag-${tag}`} className="checkbox-label px-2 rounded-xl">
                                #{tag}
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
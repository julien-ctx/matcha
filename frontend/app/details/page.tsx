"use client"

import React, { ReactNode, useState } from 'react';
import styles from './page.module.css';

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
    '#travel', '#food', '#music', '#sports', '#movies', '#books', '#art', '#photography', '#fashion', '#gaming', '#tech', '#fitness', '#cooking', '#nature', '#animals', '#science', '#history', '#politics', '#philosophy', '#religion', '#languages', '#culture', '#education', '#business', '#finance', '#health', '#lifestyle', '#beauty', '#parenting', '#relationships', '#self-improvement', '#spirituality', '#social-issues', '#environment', '#sustainability', '#human-rights'
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

    function handlePhotoChange(event: any) : void {
        if (photos.length >= 5) return alert('You can only upload 5 photos');
        setPhotos([...photos, ...event.target.files]);
    };

    function handleInterestChange(interest: string) : void {
        if (interests.includes(interest)) {
          setInterests(interests.filter(i => i !== interest));
        } else if (interests.length < 10) {
          setInterests([...interests, interest]);
        }
      };
      
    return (
        <div className="relative w-2/3 h-2/3 bg-yellow-300 flex items-center justify-center flex-col">
            {currentDetail === CurrentDetail.Gender && <div>
                <h1>You are...</h1>
                <label><input type="radio" name="gender" value={Gender.Male} checked={gender === Gender.Male} onChange={(e) => setGender(Gender.Male)} /> Male</label>
                <label><input type="radio" name="gender" value={Gender.Female} checked={gender === Gender.Female} onChange={(e) => setGender(Gender.Female)} /> Female</label>
                <label><input type="radio" name="gender" value={Gender.Other} checked={gender === Gender.Other} onChange={(e) => setGender(Gender.Other)} /> Other</label>
            </div>}
            {currentDetail === CurrentDetail.Orientation && <div>
                <h2>I'm looking for...</h2>
                <label><input type="checkbox" value="Male" checked={orientation.includes(Gender.Male)} onChange={() => handleOrientationChange(Gender.Male)} /> Male</label>
                <label><input type="checkbox" value="Female" checked={orientation.includes(Gender.Female)} onChange={() => handleOrientationChange(Gender.Female)} /> Female</label>
                <label><input type="checkbox" value="Other" checked={orientation.includes(Gender.Other)} onChange={() => handleOrientationChange(Gender.Other)} /> Other</label>
            </div>}
            {currentDetail === CurrentDetail.Photos && <div>
                <h2>Let us see your beautiful smile</h2>
                <input type="file" multiple onChange={handlePhotoChange} />
                <div>
                {photos.map((photo, index) => <img key={index} src={URL.createObjectURL(photo)} alt={`Photo ${index}`} style={{ width: '100px', height: '100px' }} />)}
                </div>
            </div>}
            {currentDetail === CurrentDetail.Bio && <div>
                <h2>Bio</h2>
                <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
            </div>}
            {currentDetail === CurrentDetail.Interests && <div>
                <h2>Interests</h2>
                {interestsList.map(interest => (
                <label key={interest}>
                    <input type="checkbox" checked={interests.includes(interest)} onChange={() => handleInterestChange(interest)} />
                    {interest}
                </label>
                ))}
                <button onClick={() => {
                    console.log('send to server');
                }}>Start Matching Journey</button>
            </div>}

            <button className={`${styles.detailButton} left-2`} onClick={prevDetail}>&lt;</button>
            <button className={`${styles.detailButton} right-2`} onClick={nextDetail}>&gt;</button>
        </div>
    )
}
"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "../auth/AuthProvider"
import { AuthStatus } from "../auth/authTypes"
import axios from "axios"
import { useRouter } from "next/navigation"
import './account.css'

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

export default function Account() {
  const { authStatus, user } = useAuth()
  const router = useRouter()
  const [profilePhotos, setProfilePhotos] = useState([])
  const [gender, setGender] = useState<Gender | null>(null);
  const [orientation, setOrientation] = useState<Orientation | null>(null);
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState([]);


  const [passwordFormData, setPasswordFormData] = useState({
    firstPassword: "",
    secondPassword: "",
  });

  useEffect(() => {
    if (authStatus === AuthStatus.NotValidated)
      router.push('/');
  }, [authStatus])

  useEffect(() => {
    if (!user) return;
    console.log('allo', user)
    setProfilePhotos(user.pictures);
    setGender(user.gender);
    setOrientation(user.sexual_orientation);
    setEmail(user.email);
    
  }, [user])

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target
    setFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handlePasswordSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault()
    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-password`, {
        token: verificationToken,
        password: formData.firstPassword,
      })
      .then(() => {
        // logout()
        // router.replace("/")
      })
      .catch((error) => {
        // display error message in the UI
        console.error("Error:", error)
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
    setProfilePhotos(prev => [...prev, ...validPhotos]);
};

  const removePhoto = index => {
    setProfilePhotos(profilePhotos.filter((_, i) => i !== index));
  };


  const handleSaveChanges = async () => {
    try {
      const response = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/auth/update-profile`, formData);
      // Update successful
      alert("Profile updated successfully!");
    } catch (error) {
      // Handle errors here, such as displaying a notification
      alert("Failed to update profile.");
    }
  };

  const orientationOptions = [
    { id: 'male', value: 'Male', label: 'Male' },
    { id: 'female', value: 'Female', label: 'Female' },
    { id: 'both', value: 'Both', label: 'Both' },
    { id: 'other', value: 'Other', label: 'Other' }
];

const renderOrientationOption = (option) => (
    <>
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
    </>
);

const genderOptions = [
  { id: 'male', value: 'Male', label: 'Male' },
  { id: 'female', value: 'Female', label: 'Female' },
  { id: 'other', value: 'Other', label: 'Other' }
];

const renderGenderOption = (option) => (
    <>
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
    </>
);

  return (
    <div className="w-full pt-20 flex justify-center h-full min-h-full grow" style={{backgroundImage: "linear-gradient(180deg,#79d1f7,#A5FECB)"}}>
      {authStatus === AuthStatus.Validated && (
        <div className="w-3/4 h-full bg-white p-12 flex-col flex items-center overflow-y-scroll">
          <h1 className="text-5xl">Account Settings</h1>
          {user && (
          <div className="flex flex-col w-4/5">
            <div className="section">
              <h1 className="text-4xl">Profile Photos</h1>
              <div className="photo-grid bg-gradient-to-r-main p-2">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className={`photo-grid-item ${index === 0 ? 'large' : ''}`}>
                        {profilePhotos[index] ? (
                            <>
                                <img src={`${process.env.NEXT_PUBLIC_API_URL}/${profilePhotos[index]}`} alt={`Photo ${index}`} />
                                <button onClick={() => removePhoto(index)} className="photo-remove">X</button>
                            </>
                        ) : (
                            <span>
                                {index === profilePhotos.length ? (
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
              <button className="save-btn">Save</button>
      
            </div>
            <div className="section">
              <h1 className="text-4xl">About You</h1>
              <div className="flex flex-col gap-2 items-center w-full">
                <label className="text-2xl">Your Gender</label>
                <div className="flex gap-1 items-center">
                  {genderOptions.map(option => renderGenderOption(option))}
                </div>
                <label className="text-2xl">Your Orientation</label>
                <div className="flex gap-1 items-center">
                  {orientationOptions.map(option => renderOrientationOption(option))}
                </div>
                <button className="save-btn">Save</button>
              </div>
            </div>
            <div className="section">
              <h1 className="text-4xl">Account Information</h1>
              <label className="text-2xl">Your Email</label>
              <input
                type="email"
                name="email"
                className="h-8 w-48 bg-slate-100 px-2"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
              />
              <button className="save-btn">Modify E-mail</button>
            </div>

            <div className="section">
              <h1 className="text-4xl">Security</h1>
              <p className="text-2xl">Your Password</p>
              <form className="w-4/5 flex flex-col gap-1" onSubmit={handlePasswordSubmit}>
                <div className="flex w-full gap-2 items-center">
                  <label className="w-1/3 text-end" htmlFor="firstPassword">Password:</label>
                  <input
                    type="firstPassword"
                    id="firstPassword"
                    name="firstPassword"
                    value={passwordFormData.firstPassword}
                    onChange={handlePasswordChange}
                    required
                    className="bg-slate-100 h-8 w-48 px-2 rounded-md"
                  />
                </div>
                <div className="flex w-full gap-2 items-center">
                  <label className="w-1/3 text-end" htmlFor="secondPassword">Confirm password:</label>
                  <input
                    type="secondPassword"
                    id="secondPassword"
                    name="secondPassword"
                    value={passwordFormData.secondPassword}
                    onChange={handlePasswordChange}
                    required
                    className="bg-slate-100 h-8 w-48 px-2 rounded-md"
                  />
                </div>
              </form>
              <button type="submit" className="save-btn">
                Change password
              </button>

            </div>
            <div>



            </div>
          </div>
        )}
        </div>
      )}
    </div>
  )
}

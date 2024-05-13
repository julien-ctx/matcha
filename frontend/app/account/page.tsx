"use client"

import React, { useState, useEffect } from "react"
import { useAuth } from "../auth/AuthProvider"
import { AuthStatus } from "../auth/authTypes"
import axios from "axios"
import { useRouter } from "next/navigation"
import './account.css'
import { calculAge, capitalize, validatePassword } from "../utils"
import Modal from "../components/Modal"

const tagsList = [
  'piercing', 'geek', 'biker', 'athlete', 'adventurer', 'artist',
  'musician', 'foodie', 'gamer', 'nature lover', 'fitness enthusiast',
  'traveler', 'bookworm', 'movie buff', 'science nerd', 'fashionista',
  'social butterfly', 'homebody', 'pet lover', 'diy enthusiast'
]

export default function Account() {
  const [userVerified, setUserVerified] = useState<boolean>(false)
  const { authStatus, user, token, httpAuthHeader, logout } = useAuth()
  const router = useRouter()
  const [profilePhotos, setProfilePhotos] = useState([])
  const [removedPhotos, setRemovedPhotos] = useState([]);
  const [gender, setGender] = useState<string | null>(null);
  const [orientation, setOrientation] = useState<string | null>(null);
  const [email, setEmail] = useState('');
  const [bio, setBio] = useState('');
  const [tags, setTags] = useState([]);
  const [deleteAccountModal, setDeleteAccountModal] = useState(false);
  const [passwordErrorMsg, setPasswordErrorMsg] = useState('');
  const [infoErrorMsg, setInfoErrorMsg] = useState('dididididididididididi');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');

  const [passwordFormData, setPasswordFormData] = useState({
    currentPassword: "",
    newPasswordFirst: "",
    newPasswordSecond: "",
  });

  useEffect(() => {
    if (!user) return;
    if (user.date_of_birth === null) {
      router.push('/')
      return;
    }
    setUserVerified(true);
  }, [user])

  useEffect(() => {
    if (authStatus === AuthStatus.NotValidated)
      router.push('/');
  }, [authStatus])

  useEffect(() => {
    if (!user) return;
    setProfilePhotos(user.pictures.map(url => ({ url: `${process.env.NEXT_PUBLIC_API_URL}/${url}`, file: null })));
    setGender(user.gender);
    setOrientation(user.sexual_orientation);
    setEmail(user.email);
    setBio(user.bio);
    setTags(user.tags);
    setFirstName(user.first_name);
    setLastName(user.last_name);
  }, [user])

  const handlePasswordChange = (event: React.ChangeEvent<HTMLInputElement>): void => {
    const { name, value } = event.target
    setPasswordFormData((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  function handleTagChange(tag: string) : void {
    if (tags.includes(tag)) {
      setTags(tags.filter(i => i !== tag));
    } else if (tags.length < 10) {
      setTags([...tags, tag]);
    }
  };


  const handlePasswordSubmit = (event: React.SyntheticEvent<HTMLFormElement>): void => {
    event.preventDefault()
    setPasswordErrorMsg("")

    if (passwordFormData.newPasswordFirst !== passwordFormData.newPasswordSecond) {
      setPasswordErrorMsg("New passwords do not match")
      return
    }

    if (validatePassword(passwordFormData.newPasswordFirst).result === false) {
      setPasswordErrorMsg(validatePassword(passwordFormData.newPasswordFirst).message)
      return
    }

    axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/internal-update-password`, {
        token: token,
        password: passwordFormData.currentPassword,
        newPassword: passwordFormData.newPasswordFirst,
      }, httpAuthHeader)
      .then((res) => {
        logout()
      })
      .catch((error) => {
        console.error("Error:", error)
        setPasswordErrorMsg("Current password is incorrect")
      })
  }

  function handlePhotoChange(event) {
    const newPhotos = Array.from(event.target.files).slice(0, 6 - profilePhotos.length); // Get new files from the input
    const validPhotos = newPhotos.filter(file => {
        const validTypes = ['image/jpeg', 'image/png', 'image/jpg'];
        const maxSize = 5 * 1024 * 1024; // 5MB max size
        return validTypes.includes(file.type) && file.size <= maxSize;
    });

    if (validPhotos.length !== newPhotos.length) {
        alert("Some files were omitted due to size or type constraints.");
    }

    const photoObjects = validPhotos.map(file => ({
        url: URL.createObjectURL(file),
        file: file
    }));

    setProfilePhotos(prev => [...prev, ...photoObjects]);
  };

  function removePhoto(index) {
    if (profilePhotos.length === 1) return ;
    if (profilePhotos[index].file === null) {
      const imagePath = profilePhotos[index].url.slice(process.env.NEXT_PUBLIC_API_URL.length + 1);
      setRemovedPhotos(prev => [...prev, imagePath]); // Track URL for server-side deletion
    } 
    setProfilePhotos(profilePhotos.filter((_, i) => i !== index));
  }

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
        <label htmlFor={`orientation-${option.id}`} className="radio-label px-3 rounded-lg">
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
        <label htmlFor={`gender-${option.id}`} className="radio-label px-3 rounded-lg">
            {option.label}
        </label>
    </>
);

  return (userVerified === true &&
    (<div className="w-full pt-20 flex justify-center h-full min-h-full grow" style={{backgroundImage: "linear-gradient(180deg,#79d1f7,#A5FECB)"}}>
      {authStatus === AuthStatus.Validated && (
        <div className="w-[97%] sm:w-[93%] md:w-3/4 h-full bg-white p-2 md:p-12 flex-col flex items-center overflow-y-scroll">
          <h1 className="text-5xl">Account Settings</h1>
          {user && (
          <div className="flex flex-col w-full sm:w-[90%] md:w-4/5 items-center">
            <div className="section relative">
              <h1 className="text-4xl">Profile Photos</h1>
              <p className=" text-slate-400 text-center w-full bottom-24">Only .jpeg, .jpg, and .png image formats are accepted.</p>

              <div className="photo-grid bg-gradient-to-r-main p-2">
                {Array.from({ length: 6 }).map((_, index) => (
                    <div key={`photobox-${index}`} className={`photo-grid-item ${index === 0 ? 'large' : ''}`}>
                        {profilePhotos[index] ? (
                            <>
                                <img src={`${profilePhotos[index].url}`} alt={`Photo ${index}`} />
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
              <button className="save-btn"
                onClick={() => {
                  const formData = new FormData();
    
                  profilePhotos.forEach((photo, index) => {
                    if (photo.file) {
                        formData.append('new_photos', photo.file); // Append each photo file
                    }
                  });

                  const pictures = profilePhotos.map(photo => ({
                    url: photo.file ? null : photo.url.slice(process.env.NEXT_PUBLIC_API_URL.length + 1),
                    filename: photo.file ? photo.file.name : null,
                  }));
                  formData.append('pictures', JSON.stringify(pictures));
                  formData.append('removedPictures', JSON.stringify(removedPhotos));

        
                  axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/update-photos`, formData, {
                      headers: {
                          Authorization: `Bearer ${token}`,
                          'Content-Type': 'multipart/form-data'
                      }
                  }).then(response => {
                      window.location.reload();
                  }).catch(error => {
                      console.error(error);
                  });
                }}
              
              >Save</button>
      
            </div>
            <div className="section relative">
              <h1 className="text-4xl">About You</h1>
              <p className="absolute bottom-2 text-red-500">{infoErrorMsg}</p>
              <div className="flex flex-col gap-2 items-center w-full">
                <label className="text-2xl">Your Name</label>
                <div className="flex gap-1 justify-center items-center">
                  <div className="flex flex-col items-center w-[40%]">
                    <label htmlFor="">First Name</label>
                    <input type="text" 
                      className="h-8 w-full bg-slate-100 px-2"
                      value={firstName}
                      onChange={(event) => setFirstName(event.target.value)}
                      placeholder="First Name"
                    />
                  </div>
                  <div className="flex flex-col items-center w-[40%]">
                    <label htmlFor="">Last Name</label>
                    <input type="text" 
                      className="h-8 w-full bg-slate-100 px-2"
                      value={lastName}
                      onChange={(event) => setLastName(event.target.value)}
                      placeholder="Last Name"
                    />
                  </div>
                </div>

                <label className="text-2xl">Your Position</label>
                <p>{user.city}, {user.country}</p>

                <label className="text-2xl">Your Birthday / Age</label>
                <p>{user.date_of_birth.split('T')[0]} / {calculAge(user.date_of_birth)} years old</p>

                <label className="text-2xl">Your Gender</label>
                <div className="flex gap-1 items-center w-full justify-center">
                      {genderOptions.map(option => (
                          <div key={`gender-option-${option.id}`}>{renderGenderOption(option)}</div>
                      ))}
                </div>
                <label className="text-2xl">Your Orientation</label>
                <div className="flex gap-1 items-center w-full justify-center">
                  {orientationOptions.map(option => (
                      <div key={`orientation-option-${option.id}`}>{renderOrientationOption(option)}</div>
                  ))}
                </div>
                <label className="text-2xl">Your Bio</label>
                <textarea
                  className="w-4/5 h-72 bg-slate-100 px-2"
                  value={bio}
                  onChange={(event) => setBio(event.target.value)}
                />
                <label className="text-2xl my-2">Your Tags</label>
                <div className="flex flex-wrap gap-1 w-full justify-center items-center gap-y-5 content-center">
                    {tagsList.map(tag => (
                        <div key={`account-${tag}`}>
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

                <button className="save-btn" onClick={() => {
                  setInfoErrorMsg('');

                  if (firstName.trim() === '' || lastName.trim() === '') {
                    setInfoErrorMsg('First and last name cannot be empty.');
                    return;
                  }

                  if (bio.trim() === '') {
                    setInfoErrorMsg('Please write anything on your bio');
                    return;
                  }

                  const formData = new FormData();
                  formData.append('firstName', firstName);
                  formData.append('lastName', lastName);
                  formData.append('gender', gender);
                  formData.append('sexualOrientation', orientation);
                  formData.append('bio', bio);
                  formData.append('tags', tags.join(','));

                  axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/details`, formData, httpAuthHeader)
                    .then(res => {
                      window.location.reload();
                    }).catch(e => {
                      console.log('error:', e);
                    })
                  }}>Save</button>
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
              <button className="save-btn"
                onClick={() => {
                  axios.put(`${process.env.NEXT_PUBLIC_API_URL}/profile/details`, { email }, httpAuthHeader)
                    .then(res => {
                      window.location.href = '/';
                    }).catch(e => {
                      console.log('error:', e);
                    })
                }}
              >Modify E-mail</button>
            </div>

            <div className="section">
              <h1 className="text-4xl">Security</h1>
              <p className="text-2xl">Your Password</p>
              <form className="w-4/5 flex flex-col gap-1 relative items-center" onSubmit={handlePasswordSubmit}>
                <div className="flex w-full gap-2 mb-2 items-center">
                    <label className="w-1/3 text-end" htmlFor="currentPassword">Current password:</label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordFormData.currentPassword}
                      onChange={handlePasswordChange}
                      required
                      className="bg-slate-100 h-8 w-48 px-2 rounded-md"
                    />
                </div>
                <div className="flex w-full gap-2 items-center">
                  <label className="w-1/3 text-end" htmlFor="newPasswordFirst">New password:</label>
                  <input
                    type="password"
                    id="newPasswordFirst"
                    name="newPasswordFirst"
                    value={passwordFormData.newPasswordFirst}
                    onChange={handlePasswordChange}
                    required
                    className="bg-slate-100 h-8 w-48 px-2 rounded-md"
                  />
                </div>
                <div className="flex w-full gap-2 items-center">
                  <label className="w-1/3 text-end" htmlFor="newPasswordSecond">Confirm new password:</label>
                  <input
                    type="password"
                    id="newPasswordSecond"
                    name="newPasswordSecond"
                    value={passwordFormData.newPasswordSecond}
                    onChange={handlePasswordChange}
                    required
                    className="bg-slate-100 h-8 w-48 px-2 rounded-md"
                  />
                </div>
              <p className="absolute bottom-16 text-red-500 left-1/2 -translate-x-1/2 text-nowrap">{passwordErrorMsg}</p>
              <button type="submit" className="save-btn">
                Change password
              </button>
              </form>

            </div>
            <div className="section">
              <h1 className="text-4xl">Account</h1>
              <h2 className="text-2xl">Deletion</h2>
              <button className="bg-white px-2 rounded-md hover:brightness-90 duration-100"
                onClick={() => setDeleteAccountModal(true)}
              >I want to delete my account.</button>
            </div>
          </div>
        )}
        </div>
      )}

      <Modal
        isOpen={deleteAccountModal} onClose={() => setDeleteAccountModal(false)}
      >
        <div className="flex flex-col items-center gap-3">
          <h1 className="text-3xl text-center mt-3">Are you sure you want to delete your account?</h1>
          <h3 className="text-center">If you delete your account, all your data will be lost and you will not be able to recover it.</h3>
          <div className="flex flex-col gap-1">
            <button className="bg-gradient-to-r-main text-white px-4 py-2 text-lg rounded-lg hover:brightness-95 duration-100"
              onClick={() => {
                axios.delete(`${process.env.NEXT_PUBLIC_API_URL}/auth/delete-account`, httpAuthHeader)
                  .then(res => {
                    logout();
                    router.push('/goodbye'); // TODO should be able to redirect to a goodbye page
                  }).catch(e => {
                    console.error(e);
                  })
              }}
            >Yes, delete my account</button>
            <button className="border-rose-500 text-rose-500 border-2 px-4 py-2 text-lg rounded-lg hover:brightness-95 bg-white duration-100" onClick={() => setDeleteAccountModal(false)}>No, keep my account</button>
          </div>
        </div>
      </Modal>
    </div>)
  )
}

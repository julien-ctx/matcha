"use client"

import React, { useState } from "react"
import { useAuth } from "../auth/AuthProvider"
import { AuthStatus } from "../auth/authTypes"
import axios from "axios"

export default function Account() {
  const { authStatus, user } = useAuth()
  const [formData, setFormData] = useState({
    email: user ? user.email : '',
    firstName: user ? user.firstName : '',
    lastName: user ? user.lastName : '',
    birthday: user ? user.birthday : '',
    gender: user ? user.gender : '',
    orientation: user ? user.orientation : ''
  });

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
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


  const handlePasswordChange = async () => {
    if (user && user.email) {
      await axios
      .post(`${process.env.NEXT_PUBLIC_API_URL}/auth/password-recovery-email`, { email: user.email })
      .then((response) => {
          // inform the user that the email has been sent
        
      })
      .catch((error) => {
        // inform the user that the email has not been sent
      })
    }
  }

  return (
    <>
      {authStatus === AuthStatus.Validated && (
        <>
          <h1>Account</h1>
          {user && (
          <div>
            <h1>Account Settings</h1>
            <div>
              <label>Email:</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
              />

              <label>First Name:</label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
              />

              <label>Last Name:</label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
              />

              <label>Birthday:</label>
              <input
                type="date"
                name="birthday"
                value={formData.birthday}
                onChange={handleInputChange}
              />

              <label>Gender:</label>
              <select name="gender" value={formData.gender} onChange={handleInputChange}>
                <option value="">Select...</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>

              <label>Orientation:</label>
              <select name="orientation" value={formData.orientation} onChange={handleInputChange}>
                <option value="">Select...</option>
                <option value="straight">Straight</option>
                <option value="gay">Gay</option>
                <option value="bisexual">Bisexual</option>
                <option value="other">Other</option>
              </select>

              <button onClick={handleSaveChanges}>Save Changes</button>
              <button onClick={handlePasswordChange}>Recover Password</button>
            </div>
          </div>
        )}
        </>
      )}
    </>
  )
}

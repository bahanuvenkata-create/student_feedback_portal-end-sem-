import React, { useState, useEffect } from 'react';
import { API_URL } from '../App';
import axios from 'axios';

function StudentProfile({ user }) {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    // In a real app, you would fetch specific student details
    // For now, we merge the logged-in user data with mock details
    const mockDetails = {
        username: user.username,
        email: user.email || "student@example.com",
        phone:user.phone||"+91 98765 43210", // Mock data
        parentName: user.parentName||"parent", // Mock data
        address: user.address|| "123 Main St, City, Country", // Mock data
        branch: user.branch||"Computer Science", // Mock data
        year: user.year||"3", // Mock data
        semester: user.semester||"1", // Mock data
        photo: "https://via.placeholder.com/150"
    };
    setProfile(mockDetails);
  }, [user]);

  const handleUpdate = (e) => {
    e.preventDefault();
    alert("Profile Updated Successfully!");
    // Here you would send axios.put to your backend
  };

  if (!profile) return <div>Loading...</div>;

  return (
    <div className="container">
      <div className="profile-header">
        <h1>Student Profile</h1>
        <p className="welcome-text">View and manage your academic details</p>
      </div>

      <div className="profile-grid">
        {/* Left: Photo & Basic Info */}
        <div className="card profile-card">
          <div className="profile-avatar-wrapper">
            <img src={profile.photo} alt="Student" className="profile-img" />
            <h2>{profile.username}</h2>
            <span className="badge-count" style={{background: '#007bff', color: 'white', marginTop: '10px'}}>Student</span>
          </div>
          
          <div className="profile-stats">
            <div className="stat-item">
              <span className="label">Branch</span>
              <span className="value">{profile.branch}</span>
            </div>
            <div className="stat-item">
              <span className="label">Year</span>
              <span className="value">{profile.year}</span>
            </div>
            <div className="stat-item">
              <span className="label">Semester</span>
              <span className="value">{profile.semester}</span>
            </div>
          </div>
        </div>

        {/* Right: Detailed Info */}
        <div className="card details-card">
          <h3>Personal Information</h3>
          
          <form onSubmit={handleUpdate}>
            <div className="form-row">
              <div className="form-group">
                <label>Full Name</label>
                <input type="text" defaultValue={profile.username} disabled />
              </div>
              <div className="form-group">
                <label>Email</label>
                <input type="email" defaultValue={profile.email} disabled />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Phone Number</label>
                <input type="text" defaultValue={profile.phone} />
              </div>
              <div className="form-group">
                <label>Parent Name</label>
                <input type="text" defaultValue={profile.parentName} />
              </div>
            </div>

            <div className="form-group">
              <label>Address</label>
              <input type="text" defaultValue={profile.address} />
            </div>

           
          </form>
        </div>
      </div>
    </div>
  );
}

export default StudentProfile;
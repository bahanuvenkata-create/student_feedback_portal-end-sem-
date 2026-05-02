import React, { useState } from 'react';

function AdminProfile({ user }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    username: user.username || 'Admin',
    email: user.email || 'pavansaiyadlapall@gmail.com',
    phone: '+91 98765 43210', // Mock data
    role: user.role || 'ADMIN'
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = (e) => {
    e.preventDefault();
    alert("Profile Updated Successfully!");
    setIsEditing(false);
    // Here you would call your backend API to update
  };

  return (
    <div className="container">
      <div className="dashboard-header">
        <h1>Admin Profile</h1>
        <p className="welcome-text">Manage your account settings and preferences</p>
      </div>

      <div className="profile-grid">
        {/* Left Column: Profile Card */}
        <div className="card profile-card">
          <div className="profile-header">
            <div className="profile-avatar">
              <img src="https://via.placeholder.com/150" alt="Admin Avatar" />
            </div>
            <div className="profile-info">
              <h2>{formData.username}</h2>
              <p>{formData.role}</p>
            </div>
          </div>
          
          <div className="profile-details">
            <div className="detail-item">
              <span className="label">Email:</span>
              <span className="value">{formData.email}</span>
            </div>
            <div className="detail-item">
              <span className="label">Phone:</span>
              <span className="value">{formData.phone}</span>
            </div>
            <div className="detail-item">
              <span className="label">Status:</span>
              <span className="badge-count" style={{background: '#28a745', color: 'white'}}>Active</span>
            </div>
          </div>
        </div>

        {/* Right Column: Settings Form */}
        <div className="card settings-card">
          <h3>Account Settings</h3>
          
          {!isEditing ? (
            <div>
              <p>Update your personal information and security settings.</p>
              <button onClick={() => setIsEditing(true)} className="btn-primary">Edit Profile</button>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <div className="form-group">
                <label>Username</label>
                <input 
                  name="username" 
                  value={formData.username} 
                  onChange={handleChange} 
                  disabled // Usually username cannot be changed
                />
              </div>

              <div className="form-group">
                <label>Email Address</label>
                <input 
                  name="email" 
                  type="email"
                  value={formData.email} 
                  onChange={handleChange} 
                />
              </div>

              <div className="form-group">
                <label>New Password (Optional)</label>
                <input 
                  name="password" 
                  type="password" 
                  placeholder="Leave blank to keep current password"
                  onChange={handleChange} 
                />
              </div>

              <div className="form-actions">
                <button type="submit" className="btn-success">Save Changes</button>
                <button type="button" onClick={() => setIsEditing(false)} className="btn-danger" style={{marginLeft: '10px'}}>Cancel</button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default AdminProfile;
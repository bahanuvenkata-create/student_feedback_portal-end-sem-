import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Navbar from './components/Navbar';
import StudentFeedback from './pages/StudentFeedback';
import AdminStudents from './pages/AdminStudents';
import AdminFeedback from './pages/AdminFeedback';
import AdminHome from './pages/AdminHome';
import AdminProfile from './pages/AdminProfile';
import StudentProfile from './pages/StudentProfile';
import './App.css';

export const API_URL = "http://localhost:8896"; 

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    window.location.href = "/login";
  };

  return (
    <Router>
      <div className="app-layout">
        {user && <Navbar user={user} logout={logout} />}
        <div className="main-content">
          <Routes>
            <Route path="/login" element={!user ? <Login onLogin={login} /> : <Navigate to={user.role === 'ADMIN' ? "/admin/home" : "/home"} />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/home" element={user?.role === 'STUDENT' ? <StudentHome /> : <Navigate to="/login" />} />
            <Route path="/feedback" element={user?.role === 'STUDENT' ? <StudentFeedback user={user} /> : <Navigate to="/login" />} />
<Route path="/profile" element={user ? <StudentProfile user={user} /> : <Navigate to="/login" />} />            <Route path="/admin/home" element={user?.role === 'ADMIN' ? <AdminHome /> : <Navigate to="/login" />} />
            <Route path="/admin/students" element={user?.role === 'ADMIN' ? <AdminStudents /> : <Navigate to="/login" />} />
            <Route path="/admin/feedback" element={user?.role === 'ADMIN' ? <AdminFeedback /> : <Navigate to="/login" />} />
            <Route path="/admin/profile" element={user ? <AdminProfile user={user} /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

// --- Login Component ---
// --- Login Component (Corrected - No OTP for Admin) ---
function Login({ onLogin }) {
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [role, setRole] = useState('STUDENT');
  const [captcha, setCaptcha] = useState({ text: '', input: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // eslint-disable-next-line
  React.useEffect(() => {
    refreshCaptcha();
  }, []);

  const refreshCaptcha = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/captcha`);
      setCaptcha({ ...captcha, text: res.data.captcha, input: '' });
    } catch (e) {
      console.error("Backend Captcha failed, using local fallback");
      const randomNum = Math.floor(1000 + Math.random() * 9000);
      setCaptcha({ ...captcha, text: randomNum.toString(), input: '' });
    }
  };

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleStudentLogin = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        username: formData.username,
        password: formData.password,
        inputCaptcha: captcha.input,
        sessionCaptcha: captcha.text
      };
      const res = await axios.post(`${API_URL}/api/auth/login`, payload);
      onLogin(res.data);
      navigate('/home');
    } catch (err) {
      let errorMsg = "Login Failed";
      if (err.response && err.response.data) {
          if (typeof err.response.data === 'string') {
              errorMsg = err.response.data;
          } else if (err.response.data.message) {
              errorMsg = err.response.data.message;
          }
      }
      setError(errorMsg);
      refreshCaptcha();
    }
  };

  // UPDATED ADMIN LOGIN (Direct Login, No OTP)
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    try {
        // Directly send login request to backend
        const res = await axios.post(`${API_URL}/api/auth/admin-login`, {
            email: formData.email,
            password: formData.password,
            inputCaptcha: captcha.input,
            sessionCaptcha: captcha.text
        });

        // If successful, log in immediately
        if (res.data) {
            onLogin(res.data);
            navigate('/admin/home');
        } else {
            setError("Invalid Admin Credentials");
        }
    } catch (err) {
        const errorMsg = err.response?.data?.message || "Admin Login Failed";
        setError(errorMsg);
        refreshCaptcha();
    }
  };

  return (
    <div className="login-wrapper">
      <div className="login-card">
        <h2>{role === 'STUDENT' ? 'Student Login' : 'Admin Login'}</h2>
        
        <div className="role-toggle">
            <button className={role === 'STUDENT' ? 'active' : ''} onClick={() => {setRole('STUDENT'); setError('');}}>Student</button>
            <button className={role === 'ADMIN' ? 'active' : ''} onClick={() => {setRole('ADMIN'); setError('');}}>Admin</button>
        </div>

        {error && <div className="error-msg">{error}</div>}

        {/* Unified Login Form */}
        <form onSubmit={role === 'STUDENT' ? handleStudentLogin : handleAdminLogin} className="login-form">
            {role === 'ADMIN' && (
                <input name="email" type="email" placeholder="Admin Email" onChange={handleChange} required />
            )}
            {role === 'STUDENT' && (
                <input name="username" type="text" placeholder="Username" onChange={handleChange} required />
            )}
            <input name="password" type="password" placeholder="Password" onChange={handleChange} required />
            
            <div className="captcha-container">
                <div className="captcha-display">{captcha.text}</div>
                <button type="button" onClick={refreshCaptcha} className="refresh-captcha">🔄</button>
                <input 
                    name="captchaInput" 
                    value={captcha.input} 
                    onChange={(e) => setCaptcha({...captcha, input: e.target.value})} 
                    placeholder="Enter Captcha" 
                    required 
                />
            </div>

            <button type="submit" className="login-btn">Login</button>
        </form>
        
        <div className="login-links">
            <a href="/forgot-password">Forgot Password?</a>
        </div>
      </div>
    </div>
  );
}

// --- Forgot Password (Updated) ---
function ForgotPassword() {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPass, setNewPass] = useState('');
    const [msg, setMsg] = useState('');

    const sendOtp = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/auth/forgot-password`, { email });
            setMsg("OTP Sent to your email.");
            setStep(2); // Move to OTP step
        } catch(err) { 
            setMsg("Error sending OTP. Please check the email."); 
        }
    };

        const verifyOtp = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(`${API_URL}/api/auth/verify-otp`, { email, otp });
            
            // Check the structure of the response
            // If the backend sends { valid: true } or { ...user data }
            if (res.data.valid === true || res.data.role) {
                setStep(3); 
                setMsg("OTP Verified! Please set your new password.");
            } else {
                // If backend returns { valid: false } or a string message
                const errorMsg = res.data.message || res.data || "Invalid OTP";
                setMsg("Error: " + errorMsg);
            }
        } catch (err) {
            // Handle 404 or 500 errors
            const backendMsg = err.response?.data?.message || err.response?.data || "Invalid OTP";
            setMsg("Server Error: " + backendMsg);
        }
    };

    const resetPass = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/auth/reset-password`, { email, otp, newPassword: newPass });
            setMsg("Password Reset Successful! Redirecting to Login...");
            setTimeout(() => window.location.href = '/login', 2000);
        } catch(err) { 
            setMsg("Error resetting password."); 
        }
    };

    return (
        <div className="login-wrapper">
            <div className="login-card">
                <h2>Reset Password</h2>
                
                {/* Progress Indicator */}
                <div style={{display: 'flex', justifyContent: 'center', gap: '10px', marginBottom: '20px'}}>
                    <div style={{height: '4px', width: '30px', background: step >= 1 ? '#007bff' : '#e0e0e0', borderRadius: '2px'}}></div>
                    <div style={{height: '4px', width: '30px', background: step >= 2 ? '#007bff' : '#e0e0e0', borderRadius: '2px'}}></div>
                    <div style={{height: '4px', width: '30px', background: step >= 3 ? '#007bff' : '#e0e0e0', borderRadius: '2px'}}></div>
                </div>

                {msg && <div className="error-msg" style={{marginBottom: '15px'}}>{msg}</div>}

                {/* STEP 1: ENTER EMAIL */}
                {step === 1 && (
                    <form onSubmit={sendOtp} className="login-form">
                        <label>Enter your registered Email</label>
                        <input 
                            type="email" 
                            placeholder="student@example.com" 
                            value={email} 
                            onChange={e => setEmail(e.target.value)} 
                            required 
                        />
                        <button type="submit" className="login-btn">Send OTP</button>
                    </form>
                )}

                {/* STEP 2: ENTER OTP */}
                {step === 2 && (
                    <form onSubmit={verifyOtp} className="login-form">
                        <label>Enter the OTP sent to {email}</label>
                        <input 
                            type="text" 
                            placeholder="Enter OTP" 
                            value={otp} 
                            onChange={e => setOtp(e.target.value)} 
                            required 
                        />
                        <button type="submit" className="login-btn">Verify OTP</button>
                        <button type="button" onClick={() => setStep(1)} style={{background:'none', border:'none', color:'#666', marginTop:'10px', cursor:'pointer'}}>Back</button>
                    </form>
                )}

                {/* STEP 3: NEW PASSWORD */}
                {step === 3 && (
                    <form onSubmit={resetPass} className="login-form">
                        <label>Enter New Password</label>
                        <input 
                            type="password" 
                            placeholder="New Password" 
                            value={newPass} 
                            onChange={e => setNewPass(e.target.value)} 
                            required 
                        />
                        <button type="submit" className="login-btn">Reset Password</button>
                        <button type="button" onClick={() => setStep(1)} style={{background:'none', border:'none', color:'#666', marginTop:'10px', cursor:'pointer'}}>Cancel</button>
                    </form>
                )}
            </div>
        </div>
    );
}

// --- Placeholders ---
const StudentHome = () => <div className="container"><h1>University Home</h1><p>Welcome Student!</p></div>;

export default App;
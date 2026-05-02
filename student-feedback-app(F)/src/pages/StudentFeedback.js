import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../App';

function StudentFeedback({ user }) {
  const [year, setYear] = useState('2023');
  const [semester, setSemester] = useState('1');
  const [status, setStatus] = useState(null);
  const [msg, setMsg] = useState('');
  const [hasSubmitted, setHasSubmitted] = useState(false);
  
  const [selectedSubject, setSelectedSubject] = useState('');
  const [subjects, setSubjects] = useState([]);
  const [ratings, setRatings] = useState({});
  
  // NEW: Store submitted subjects
  const [submittedSubjects, setSubmittedSubjects] = useState([]);

  const questions = [
    "Is he/she conducting alms regularly?",
    "Doubt clarifying skills?",
    "About communication skills?",
    "Completing syllabus on time?",
    "Interaction with students?"
  ];

  // Complete Subjects Data
  const getAllSubjects = (sem, yr) => {
    let list = [];
    switch (yr) {
      case "2023":
        if (sem === '1') list = ["ENGINEERING PHYSICS", "ENGINEERING CHEMISTRY", "MATHEMATICS-I", "ENGINEERING DRAWING", "COMPUTER PROGRAMMING"];
        else if (sem === '2') list = ["MATHEMATICS-II", "APPLIED PHYSICS", "BASIC ELECTRICAL ENGINEERING", "C PROGRAMMING LAB", "ENGINEERING WORKSHOP"];
        break;
      case "2024":
        if (sem === '1') list = ["DATA STRUCTURES", "DIGITAL LOGIC DESIGN", "DISCRETETE MATHEMATICS", "COMPUTER ORGANIZATION", "WEB TECHNOLOGY"];
        else if (sem === '2') list = ["DATABASE MANAGEMENT SYSTEMS", "OPERATING SYSTEMS", "DESIGN AND ANALYSIS OF ALGORITHMS", "COA LAB", "WEB TECH LAB"];
        break;
      case "2025":
        if (sem === '1') list = ["AUTOMATA THEORY", "COMPILER DESIGN", "OPERATING SYSTEMS", "COMPUTER NETWORKS", "DBMS (Advanced)"];
        else if (sem === '2') list = ["MACHINE LEARNING", "ARTIFICIAL INTELLIGENCE", "CLOUD COMPUTING", "INTERNET OF THINGS", "BIG DATA ANALYTICS"];
        break;
      case "2026":
        if (sem === '1') list = ["SOFTWARE ENGINEERING", "DISTRIBUTED SYSTEMS", "CRYPTOGRAPHY AND NETWORK SECURITY", "MOBILE COMPUTING", "PROJECT PHASE I"];
        else if (sem === '2') list = ["BLOCKCHAIN TECHNOLOGY", "CYBER SECURITY", "DATA MINING", "IMAGE PROCESSING", "PROJECT PHASE II"];
        break;
      case "2027":
        if (sem === '1') list = ["QUANTUM COMPUTING", "NEUROMORPHIC COMPUTING", "BIO-INFORMATICS", "ROBOTICS AND AUTOMATION", "ADVANCED AI"];
        else if (sem === '2') list = ["NANOTECHNOLOGY", "ADVANCED WIRELESS NETWORKS", "GRID COMPUTING", "CLOUD SECURITY", "RESEARCH METHODOLOGY"];
        break;
      default: list = [];
    }
    return list;
  };

  // 1. Check Status (And Load Submitted Subjects)
  const checkStatus = async () => {
    if (year && semester) {
        try {
            const res = await axios.post(`${API_URL}/api/feedback/status`, { year, semester });
            setStatus(res.data.enabled);
            
            if (res.data.enabled) {
                // Fetch all submitted feedback for this Student/Year/Sem
                const allFeedback = await axios.get(`${API_URL}/api/admin/analysis/${year}/${semester}`);
                
                // Extract only the subjects from the data
                const submitted = allFeedback.data
                    .filter(f => f.username === user.username) // Make sure it's THIS user
                    .map(f => f.subject);
                
                setSubmittedSubjects(submitted);
                
                // Get All Available Subjects
                const allSubjects = getAllSubjects(semester, year);
                
                // FILTER: Keep only subjects NOT in submitted list
                const availableSubjects = allSubjects.filter(sub => !submitted.includes(sub));
                
                setSubjects(availableSubjects);
                
                setMsg(`Feedback for ${year} - Sem ${semester} is: ENABLED`);
            } else {
                setMsg(`Feedback for ${year} - Sem ${semester} is: DISABLED`);
                setSubjects([]);
            }
        } catch (e) { 
            setStatus(false); 
            setMsg("Error checking status.");
        }
    }
  };

  // 2. Check Subject Status (Remains same)
  const checkSubjectStatus = async () => {
    setHasSubmitted(false);
    setMsg(""); 
    if (!selectedSubject) return;

    try {
        const res = await axios.post(`${API_URL}/api/feedback/check-subject`, {
            username: user.username,
            year: year,
            semester: semester,
            subject: selectedSubject
        });
        
        if (res.data.hasSubmitted) {
            setHasSubmitted(true);
            setMsg(`You have already submitted feedback for ${selectedSubject}.`);
        } else {
            setHasSubmitted(false);
        }
    } catch (err) {
        console.error("Error checking subject:", err);
        setHasSubmitted(false);
    }
  };

  const handleRatingChange = (questionIndex, value) => {
    setRatings({
        ...ratings,
        [questionIndex]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedSubject) {
        setMsg("Please select a subject.");
        return;
    }
    if (Object.keys(ratings).length < 5) {
        setMsg("Please answer all 5 questions.");
        return;
    }

    const feedbackList = questions.map((q, index) => ({
        username: user.username, 
        year: year, 
        semester: semester,
        subject: selectedSubject,
        comments: q, 
        rating: ratings[index]
    }));

    try {
        const res = await axios.post(`${API_URL}/api/feedback/submit`, feedbackList);
        
        // Add to local state so it disappears from list immediately
        setSubmittedSubjects([...submittedSubjects, selectedSubject]);
        
        // Update the displayed list (remove the submitted one)
        setSubjects(subjects.filter(s => s !== selectedSubject));
        
        setHasSubmitted(true); 
        setMsg("Feedback Submitted Successfully!");
        setSelectedSubject(''); 
        setRatings({});
    } catch (err) {
        setMsg(err.response?.data || "Error submitting feedback");
    }
  };

  return (
    <div className="container">
      <h1>Submit Feedback</h1>
      <div className="card">
        
        {/* Selection Controls */}
        <div className="form-row" style={{marginBottom: '20px'}}>
            <div className="form-group">
                <label>Academic Year</label>
                <select value={year} onChange={e => {setYear(e.target.value); setStatus(null);}}>
                    <option value="2023">2023</option>
                    <option value="2024">2024</option>
                    <option value="2025">2025</option>
                    <option value="2026">2026</option>
                    <option value="2027">2027</option>
                </select>
            </div>
            <div className="form-group">
                <label>Semester</label>
                <select value={semester} onChange={e => {setSemester(e.target.value); setStatus(null);}}>
                    <option value="1">Semester 1</option>
                    <option value="2">Semester 2</option>
                </select>
            </div>
        </div>

        <button onClick={checkStatus} className="btn-primary">Check Availability</button>

        {/* Info Message */}
        {submittedSubjects.length > 0 && (
            <div style={{marginTop: '15px', padding: '10px', background: '#e3f2fd', color: '#0d47a1', borderRadius: '4px', fontSize: '0.9rem'}}>
                You have already submitted feedback for: <strong>{submittedSubjects.join(", ")}</strong>
            </div>
        )}

        {/* Subject Dropdown */}
        {status === true && (
            <div style={{marginTop: '20px'}}>
                <h3>Select Subject</h3>
                {subjects.length === 0 ? (
                    <p style={{color: 'green', fontWeight: 'bold'}}>You have completed all feedback for this semester!</p>
                ) : (
                    <select 
                        value={selectedSubject} 
                        onChange={(e) => {
                            setSelectedSubject(e.target.value);
                            checkSubjectStatus(); 
                        }}
                        style={{padding: '10px', width: '100%', maxWidth: '500px', marginBottom: '20px'}}
                    >
                        <option value="">-- Choose a Subject --</option>
                        {subjects.map((sub, idx) => (
                            <option key={idx} value={sub}>{sub}</option>
                        ))}
                    </select>
                )}
            </div>
        )}

        {/* Questions Form */}
        {selectedSubject && !hasSubmitted && (
            <form onSubmit={handleSubmit} style={{marginTop: '20px'}}>
                <h3>Feedback for: {selectedSubject}</h3>
                {questions.map((q, index) => (
                    <div key={index} className="question-block">
                        <label><strong>Q{index + 1}:</strong> {q}</label>
                        <select 
                            required 
                            value={ratings[index] || ''}
                            onChange={(e) => handleRatingChange(index, e.target.value)}
                        >
                            <option value="">Select Rating...</option>
                            <option value="5">Excellent (5)</option>
                            <option value="4">Good (4)</option>
                            <option value="3">Average (3)</option>
                            <option value="2">Poor (2)</option>
                            <option value="1">Very Poor (1)</option>
                        </select>
                    </div>
                ))}
                <button type="submit" className="btn-primary" style={{marginTop: '20px'}}>Submit Feedback</button>
            </form>
        )}
        
        {msg && <div className="error-msg" style={{marginTop: '20px', textAlign: 'center'}}>{msg}</div>}
      </div>
    </div>
  );
}

export default StudentFeedback;
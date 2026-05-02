import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../App';

function AdminFeedback() {
    // State for Tabs
    const [view, setView] = useState('control'); // 'control' or 'analysis'
    
    // State for Control
    const [year, setYear] = useState('2023');
    const [semester, setSemester] = useState('1');
    const [isEnabled, setIsEnabled] = useState(false);

    // State for Analysis
    const [feedbacks, setFeedbacks] = useState([]);
    const [selectedSubject, setSelectedSubject] = useState('All');
    const [analysis, setAnalysis] = useState(null);

    // 1. CHECK STATUS (Used by Control & Analysis)
    const checkStatus = async () => {
        try {
            const res = await axios.post(`${API_URL}/api/feedback/status`, { year, semester });
            setIsEnabled(res.data.enabled);
        } catch (err) { 
            console.error(err);
        }
    };

    // 2. TOGGLE STATUS (Control)
    const toggleStatus = async () => {
        try {
            await axios.post(`${API_URL}/api/admin/feedback/toggle`, { 
                year, semester, enabled: !isEnabled 
            });
            setIsEnabled(!isEnabled);
            alert(`Feedback ${!isEnabled ? 'Enabled' : 'Disabled'} for ${year} - Sem ${semester}`);
        } catch (e) {
            alert("Failed to update status");
        }
    };

    // 3. LOAD DATA (Analysis)
    const loadFeedbacks = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/analysis/${year}/${semester}`);
            setFeedbacks(res.data);
            calculateStats(res.data);
        } catch (err) {
            alert("Error loading data");
        }
    };

    // 4. CALCULATE STATS (Analysis Logic)
    const calculateStats = (data) => {
        const filteredData = selectedSubject === 'All' ? data : data.filter(f => f.subject === selectedSubject);

        if (filteredData.length === 0) {
            setAnalysis(null);
            return;
        }

        const questionStats = {};
        
        filteredData.forEach(item => {
            const questionText = item.comments; 
            if (!questionStats[questionText]) {
                questionStats[questionText] = { total: 0, sum: 0 };
            }
            questionStats[questionText].total++;
            questionStats[questionText].sum += parseInt(item.rating);
        });

        const result = Object.keys(questionStats).map(key => {
            const stats = questionStats[key];
            return {
                question: key,
                count: stats.total,
                average: (stats.sum / stats.total).toFixed(1)
            };
        });

        setAnalysis(result);
    };

    useEffect(() => {
        if (feedbacks.length > 0) {
            calculateStats(feedbacks);
        }
    }, [selectedSubject]);

    const uniqueSubjects = [...new Set(feedbacks.map(f => f.subject))];

    return (
        <div className="container">
            <h1>Feedback Management</h1>
            
            {/* TABS */}
            <div className="tabs-container">
                <button 
                    className={`tab-btn ${view === 'control' ? 'active' : ''}`}
                    onClick={() => setView('control')}
                >
                    Control Form
                </button>
                <button 
                    className={`tab-btn ${view === 'analysis' ? 'active' : ''}`}
                    onClick={() => setView('analysis')}
                >
                    View Analysis
                </button>
            </div>

            {/* --- TAB 1: CONTROL FORM --- */}
            {view === 'control' && (
                <div className="card control-panel">
                    <h3>Configure Feedback Availability</h3>
                    <p className="text-muted">Select Year and Semester to enable or disable the feedback form for students.</p>
                    
                    <div className="form-row">
                        <div className="form-group">
                            <label>Academic Year</label>
                            <select value={year} onChange={e => setYear(e.target.value)}>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label>Semester</label>
                            <select value={semester} onChange={e => setSemester(e.target.value)}>
                                <option value="1">Semester 1</option>
                                <option value="2">Semester 2</option>
                            </select>
                        </div>
                    </div>

                    <div className="status-display">
                        <span>Current Status for {year} - Sem {semester}: </span>
                        <span className={`status-badge ${isEnabled ? 'status-enabled' : 'status-disabled'}`}>
                            {isEnabled ? "ENABLED" : "DISABLED"}
                        </span>
                    </div>

                    <button 
                        onClick={toggleStatus} 
                        className={`btn-large ${isEnabled ? 'btn-danger' : 'btn-success'}`}
                    >
                        {isEnabled ? "Disable Feedback Form" : "Enable Feedback Form"}
                    </button>
                </div>
            )}

            {/* --- TAB 2: ANALYSIS --- */}
            {view === 'analysis' && (
                <div className="card control-panel">
                    <h3>Feedback Analysis</h3>
                    <div className="form-row">
                        <div className="form-group">
                            <label>Year</label>
                            <select value={year} onChange={e => setYear(e.target.value)}>
                                <option value="2023">2023</option>
                                <option value="2024">2024</option>
                                <option value="2025">2025</option>
                                <option value="2026">2026</option>
                                <option value="2027">2027</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label>Semester</label>
                            <select value={semester} onChange={e => setSemester(e.target.value)}>
                                <option value="1">Sem 1</option>
                                <option value="2">Sem 2</option>
                            </select>
                        </div>
                    </div>
                    
                    {feedbacks.length > 0 && (
                        <div className="form-group" style={{marginTop: '15px'}}>
                            <label>Filter by Subject</label>
                            <select value={selectedSubject} onChange={e => setSelectedSubject(e.target.value)}>
                                <option value="All">All Subjects</option>
                                {uniqueSubjects.map((sub, idx) => (
                                    <option key={idx} value={sub}>{sub}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <button onClick={loadFeedbacks} className="btn-primary" style={{marginTop: '15px'}}>Load Analysis</button>
                </div>
            )}

            {/* DISPLAY ANALYSIS RESULTS */}
            {view === 'analysis' && analysis && (
                <div className="card">
                    <h3>Question-wise Analysis {selectedSubject !== 'All' ? `for ${selectedSubject}` : `(All Subjects)`}</h3>
                    <table className="analysis-table">
                        <thead>
                            <tr>
                                <th>Parameter / Question</th>
                                <th>Responses</th>
                                <th>Average Rating</th>
                                <th>Visual</th>
                            </tr>
                        </thead>
                        <tbody>
                            {analysis.map((item, index) => (
                                <tr key={index}>
                                    <td><strong>{item.question}</strong></td>
                                    <td>{item.count}</td>
                                    <td>
                                        <span className={`rating-badge ${item.average >= 4 ? 'high' : item.average >= 3 ? 'medium' : 'low'}`}>
                                            {item.average}
                                        </span>
                                    </td>
                                    <td>
                                        <div style={{background: '#e0e0e0', borderRadius: '4px', width: '100%', height: '10px'}}>
                                            <div style={{
                                                background: item.average >= 4 ? '#28a745' : item.average >= 3 ? '#ffc107' : '#dc3545',
                                                width: `${(item.average / 5) * 100}%`,
                                                height: '100%'
                                            }}></div>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default AdminFeedback;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_URL } from '../App';

function AdminStudents() {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentStudent, setCurrentStudent] = useState({});

  // NEW: State for the "Add Student" Modal with ALL details
  const [showAddModal, setShowAddModal] = useState(false);
    const [newStudent, setNewStudent] = useState({ 
    username: '', 
    password: '', 
    email: '', 
    phone: '',
    parentName: '',
    address: '',
    branch: '', // Empty
    year: '',   // Empty
    semester: '' // Empty
  });

  useEffect(() => { fetchStudents(); }, []);

  const fetchStudents = async () => {
    const res = await axios.get(`${API_URL}/api/admin/students`);
    setStudents(res.data);
  };

  const handleDelete = async (id) => {
    if(window.confirm("Delete this student?")) {
        await axios.delete(`${API_URL}/api/admin/students/${id}`);
        fetchStudents();
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    await axios.put(`${API_URL}/api/admin/students/${currentStudent.id}`, currentStudent);
    setEditMode(false);
    fetchStudents();
  };

  // UPDATED: Function to Add Student (Sends all fields)
  const handleAddStudent = async (e) => {
    e.preventDefault();
    try {
        await axios.post(`${API_URL}/api/admin/students`, newStudent);
        alert("Student Added Successfully!");
        setShowAddModal(false); 
        // Reset Form
        setNewStudent({ 
            username: '', password: '', email: '', 
            phone: '', parentName: '', address: '', 
            branch: 'CSE', year: '1', semester: '1' 
        });
        fetchStudents();
    } catch (err) {
        alert("Error adding student: " + (err.response?.data || err.message));
    }
  };

  const downloadExcel = async () => {
    try {
        const res = await axios.get(`${API_URL}/api/admin/students/export`, { responseType: 'blob' });
        const url = window.URL.createObjectURL(new Blob([res.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'students.xlsx');
        document.body.appendChild(link);
        link.click();
        link.remove();
    } catch(e) { console.error(e); }
  };

  const filtered = students.filter(s => s.username.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="container">
        <h1>Manage Students</h1>
        <div className="controls">
            <input placeholder="Search username..." onChange={e => setSearch(e.target.value)} />
            <button onClick={downloadExcel} className="btn-success">Download Excel</button>
            <button onClick={() => setShowAddModal(true)} className="btn-primary">Add Student</button>
        </div>

        <table>
            <thead><tr><th>ID</th><th>Username</th><th>Email</th><th>Branch</th><th>Phone</th><th>Actions</th></tr></thead>
            <tbody>
                {filtered.map(s => (
                    <tr key={s.id}>
                        <td>{s.id}</td>
                        <td>{s.username}</td>
                        <td>{s.email}</td>
                        <td>{s.branch}</td>
                        <td>{s.phone}</td>
                        <td>
                            <button onClick={() => {setCurrentStudent(s); setEditMode(true);}}>Edit</button>
                            <button onClick={() => handleDelete(s.id)}>Delete</button>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>

        {/* --- ADD STUDENT MODAL (UPDATED WITH ALL FIELDS) --- */}
        {showAddModal && (
            <div className="modal">
                <div className="modal-content" style={{maxWidth: '600px', maxHeight: '80vh', overflowY: 'auto'}}>
                    <h3>Add New Student</h3>
                    <form onSubmit={handleAddStudent}>
                        
                        {/* Login Info */}
                        <h4 style={{margin:'10px 0', color:'#007bff'}}>Login Credentials</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Username</label>
                                <input 
                                    required 
                                    value={newStudent.username} 
                                    onChange={e => setNewStudent({...newStudent, username: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Password</label>
                                <input 
                                    required 
                                    type="password"
                                    value={newStudent.password} 
                                    onChange={e => setNewStudent({...newStudent, password: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Email</label>
                            <input 
                                required 
                                type="email"
                                value={newStudent.email} 
                                onChange={e => setNewStudent({...newStudent, email: e.target.value})} 
                            />
                        </div>

                        {/* Academic Info */}
                                                {/* Academic Info */}
                        <h4 style={{margin:'10px 0', color:'#007bff'}}>Academic Details</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Branch</label>
                                <select 
                                    required // Enforces selection
                                    value={newStudent.branch} 
                                    onChange={e => setNewStudent({...newStudent, branch: e.target.value})}
                                >
                                    <option value="">-- Select Branch --</option>
                                    <option value="CSE">CSE</option>
                                    <option value="ECE">ECE</option>
                                    <option value="EEE">EEE</option>
                                    <option value="MECH">MECH</option>
                                    <option value="CIVIL">CIVIL</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Year</label>
                                <select 
                                    required // Enforces selection
                                    value={newStudent.year} 
                                    onChange={e => setNewStudent({...newStudent, year: e.target.value})}
                                >
                                    <option value="">-- Select Year --</option>
                                    <option value="1">1st Year</option>
                                    <option value="2">2nd Year</option>
                                    <option value="3">3rd Year</option>
                                    <option value="4">4th Year</option>
                                </select>
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Semester</label>
                            <select 
                                required // Enforces selection
                                value={newStudent.semester} 
                                onChange={e => setNewStudent({...newStudent, semester: e.target.value})}
                            >
                                <option value="">-- Select Semester --</option>
                                <option value="1">Semester 1</option>
                                <option value="2">Semester 2</option>
                            </select>
                        </div>
                           

                        {/* Personal Info */}
                        <h4 style={{margin:'10px 0', color:'#007bff'}}>Personal Details</h4>
                        <div className="form-row">
                            <div className="form-group">
                                <label>Phone</label>
                                <input 
                                    required 
                                    value={newStudent.phone} 
                                    onChange={e => setNewStudent({...newStudent, phone: e.target.value})} 
                                />
                            </div>
                            <div className="form-group">
                                <label>Parent Name</label>
                                <input 
                                    required 
                                    value={newStudent.parentName} 
                                    onChange={e => setNewStudent({...newStudent, parentName: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div className="form-group">
                            <label>Address</label>
                            <input 
                                required 
                                value={newStudent.address} 
                                onChange={e => setNewStudent({...newStudent, address: e.target.value})} 
                            />
                        </div>

                        <div style={{marginTop: '15px'}}>
                            <button type="submit" className="btn-success">Save Student</button>
                            <button type="button" onClick={() => setShowAddModal(false)} className="btn-danger" style={{marginLeft: '10px'}}>Cancel</button>
                        </div>
                    </form>
                </div>
            </div>
        )}

        {/* --- EDIT STUDENT MODAL (Existing) --- */}
        {editMode && (
            <div className="modal">
                <div className="modal-content">
                    <h3>Edit Student</h3>
                    <form onSubmit={handleUpdate}>
                        <input value={currentStudent.username} onChange={e => setCurrentStudent({...currentStudent, username: e.target.value})} placeholder="Username" />
                        <input value={currentStudent.email} onChange={e => setCurrentStudent({...currentStudent, email: e.target.value})} placeholder="Email" />
                        <input value={currentStudent.phone} onChange={e => setCurrentStudent({...currentStudent, phone: e.target.value})} placeholder="Phone" />
                        <input value={currentStudent.parentName} onChange={e => setCurrentStudent({...currentStudent, parentName: e.target.value})} placeholder="Parent Name" />
                        <input value={currentStudent.address} onChange={e => setCurrentStudent({...currentStudent, address: e.target.value})} placeholder="Address" />
                        <input value={currentStudent.branch} onChange={e => setCurrentStudent({...currentStudent, branch: e.target.value})} placeholder="Branch" />
                        <input placeholder="New Password" type="password" onChange={e => setCurrentStudent({...currentStudent, password: e.target.value})} />
                        <button type="submit" className="btn-primary">Save</button>
                        <button type="button" onClick={() => setEditMode(false)} className="btn-danger" style={{marginLeft: '10px'}}>Cancel</button>
                    </form>
                </div>
            </div>
        )}
    </div>
  );
}

export default AdminStudents;
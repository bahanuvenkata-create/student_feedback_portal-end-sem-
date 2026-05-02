import React from 'react';
import { Link, useLocation } from 'react-router-dom';

function Navbar({ user, logout }) {
  const location = useLocation();

  return (
    <div className="sidebar">
      <div>
        <div className="sidebar-brand">
          DashBaord
        </div>
        
        <ul className="sidebar-menu" >
          {user.role === 'STUDENT' ? (
            <>
              <li>
                <Link to="/home" className={location.pathname === '/home' ? 'active' : ''}>Home</Link>
              </li>
              <li>
                <Link to="/feedback" className={location.pathname === '/feedback' ? 'active' : ''}>Feedback</Link>
              </li>
              <li>
                <Link to="/profile" className={location.pathname === '/profile' ? 'active' : ''}>Profile</Link>
              </li>
            </>
          ) : (
            <>
                            <li>
                <Link to="/admin/home" className={location.pathname.includes('/admin/home') ? 'active' : ''}>Home</Link>
              </li>
              <li>
                <Link to="/admin/students" className={location.pathname.includes('/admin/students') ? 'active' : ''}>Students</Link>
              </li>
              <li>
                <Link to="/admin/feedback" className={location.pathname.includes('/admin/feedback') ? 'active' : ''}>Feedback Mgm</Link>
              </li>
              <li>
                <Link to="/admin/profile" className={location.pathname.includes('/admin/profile') ? 'active' : ''}>Profile</Link>
              </li>
            </>
          )}
        </ul>
      </div>

      <button onClick={logout} className="sidebar-logout">
        Logout
      </button>
    </div>
  );
}

export default Navbar;
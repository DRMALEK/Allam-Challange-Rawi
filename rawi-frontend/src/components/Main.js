import React from 'react';
import { useNavigate } from 'react-router-dom';
import { registerLicense } from '@syncfusion/ej2-base';

// Register Syncfusion community license
registerLicense('Ngo9BigBOggjHTQxAR8/V1NDaF5cWWtCf1FpRmJGdld5fUVHYVZUTXxaS00DNHVRdkdnWH5ecXVTR2BYU0NxW0A=');

function Main({ setIsAuthenticated }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    setIsAuthenticated(false);
    navigate('/');
  };

  return (
    <div className="main-container">
      <h2>Welcome to Main Page</h2>
      <p>You are logged in!</p>
      <button onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Main;
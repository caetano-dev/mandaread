import React from 'react';
import { useNavigate } from 'react-router-dom';

const NotFoundRoute: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div style={{ 
      padding: '40px 20px', 
      textAlign: 'center',
      minHeight: '50vh',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <h1 style={{ fontSize: '3em', margin: '0 0 20px 0', color: '#666' }}>404</h1>
      <h2 style={{ margin: '0 0 20px 0', color: '#888' }}>Page Not Found</h2>
      <p style={{ margin: '0 0 30px 0', color: '#999', maxWidth: '400px' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button 
          onClick={() => navigate('/')}
          style={{
            padding: '12px 24px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go to Home
        </button>
        <button 
          onClick={() => navigate(-1)}
          style={{
            padding: '12px 24px',
            backgroundColor: '#6c757d',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          Go Back
        </button>
      </div>
    </div>
  );
};

export default NotFoundRoute;
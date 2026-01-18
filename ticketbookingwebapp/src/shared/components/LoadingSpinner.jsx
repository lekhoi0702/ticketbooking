import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = false }) => {
    return (
        <div className={`loading-spinner-wrapper ${fullScreen ? 'fullscreen' : ''}`}>
            <img
                src="/loading.gif"
                alt="Loading..."
                className="loading-gif"
            />
        </div>
    );
};

export default LoadingSpinner;

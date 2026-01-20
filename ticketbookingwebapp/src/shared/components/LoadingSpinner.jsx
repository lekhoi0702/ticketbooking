import React from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = false, tip = "" }) => {
    return (
        <div className={`loading-spinner-wrapper ${fullScreen ? 'fullscreen' : ''}`}>
            <div className="loading-content">
                <img
                    src="/loading.gif"
                    alt="Loading..."
                    className="loading-gif"
                />
                {tip && <p className="loading-tip">{tip}</p>}
            </div>
        </div>
    );
};

export default LoadingSpinner;

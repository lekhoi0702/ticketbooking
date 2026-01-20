import React, { useEffect } from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = false, tip = "" }) => {
    // Prevent body scroll and reset scroll position when fullscreen loading is active
    useEffect(() => {
        if (fullScreen) {
            // Scroll to top immediately
            window.scrollTo(0, 0);
            
            // Prevent scrolling
            document.body.style.overflow = 'hidden';
            document.body.style.height = '100vh';
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.height = '100vh';
        }
        
        return () => {
            document.body.style.overflow = '';
            document.body.style.height = '';
            document.documentElement.style.overflow = '';
            document.documentElement.style.height = '';
        };
    }, [fullScreen]);

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

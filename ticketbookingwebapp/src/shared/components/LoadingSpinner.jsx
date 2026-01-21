import React, { useEffect } from 'react';
import './LoadingSpinner.css';

const LoadingSpinner = ({ fullScreen = false, tip = "" }) => {
    // Prevent body scroll and reset scroll position when fullscreen loading is active
    useEffect(() => {
        if (fullScreen) {
            // Get current scroll position
            const scrollY = window.scrollY;
            
            // Scroll to top immediately
            window.scrollTo(0, 0);
            
            // Prevent scrolling completely
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            document.body.style.height = '100vh';
            document.documentElement.style.overflow = 'hidden';
            document.documentElement.style.height = '100vh';
            
            // Also prevent scrolling on the main content area and layout
            const mainContent = document.querySelector('.app-content');
            const appLayout = document.querySelector('.app-layout');
            const mainElement = document.querySelector('main');
            
            if (mainContent) {
                mainContent.style.overflow = 'hidden';
                mainContent.style.height = '100vh';
            }
            if (appLayout) {
                appLayout.style.overflow = 'hidden';
            }
            if (mainElement) {
                mainElement.style.overflow = 'hidden';
            }
            
            // Store scroll position for restoration
            document.body.setAttribute('data-scroll-y', scrollY.toString());
        }
        
        return () => {
            // Restore scroll position
            const scrollY = document.body.getAttribute('data-scroll-y');
            if (scrollY) {
                document.body.removeAttribute('data-scroll-y');
                window.scrollTo(0, parseInt(scrollY, 10));
            }
            
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.top = '';
            document.body.style.width = '';
            document.body.style.height = '';
            document.documentElement.style.overflow = '';
            document.documentElement.style.height = '';
            
            const mainContent = document.querySelector('.app-content');
            const appLayout = document.querySelector('.app-layout');
            const mainElement = document.querySelector('main');
            
            if (mainContent) {
                mainContent.style.overflow = '';
                mainContent.style.height = '';
            }
            if (appLayout) {
                appLayout.style.overflow = '';
            }
            if (mainElement) {
                mainElement.style.overflow = '';
            }
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


import React from 'react';
import './GetStartedButton.css';

const GetStartedButton = ({ onClick }) => {
    return (
        <button className="get-started-btn" onClick={onClick}>
            <span className="btn-text">Get Started</span>
            <span className="btn-icon">
                <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                >
                    <line x1="5" y1="12" x2="19" y2="12"></line>
                    <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
            </span>
            <div className="btn-glow"></div>
        </button>
    );
};

export default GetStartedButton;

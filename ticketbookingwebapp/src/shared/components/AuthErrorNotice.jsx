import React from 'react';

const AuthErrorNotice = ({ message, style = {} }) => {
    if (!message) return null;

    return (
        <div
            role="alert"
            style={{
                marginBottom: 16,
                padding: '10px 12px',
                borderRadius: 8,
                border: '1px solid #ffccc7',
                background: '#fff2f0',
                color: '#cf1322',
                fontSize: 13,
                lineHeight: 1.4,
                ...style,
            }}
        >
            {message}
        </div>
    );
};

export default AuthErrorNotice;

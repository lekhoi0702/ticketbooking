import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom';

const AdminPortal = ({ children }) => {
    const [container, setContainer] = useState(null);

    useEffect(() => {
        const el = document.getElementById('admin-actions-container');
        if (el) {
            setContainer(el);
        }
    }, []);

    if (!container) return null;

    return ReactDOM.createPortal(children, container);
};

export default AdminPortal;

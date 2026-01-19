import React from 'react';
import { Link } from 'react-router-dom';
import { FaHome, FaChevronRight } from 'react-icons/fa';
import './AntBreadcrumb.css';

/**
 * Ant Design styled Breadcrumb component
 * @param {Array} items - Array of breadcrumb items: [{ label, path, icon }]
 */
const AntBreadcrumb = ({ items = [] }) => {
    return (
        <nav className="ant-breadcrumb" aria-label="Breadcrumb">
            <ol className="ant-breadcrumb-list">
                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={index} className="ant-breadcrumb-item">
                            {!isLast ? (
                                <>
                                    <Link to={item.path} className="ant-breadcrumb-link">
                                        {item.icon && <span className="ant-breadcrumb-icon">{item.icon}</span>}
                                        <span className="ant-breadcrumb-text">{item.label}</span>
                                    </Link>
                                    <span className="ant-breadcrumb-separator">
                                        <FaChevronRight />
                                    </span>
                                </>
                            ) : (
                                <span className="ant-breadcrumb-link ant-breadcrumb-link-active">
                                    {item.icon && <span className="ant-breadcrumb-icon">{item.icon}</span>}
                                    <span className="ant-breadcrumb-text">{item.label}</span>
                                </span>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
};

export default AntBreadcrumb;

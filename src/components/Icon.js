import React from 'react';
import { Link } from 'react-router-dom';

const Icon = ({ title, path, icon }) => {
    return (
        <Link to={path} className="icon-link">
            <div className="icon">
                <div className="icon-image">{icon}</div>
                <div className="icon-title">{title}</div>
            </div>
        </Link>
    );
};

export default Icon; 
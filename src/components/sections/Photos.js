// src/components/sections/Photos.js
import React, { useState } from 'react';
import './SectionStyles.css';
import useWindowControls from '../../hooks/useWindowControls';

// Exact matching photos in /public/photos to avoid 404 requests and layout shifts
const validPhotoNumbers = [
    2, 3, 4, 5, 6, 7, 8, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20,
    21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 32, 33, 34, 35, 36,
    37, 38, 39, 40, 42, 43, 44
];

const photoFiles = validPhotoNumbers.map(num => {
    // We check both lowercase and uppercase JPG if requested, but most are .JPG / .jpg
    // Let's just use the exact extensions we found to be safe:
    let ext = '.jpg';
    if ([2, 3, 4, 5, 6, 13, 15, 16, 18, 20, 22, 23, 24, 26, 30, 32, 33, 34, 35, 37, 38, 40, 42, 44].includes(num)) ext = '.JPG';
    return {
        filename: `${num}${ext}`,
        caption: '',
    };
});

const Photos = () => {
    const { isExpanded, isVisible, animState, onAnimationEnd, TrafficLights } = useWindowControls();
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    if (!isVisible) return null;

    return (
        <div
            className={`section photos ${isExpanded ? 'expanded' : ''} ${animState || ''}`}
            onAnimationEnd={onAnimationEnd}
        >
            <div className="section-header">
                <TrafficLights />
                <h2>photos</h2>
            </div>

            <div className="section-content photos-scroll-content">
                <div className="photos-masonry">
                    {photoFiles.map((photo, index) => (
                        <div
                            key={index}
                            className="photos-tile"
                            onClick={() => setSelectedPhoto(photo)}
                        >
                            <img
                                src={`/photos/${photo.filename}`}
                                alt={photo.caption || `Photo ${index + 1}`}
                                loading="lazy"
                                onError={(e) => {
                                    e.target.style.display = 'none';
                                    e.target.parentNode.classList.add('photos-tile--placeholder');
                                }}
                            />
                        </div>
                    ))}
                </div>
            </div>

            {selectedPhoto && (
                <div className="photos-lightbox" onClick={() => setSelectedPhoto(null)}>
                    <div className="photos-lightbox-content" onClick={e => e.stopPropagation()}>
                        <button className="photos-lightbox-close" onClick={() => setSelectedPhoto(null)}>×</button>
                        <img
                            src={`/photos/${selectedPhoto.filename}`}
                            alt={selectedPhoto.caption || 'Photo'}
                        />
                        {selectedPhoto.caption && (
                            <p className="photos-lightbox-caption">{selectedPhoto.caption}</p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Photos;

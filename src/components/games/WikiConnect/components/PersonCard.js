import React from 'react';

export const PersonCard = ({ person, type, startPerson, getWikipediaUrl }) => {
    if (type === "current" && person?.title === startPerson?.title) {
        return (
            <div className={`person-card ${type}-card`}>
                <div className="question-mark-container">
                    <div className="question-mark">?</div>
                </div>
            </div>
        );
    }

    return (
        <div className={`person-card ${type}-card`}>
            <div className="card-label">{type.charAt(0).toUpperCase() + type.slice(1)}</div>
            <div className="card-content">
                <div className="person-image">
                    {person?.imageUrl ? (
                        <img src={person.imageUrl} alt={person.title} />
                    ) : (
                        <div className="default-image">
                            <span>{person?.title?.[0] || '?'}</span>
                        </div>
                    )}
                </div>
                <div className="person-info">
                    <div className="person-title">
                        <a
                            href={getWikipediaUrl(person?.title)}
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            {person?.title}
                        </a>
                    </div>
                    <div className="person-description">
                        {person?.description}
                    </div>
                </div>
            </div>
        </div>
    );
}; 
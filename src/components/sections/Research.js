// src/components/sections/Research.js
import React from 'react';
import './SectionStyles.css';
import useWindowControls from '../../hooks/useWindowControls';

const Research = () => {
    const { isExpanded, isVisible, animState, onAnimationEnd, TrafficLights } = useWindowControls();

    const research = [
        {
            title: "Research Apprentice at UC Berkeley School of Informatics",
            advisor: "Prof. Zachary Pardos",
            date: "February 2023 - May 2023",
            description: "Worked on the OATutor platform, enabling facilitation of mathematics education",
        },
        {
            title: "Research Apprentice at UCSF Memory and Aging Center",
            advisor: "Dr. Jet Vonk",
            date: "February 2024 - May 2024",
            description: "Developed, integrated, and evaluated content units in Linguistic Pipelines to quantify and interpret semantic richness of patient data.",
        },
        {
            title: "NLP Research at Haas School of Business",
            advisor: "Prof. Biwen Zhang",
            date: "April 2024 - June 2024",
            description: "Developed BERT models on large-scale datasets, fine-tuning hyperparameters for accurate semantic categorization and understanding of semantic textual data.",
        },
        {
            title: "Journalism and LLM Research",
            advisor: "Alexander Spangher",
            date: "May 2024 - September 2024",
            description: "Working on Large Language Model research in the intersection of Journalism and Newspaper Bias",
        },
        {
            title: "Transformaer Architectures for Regression Models",
            advisor: "Deep Learning at Berkeley",
            date: "September 2025 - Febuary 2026",
            description: <a href='https://arxiv.org/abs/2602.17171' target='_blank'>View Paper</a>,
        },
        {
            title: "Transformers for Social Media Trends and Algortihims",
            advisor: "Designing Algorithmic Media",
            date: "January 2026 - Current",
            description: "In Progress",
        }
    ];

    if (!isVisible) return null;

    return (
        <div className={`section research ${isExpanded ? 'expanded' : ''} ${animState || ''}`} onAnimationEnd={onAnimationEnd}>
            <div className="section-header">
                <TrafficLights />
                <h2>research</h2>
            </div>
            <div className="section-content">
                {research.map((item, index) => (
                    <div key={index} className="research-item">
                        <div className="research-header">
                            <h3>{item.title}</h3>
                            <span className="research-date">{item.date}</span>
                        </div>
                        {item.advisor && (
                            <div className="research-lab">
                                <span>{item.advisor}</span>
                            </div>
                        )}
                        <p className="description">{item.description}</p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Research;

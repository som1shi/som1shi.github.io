
import React from 'react';
import './Projects.css';

const Projects = () => {
  return (
    <section className="projects" id="projects">
      <h2>Projects</h2>
      <div className="project-list">
        <div className="project-item">
          <h3>Project 1</h3>
          <p>Description of the project.</p>
        </div>
        {/* Repeat for more projects */}
      </div>
    </section>
  );
};

export default Projects;

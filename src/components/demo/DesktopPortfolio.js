import React from 'react';
import { FaArrowRight, FaExternalLinkAlt } from 'react-icons/fa';
import { experiences, profile, projects, research, socialLinks } from '../../content/portfolioContent';
import DesktopAppWindow from './DesktopAppWindow';

const ExternalLink = ({ href, children, className = '', ...props }) => (
  <a className={className} href={href} target="_blank" rel="noopener noreferrer" {...props}>
    {children}
  </a>
);

const DesktopPortfolio = () => {
  const remainingProjects = projects.filter((project) => !project.featured);

  return (
    <>
      <section id="about" className="desktop-story desktop-about" aria-label="About Me" data-reveal>
        <DesktopAppWindow app="about">
          <div className="desktop-about-copy">
            {profile.about.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
          </div>
        </DesktopAppWindow>
      </section>

      <section id="projects" className="desktop-story" aria-label="Projects">
        <DesktopAppWindow app="projects">
          <div className="desktop-feature-grid">
            <section className="desktop-card os32-card" aria-label="os32" data-reveal>
              <div className="portfolio-card-heading">
                <span>Featured project</span>
                <ExternalLink href={socialLinks.os32} className="card-icon-link" aria-label="Open os32">
                  <FaExternalLinkAlt />
                </ExternalLink>
              </div>
              <div className="os32-copy">
                <p>Web operating system</p>
                <h3>os32</h3>
                <span>A playful desktop with a file system, terminal, browser, and built-in apps.</span>
              </div>
              <div className="os32-preview" aria-hidden="true">
                <div className="os32-preview-bar"><span>os32</span></div>
                <div className="os32-preview-body">
                  <strong>~/portfolio</strong>
                  <span>open projects</span>
                  <span>open photos</span>
                  <span>open games</span>
                </div>
              </div>
            </section>

            <section className="desktop-card academic-card" aria-label="Computer Vision & Graphics" data-reveal>
              <div className="portfolio-card-heading"><span>Coursework</span></div>
              <h3>Computer Vision &amp; Graphics</h3>
              <p>Two project collections covering computational photography, graphics, geometry, and rendering.</p>
              <div className="academic-links">
                {projects.filter((project) => project.featured && project.id !== 'os32').map((project) => (
                  <ExternalLink href={project.url} key={project.id}>
                    <span>{project.id === 'computer-vision' ? 'CS 180' : 'CS 184'}</span>
                    <strong>{project.id === 'computer-vision' ? 'Computational photography' : 'Computer graphics'}</strong>
                    <FaArrowRight />
                  </ExternalLink>
                ))}
              </div>
            </section>
          </div>

          <div className="portfolio-index desktop-scroll-widget" aria-label="More projects" tabIndex="0">
            {remainingProjects.map((project, index) => {
              const content = (
                <>
                  <span className="portfolio-index-number">{String(index + 1).padStart(2, '0')}</span>
                  <div>
                    <h3>{project.title}</h3>
                    <p>{project.description}</p>
                    <span className="portfolio-index-tags">{project.technologies.join(' · ')}</span>
                  </div>
                  <span className="portfolio-index-action">{project.url ? <FaArrowRight /> : 'Private project'}</span>
                </>
              );

              return project.url ? (
                <ExternalLink className="portfolio-index-item" href={project.url} key={project.id}>{content}</ExternalLink>
              ) : (
                <article className="portfolio-index-item" key={project.id}>{content}</article>
              );
            })}
          </div>
        </DesktopAppWindow>
      </section>

      <section id="research" className="desktop-story" aria-label="Research">
        <DesktopAppWindow app="research">
          <div className="desktop-list-card desktop-scroll-widget" role="region" aria-label="Current research" tabIndex="0" data-reveal>
            {research.map((item, index) => {
              const body = (
                <>
                  <span className="desktop-list-number">{String(index + 1).padStart(2, '0')}</span>
                  <div className="desktop-list-copy">
                    <span>{item.organization}</span>
                    <h3>{item.title}</h3>
                    <p>{item.description}</p>
                  </div>
                  <div className="desktop-list-meta"><span>{item.date}</span>{item.url && <FaArrowRight />}</div>
                </>
              );

              return item.url ? (
                <ExternalLink className="desktop-list-row" href={item.url} key={item.id}>{body}</ExternalLink>
              ) : (
                <article className="desktop-list-row" key={item.id}>{body}</article>
              );
            })}
          </div>
        </DesktopAppWindow>
      </section>

      <section id="experience" className="desktop-story" aria-label="Experience">
        <DesktopAppWindow app="experience">
          <div className="desktop-list-card experience-directory desktop-scroll-widget" role="region" aria-label="Recent experience" tabIndex="0" data-reveal>
            <ExternalLink href={socialLinks.linkedin} className="experience-link" aria-label="Open LinkedIn">
              LinkedIn <FaExternalLinkAlt />
            </ExternalLink>
            {experiences.map((item) => (
              <article className="experience-directory-row" key={item.id}>
                <h3>{item.company}</h3>
                <span>{item.role}</span>
                <span>{item.date}</span>
                <span>{item.location}</span>
              </article>
            ))}
          </div>
        </DesktopAppWindow>
      </section>
    </>
  );
};

export default DesktopPortfolio;

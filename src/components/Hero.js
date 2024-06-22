import React from 'react';
import './Hero.css';

const Hero = () => {
  return (
    <section className="hero" id="home">
      <h1>Hello, I'm Sarvagya</h1>
      <p>Computer Scientist and Software Developer</p>
      <div className="buttons">
        <button className="button about-me">About Me</button>
        <button className="button experiences">Experiences</button>
        <button className="button projects">Projects</button>
      </div>
    </section>
  );
};

export default Hero;

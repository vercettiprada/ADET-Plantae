import React from 'react';
import './About.css';

const About = ({ onBack }) => {
  return (
    <div className="about-page">
      <div className="about-container">
        <button className="back-btn" onClick={onBack}>← Back to Garden</button>
        
        <header className="about-header">
          <h1 className="brand-title">About Plantae</h1>
          <p className="subtitle">Cultivating Digital Serenity</p>
        </header>

        <section className="about-content">
          <div className="glass-card about-card">
            <h3>Our Mission</h3>
            <p>
              Plantae was born from a desire to bridge the gap between technology and nature. 
              We believe that tracking your green companions should be as beautiful as the 
              plants themselves.
            </p>
          </div>

          <div className="about-grid">
            <div className="glass-card">
              <h4>Minimalist Design</h4>
              <p>Inspired by Apple's clean aesthetics and the organic curves of nature.</p>
            </div>
            <div className="glass-card">
              <h4>Smart Care</h4>
              <p>Tailored watering and light schedules for every unique species.</p>
            </div>
          </div>

          <div className="version-tag">Version 2.0.26 • Built with React</div>
        </section>
      </div>
    </div>
  );
};

export default About;
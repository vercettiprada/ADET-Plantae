import React from 'react';
import './styles/About.css';

const About = ({ onBack }) => (
  <div className="about-page">
    <div className="about-container">
      <button className="back-btn" type="button" onClick={onBack}>Back to Garden</button>

      <header className="about-header">
        <h1 className="brand-title">About Plantae</h1>
        <p className="subtitle">Cultivating Digital Serenity</p>
      </header>

      <section className="about-content">
        <div className="about-card">
          <h3>Our Mission</h3>
          <p>
            Plantae was born from a desire to bridge the gap between technology and nature.
            We believe that tracking your green companions should be as beautiful as the plants
            themselves.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-mini-card">
            <h4>Minimalist Design</h4>
            <p>Inspired by Apple-like calm, soft surfaces, and the organic curves of nature.</p>
          </div>
          <div className="about-mini-card">
            <h4>Smart Care</h4>
            <p>Tailored watering and light details for every species in your sanctuary.</p>
          </div>
        </div>
      </section>
    </div>
  </div>
);

export default About;

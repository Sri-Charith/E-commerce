import React from "react";
import "./Hero.css";
import hand_icon from "../assets/hand_icon.png";
import arrow_icon from "../assets/arrow.png";
import hero_image from "../assets/hero_image.png";

const Hero = () => {
  return (
    <div className="hero">
      <div className="hero-left">
        <h2>NEW ARRIVALS ONLY</h2>

        <div className="hero-hand-icon">
          <h1>new</h1>
          <img src={hand_icon} alt="hand waving" />
        </div>

        <h1>collections</h1>
        <h1>for everyone</h1>

        <div className="hero-latest-btn">
          <div>Latest Collection</div>
          <img src={arrow_icon} alt="arrow" />
        </div>
      </div>

      <div className="hero-right">
        <img src={hero_image} alt="fashion" />
      </div>
    </div>
  );
};

export default Hero;

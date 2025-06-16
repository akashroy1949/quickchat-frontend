import React, { useEffect, useState, useRef } from 'react';
import PropTypes from 'prop-types';

const ScrollIcon = ({ onClick }) => {
  const [isVisible, setIsVisible] = useState(true);
  const animationFrame = useRef(null);
  const isScrolling = useRef(false);
  
  useEffect(() => {
    const handleScroll = () => {
      // Clear any existing animation frame
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }

      // Use requestAnimationFrame for smooth state updates
      animationFrame.current = requestAnimationFrame(() => {
        if (window.scrollY > 30) {
          setIsVisible(false);
        } else if (window.scrollY === 0) {
          // Only if we're completely at the top
          if (!isScrolling.current) {
            setIsVisible(true);
          }
        }
      });
    };

    // Detect start and end of scrolling
    let scrollTimeout;
    const handleScrollStart = () => {
      isScrolling.current = true;
      clearTimeout(scrollTimeout);
      
      scrollTimeout = setTimeout(() => {
        isScrolling.current = false;
        // Check if we should show the icon after scrolling stops
        if (window.scrollY === 0) {
          setIsVisible(true);
        }
      }, 150); // Adjust this timeout as needed
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScrollStart, { passive: true });

    // Initial state
    setIsVisible(window.scrollY === 0);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScrollStart);
      if (animationFrame.current) {
        cancelAnimationFrame(animationFrame.current);
      }
      clearTimeout(scrollTimeout);
    };
  }, []);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      onClick();
    }
  };

  return (
    <button 
      className={`scroll-icon ${!isVisible ? 'scroll-icon-hidden' : ''}`}
      onClick={onClick}
      onKeyDown={handleKeyDown}
      aria-label="Scroll down"
      type="button"
    />
  );
};

ScrollIcon.propTypes = {
  onClick: PropTypes.func.isRequired,
};

export default ScrollIcon;

import React, { useEffect, useState, useRef } from 'react';
import { useInView, useSpring } from 'framer-motion';

const AnimatedNumber = ({ value, format }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [displayValue, setDisplayValue] = useState(0);

  const spring = useSpring(0, {
    damping: 20,
    stiffness: 100,
  });

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [spring, isInView, value]);

  useEffect(() => {
    const unsubscribe = spring.on("change", (latest) => {
      setDisplayValue(latest);
    });
    return () => unsubscribe();
  }, [spring]);

  const formatDisplayValue = () => {
    const formatted = format(displayValue);
    // This regex ensures we only split on the first number sequence
    const match = String(formatted).match(/(\D*)(\d.*)/);
    if (!match) return formatted;
    
    const [, prefix, numberPart] = match;
    return (
      <>
        {prefix}
        {numberPart}
      </>
    );
  };

  return <span ref={ref}>{formatDisplayValue()}</span>;
};

export default AnimatedNumber;

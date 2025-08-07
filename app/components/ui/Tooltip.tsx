import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  children: React.ReactNode;
  content: string;
  position?: 'top' | 'right' | 'bottom' | 'left';
}

const Tooltip: React.FC<TooltipProps> = ({ 
  children, 
  content,
  position = 'top' 
}) => {
  const [isVisible, setIsVisible] = useState(false);

  // Position styles
  const getPositionStyles = () => {
    switch (position) {
      case 'right':
        return { 
          left: 'calc(100% + 10px)', 
          top: '50%', 
          transform: 'translateY(-50%)'
        };
      case 'bottom':
        return { 
          top: 'calc(100% + 10px)', 
          left: '50%', 
          transform: 'translateX(-50%)' 
        };
      case 'left':
        return { 
          right: 'calc(100% + 10px)', 
          top: '50%', 
          transform: 'translateY(-50%)'
        };
      case 'top':
      default:
        return { 
          bottom: 'calc(100% + 10px)', 
          left: '50%', 
          transform: 'translateX(-50%)' 
        };
    }
  };

  return (
    <div 
      className="relative inline-block"
      onMouseEnter={() => setIsVisible(true)}
      onMouseLeave={() => setIsVisible(false)}
      onFocus={() => setIsVisible(true)}
      onBlur={() => setIsVisible(false)}
    >
      {children}
      <AnimatePresence>
        {isVisible && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.15 }}
            className="absolute z-50 w-max max-w-xs px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-md shadow-sm"
            style={getPositionStyles()}
            role="tooltip"
          >
            {content}
            <div 
              className={`absolute w-2 h-2 bg-gray-900 transform rotate-45 ${
                position === 'bottom' ? 'top-[-4px] left-1/2 -translate-x-1/2' :
                position === 'top' ? 'bottom-[-4px] left-1/2 -translate-x-1/2' :
                position === 'left' ? 'right-[-4px] top-1/2 -translate-y-1/2' :
                'left-[-4px] top-1/2 -translate-y-1/2'
              }`}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Tooltip;
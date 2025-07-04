import React, { useState } from 'react';
import styles from './DropdownMenu.module.css';

const DropdownMenu = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);


  return (
    <div 
      className={styles.dropdown}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      
      <div className={styles.trigger}>
        {trigger}
      </div>
      
      {isOpen && (
        <div className={styles.menu}>
          {children}
        </div>
      )}
    </div>
  );
};

export default DropdownMenu;
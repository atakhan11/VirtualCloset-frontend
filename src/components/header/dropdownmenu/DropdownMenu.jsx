// src/components/Header/DropdownMenu.jsx
import React, { useState } from 'react';
import styles from './DropdownMenu.module.css';

const DropdownMenu = ({ trigger, children }) => {
  const [isOpen, setIsOpen] = useState(false);

  // DƏYİŞİKLİK BURADADIR:
  // onMouseEnter və onMouseLeave hadisələrini trigger-dən alıb
  // həm trigger-i, həm də menyunu əhatə edən ana .dropdown div-inə veririk.
  return (
    <div 
      className={styles.dropdown}
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      {/* Trigger olduğu kimi qalır, amma artıq üzərində event yoxdur */}
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
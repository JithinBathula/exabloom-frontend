import React from 'react';
import { Button } from '../ui/button';

interface NodeMenuProps {
  position: { x: number; y: number };
  onAddAction: () => void;
  onAddIfElse: () => void;
  onClose: () => void;
}

const styles = {
  menu: {
    position: 'fixed' as const,
    zIndex: 100,
    background: '#fff',
    border: '1px solid #ccc',
    padding: 5,
    borderRadius: 4,
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
  },
  button: {
    display: 'block' as const,
    width: '100%',
    marginBottom: 4,
  }
};

export const NodeMenu: React.FC<NodeMenuProps> = ({ position, onAddAction, onAddIfElse, onClose }) => {
  // Close menu when clicking outside
  React.useEffect(() => {
    const handleClickOutside = () => onClose();
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [onClose]);

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div 
      style={{ ...styles.menu, left: position.x, top: position.y }}
      onClick={handleClick}
    >
      <button onClick={onAddAction} style={styles.button}>
        Action Node
      </button>
      <button onClick={onAddIfElse} style={styles.button}>
        If/Else Node
      </button>
    </div>
  );
};
import React, { useState, useRef, useEffect } from 'react';

// Simple utility function to replace clsx
const cn = (...classes: (string | undefined | null | false)[]) => {
  return classes.filter(Boolean).join(' ');
};

export interface DropdownItem {
  key: string;
  label: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  divider?: boolean;
}

export interface LuxuryDropdownProps {
  trigger: React.ReactNode;
  items: DropdownItem[];
  align?: 'left' | 'right';
  className?: string;
}

export const LuxuryDropdown: React.FC<LuxuryDropdownProps> = ({
  trigger,
  items,
  align = 'left',
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleItemClick = (item: DropdownItem) => {
    if (item.disabled) return;
    item.onClick?.();
    setIsOpen(false);
  };

  return (
    <div className={cn('relative', className)} ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="focus:outline-none focus:ring-2 focus:ring-neon-green focus:ring-offset-2"
      >
        {trigger}
      </button>

      {isOpen && (
        <div
          className={cn(
            'absolute z-50 mt-2 min-w-[200px] rounded-xl bg-white/90 dark:bg-gray-900/90 backdrop-blur-xl border border-gray-200 dark:border-gray-700 shadow-2xl shadow-black/20',
            align === 'right' ? 'right-0' : 'left-0'
          )}
        >
          <div className="py-2">
            {items.map((item, index) => (
              <React.Fragment key={item.key}>
                {item.divider ? (
                  <div className="my-1 border-t border-gray-200 dark:border-gray-700" />
                ) : (
                  <button
                    onClick={() => handleItemClick(item)}
                    disabled={item.disabled}
                    className={cn(
                      'w-full px-4 py-2 text-left text-sm transition-colors duration-200 focus:outline-none focus:bg-white/20 dark:focus:bg-gray-800/20',
                      item.disabled
                        ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                        : 'text-gray-700 dark:text-gray-300 hover:text-neon-green hover:bg-white/20 dark:hover:bg-gray-800/20'
                    )}
                  >
                    <div className="flex items-center space-x-3">
                      {item.icon && (
                        <span className="text-current">{item.icon}</span>
                      )}
                      <span>{item.label}</span>
                    </div>
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}; 
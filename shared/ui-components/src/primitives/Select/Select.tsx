import React, { useState, useRef, useEffect } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';
import { auditLog } from '../../utils/auditLogger';
import { cn } from '../../utils/cn';

const selectVariants = cva(
  'relative w-full min-w-[200px] cursor-pointer rounded-md border border-gray-300 bg-white px-3 py-2 text-left shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'border-gray-300',
  error: 'border-red-500 focus:border-red-500 focus:ring-red-500',
        success: 'border-green-500 focus:border-green-500 focus:ring-green-500',
      },
      size: {
        sm: 'px-2 py-1 text-sm',
  md: 'px-3 py-2 text-base',
        lg: 'px-4 py-3 text-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
  size: 'md',
    },
  }
);

const optionVariants = cva(
  'relative cursor-pointer select-none px-3 py-2 hover:bg-gray-100 focus:bg-gray-100 focus:outline-none',
  {
    variants: {
      variant: {
        default: '',
  selected: 'bg-blue-50 text-blue-900',
        disabled: 'cursor-not-allowed opacity-50',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
  data?: Record<string, any>
}

export interface SelectProps
  extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onChange'>,
    VariantProps<typeof selectVariants> {
  options: SelectOption[];
  value?: string;
  onChange?: (value: string,
  option: SelectOption) => void;
  placeholder?: string;
  disabled?: boolean;
  required?: boolean;
  error?: string;
  success?: string;
  searchable?: boolean;
  multiSelect?: boolean;
  maxHeight?: string;
  onSearch?: (query: string) => void;
  renderOption?: (option: SelectOption,
  isSelected: boolean) => React.ReactNode;
  renderValue?: (selectedOptions: SelectOption[]) => React.ReactNode
}

const SelectComponent: React.FC<SelectProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option...',
  disabled = false,
  required = false,
  error,
  success,
  searchable = false,
  multiSelect = false,
  maxHeight = '200px',
  onSearch,
  renderOption,
  renderValue,
  className,
  variant,
  size,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedValues, setSelectedValues] = useState<string[]>(value ? [value] : []);
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedOptions = options.filter(option => selectedValues.includes(option.value));

  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : options;

  useEffect(() => {
    if (value && !selectedValues.includes(value)) {
      setSelectedValues([value])
}
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setSearchQuery('')
}
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside)
}, []);

  useEffect(() => {
    if (isOpen && searchable && searchInputRef.current) {
      searchInputRef.current.focus()
}
  }, [isOpen, searchable]);

  const handleToggle = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
      auditLog('select_toggle', {
        component: 'Select',
  isOpen: !isOpen,
        selectedValues,
      })
}
  };

  const handleOptionSelect = (option: SelectOption) => {
    if (option.disabled) return;

    let newSelectedValues: string[];

    if (multiSelect) {
      newSelectedValues = selectedValues.includes(option.value)
        ? selectedValues.filter(v => v !== option.value)
        : [...selectedValues, option.value]
} else {
      newSelectedValues = [option.value];
      setIsOpen(false);
      setSearchQuery('')
}

    setSelectedValues(newSelectedValues);

    const selectedOption = options.find(opt => opt.value === option.value);
    if (selectedOption && onChange) {
      onChange(option.value, selectedOption)
}

    auditLog('select_option_selected', {
      component: 'Select',
  selectedValue: option.value,
      selectedLabel: option.label,
      multiSelect,
    })
};

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setSearchQuery(query);
    if (onSearch) {
      onSearch(query)
}
  };

  const displayValue = () => {
    if (renderValue) {
      return renderValue(selectedOptions)
}

    if (selectedOptions.length === 0) {
      return <span className="text-gray-500">{placeholder}</span>
}

    if (multiSelect) {
      return (
        <div className="flex flex-wrap gap-1">
          {selectedOptions.map(option => (
            <span
              key={option.value}
              className="inline-flex items-center rounded-full bg-blue-100 px-2 py-1 text-xs font-medium text-blue-800"
            >
              {option.label}
            </span>
          ))}
        </div>
      )
}

    return selectedOptions[0]?.label || placeholder
};

  return (
    <div
      ref={containerRef}
      className={cn('relative', className)}
      {...props}
    >
      <div
        className={cn(
          selectVariants({ variant: error ? 'error' : success ? 'success' : variant, size }),
          isOpen && 'ring-2 ring-blue-500'
        )}
        onClick={handleToggle}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        aria-labelledby="select-label"
        tabIndex={disabled ? -1 : 0}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1 truncate">{displayValue()}</div>
          <svg
            className={cn(
              'h-4 w-4 text-gray-400 transition-transform',
              isOpen && 'rotate-180'
            )}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </div>
      </div>

      {isOpen && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg"
          style={{ maxHeight }}
        >
          {searchable && (
            <div className="border-b border-gray-200 p-2">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search options..."
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>
          )}

          <div className="max-h-48 overflow-auto">
            {filteredOptions.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500">No options found</div>
            ) : (
              filteredOptions.map(option => {
                const isSelected = selectedValues.includes(option.value);
                return (
                  <div
                    key={option.value}
                    className={cn(
                      optionVariants({
                        variant: option.disabled ? 'disabled' : isSelected ? 'selected' : 'default',
                      })
                    )}
                    onClick={() => handleOptionSelect(option)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    {renderOption ? (
                      renderOption(option, isSelected)
                    ) : (
                      <div className="flex items-center justify-between">
                        <span>{option.label}</span>
                        {isSelected && (
                          <svg
                            className="h-4 w-4 text-blue-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                    )}
                  </div>
                )
})
            )}
          </div>
        </div>
      )}

      {error && (
        <p className="mt-1 text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
      {success && (
        <p className="mt-1 text-sm text-green-600" role="alert">
          {success}
        </p>
      )}
    </div>
  )
};

export const Select = withCompliance(withPerformance(SelectComponent));

export default Select;

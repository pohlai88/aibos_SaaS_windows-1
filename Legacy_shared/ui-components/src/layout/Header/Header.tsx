import React, { useState } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { withCompliance } from '../../core/compliance/withCompliance';
import { withPerformance } from '../../core/performance/withPerformance';
import { auditLog } from '../../utils/auditLogger';
import { cn } from '../../utils/cn';
import { Button } from '../../primitives/Button/Button';
import { Avatar } from '../../primitives/Avatar/Avatar';

const headerVariants = cva(
  'sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60',
  {
    variants: {
      variant: {
        default: 'border-gray-200 bg-white',
  elevated: 'border-gray-200 bg-white shadow-sm',
        transparent: 'border-transparent bg-transparent',
      },
      size: {
        sm: 'h-12',
  md: 'h-16',
        lg: 'h-20',
      },
    },
    defaultVariants: {
      variant: 'default',
  size: 'md',
    },
  }
);

export interface HeaderProps
  extends React.HTMLAttributes<HTMLElement>,
    VariantProps<typeof headerVariants> {
  logo?: React.ReactNode;
  title?: string;
  navigation?: Array<{
    label: string;
    href: string;
    active?: boolean;
    icon?: React.ReactNode
}>;
  actions?: React.ReactNode;
  user?: {
    name: string;
    email: string;
    avatar?: string;
    role?: string
};
  onUserMenuClick?: (action: string) => void;
  onNavigationClick?: (href: string) => void;
  mobileMenuOpen?: boolean;
  onMobileMenuToggle?: () => void
}

const HeaderComponent: React.FC<HeaderProps> = ({
  className,
  variant,
  size,
  logo,
  title,
  navigation = [],
  actions,
  user,
  onUserMenuClick,
  onNavigationClick,
  mobileMenuOpen = false,
  onMobileMenuToggle,
  children,
  ...props
}) => {
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const handleNavigationClick = (href: string) => {
    if (onNavigationClick) {
      onNavigationClick(href)
}
    auditLog('header_navigation_click', {
      component: 'Header',
      href,
    })
};

  const handleUserMenuClick = (action: string) => {
    setUserMenuOpen(false);
    if (onUserMenuClick) {
      onUserMenuClick(action)
}
    auditLog('header_user_menu_click', {
      component: 'Header',
      action,
      userName: user?.name,
    })
};

  const handleMobileMenuToggle = () => {
    if (onMobileMenuToggle) {
      onMobileMenuToggle()
}
    auditLog('header_mobile_menu_toggle', {
      component: 'Header',
  mobileMenuOpen: !mobileMenuOpen,
    })
};

  return (
    <header
      className={cn(headerVariants({ variant, size }), className)}
      {...props}
    >
      <div className="container mx-auto px-4 h-full">
        <div className="flex items-center justify-between h-full">
          {/* Logo and Title */}
          <div className="flex items-center space-x-4">
            {logo && <div className="flex-shrink-0">{logo}</div>}
            {title && (
              <h1 className="text-lg font-semibold text-gray-900">{title}</h1>
            )}
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.href}
                onClick={() => handleNavigationClick(item.href)}
                className={cn(
                  'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                  item.active
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                )}
              >
                {item.icon && <span>{item.icon}</span>}
                <span>{item.label}</span>
              </button>
            ))}
          </nav>

          {/* Actions and User Menu */}
          <div className="flex items-center space-x-4">
            {actions && <div className="flex items-center space-x-2">{actions}</div>}

            {user && (
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center space-x-3 p-2 rounded-md hover:bg-gray-50 transition-colors"
                >
                  <Avatar
                    src={user.avatar}
                    alt={user.name}
                    size="sm"
                    fallback={user.name}
                  />
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-medium text-gray-900">{user.name}</p>
                    {user.role && (
                      <p className="text-xs text-gray-500">{user.role}</p>
                    )}
                  </div>
                  <svg
                    className={cn(
                      'h-4 w-4 text-gray-400 transition-transform',
                      userMenuOpen && 'rotate-180'
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
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 z-50">
                    <div className="py-1">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900">{user.name}</p>
                        <p className="text-sm text-gray-500">{user.email}</p>
                      </div>
                      <button
                        onClick={() => handleUserMenuClick('profile')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Profile
                      </button>
                      <button
                        onClick={() => handleUserMenuClick('settings')}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        Settings
                      </button>
                      <button
                        onClick={() => handleUserMenuClick('logout')}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        Sign out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={handleMobileMenuToggle}
              className="md:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
            >
              <svg
                className="h-6 w-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-200 py-4">
            <nav className="flex flex-col space-y-2">
              {navigation.map((item) => (
                <button
                  key={item.href}
                  onClick={() => handleNavigationClick(item.href)}
                  className={cn(
                    'flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded-md transition-colors',
                    item.active
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-gray-700 hover:text-blue-600 hover:bg-gray-50'
                  )}
                >
                  {item.icon && <span>{item.icon}</span>}
                  <span>{item.label}</span>
                </button>
              ))}
            </nav>
          </div>
        )}
      </div>

      {children}
    </header>
  )
};

export const Header = withCompliance(withPerformance(HeaderComponent));

export default Header;

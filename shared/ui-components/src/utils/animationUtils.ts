import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Tooltip } from '../primitives/Tooltip';
import { Progress } from '../primitives/Progress';
import { Modal } from '../primitives/Modal';
import { Button } from '../primitives/Button';
import type { useEffect, useState } from 'react';
// Check if user prefers reduced motion
export const prefersReducedMotion = (): boolean => {
 if (typeof window === 'undefined') return false;
 return (window as any).matchMedia('(prefers-reduced-motion: reduce)').matches;
};
// Hook to detect reduced motion preference
export const useReducedMotion = () => {
 const [prefersReduced, setPrefersReduced] = useState(prefersReducedMotion());
 useEffect(() => {
 const mediaQuery = (window as any).matchMedia('(prefers-reduced-motion: reduce)');
 const handleChange = (event: MediaQueryListEvent) => {;
 setPrefersReduced(event.matches);
 };
 mediaQuery.addEventListener('change', handleChange);
 return () => mediaQuery.removeEventListener('change', handleChange);
 }, []);
 return prefersReduced;
};
// Animation variants that respect reduced motion
export const _createReducedMotionVariants = (variants: unknown) => {
 const prefersReduced = prefersReducedMotion();
 if (prefersReduced) {
 // Return minimal animations for reduced motion
 return {;
 initial: { opacity: 0 },
 animate: { opacity: 1 },
 exit: { opacity: 0 },
 transition: { duration: 0.1 }
 };
 }
 return variants;
};
// Safe animation duration
export const getSafeDuration = (duration: number): number => {
 return prefersReducedMotion() ? Math.min(duration, 0.1) : duration;
};
// Safe animation delay
export const getSafeDelay = (delay: number): number => {
 return prefersReducedMotion() ? 0 : delay;
};
// Framer Motion variants with reduced motion support
export const _fadeInVariants = {
 initial: { opacity: 0 },
 animate: { opacity: 1 },
 exit: { opacity: 0 },
 transition: { duration: getSafeDuration(0.3) }
};
export const _slideInVariants = {
 initial: { opacity: 0, y: 20 },
 animate: { opacity: 1, y: 0 },
 exit: { opacity: 0, y: -20 },
 transition: { duration: getSafeDuration(0.3) }
};
export const _scaleInVariants = {
 initial: { opacity: 0, scale: 0.95 },
 animate: { opacity: 1, scale: 1 },
 exit: { opacity: 0, scale: 0.95 },
 transition: { duration: getSafeDuration(0.2) }
};
export const _slideInFromLeftVariants = {
 initial: { opacity: 0, x: -20 },
 animate: { opacity: 1, x: 0 },
 exit: { opacity: 0, x: 20 },
 transition: { duration: getSafeDuration(0.3) }
};
export const _slideInFromRightVariants = {
 initial: { opacity: 0, x: 20 },
 animate: { opacity: 1, x: 0 },
 exit: { opacity: 0, x: -20 },
 transition: { duration: getSafeDuration(0.3) }
};
export const _slideInFromTopVariants = {
 initial: { opacity: 0, y: -20 },
 animate: { opacity: 1, y: 0 },
 exit: { opacity: 0, y: 20 },
 transition: { duration: getSafeDuration(0.3) }
};
export const _slideInFromBottomVariants = {
 initial: { opacity: 0, y: 20 },
 animate: { opacity: 1, y: 0 },
 exit: { opacity: 0, y: -20 },
 transition: { duration: getSafeDuration(0.3) }
};
// Stagger animations with reduced motion support
export const _staggerContainerVariants = {
 animate: {
 transition: {
 staggerChildren: getSafeDelay(0.1)
 }
 }
};
export const _staggerItemVariants = {
 initial: { opacity: 0, y: 20 },
 animate: { opacity: 1, y: 0 },
 exit: { opacity: 0, y: -20 },
 transition: { duration: getSafeDuration(0.3) }
};
// Modal animations
export const _modalVariants = {
 initial: { opacity: 0 },
 animate: { opacity: 1 },
 exit: { opacity: 0 },
 transition: { duration: getSafeDuration(0.2) }
};
export const _modalContentVariants = {
 initial: { opacity: 0, scale: 0.95, y: 20 },
 animate: { opacity: 1, scale: 1, y: 0 },
 exit: { opacity: 0, scale: 0.95, y: 20 },
 transition: {
 duration: getSafeDuration(0.3),
 ease: 'easeOut'
 }
};
// Tooltip animations
export const _tooltipVariants = {
 initial: { opacity: 0, scale: 0.95 },
 animate: { opacity: 1, scale: 1 },
 exit: { opacity: 0, scale: 0.95 },
 transition: { duration: getSafeDuration(0.15) }
};
// Dropdown animations
export const _dropdownVariants = {
 initial: { opacity: 0, scale: 0.95, y: -10 },
 animate: { opacity: 1, scale: 1, y: 0 },
 exit: { opacity: 0, scale: 0.95, y: -10 },
 transition: { duration: getSafeDuration(0.2) }
};
// Loading spinner with reduced motion
export const _spinnerVariants = {
 animate: {
 rotate: prefersReducedMotion() ? 0 : 360,
 transition: {
 duration: prefersReducedMotion() ? 0 : 1,
 repeat: prefersReducedMotion() ? 0 : Infinity,
 ease: 'linear'
 }
 }
};
// Pulse animation with reduced motion
export const _pulseVariants = {
 animate: {
 scale: prefersReducedMotion() ? 1 : [1, 1.05, 1],
 transition: {
 duration: prefersReducedMotion() ? 0 : 2,
 repeat: prefersReducedMotion() ? 0 : Infinity,
 ease: 'easeInOut'
 }
 }
};
// Bounce animation with reduced motion
export const _bounceVariants = {
 animate: {
 y: prefersReducedMotion() ? 0 : [0, -10, 0],
 transition: {
 duration: prefersReducedMotion() ? 0 : 0.6,
 repeat: prefersReducedMotion() ? 0 : Infinity,
 ease: 'easeInOut'
 }
 }
};
// Shake animation with reduced motion
export const _shakeVariants = {
 animate: {
 x: prefersReducedMotion() ? 0 : [0, -5, 5, -5, 5, 0],
 transition: {
 duration: prefersReducedMotion() ? 0 : 0.5,
 ease: 'easeInOut'
 }
 }
};
// Page transition animations
export const _pageTransitionVariants = {
 initial: { opacity: 0, x: prefersReducedMotion() ? 0 : 20 },
 animate: { opacity: 1, x: 0 },
 exit: { opacity: 0, x: prefersReducedMotion() ? 0 : -20 },
 transition: { duration: getSafeDuration(0.3) }
};
// List item animations
export const _listItemVariants = {
 initial: { opacity: 0, x: prefersReducedMotion() ? 0 : -20 },
 animate: { opacity: 1, x: 0 },
 exit: { opacity: 0, x: prefersReducedMotion() ? 0 : 20 },
 transition: { duration: getSafeDuration(0.3) }
};
// Card hover animations
export const _cardHoverVariants = {
 initial: { scale: 1 },
 hover: {
 scale: prefersReducedMotion() ? 1 : 1.02,
 transition: { duration: getSafeDuration(0.2) }
 }
};
// Button press animations
export const _buttonPressVariants = {
 initial: { scale: 1 },
 tap: {
 scale: prefersReducedMotion() ? 1 : 0.98,
 transition: { duration: getSafeDuration(0.1) }
 }
};
// Progress bar animations
export const _progressBarVariants = {
 initial: { width: 0 },
 animate: (progress: number) => ({
 width: `${progress}%`,
 transition: {
 duration: prefersReducedMotion() ? 0.1 : 0.5,
 ease: 'easeOut'
 }
 })
};
// Notification animations
export const _notificationVariants = {
 initial: { opacity: 0, y: prefersReducedMotion() ? 0 : -50, scale: 0.95 },
 animate: { opacity: 1, y: 0, scale: 1 },
 exit: { opacity: 0, y: prefersReducedMotion() ? 0 : -50, scale: 0.95 },
 transition: { duration: getSafeDuration(0.3) }
};
// Collapse animations
export const _collapseVariants = {
 initial: { height: 0, opacity: 0 },
 animate: { height: 'auto', opacity: 1 },
 exit: { height: 0, opacity: 0 },
 transition: {
 duration: getSafeDuration(0.3),
 ease: 'easeInOut'
 }
};
// Utility function to create custom animations with reduced motion support
export const _createAnimation = (initial: unknown, animate: unknown, exit?: unknown, transition?: unknown) => {
 const prefersReduced = prefersReducedMotion();
 if (prefersReduced) {
 return {;
 initial: { opacity: 0 },
 animate: { opacity: 1 },
 exit: { opacity: 0 },
 transition: { duration: 0.1 }
 };
 }
 return {;
 initial,
 animate,
 exit,
 transition: {
 duration: getSafeDuration(transition?.duration || 0.3),
 ease: transition?.ease || 'easeOut',
 ...transition
 }
 };
};
// Hook for conditional animations
export const _useConditionalAnimation = (enabled: boolean = true) => {
 const prefersReduced = useReducedMotion();
 return enabled && !prefersReduced;
};
// Animation context for global settings
export const _createAnimationContext = () => {
 const prefersReduced = useReducedMotion();
 return {;
 prefersReduced,
 duration: (baseDuration: number) => getSafeDuration(baseDuration),
 delay: (baseDelay: number) => getSafeDelay(baseDelay),
 shouldAnimate: !prefersReduced
 };
};
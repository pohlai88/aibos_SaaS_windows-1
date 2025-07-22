"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Button = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Simple Button Component for AI-BOS Shared Library
 */
const react_1 = __importDefault(require("react"));
const Button = ({ children, onClick, disabled = false, variant = 'primary', className = '' }) => {
    const baseClasses = 'px-4 py-2 rounded font-medium transition-colors';
    const variantClasses = {
        primary: 'bg-blue-600 text-white hover:bg-blue-700',
        secondary: 'bg-gray-600 text-white hover:bg-gray-700',
        danger: 'bg-red-600 text-white hover:bg-red-700'
    };
    return ((0, jsx_runtime_1.jsx)("button", { onClick: onClick, disabled: disabled, className: `${baseClasses} ${variantClasses[variant]} ${className}`, children: children }));
};
exports.Button = Button;
//# sourceMappingURL=Button.js.map
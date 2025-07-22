"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Badge = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Simple Badge Component for AI-BOS Shared Library
 */
const react_1 = __importDefault(require("react"));
const Badge = ({ children, variant = 'default', className = '' }) => {
    const baseClasses = 'px-2 py-1 text-xs font-medium rounded';
    const variantClasses = {
        default: 'bg-gray-100 text-gray-800',
        success: 'bg-green-100 text-green-800',
        warning: 'bg-yellow-100 text-yellow-800',
        danger: 'bg-red-100 text-red-800'
    };
    return ((0, jsx_runtime_1.jsx)("span", { className: `${baseClasses} ${variantClasses[variant]} ${className}`, children: children }));
};
exports.Badge = Badge;
//# sourceMappingURL=Badge.js.map
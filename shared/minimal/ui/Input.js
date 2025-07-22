"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Input = void 0;
const jsx_runtime_1 = require("react/jsx-runtime");
/**
 * Simple Input Component for AI-BOS Shared Library
 */
const react_1 = __importDefault(require("react"));
const Input = ({ value = '', onChange, placeholder, disabled = false, className = '' }) => {
    return ((0, jsx_runtime_1.jsx)("input", { type: "text", value: value, onChange: (e) => onChange?.(e.target.value), placeholder: placeholder, disabled: disabled, className: `px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}` }));
};
exports.Input = Input;
//# sourceMappingURL=Input.js.map
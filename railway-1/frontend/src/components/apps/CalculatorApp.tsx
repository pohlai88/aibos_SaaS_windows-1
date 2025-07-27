'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Calculator, History, Brain, Zap, RotateCcw,
  Square, Pi, Infinity, Plus, Minus,
  X, Divide, Equal, Percent, Trash2, ArrowLeft
} from 'lucide-react';
import { useConsciousness } from '../consciousness/ConsciousnessEngine';

// ==================== TYPES ====================

interface Calculation {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
  type: 'basic' | 'scientific' | 'ai';
}

interface CalculatorState {
  display: string;
  previousValue: number | null;
  operation: string | null;
  waitingForOperand: boolean;
  history: Calculation[];
  isScientific: boolean;
  memory: number;
}

// ==================== CALCULATOR ENGINE ====================

class CalculatorEngine {
  private state: CalculatorState;

  constructor() {
    this.state = {
      display: '0',
      previousValue: null,
      operation: null,
      waitingForOperand: false,
      history: [],
      isScientific: false,
      memory: 0
    };
  }

  // ==================== BASIC OPERATIONS ====================

  inputDigit(digit: string) {
    if (this.state.waitingForOperand) {
      this.state.display = digit;
      this.state.waitingForOperand = false;
    } else {
      this.state.display = this.state.display === '0' ? digit : this.state.display + digit;
    }
  }

  inputDecimal() {
    if (this.state.waitingForOperand) {
      this.state.display = '0.';
      this.state.waitingForOperand = false;
    } else if (this.state.display.indexOf('.') === -1) {
      this.state.display = this.state.display + '.';
    }
  }

  clear() {
    this.state.display = '0';
    this.state.previousValue = null;
    this.state.operation = null;
    this.state.waitingForOperand = false;
  }

  clearDisplay() {
    this.state.display = '0';
  }

  backspace() {
    if (this.state.display.length > 1) {
      this.state.display = this.state.display.slice(0, -1);
    } else {
      this.state.display = '0';
    }
  }

  performOperation(nextOperation: string) {
    const inputValue = parseFloat(this.state.display);

    if (this.state.previousValue === null) {
      this.state.previousValue = inputValue;
    } else if (this.state.operation) {
      const currentValue = this.state.previousValue;
      const newValue = this.calculate(currentValue, inputValue, this.state.operation);

      this.state.display = String(newValue);
      this.state.previousValue = newValue;
    }

    this.state.waitingForOperand = true;
    this.state.operation = nextOperation;
  }

  calculate(firstValue: number, secondValue: number, operation: string): number {
    switch (operation) {
      case '+': return firstValue + secondValue;
      case '-': return firstValue - secondValue;
      case '×': return firstValue * secondValue;
      case '÷': return firstValue / secondValue;
      case '%': return firstValue % secondValue;
      default: return secondValue;
    }
  }

  // ==================== SCIENTIFIC OPERATIONS ====================

  scientificOperation(operation: string) {
    const value = parseFloat(this.state.display);
    let result: number;

    switch (operation) {
      case 'sin':
        result = Math.sin(value * Math.PI / 180);
        break;
      case 'cos':
        result = Math.cos(value * Math.PI / 180);
        break;
      case 'tan':
        result = Math.tan(value * Math.PI / 180);
        break;
      case 'log':
        result = Math.log10(value);
        break;
      case 'ln':
        result = Math.log(value);
        break;
      case 'sqrt':
        result = Math.sqrt(value);
        break;
      case 'square':
        result = value * value;
        break;
      case 'cube':
        result = value * value * value;
        break;
      case 'factorial':
        result = this.factorial(value);
        break;
      case 'inverse':
        result = 1 / value;
        break;
      case 'abs':
        result = Math.abs(value);
        break;
      case 'exp':
        result = Math.exp(value);
        break;
      case 'pi':
        result = Math.PI;
        break;
      case 'e':
        result = Math.E;
        break;
      default:
        result = value;
    }

    this.state.display = this.formatDisplay(result);
    this.addToHistory(`${operation}(${value})`, result.toString(), 'scientific');
  }

  factorial(n: number): number {
    if (n < 0) return NaN;
    if (n === 0 || n === 1) return 1;
    let result = 1;
    for (let i = 2; i <= n; i++) {
      result *= i;
    }
    return result;
  }

  // ==================== MEMORY OPERATIONS ====================

  memoryStore() {
    this.state.memory = parseFloat(this.state.display);
  }

  memoryRecall() {
    this.state.display = this.formatDisplay(this.state.memory);
  }

  memoryAdd() {
    this.state.memory += parseFloat(this.state.display);
  }

  memorySubtract() {
    this.state.memory -= parseFloat(this.state.display);
  }

  memoryClear() {
    this.state.memory = 0;
  }

  // ==================== AI-POWERED CALCULATIONS ====================

  async aiCalculate(expression: string): Promise<string> {
    try {
      // Simulate AI processing
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Parse natural language expressions
      const lowerExpression = expression.toLowerCase();

      if (lowerExpression.includes('area of circle')) {
        const radius = this.extractNumber(expression);
        const area = Math.PI * radius * radius;
        return `Area of circle with radius ${radius} = ${area.toFixed(2)}`;
      }

      if (lowerExpression.includes('volume of sphere')) {
        const radius = this.extractNumber(expression);
        const volume = (4/3) * Math.PI * radius * radius * radius;
        return `Volume of sphere with radius ${radius} = ${volume.toFixed(2)}`;
      }

      if (lowerExpression.includes('compound interest')) {
        const numbers = this.extractNumbers(expression);
        if (numbers.length >= 4) {
          const [principal, rate, time, compounds] = numbers;
          if (principal !== undefined && rate !== undefined && time !== undefined && compounds !== undefined) {
            const amount = principal * Math.pow(1 + rate / (100 * compounds), compounds * time);
            return `Compound interest: $${amount.toFixed(2)}`;
          }
        }
      }

      if (lowerExpression.includes('pythagorean theorem')) {
        const numbers = this.extractNumbers(expression);
        if (numbers.length >= 2) {
          const [a, b] = numbers;
          if (a !== undefined && b !== undefined) {
            const c = Math.sqrt(a * a + b * b);
            return `Hypotenuse = ${c.toFixed(2)}`;
          }
        }
      }

      // Default: try to evaluate as mathematical expression
      const result = this.evaluateExpression(expression);
      return result.toString();
    } catch (error) {
      return 'Unable to process AI calculation';
    }
  }

  private extractNumber(text: string): number {
    const match = text.match(/\d+(\.\d+)?/);
    return match ? parseFloat(match[0]) : 0;
  }

  private extractNumbers(text: string): number[] {
    const matches = text.match(/\d+(\.\d+)?/g);
    return matches ? matches.map(m => parseFloat(m)) : [];
  }

  private evaluateExpression(expression: string): number {
    // Simple expression evaluator (in production, use a proper math library)
    const sanitized = expression.replace(/[^0-9+\-*/().]/g, '');
    return Function(`'use strict'; return (${sanitized})`)();
  }

  // ==================== UTILITY FUNCTIONS ====================

  formatDisplay(value: number): string {
    const stringValue = value.toString();

    if (stringValue.indexOf('e-') !== -1) {
      return value.toFixed(10);
    }

    if (stringValue.indexOf('.') !== -1) {
      return value.toFixed(10).replace(/\.?0+$/, '');
    }

    return stringValue;
  }

  addToHistory(expression: string, result: string, type: 'basic' | 'scientific' | 'ai' = 'basic') {
    const calculation: Calculation = {
      id: crypto.randomUUID(),
      expression,
      result,
      timestamp: new Date().toISOString(),
      type
    };

    this.state.history.unshift(calculation);

    // Keep only last 50 calculations
    if (this.state.history.length > 50) {
      this.state.history = this.state.history.slice(0, 50);
    }
  }

  getState(): CalculatorState {
    return { ...this.state };
  }

  setState(newState: Partial<CalculatorState>) {
    this.state = { ...this.state, ...newState };
  }
}

// ==================== CALCULATOR APP ====================

const CalculatorApp: React.FC = () => {
  const [calculator] = useState(() => new CalculatorEngine());
  const [state, setState] = useState(calculator.getState());
  const [aiExpression, setAiExpression] = useState('');
  const [isAiCalculating, setIsAiCalculating] = useState(false);
  const [showHistory, setShowHistory] = useState(false);

  const { quantumState } = useConsciousness();

  // ==================== EVENT HANDLERS ====================

  const updateState = (newState: Partial<CalculatorState>) => {
    calculator.setState(newState);
    setState(calculator.getState());
  };

  const handleDigitClick = (digit: string) => {
    calculator.inputDigit(digit);
    setState(calculator.getState());
  };

  const handleDecimalClick = () => {
    calculator.inputDecimal();
    setState(calculator.getState());
  };

  const handleClear = () => {
    calculator.clear();
    setState(calculator.getState());
  };

  const handleClearDisplay = () => {
    calculator.clearDisplay();
    setState(calculator.getState());
  };

  const handleBackspace = () => {
    calculator.backspace();
    setState(calculator.getState());
  };

  const handleOperation = (operation: string) => {
    calculator.performOperation(operation);
    setState(calculator.getState());
  };

  const handleEquals = () => {
    if (state.operation && state.previousValue !== null) {
      const inputValue = parseFloat(state.display);
      const result = calculator.calculate(state.previousValue, inputValue, state.operation);

      calculator.addToHistory(
        `${state.previousValue} ${state.operation} ${inputValue}`,
        result.toString()
      );

      updateState({
        display: calculator.formatDisplay(result),
        previousValue: null,
        operation: null,
        waitingForOperand: true
      });
    }
  };

  const handleScientificOperation = (operation: string) => {
    calculator.scientificOperation(operation);
    setState(calculator.getState());
  };

  const handleMemoryOperation = (operation: string) => {
    switch (operation) {
      case 'store':
        calculator.memoryStore();
        break;
      case 'recall':
        calculator.memoryRecall();
        break;
      case 'add':
        calculator.memoryAdd();
        break;
      case 'subtract':
        calculator.memorySubtract();
        break;
      case 'clear':
        calculator.memoryClear();
        break;
    }
    setState(calculator.getState());
  };

  const handleAiCalculate = async () => {
    if (!aiExpression.trim()) return;

    setIsAiCalculating(true);
    try {
      const result = await calculator.aiCalculate(aiExpression);
      calculator.addToHistory(aiExpression, result, 'ai');
      setState(calculator.getState());
      setAiExpression('');
    } catch (error) {
      console.error('AI calculation failed:', error);
    } finally {
      setIsAiCalculating(false);
    }
  };

  const handleHistoryClick = (calculation: Calculation) => {
    updateState({ display: calculation.result });
  };

  // ==================== RENDER ====================

  return (
    <div className="flex h-full bg-gray-50 dark:bg-gray-900">
      {/* Main Calculator */}
      <div className="flex-1 flex flex-col p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Calculator className="w-8 h-8 text-blue-500" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Calculator</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowHistory(!showHistory)}
              className={`p-2 rounded-lg transition-colors ${
                showHistory
                  ? 'bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <History className="w-5 h-5" />
            </button>

            <button
              onClick={() => updateState({ isScientific: !state.isScientific })}
              className={`p-2 rounded-lg transition-colors ${
                state.isScientific
                  ? 'bg-purple-100 dark:bg-purple-900 text-purple-600 dark:text-purple-400'
                  : 'text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
              }`}
            >
              <Brain className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* AI Calculator */}
        <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-xl border border-purple-200 dark:border-purple-700">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">AI Calculator</h3>
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={aiExpression}
              onChange={(e) => setAiExpression(e.target.value)}
              placeholder="Try: 'area of circle with radius 5' or 'compound interest $1000 at 5% for 2 years'"
              className="flex-1 px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
            />
            <button
              onClick={handleAiCalculate}
              disabled={isAiCalculating || !aiExpression.trim()}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isAiCalculating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Calculating...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Calculate
                </>
              )}
            </button>
          </div>
        </div>

        {/* Display */}
        <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">
              {state.previousValue !== null && state.operation
                ? `${state.previousValue} ${state.operation}`
                : ''
              }
            </div>
            <div className="text-3xl font-mono text-gray-900 dark:text-white">
              {state.display}
            </div>
          </div>
        </div>

        {/* Calculator Buttons */}
        <div className="grid grid-cols-4 gap-3">
          {/* Memory Row */}
          <button
            onClick={() => handleMemoryOperation('store')}
            className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            MS
          </button>
          <button
            onClick={() => handleMemoryOperation('recall')}
            className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            MR
          </button>
          <button
            onClick={() => handleMemoryOperation('add')}
            className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            M+
          </button>
          <button
            onClick={() => handleMemoryOperation('subtract')}
            className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors text-sm"
          >
            M-
          </button>

          {/* Scientific Functions */}
          {state.isScientific && (
            <>
              <button
                onClick={() => handleScientificOperation('sin')}
                className="p-3 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm"
              >
                sin
              </button>
              <button
                onClick={() => handleScientificOperation('cos')}
                className="p-3 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm"
              >
                cos
              </button>
              <button
                onClick={() => handleScientificOperation('tan')}
                className="p-3 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm"
              >
                tan
              </button>
              <button
                onClick={() => handleScientificOperation('log')}
                className="p-3 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm"
              >
                log
              </button>

              <button
                onClick={() => handleScientificOperation('sqrt')}
                className="p-3 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm"
              >
                √
              </button>
              <button
                onClick={() => handleScientificOperation('square')}
                className="p-3 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm"
              >
                x²
              </button>
              <button
                onClick={() => handleScientificOperation('cube')}
                className="p-3 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm"
              >
                x³
              </button>
              <button
                onClick={() => handleScientificOperation('factorial')}
                className="p-3 bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-200 dark:hover:bg-purple-800 transition-colors text-sm"
              >
                n!
              </button>
            </>
          )}

          {/* Standard Buttons */}
          <button
            onClick={handleClear}
            className="p-3 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
          >
                            <Trash2 className="w-5 h-5" />
          </button>
          <button
            onClick={handleBackspace}
            className="p-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
                            <ArrowLeft className="w-5 h-5" />
          </button>
          <button
            onClick={() => handleOperation('%')}
            className="p-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            %
          </button>
          <button
            onClick={() => handleOperation('÷')}
            className="p-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            ÷
          </button>

          {/* Number Pad */}
          {[7, 8, 9].map(num => (
            <button
              key={num}
              onClick={() => handleDigitClick(num.toString())}
              className="p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOperation('×')}
            className="p-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            ×
          </button>

          {[4, 5, 6].map(num => (
            <button
              key={num}
              onClick={() => handleDigitClick(num.toString())}
              className="p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOperation('-')}
            className="p-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            <Minus className="w-5 h-5" />
          </button>

          {[1, 2, 3].map(num => (
            <button
              key={num}
              onClick={() => handleDigitClick(num.toString())}
              className="p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => handleOperation('+')}
            className="p-3 bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300 rounded-lg hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
          >
            <Plus className="w-5 h-5" />
          </button>

          <button
            onClick={() => handleDigitClick('0')}
            className="p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700 col-span-2"
          >
            0
          </button>
          <button
            onClick={handleDecimalClick}
            className="p-3 bg-white dark:bg-gray-800 text-gray-900 dark:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors border border-gray-200 dark:border-gray-700"
          >
            .
          </button>
          <button
            onClick={handleEquals}
            className="p-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
          >
            <Equal className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* History Panel */}
      <AnimatePresence>
        {showHistory && (
          <motion.div
            initial={{ width: 0, opacity: 0 }}
            animate={{ width: 300, opacity: 1 }}
            exit={{ width: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="w-80 border-l border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 flex flex-col"
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">History</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4">
              {state.history.length === 0 ? (
                <div className="text-center text-gray-500 dark:text-gray-400">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>No calculations yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {state.history.map(calculation => (
                    <div
                      key={calculation.id}
                      onClick={() => handleHistoryClick(calculation)}
                      className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                        {calculation.expression}
                      </div>
                      <div className="text-lg font-semibold text-gray-900 dark:text-white">
                        {calculation.result}
                      </div>
                      <div className="flex items-center justify-between text-xs text-gray-400 mt-1">
                        <span>{new Date(calculation.timestamp).toLocaleTimeString()}</span>
                        <span className={`px-2 py-1 rounded text-xs ${
                          calculation.type === 'ai'
                            ? 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300'
                            : calculation.type === 'scientific'
                            ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                            : 'bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300'
                        }`}>
                          {calculation.type}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CalculatorApp;

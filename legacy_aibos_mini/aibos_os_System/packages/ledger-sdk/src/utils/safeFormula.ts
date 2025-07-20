// Safe formula parser using Function constructor (no eval)
// Only allows math expressions and date variables
export function safeEvaluateFormula(formula: string, variables: Record<string, number>): number {
  // Replace allowed variables
  let expr = formula;
  for (const [key, value] of Object.entries(variables)) {
    expr = expr.replace(new RegExp(`\\{${key}\\}`, 'g'), value.toString());
  }
  // Only allow numbers, operators, parentheses, and dots
  if (!/^[-+*/(). 0-9]+$/.test(expr.replace(/\d+/g, ''))) {
    throw new Error('Unsafe formula detected');
  }
  // eslint-disable-next-line no-new-func
  return Function(`'use strict'; return (${expr})`)();
}

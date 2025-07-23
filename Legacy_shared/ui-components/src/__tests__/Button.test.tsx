/**
 * Enterprise Button Component Tests
 *
 * @author AI-BOS Team
 * @version 1.0.0
 * @license MIT
 */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '../primitives/Button/Button';

describe('Enterprise Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: 'Click me' });
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-enterprise-component', 'true');
    expect(button).toHaveAttribute('data-iso27001-compliant', 'true');
    expect(button).toHaveAttribute('data-gdpr-compliant', 'true')
});

  it('handles click events with audit trail', () => {
    const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

    render(<Button auditTrail={true}>Test Button</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(consoleSpy).toHaveBeenCalledWith(
      'Button Click Audit:',
      expect.objectContaining({
        component: 'EnterpriseButton',
  actionType: 'default',
        securityLevel: 'medium',
  dataClassification: 'internal'
      })
    );

    consoleSpy.mockRestore()
});

  it('reports compliance violations for critical security without encryption', () => {
    const violationSpy = jest.fn();

    render(
      <Button
        securityLevel="critical"
        encryption={false}
        onComplianceViolation={violationSpy}
      >
        Critical Button
      </Button>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(violationSpy).toHaveBeenCalledWith(
      'Critical security level requires encryption'
    )
});

  it('applies correct CSS classes for variants', () => {
    const { rerender } = render(<Button variant="destructive">Destructive</Button>);

    let button = screen.getByRole('button');
    expect(button).toHaveClass('bg-destructive');

    rerender(<Button variant="outline">Outline</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('border')
});

  it('applies correct CSS classes for sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);

    let button = screen.getByRole('button');
    expect(button).toHaveClass('h-9');

    rerender(<Button size="lg">Large</Button>);
    button = screen.getByRole('button');
    expect(button).toHaveClass('h-11')
})
});

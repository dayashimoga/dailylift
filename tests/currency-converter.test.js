/**
 * @jest-environment jsdom
 */

/**
 * Tests for src/tools/currency-converter.js
 * Covers: conversion calculations, cross-rates, swap, edge cases
 */

describe('Currency Converter', () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <form id="currencyForm">
        <input type="number" id="currencyAmount" value="">
        <select id="currencyFrom">
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="INR">INR</option>
          <option value="JPY">JPY</option>
        </select>
        <select id="currencyTo">
          <option value="USD">USD</option>
          <option value="EUR">EUR</option>
          <option value="GBP">GBP</option>
          <option value="INR">INR</option>
          <option value="JPY">JPY</option>
        </select>
        <button type="submit">Convert</button>
        <button type="button" id="currencySwap">⇄</button>
      </form>
      <div id="currencyResult">—</div>
      <div id="currencyRate">—</div>
    `;
        jest.resetModules();
        require('../src/tools/currency-converter.js');
    });

    function setInputs(amount, from, to) {
        document.getElementById('currencyAmount').value = amount;
        document.getElementById('currencyFrom').value = from;
        document.getElementById('currencyTo').value = to;
    }

    function submitForm() {
        const form = document.getElementById('currencyForm');
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }

    describe('Basic Conversions', () => {
        test('converts USD to EUR', () => {
            setInputs(100, 'USD', 'EUR');
            submitForm();
            const result = document.getElementById('currencyResult').textContent;
            expect(result).not.toBe('—');
        });

        test('converts USD to INR', () => {
            setInputs(100, 'USD', 'INR');
            submitForm();
            expect(document.getElementById('currencyResult').textContent).not.toBe('—');
        });

        test('converts GBP to JPY', () => {
            setInputs(500, 'GBP', 'JPY');
            submitForm();
            expect(document.getElementById('currencyResult').textContent).not.toBe('—');
        });

        test('same currency returns same amount', () => {
            setInputs(100, 'USD', 'USD');
            submitForm();
            const result = document.getElementById('currencyResult').textContent;
            expect(result).toContain('100');
        });

        test('shows exchange rate', () => {
            setInputs(100, 'USD', 'EUR');
            submitForm();
            expect(document.getElementById('currencyRate').textContent).not.toBe('—');
        });
    });

    describe('Swap Feature', () => {
        test('swap button switches currencies', () => {
            setInputs(100, 'USD', 'EUR');
            const swapBtn = document.getElementById('currencySwap');
            swapBtn.click();
            expect(document.getElementById('currencyFrom').value).toBe('EUR');
            expect(document.getElementById('currencyTo').value).toBe('USD');
        });
    });

    describe('Edge Cases', () => {
        test('does not convert with empty amount', () => {
            setInputs('', 'USD', 'EUR');
            submitForm();
            expect(document.getElementById('currencyResult').textContent).toBe('—');
        });

        test('does not convert with zero amount', () => {
            setInputs(0, 'USD', 'EUR');
            submitForm();
            expect(document.getElementById('currencyResult').textContent).toBe('—');
        });

        test('does not convert with negative amount', () => {
            setInputs(-100, 'USD', 'EUR');
            submitForm();
            expect(document.getElementById('currencyResult').textContent).toBe('—');
        });

        test('initializes without form gracefully', () => {
            document.body.innerHTML = '';
            expect(() => {
                jest.resetModules();
                require('../src/tools/currency-converter.js');
            }).not.toThrow();
        });
    });
});

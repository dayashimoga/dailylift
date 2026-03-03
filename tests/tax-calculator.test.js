/**
 * @jest-environment jsdom
 */

/**
 * Tests for src/tools/tax-calculator.js
 * Covers: progressive tax calculations for US, UK, Canada, India
 */

describe('Income Tax Calculator', () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <form id="taxForm">
        <select id="taxCountry">
          <option value="us">United States</option>
          <option value="uk">United Kingdom</option>
          <option value="ca">Canada</option>
          <option value="in">India</option>
        </select>
        <input type="number" id="taxIncome" value="">
        <button type="submit">Calculate</button>
      </form>
      <div id="taxTotal">—</div>
      <div id="taxEffective">—</div>
      <div id="taxTakeHome">—</div>
      <div id="taxBracket">—</div>
    `;
        jest.resetModules();
        require('../src/tools/tax-calculator.js');
    });

    function setInputs(country, income) {
        document.getElementById('taxCountry').value = country;
        document.getElementById('taxIncome').value = income;
    }

    function submitForm() {
        const form = document.getElementById('taxForm');
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }

    describe('US Tax Calculations', () => {
        test('calculates tax for $50,000 income', () => {
            setInputs('us', 50000);
            submitForm();
            expect(document.getElementById('taxTotal').textContent).not.toBe('—');
            expect(document.getElementById('taxEffective').textContent).not.toBe('—');
        });

        test('calculates tax for $100,000 income', () => {
            setInputs('us', 100000);
            submitForm();
            expect(document.getElementById('taxTakeHome').textContent).not.toBe('—');
        });

        test('higher income produces higher tax', () => {
            setInputs('us', 50000);
            submitForm();
            const lowTax = document.getElementById('taxTotal').textContent;

            document.body.innerHTML = `
        <form id="taxForm">
          <select id="taxCountry"><option value="us">US</option><option value="uk">UK</option><option value="ca">Canada</option><option value="in">India</option></select>
          <input type="number" id="taxIncome" value="">
          <button type="submit">Calculate</button>
        </form>
        <div id="taxTotal">—</div>
        <div id="taxEffective">—</div>
        <div id="taxTakeHome">—</div>
        <div id="taxBracket">—</div>
      `;
            jest.resetModules();
            require('../src/tools/tax-calculator.js');
            setInputs('us', 500000);
            submitForm();
            const highTax = document.getElementById('taxTotal').textContent;

            expect(highTax).not.toBe(lowTax);
        });
    });

    describe('UK Tax Calculations', () => {
        test('calculates UK tax', () => {
            setInputs('uk', 50000);
            submitForm();
            expect(document.getElementById('taxTotal').textContent).not.toBe('—');
        });
    });

    describe('Canada Tax Calculations', () => {
        test('calculates Canada tax', () => {
            setInputs('ca', 80000);
            submitForm();
            expect(document.getElementById('taxTotal').textContent).not.toBe('—');
        });
    });

    describe('India Tax Calculations', () => {
        test('calculates India tax', () => {
            setInputs('in', 1000000);
            submitForm();
            expect(document.getElementById('taxTotal').textContent).not.toBe('—');
        });
    });

    describe('Edge Cases', () => {
        test('does not calculate with empty income', () => {
            setInputs('us', '');
            submitForm();
            expect(document.getElementById('taxTotal').textContent).toBe('—');
        });

        test('does not calculate with zero income', () => {
            setInputs('us', 0);
            submitForm();
            expect(document.getElementById('taxTotal').textContent).toBe('—');
        });

        test('does not calculate with negative income', () => {
            setInputs('us', -50000);
            submitForm();
            expect(document.getElementById('taxTotal').textContent).toBe('—');
        });

        test('initializes without form gracefully', () => {
            document.body.innerHTML = '';
            expect(() => {
                jest.resetModules();
                require('../src/tools/tax-calculator.js');
            }).not.toThrow();
        });
    });
});

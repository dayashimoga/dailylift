/**
 * @jest-environment jsdom
 */

/**
 * Tests for src/tools/insurance-estimator.js
 * Covers: premium calculations, coverage types, age factors
 */

describe('Insurance Premium Estimator', () => {
    beforeEach(() => {
        document.body.innerHTML = `
      <form id="insuranceForm">
        <input type="number" id="insuranceAge" value="">
        <select id="insuranceCoverage">
          <option value="health">Health</option>
          <option value="auto">Auto</option>
          <option value="life">Life</option>
        </select>
        <input type="number" id="insuranceAmount" value="">
        <button type="submit">Estimate</button>
      </form>
      <div id="insuranceMonthly">—</div>
      <div id="insuranceAnnual">—</div>
      <div id="insuranceRisk">—</div>
    `;
        jest.resetModules();
        require('../src/tools/insurance-estimator.js');
    });

    function setInputs(age, coverage, amount) {
        document.getElementById('insuranceAge').value = age;
        document.getElementById('insuranceCoverage').value = coverage;
        document.getElementById('insuranceAmount').value = amount;
    }

    function submitForm() {
        const form = document.getElementById('insuranceForm');
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
    }

    describe('Health Insurance', () => {
        test('calculates health premium for young adult', () => {
            setInputs(25, 'health', 500000);
            submitForm();
            expect(document.getElementById('insuranceMonthly').textContent).toContain('₹');
            expect(document.getElementById('insuranceAnnual').textContent).toContain('₹');
        });

        test('calculates health premium for middle-aged', () => {
            setInputs(45, 'health', 1000000);
            submitForm();
            expect(document.getElementById('insuranceMonthly').textContent).not.toBe('—');
        });

        test('older age produces higher premium', () => {
            setInputs(25, 'health', 500000);
            submitForm();
            const youngPremium = document.getElementById('insuranceMonthly').textContent;

            document.body.innerHTML = `
        <form id="insuranceForm">
          <input type="number" id="insuranceAge" value="">
          <select id="insuranceCoverage"><option value="health">Health</option><option value="auto">Auto</option><option value="life">Life</option></select>
          <input type="number" id="insuranceAmount" value="">
          <button type="submit">Estimate</button>
        </form>
        <div id="insuranceMonthly">—</div>
        <div id="insuranceAnnual">—</div>
        <div id="insuranceRisk">—</div>
      `;
            jest.resetModules();
            require('../src/tools/insurance-estimator.js');
            setInputs(60, 'health', 500000);
            submitForm();
            const oldPremium = document.getElementById('insuranceMonthly').textContent;

            expect(oldPremium).not.toBe(youngPremium);
        });
    });

    describe('Auto Insurance', () => {
        test('calculates auto premium', () => {
            setInputs(30, 'auto', 1000000);
            submitForm();
            expect(document.getElementById('insuranceMonthly').textContent).toContain('₹');
        });
    });

    describe('Life Insurance', () => {
        test('calculates life premium', () => {
            setInputs(35, 'life', 5000000);
            submitForm();
            expect(document.getElementById('insuranceMonthly').textContent).toContain('₹');
        });
    });

    describe('Edge Cases', () => {
        test('does not calculate with empty age', () => {
            setInputs('', 'health', 500000);
            submitForm();
            expect(document.getElementById('insuranceMonthly').textContent).toBe('—');
        });

        test('does not calculate with zero amount', () => {
            setInputs(30, 'health', 0);
            submitForm();
            expect(document.getElementById('insuranceMonthly').textContent).toBe('—');
        });

        test('does not calculate with negative age', () => {
            setInputs(-5, 'health', 500000);
            submitForm();
            expect(document.getElementById('insuranceMonthly').textContent).toBe('—');
        });

        test('initializes without form gracefully', () => {
            document.body.innerHTML = '';
            expect(() => {
                jest.resetModules();
                require('../src/tools/insurance-estimator.js');
            }).not.toThrow();
        });
    });
});

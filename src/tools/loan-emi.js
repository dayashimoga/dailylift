// Loan EMI Calculator
(function () {
    'use strict';
    const form = document.getElementById('loanForm');
    if (!form) return;

    form.addEventListener('submit', function (e) {
        e.preventDefault();
        const P = parseFloat(document.getElementById('loanPrincipal').value);
        const annualRate = parseFloat(document.getElementById('loanRate').value);
        const tenureYears = parseFloat(document.getElementById('loanTenure').value);

        if (!P || !annualRate || !tenureYears || P <= 0 || annualRate <= 0 || tenureYears <= 0) return;

        const r = annualRate / 12 / 100; // monthly interest rate
        const n = tenureYears * 12; // total months

        // EMI = P * r * (1+r)^n / ((1+r)^n - 1)
        const emi = P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1);
        const totalPayment = emi * n;
        const totalInterest = totalPayment - P;

        document.getElementById('loanEmi').textContent = '₹' + emi.toLocaleString('en-IN', { maximumFractionDigits: 0 });
        document.getElementById('loanTotalInterest').textContent = '₹' + totalInterest.toLocaleString('en-IN', { maximumFractionDigits: 0 });
        document.getElementById('loanTotalPayment').textContent = '₹' + totalPayment.toLocaleString('en-IN', { maximumFractionDigits: 0 });
    });
})();

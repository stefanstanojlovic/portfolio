document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('display');
  const expressionDisplay = document.getElementById('expression');

  let current = '0';
  let prev = '';
  let operator = null;
  let justCalculated = false;

  function updateDisplay() {
    display.textContent = current.length > 12 ? parseFloat(current).toExponential(6) : current;
    expressionDisplay.textContent = prev;
  }

  function clearAll() {
    current = '0';
    prev = '';
    operator = null;
    justCalculated = false;
    updateDisplay();
  }

  function inputNumber(num) {
    if (current === '0' || justCalculated) {
      current = num;
      justCalculated = false;
    } else if (current.length < 14) {
      current += num;
    }
    updateDisplay();
  }

  function inputDot() {
    if (!current.includes('.')) {
      current += '.';
      updateDisplay();
    }
  }

  function setOperator(op) {
    if (operator && !justCalculated && current !== '') {
      calculate(false); // izvrši prethodnu operaciju, ali ne prikazuj kao konačan rezultat
    }
    if (current === '') current = '0';
    prev = (prev ? prev : '') + current + " " + opToSymbol(op) + " ";
    operator = op;
    justCalculated = false;
    current = '';
    updateDisplay();
  }

  function opToSymbol(op) {
    switch(op) {
      case '+': return '+';
      case '-': return '−';
      case '*': return '×';
      case '/': return '÷';
    }
  }

  function calculate(final = true) {
    if (!operator || prev === '' || current === '') return;
    const parts = prev.trim().split(' ');
    const a = parseFloat(parts[parts.length - 2]);
    const b = parseFloat(current);
    let result = '';
    switch (operator) {
      case '+': result = (a + b).toString(); break;
      case '-': result = (a - b).toString(); break;
      case '*': result = (a * b).toString(); break;
      case '/': result = b !== 0 ? (a / b).toString() : 'Error'; break;
    }
    if (final) {
      prev = prev + current + " =";
      current = result;
      operator = null;
      justCalculated = true;
    } else {
      prev = '';
      current = result;
      operator = null;
      justCalculated = false;
    }
    updateDisplay();
  }

  function backspace() {
    if (justCalculated) {
      clearAll();
      return;
    }
    if (current.length > 1) {
      current = current.slice(0, -1);
    } else {
      current = '0';
    }
    updateDisplay();
  }

  document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const action = btn.dataset.action;
      if (!isNaN(action)) {
        inputNumber(action);
      } else {
        switch(action) {
          case 'dot': inputDot(); break;
          case 'add': setOperator('+'); break;
          case 'subtract': setOperator('-'); break;
          case 'multiply': setOperator('*'); break;
          case 'divide': setOperator('/'); break;
          case 'equals': calculate(); break;
          case 'clear': clearAll(); break;
          case 'back': backspace(); break;
        }
      }
    });
  });

  clearAll();
});

document.addEventListener('DOMContentLoaded', () => {
  const display = document.getElementById('display');
  const expressionDisplay = document.getElementById('expression');
  const buttons = document.querySelectorAll('.btn');
  const backspaceBtn = document.getElementById('backspace-btn');

  // ====== HISTORIJA ======
  let history = [];
  if (localStorage.getItem('calcHistory')) {
    try {
      history = JSON.parse(localStorage.getItem('calcHistory')) || [];
    } catch {
      history = [];
    }
  }

  let input = '';
  let result = '0';
  let lastPressed = '';
  let openParens = 0;

  function updateDisplay() {
    expressionDisplay.textContent = input;
    display.textContent = result;
  }

  function isOperator(val) {
    return ['+', '-', '*', '/', '%'].includes(val);
  }

  function handleButton(action) {
    if (!isNaN(action)) { // broj
      if (result === 'Error' || lastPressed === '=') {
        input = '';
        result = '0';
      }
      input += action;
      result = input.match(/[\d.]+$/) ? input.match(/[\d.]+$/)[0] : '0';
      lastPressed = action;
      updateDisplay();
    } else {
      switch(action) {
        case 'dot':
          if (result === 'Error' || lastPressed === '=') {
            input = '';
            result = '0';
          }
          if (!input.match(/[\d.]+$/) || input.endsWith('.')) return;
          if (input === '' || isOperator(input.slice(-1)) || input.endsWith('(')) {
            input += '0.';
          } else if (!input.match(/[\d.]+$/)[0].includes('.')) {
            input += '.';
          }
          result = input.match(/[\d.]+$/) ? input.match(/[\d.]+$/)[0] : '0';
          lastPressed = action;
          updateDisplay();
          break;
        case 'clear':
          input = '';
          result = '0';
          lastPressed = '';
          openParens = 0;
          updateDisplay();
          break;
        case 'add':
          addOperator('+');
          break;
        case 'subtract':
          addOperator('-');
          break;
        case 'multiply':
          addOperator('*');
          break;
        case 'divide':
          addOperator('/');
          break;
        case 'percent':
          addOperator('%');
          break;
        case 'plusminus':
          // +/- dugme
          if (input.length === 0 || lastPressed === '=') {
            if (result !== '0') {
              result = (-parseFloat(result)).toString();
              input = result;
            }
          } else {
            // promeni znak poslednjeg broja u inputu
            input = input.replace(/([\d.]+)(?!.*[\d.])/, (n) => (-parseFloat(n)).toString());
            result = input.match(/[\d.]+$/) ? input.match(/[\d.]+$/)[0] : '0';
          }
          updateDisplay();
          break;
        case 'open-paren':
          if (
            input === '' ||
            isOperator(input.slice(-1)) ||
            input.slice(-1) === '('
          ) {
            input += '(';
            openParens++;
            lastPressed = action;
            updateDisplay();
          }
          break;
        case 'close-paren':
          if (openParens > 0 && input && /[\d)]$/.test(input)) {
            input += ')';
            openParens--;
            lastPressed = action;
            updateDisplay();
          }
          break;
        case 'equals':
          try {
            let expr = input
              .replace(/×/g, '*')
              .replace(/÷/g, '/')
              .replace(/%/g, '/100');
            while (openParens > 0) {
              expr += ')';
              openParens--;
            }
            let calc = Function(`'use strict';return (${expr})`)();
            result = (calc !== undefined && calc !== null) ? calc.toString() : '0';
            if (input && result !== 'Error') {
              history.unshift({ expression: input, result: result });
              if (history.length > 30) history.pop();
              localStorage.setItem('calcHistory', JSON.stringify(history));
            }
            lastPressed = '=';
          } catch {
            result = 'Error';
            lastPressed = '=';
          }
          updateDisplay();
          break;
      }
    }
  }

  function addOperator(op) {
    if (input === '' && (op === '+' || op === '-')) {
      input = op;
    } else if (
      input &&
      !isOperator(input.slice(-1)) &&
      input.slice(-1) !== '('
    ) {
      input += op;
    } else if (
      input &&
      isOperator(input.slice(-1))
    ) {
      input = input.slice(0, -1) + op;
    }
    lastPressed = op;
    updateDisplay();
  }

  // Dugme za brisanje ("backspace")
  backspaceBtn.addEventListener('click', () => {
    if (input.length > 0 && lastPressed !== '=') {
      if (input.slice(-1) === '(') openParens--;
      if (input.slice(-1) === ')') openParens++;
      input = input.slice(0, -1);
      let numMatch = input.match(/[\d.]+$/);
      result = numMatch ? numMatch[0] : '0';
      updateDisplay();
    }
  });

  // Sva dugmad za kalkulator
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      handleButton(btn.dataset.action);
    });
  });

  // Dummy dugmad - istorija, unit converter
  document.getElementById('unit-btn').addEventListener('click', () => {});
  
  // SCIENTIFIC MODE: Prikaži/skrivaj stub
  const sciBtnToggle = document.getElementById('sci-btn');
  const sciPanel = document.getElementById('sci-buttons');
  let sciMode = false;
  sciBtnToggle.addEventListener('click', () => {
    sciMode = !sciMode;
    sciPanel.classList.toggle('active', sciMode);
    document.querySelector('.calculator').style.width = sciMode ? '520px' : '340px';
  });

  // === HISTORIJA MODAL ===
  function showHistory() {
    const modal = document.getElementById('history-modal');
    const list = document.getElementById('history-list');
    list.innerHTML = '';
    if (history.length === 0) {
      list.innerHTML = `<li style="color:#aaa;text-align:center;">No history yet.</li>`;
    } else {
      history.forEach(h => {
        const li = document.createElement('li');
        li.innerHTML = `
          <span class="history-expression">${h.expression}</span>
          <span class="history-result">${h.result}</span>
        `;
        list.appendChild(li);
      });
    }
    modal.classList.add('open');
  }

  document.getElementById('history-btn').addEventListener('click', showHistory);
  document.getElementById('close-history').addEventListener('click', () => {
    document.getElementById('history-modal').classList.remove('open');
  });
  document.getElementById('history-modal').addEventListener('click', function(e) {
    if (e.target === this) this.classList.remove('open');
  });
  document.getElementById('clear-history-btn').addEventListener('click', () => {
    history = [];
    localStorage.removeItem('calcHistory');
    showHistory();
  });

  updateDisplay();
});

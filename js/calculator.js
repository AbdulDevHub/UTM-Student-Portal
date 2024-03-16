let calculationHistory = [];

function appendToResult(value) {
  const result = document.getElementById('result');
  result.value += value;
}

// Calculation Logic and error handling.
function calculate() {
  const result = document.getElementById('result');
  const expression = result.value;
  let calculation;
  try {
    let evaluatedResult = eval(expression);

    // Check for division by zero
    if (expression.includes('/')) {
      const [numerator, denominator] = expression.split('/');
      if (parseFloat(denominator) === 0) {
        calculation = "Error: Division by zero";
        result.value = calculation;
        calculationHistory.push(calculation);
        updateHistory();
        saveHistory();
        return;
      }
    }

    if (Math.abs(evaluatedResult) > Number.MAX_SAFE_INTEGER) {
      calculation = "Number too large";
      result.value = calculation;
    } else {
      calculation = `${expression} = ${evaluatedResult}`;
      result.value = evaluatedResult;
    }
  } catch (error) {
    calculation = "Invalid expression";
    result.value = calculation;
  }
  calculationHistory.push(calculation);
  updateHistory();
  saveHistory();
}

function clearResult() {
  const result = document.getElementById('result');
  result.value = '';
}

function updateHistory() {
  const historyList = document.getElementById('history-list');
  historyList.innerHTML = '';
  calculationHistory.forEach(calculation => {
    const listItem = document.createElement('li');
    listItem.textContent = calculation;
    historyList.appendChild(listItem);
  });
}

function clearHistory() {
  calculationHistory = [];
  updateHistory();
  saveHistory();
}

// Local storage for browser
function saveHistory() {
  localStorage.setItem('calculationHistory', JSON.stringify(calculationHistory));
}

function loadHistory() {
  const savedHistory = JSON.parse(localStorage.getItem('calculationHistory'));
  if (savedHistory) {
    calculationHistory = savedHistory;
    updateHistory();
  }
}

// Keyboard keys input handling
document.addEventListener('keydown', handleKeyboardInput);

function handleKeyboardInput(event) {
  const result = document.getElementById('result');
  const allowedKeys = /[0-9.+\-*/^=()]/;

  if (allowedKeys.test(event.key)) {
    if (event.key === '=') {
      calculate();
    } else {
      appendToResult(event.key);
    }
  } else if (event.key === 'Enter') {
    calculate();
  } else if (event.key === 'Backspace' || event.key === 'Delete') {
    result.value = result.value.slice(0, -1);
  } else if (event.key === 'Escape') {
    clearResult();
  }
}

window.onload = loadHistory;
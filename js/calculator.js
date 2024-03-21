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
        throw new Error(calculation);
      }
    }

    if (Math.abs(evaluatedResult) > Number.MAX_SAFE_INTEGER) {
      calculation = "Error: Number too large";
      throw new Error(calculation);
    } else {
      calculation = `${expression} = ${evaluatedResult}`;
      result.value = evaluatedResult;
    }
  } catch (error) {
    calculation = error.message;
    result.value = '';
    alert(calculation);
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
    event.preventDefault(); // Prevent the default form submission behavior
    calculate();
    displayResult(); // Display the calculated result
  } else if (event.key === 'Backspace' || event.key === 'Delete') {
    result.value = result.value.slice(0, -1);
  } else if (event.key === 'Escape') {
    clearResult();
  }
}

function displayResult() {
  const result = document.getElementById('result');
  const lastCalculation = calculationHistory[calculationHistory.length - 1];
  
  if (lastCalculation.startsWith('Error:')) {
    // If the last calculation is an error, clear the calculation window
    result.value = '';
  } else {
    // Otherwise, display the calculated result in the calculation window
    const resultValue = lastCalculation.split('=').pop().trim();
    result.value = resultValue;
  }
}
// Paste event handling
const resultInput = document.getElementById('result');
resultInput.addEventListener('paste', handlePaste);

function handlePaste(event) {
  const pastedData = event.clipboardData.getData('text');
  appendToResult(pastedData);
  event.preventDefault(); // Prevent the default paste behavior
}

window.onload = loadHistory;
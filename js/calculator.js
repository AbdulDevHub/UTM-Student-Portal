const btn = document.querySelector("#dark_mode");
const body = document.body;

function change() {
  btn.checked
    ? body.classList.add("dark")
    : body.classList.remove("dark");
}

btn.addEventListener("change", change);

document
  .getElementById("submit_calculation")
  .addEventListener("click", function () {
    const inputA = parseFloat(document.getElementById("input_a").value);
    const inputB = parseFloat(document.getElementById("input_b").value);
    const operator = document.getElementById("operators").value;
    let result;

    switch (operator) {
      case "+":
        result = inputA + inputB;
        break;
      case "-":
        result = inputA - inputB;
        break;
      case "*":
        result = inputA * inputB;
        break;
      case "/":
        if (inputB === 0) {
          result = "Error: Division by zero";
        } else {
          result = inputA / inputB;
        }
        break;
      case "^":
        result = Math.pow(inputA, inputB);
        break;
      default:
        result = "Invalid operation";
    }

    document.getElementById(
      "calculation_result"
    ).innerHTML = `Result: ${result}`;
  });
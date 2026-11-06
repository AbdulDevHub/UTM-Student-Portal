// Safe arithmetic evaluator for the calculator page (replaces eval()).
// Supports + - × ÷ * / ^, parentheses, unary minus, postfix % (percent) and √.

const PREC = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3, "neg": 2.5 }
const RIGHT = new Set(["^", "neg"])

export function tokenize(expr) {
  const src = String(expr).replace(/×/g, "*").replace(/÷/g, "/").replace(/−/g, "-").replace(/\s+/g, "")
  const out = []
  let i = 0
  while (i < src.length) {
    const ch = src[i]
    if (/[0-9.]/.test(ch)) {
      let j = i
      while (j < src.length && /[0-9.]/.test(src[j])) j++
      const numStr = src.slice(i, j)
      if ((numStr.match(/\./g) || []).length > 1) throw new Error("Invalid number")
      out.push({ type: "num", value: parseFloat(numStr) })
      i = j
    } else if ("+-*/^()%√".includes(ch)) {
      out.push({ type: "op", value: ch })
      i++
    } else {
      throw new Error(`Unexpected "${ch}"`)
    }
  }
  return out
}

/** Evaluate an expression string. Throws Error with a friendly message on bad input. */
export function evaluate(expr) {
  const tokens = tokenize(expr)
  if (!tokens.length) throw new Error("Nothing to calculate")
  const output = []
  const ops = []
  let expectOperand = true

  const apply = () => {
    const op = ops.pop()
    if (op === "neg" || op === "√") {
      if (!output.length) throw new Error("Incomplete expression")
      const a = output.pop()
      if (op === "√" && a < 0) throw new Error("Square root of a negative number")
      output.push(op === "neg" ? -a : Math.sqrt(a))
      return
    }
    if (output.length < 2) throw new Error("Incomplete expression")
    const b = output.pop()
    const a = output.pop()
    if (op === "/" && b === 0) throw new Error("Can't divide by zero")
    output.push(op === "+" ? a + b : op === "-" ? a - b : op === "*" ? a * b : op === "/" ? a / b : Math.pow(a, b))
  }

  for (const tok of tokens) {
    if (tok.type === "num") {
      if (!expectOperand) {
        // implicit multiplication: 2(3) or 50%2 is not supported, but "2 3" is an error
        throw new Error("Missing operator")
      }
      output.push(tok.value)
      expectOperand = false
      continue
    }
    const v = tok.value
    if (v === "(") {
      if (!expectOperand) ops.push("*") // 2(3+4) → 2*(3+4)
      ops.push("(")
      expectOperand = true
    } else if (v === ")") {
      while (ops.length && ops[ops.length - 1] !== "(") apply()
      if (!ops.length) throw new Error("Unbalanced parentheses")
      ops.pop()
      if (ops[ops.length - 1] === "√") apply()
      expectOperand = false
    } else if (v === "%") {
      if (expectOperand || !output.length) throw new Error("% needs a number before it")
      output.push(output.pop() / 100)
    } else if (v === "√") {
      if (!expectOperand) ops.push("*")
      ops.push("√")
      expectOperand = true
    } else if (expectOperand && (v === "-" || v === "+")) {
      if (v === "-") ops.push("neg")
    } else {
      if (expectOperand) throw new Error("Missing number")
      const op = v
      while (ops.length) {
        const top = ops[ops.length - 1]
        if (top === "(" ) break
        if (top === "√" || PREC[top] > PREC[op] || (PREC[top] === PREC[op] && !RIGHT.has(op))) apply()
        else break
      }
      ops.push(op)
      expectOperand = true
    }
  }
  if (expectOperand) throw new Error("Incomplete expression")
  while (ops.length) {
    if (ops[ops.length - 1] === "(") throw new Error("Unbalanced parentheses")
    apply()
  }
  const result = output.pop()
  if (!Number.isFinite(result)) throw new Error("Number too large")
  // Trim floating point noise (0.1 + 0.2 → 0.3)
  return parseFloat(result.toPrecision(12))
}

/** True when text looks like arithmetic someone wants answered ("85*0.4+72*0.6", "√2"). */
export function looksLikeMath(text) {
  const t = String(text).trim()
  return t.length > 1 && /^[\d\s.+\-*/×÷−^%()√]+$/.test(t) && /\d/.test(t) && /[+\-*/×÷−^%√]/.test(t.replace(/^-/, ""))
}

/** Evaluate if it looks like math; returns the number or null. Never throws. */
export function tryCalc(text) {
  if (!looksLikeMath(text)) return null
  try { return evaluate(text) } catch { return null }
}

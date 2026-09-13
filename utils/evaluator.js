const ALLOWED_FUNCS = ['sin', 'cos', 'tan', 'asin', 'acos', 'atan', 'log', 'ln', 'sqrt', 'abs'];

function toRadiansAware(expr, isDegrees) {
  if (!isDegrees) return expr;
  return expr
    .replace(/\bsin\(/g, 'sinDeg(')
    .replace(/\bcos\(/g, 'cosDeg(')
    .replace(/\btan\(/g, 'tanDeg(');
}

export function evaluateExpression(rawExpr, { isDegrees = true } = {}) {
  if (!rawExpr || !rawExpr.trim()) return '';

  let expr = rawExpr
    .replace(/×/g, '*')
    .replace(/÷/g, '/')
    .replace(/−/g, '-')
    .replace(/π/g, 'PI')
    .replace(/√/g, 'sqrt')
    .replace(/\^/g, '**')
    .replace(/(\d)%/g, '($1/100)');

  expr = expr.replace(/\bln\(/g, 'log(');
  expr = expr.replace(/\blog10\(/g, 'log10(');

  const safePattern = /^[0-9+\-*/().,\sA-Za-z]*$/;
  if (!safePattern.test(expr)) {
    throw new Error('عبارت نامعتبر است');
  }

  const allowedWords = new Set([
    ...ALLOWED_FUNCS,
    'log10', 'PI', 'E', 'sinDeg', 'cosDeg', 'tanDeg',
  ]);
  const words = expr.match(/[A-Za-z]+/g) || [];
  for (const w of words) {
    if (!allowedWords.has(w)) {
      throw new Error('تابع پشتیبانی نمی‌شود: ' + w);
    }
  }

  expr = toRadiansAware(expr, isDegrees);

  const body = `
    const PI = Math.PI;
    const E = Math.E;
    const sqrt = Math.sqrt;
    const abs = Math.abs;
    const asin = Math.asin;
    const acos = Math.acos;
    const atan = Math.atan;
    const log10 = Math.log10;
    function log(x) { return Math.log(x); }
    function sinDeg(x) { return Math.sin(x * PI / 180); }
    function cosDeg(x) { return Math.cos(x * PI / 180); }
    function tanDeg(x) { return Math.tan(x * PI / 180); }
    function sin(x) { return Math.sin(x); }
    function cos(x) { return Math.cos(x); }
    function tan(x) { return Math.tan(x); }
    return (${expr});
  `;

  const fn = new Function(body);
  const result = fn();

  if (typeof result !== 'number' || !isFinite(result)) {
    throw new Error('نتیجه نامعتبر است');
  }
  return Math.round(result * 1e10) / 1e10;
                      }

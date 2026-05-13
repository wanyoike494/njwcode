# calculator/views.py

import json
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods


@csrf_exempt                           # Safe for a JSON-only API (see note in settings)
@require_http_methods(["POST"])        # Only allow POST; return 405 for anything else
def calculate(request):
    """
    Receives: POST { "expression": "12.5*4" }
    Returns:  { "result": "50" }   on success
              { "error":  "..." }  on failure
    """

    # ── 1. Parse JSON body ────────────────────────────────────────────
    try:
        body = json.loads(request.body)
    except json.JSONDecodeError:
        return JsonResponse({"error": "Invalid JSON"}, status=400)

    expression = body.get("expression", "").strip()

    # ── 2. Validate the expression ───────────────────────────────────
    # Only allow digits, operators, decimal points, and parentheses.
    # This whitelist approach prevents code injection completely.
    import re
    if not re.fullmatch(r'[0-9+\-*/.() ]+', expression):
        return JsonResponse({"error": "Invalid characters"}, status=400)

    if not expression:
        return JsonResponse({"error": "Empty expression"}, status=400)

    if len(expression) > 200:
        return JsonResponse({"error": "Expression too long"}, status=400)

    # ── 3. Evaluate safely in Python ─────────────────────────────────
    # We do NOT use eval() on the raw string — that would be a security
    # hole. Instead we convert to Decimal arithmetic step by step.
    # For a full-featured safe evaluator we use Python's ast module.
    try:
        result = safe_eval(expression)
    except ZeroDivisionError:
        print(f"[Calculator] ERROR — Division by zero in: {expression!r}")
        return JsonResponse({"error": "Cannot divide by zero"})
    except (InvalidOperation, ValueError, OverflowError):
        print(f"[Calculator] ERROR — Math error in: {expression!r}")
        return JsonResponse({"error": "Math error"})
    except Exception:
        print(f"[Calculator] ERROR — Unexpected: {e!r} in: {expression!r}")
        return JsonResponse({"error": "Calculation failed"})
    
    print(f"[Calculator] Expression: {expression!r}  →  Result: {result}")

    # ── 4. Format result ─────────────────────────────────────────────
    # Remove trailing zeros after decimal point for clean display
    result_str = format_result(result)

    return JsonResponse({"result": result_str})


# ─── SAFE EVALUATOR ──────────────────────────────────────────────────
import ast, operator as op_module

# Map AST node types to Python operators
SAFE_OPERATORS = {
    ast.Add:  op_module.add,
    ast.Sub:  op_module.sub,
    ast.Mult: op_module.mul,
    ast.Div:  op_module.truediv,
    ast.USub: op_module.neg,    # unary minus e.g. -5
    ast.UAdd: op_module.pos,    # unary plus
}

def safe_eval(expression: str) -> Decimal:
    """
    Parse and evaluate an arithmetic expression using Python's AST.
    Only allows numbers and the four arithmetic operators + parentheses.
    No exec, no eval, no shell calls — completely safe.
    """
    tree = ast.parse(expression, mode='eval')
    return _eval_node(tree.body)


def _eval_node(node):
    """Recursively walk the AST, converting everything to Decimal."""
    if isinstance(node, ast.Constant):                          # a number literal
        return Decimal(str(node.value))

    if isinstance(node, ast.BinOp):                            # a op b
        left  = _eval_node(node.left)
        right = _eval_node(node.right)
        fn    = SAFE_OPERATORS.get(type(node.op))
        if fn is None:
            raise ValueError("Unsupported operator")
        return fn(left, right)

    if isinstance(node, ast.UnaryOp):                          # -a  or  +a
        operand = _eval_node(node.operand)
        fn      = SAFE_OPERATORS.get(type(node.op))
        if fn is None:
            raise ValueError("Unsupported unary operator")
        return fn(operand)

    raise ValueError(f"Unsupported expression type: {type(node)}")


def format_result(value: Decimal) -> str:
    """Format a Decimal for display: remove trailing zeros, cap at 10 decimal places."""
    # Round to 10 decimal places maximum
    value = value.quantize(Decimal('0.0000000001'), rounding=ROUND_HALF_UP)
    # Convert to string and strip unnecessary trailing zeros
    s = str(value).rstrip('0').rstrip('.')
    return s

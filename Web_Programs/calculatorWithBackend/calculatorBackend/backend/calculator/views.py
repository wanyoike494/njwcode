from django.http import JsonResponse
import json
import time

def calculate(request):

    if request.method == "POST":

        data = json.loads(request.body)

        num1 = float(data.get("num1"))
        num2 = float(data.get("num2"))
        operation = data.get("operation")

        # simulate waiting
        time.sleep(2)

        result = 0

        if operation == "+":
            result = num1 + num2

        elif operation == "-":
            result = num1 - num2

        elif operation == "*":
            result = num1 * num2

        elif operation == "/":
            result = num1 / num2

        return JsonResponse({
            "result": result
        })

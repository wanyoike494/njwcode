const calculateBtn = document.getElementById("calculateBtn");

const message = document.getElementById("message");

const result = document.getElementById("result");

calculateBtn.addEventListener("click", async () => {

    const num1 = document.getElementById("num1").value;

    const num2 = document.getElementById("num2").value;

    const operation = document.getElementById("operation").value;

    // show waiting message
    message.innerText = "Calculating, please wait...";

    result.innerText = "";

    try {

        const response = await fetch(
            "http://127.0.0.1:8000/calculate/",
            {
                method: "POST",

                headers: {
                    "Content-Type": "application/json"
                },

                body: JSON.stringify({
                    num1,
                    num2,
                    operation
                })
            }
        );

        const data = await response.json();

        message.innerText = "";

        result.innerText = `Result: ${data.result}`;

    } catch(error){

        message.innerText = "Error connecting to server";

        console.log(error);
    }

});
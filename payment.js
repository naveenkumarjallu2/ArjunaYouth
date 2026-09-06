// payment.js
// Razorpay payment UI

const paymentRadios =
    document.querySelectorAll("input[name='payment']");

const onlineSection =
    document.getElementById("onlineSection");

const upiButton =
    document.getElementById("upiButton");

const amountInput =
    document.getElementById("amount");


paymentRadios.forEach(radio => {

    radio.addEventListener(
        "change",
        togglePayment
    );

});


amountInput.addEventListener(
    "input",
    updatePayButton
);


function togglePayment() {

    const cashButton =
        document.getElementById("cashSubmitBtn");

    if (paymentType === "Online") {

        onlineSection.classList.remove("hidden");

        cashButton.classList.add("hidden");

        updatePayButton();

    } else {

        onlineSection.classList.add("hidden");

        cashButton.classList.remove("hidden");

    }

}


function updatePayButton() {

    const amount =
        Number(amountInput.value);


    if (!amount || amount <= 0) {

        upiButton.textContent =
            "Enter Amount First";

        upiButton.disabled = true;

        return;
    }


    upiButton.textContent =
        `💳 Pay ₹${amount.toFixed(2)} Now`;

    upiButton.disabled = false;
}
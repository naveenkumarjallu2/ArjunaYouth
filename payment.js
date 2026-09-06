// payment.js
// Arujuna Youth - Razorpay Payment UI

const paymentRadios =
    document.querySelectorAll("input[name='payment']");

const onlineSection =
    document.getElementById("onlineSection");

const upiButton =
    document.getElementById("upiButton");

const amountInput =
    document.getElementById("amount");

const cashButton =
    document.getElementById("cashSubmitBtn");


// ===============================
// PAYMENT METHOD CHANGE
// ===============================

paymentRadios.forEach(radio => {

    radio.addEventListener(
        "change",
        togglePayment
    );

});


// ===============================
// AMOUNT CHANGE
// ===============================

amountInput.addEventListener(
    "input",
    updatePayButton
);


// ===============================
// TOGGLE CASH / ONLINE
// ===============================

function togglePayment() {

    const selectedPayment =
        document.querySelector(
            "input[name='payment']:checked"
        );

    if (!selectedPayment) {
        return;
    }

    const paymentType =
        selectedPayment.value;


    if (paymentType === "Online") {

        // Show online payment section
        onlineSection.classList.remove("hidden");

        // Hide cash submit button
        cashButton.classList.add("hidden");

        // Update Pay Now button
        updatePayButton();

    } else {

        // Hide online payment section
        onlineSection.classList.add("hidden");

        // Show cash submit button
        cashButton.classList.remove("hidden");

    }
}


// ===============================
// UPDATE PAY BUTTON
// ===============================

function updatePayButton() {

    const amount =
        Number(amountInput.value);


    // No amount entered
    if (!amount || amount <= 0) {

        upiButton.textContent =
            "Enter Amount First";

        upiButton.disabled = true;

        return;
    }


    // Valid amount
    upiButton.textContent =
        `💳 Pay ₹${amount.toFixed(2)} Now`;

    upiButton.disabled = false;
}


// ===============================
// INITIAL PAGE STATE
// ===============================

togglePayment();
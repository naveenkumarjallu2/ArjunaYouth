const YOUR_UPI_ID = "navibittu211@ibl";
const YOUR_NAME = "Arujuna Youth";

const paymentRadios =
    document.querySelectorAll("input[name='payment']");

const onlineSection =
    document.getElementById("onlineSection");

const qrImage =
    document.getElementById("qrImage");

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
    generateQR
);


function togglePayment() {

    const paymentType =
        document.querySelector(
            "input[name='payment']:checked"
        ).value;


    if (paymentType === "Online") {

        onlineSection.classList.remove("hidden");

        generateQR();

    } else {

        onlineSection.classList.add("hidden");

    }

}


function generateQR() {

    const amount = Number(amountInput.value);

    if (!amount || amount <= 0) {

        upiButton.removeAttribute("href");

        upiButton.textContent =
            "Enter Amount First";

        return;
    }

    const upiLink =
        `upi://pay` +
        `?pa=${encodeURIComponent(YOUR_UPI_ID)}` +
        `&pn=${encodeURIComponent(YOUR_NAME)}` +
        `&am=${amount.toFixed(2)}` +
        `&cu=INR` +
        `&tn=${encodeURIComponent(
            "Ganesh Chanda Donation"
        )}`;

    upiButton.href = upiLink;

    upiButton.textContent =
        `💳 Pay ₹${amount.toFixed(2)} Now`;
}
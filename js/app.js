// app.js
// Arujuna Youth - Ganesh Chanda
// Supabase + Razorpay Payment Integration


// ======================================================
// ELEMENTS
// ======================================================

const donationForm =
    document.getElementById("donationForm");

const messageBox =
    document.getElementById("message");

// payment.js already declares:
// upiButton
// cashButton
//
// So app.js uses different variable names.
const appCashButton =
    document.getElementById("cashSubmitBtn");

const appUpiButton =
    document.getElementById("upiButton");


// ======================================================
// SUPABASE EDGE FUNCTION URLs
// ======================================================

const CREATE_ORDER_URL =
    `${SUPABASE_URL}/functions/v1/create-payment-order`;

const VERIFY_PAYMENT_URL =
    `${SUPABASE_URL}/functions/v1/verify-payment`;

const CASH_DONATION_URL =
    `${SUPABASE_URL}/functions/v1/create-cash-donation`;


// ======================================================
// DEBUG
// ======================================================

console.log("======================================");
console.log("Arujuna Youth app.js loaded");
console.log("======================================");

console.log("Donation form:", donationForm);
console.log("Cash button:", appCashButton);
console.log("UPI button:", appUpiButton);
console.log("Supabase:", typeof supabaseClient);
console.log("Razorpay:", typeof Razorpay);
console.log("Cash Function:", CASH_DONATION_URL);


// ======================================================
// REQUIRED ELEMENT CHECK
// ======================================================

if (!donationForm) {
    console.error("ERROR: donationForm not found.");
}

if (!messageBox) {
    console.error("ERROR: message element not found.");
}

if (!appCashButton) {
    console.error("ERROR: cashSubmitBtn not found.");
}

if (!appUpiButton) {
    console.error("ERROR: upiButton not found.");
}


// ======================================================
// ONLINE PAY BUTTON
// ======================================================

appUpiButton.addEventListener(
    "click",
    function () {

        console.log("Pay Now clicked");


        // Browser validation
        if (!donationForm.reportValidity()) {

            console.log(
                "Form validation failed"
            );

            return;
        }


        // Trigger form submit
        donationForm.requestSubmit();

    }
);


// ======================================================
// FORM SUBMIT
// ======================================================

donationForm.addEventListener(
    "submit",
    async function (event) {

        // IMPORTANT:
        // Prevent normal browser form GET submission.
        event.preventDefault();


        console.log(
            "======================================"
        );

        console.log(
            "Donation form submitted"
        );

        console.log(
            "======================================"
        );


        showMessage(
            "",
            "green"
        );


        // ==================================================
        // GET FORM VALUES
        // ==================================================

        const name =
            document.getElementById("name")
                .value
                .trim();

        const surname =
            document.getElementById("surname")
                .value
                .trim();

        const mobile =
            document.getElementById("mobile")
                .value
                .trim();

        const isWhatsapp =
            document.getElementById("whatsapp")
                .checked;

        const address =
            document.getElementById("address")
                .value
                .trim();

        const amount =
            Number(
                document.getElementById("amount")
                    .value
            );


        const selectedPayment =
            document.querySelector(
                "input[name='payment']:checked"
            );


        // ==================================================
        // PAYMENT METHOD CHECK
        // ==================================================

        if (!selectedPayment) {

            showMessage(
                "Please select a payment method.",
                "red"
            );

            return;
        }


        const paymentType =
            selectedPayment.value;


        console.log(
            "Payment type:",
            paymentType
        );

        console.log(
            "Amount:",
            amount
        );


        // ==================================================
        // VALIDATION
        // ==================================================

        if (
            !name ||
            !surname ||
            !mobile ||
            !address ||
            !amount
        ) {

            showMessage(
                "Please fill in all required fields.",
                "red"
            );

            return;
        }


        if (
            !/^[0-9]{10}$/.test(mobile)
        ) {

            showMessage(
                "Please enter a valid 10-digit mobile number.",
                "red"
            );

            return;
        }


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            showMessage(
                "Donation amount must be greater than ₹0.",
                "red"
            );

            return;
        }


        // ==================================================
        // CASH PAYMENT
        // ==================================================

        if (paymentType === "Cash") {

            console.log(
                "======================================"
            );

            console.log(
                "Starting Cash donation"
            );

            console.log(
                "======================================"
            );


            appCashButton.disabled =
                true;

            appCashButton.textContent =
                "Saving Donation...";


            try {

                // ==================================================
                // CALL CASH EDGE FUNCTION
                // ==================================================

                console.log(
                    "Calling Cash Function:",
                    CASH_DONATION_URL
                );


                const response =
                    await fetch(
                        CASH_DONATION_URL,
                        {
                            method: "POST",

                            headers: {
                                "Content-Type":
                                    "application/json",

                                "apikey":
                                    SUPABASE_KEY
                            },

                            body:
                                JSON.stringify({

                                    donor_name:
                                        name,

                                    donor_surname:
                                        surname,

                                    mobile:
                                        mobile,

                                    is_whatsapp:
                                        isWhatsapp,

                                    address:
                                        address,

                                    amount:
                                        amount
                                })
                        }
                    );


                console.log(
                    "Cash HTTP status:",
                    response.status
                );


                // ==================================================
                // READ RESPONSE
                // ==================================================

                const result =
                    await response.json();


                console.log(
                    "Cash donation response:",
                    result
                );


                // ==================================================
                // CHECK RESPONSE
                // ==================================================

                if (!response.ok) {

                    throw new Error(
                        result.error ||
                        "Could not save cash donation."
                    );
                }


                if (
                    !result.success ||
                    !result.donation
                ) {

                    throw new Error(
                        "Cash donation was not saved."
                    );
                }


                // ==================================================
                // DONATION SUCCESS
                // ==================================================

                const data =
                    result.donation;


                console.log(
                    "Cash donation saved:",
                    data
                );


                // ==================================================
                // SAVE FOR SUCCESS PAGE
                // ==================================================

                localStorage.setItem(
                    "lastDonation",
                    JSON.stringify(data)
                );


                // ==================================================
                // REDIRECT
                // ==================================================

                console.log(
                    "Redirecting to success.html"
                );


                window.location.href =
                    `success.html?id=${encodeURIComponent(
                        data.id
                    )}&type=cash`;


                return;


            } catch (error) {

                console.error(
                    "Cash donation failed:",
                    error
                );


                showMessage(
                    error.message ||
                    "Unable to save cash donation.",
                    "red"
                );


                appCashButton.disabled =
                    false;

                appCashButton.textContent =
                    "Submit Cash Donation";
            }


            return;
        }


        // ==================================================
        // ONLINE PAYMENT
        // ==================================================

        console.log(
            "======================================"
        );

        console.log(
            "Starting Online payment"
        );

        console.log(
            "======================================"
        );


        appUpiButton.disabled =
            true;

        appUpiButton.textContent =
            "Creating Payment...";


        try {

            // ==================================================
            // CREATE RAZORPAY ORDER
            // ==================================================

            console.log(
                "Calling:",
                CREATE_ORDER_URL
            );


            const response =
                await fetch(
                    CREATE_ORDER_URL,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            "apikey":
                                SUPABASE_KEY
                        },

                        body:
                            JSON.stringify({

                                donor_name:
                                    name,

                                donor_surname:
                                    surname,

                                mobile:
                                    mobile,

                                is_whatsapp:
                                    isWhatsapp,

                                address:
                                    address,

                                amount:
                                    amount
                            })
                    }
                );


            console.log(
                "Create order HTTP status:",
                response.status
            );


            const result =
                await response.json();


            console.log(
                "Create order response:",
                result
            );


            if (!response.ok) {

                throw new Error(
                    result.error ||
                    "Unable to create payment order."
                );
            }


            // ==================================================
            // GET ORDER DATA
            // ==================================================

            const donationId =
                result.donationId;

            const orderId =
                result.orderId;

            const keyId =
                result.keyId;

            const razorpayAmount =
                result.amount;


            if (
                !donationId ||
                !orderId ||
                !keyId ||
                !razorpayAmount
            ) {

                console.error(
                    "Invalid Razorpay response:",
                    result
                );

                throw new Error(
                    "Invalid payment order response."
                );
            }


            console.log(
                "Donation ID:",
                donationId
            );

            console.log(
                "Razorpay Order:",
                orderId
            );


            // ==================================================
            // CHECK RAZORPAY
            // ==================================================

            if (
                typeof Razorpay ===
                "undefined"
            ) {

                throw new Error(
                    "Razorpay Checkout is not loaded."
                );
            }


            appUpiButton.textContent =
                "Opening Payment...";


            // ==================================================
            // RAZORPAY OPTIONS
            // ==================================================

            const options = {

                key:
                    keyId,

                amount:
                    razorpayAmount,

                currency:
                    "INR",

                name:
                    "Arujuna Youth",

                description:
                    "Ganesh Chanda Donation",

                order_id:
                    orderId,


                // ==================================================
                // PREFILL
                // ==================================================

                prefill: {

                    name:
                        `${name} ${surname}`,

                    contact:
                        mobile
                },


                // ==================================================
                // NOTES
                // ==================================================

                notes: {

                    donation_id:
                        donationId,

                    donor_name:
                        name,

                    donor_surname:
                        surname
                },


                // ==================================================
                // THEME
                // ==================================================

                theme: {

                    color:
                        "#3399cc"
                },


                // ==================================================
                // PAYMENT SUCCESS
                // ==================================================

                handler:
                    async function (
                        paymentResponse
                    ) {

                        console.log(
                            "======================================"
                        );

                        console.log(
                            "Razorpay SUCCESS"
                        );

                        console.log(
                            paymentResponse
                        );

                        console.log(
                            "======================================"
                        );


                        appUpiButton.disabled =
                            true;

                        appUpiButton.textContent =
                            "Verifying Payment...";


                        try {

                            // ==========================================
                            // VERIFY PAYMENT
                            // ==========================================

                            console.log(
                                "Calling verify-payment..."
                            );


                            const verifyResponse =
                                await fetch(
                                    VERIFY_PAYMENT_URL,
                                    {
                                        method: "POST",

                                        headers: {
                                            "Content-Type":
                                                "application/json",

                                            "apikey":
                                                SUPABASE_KEY
                                        },

                                        body:
                                            JSON.stringify({

                                                donationId:
                                                    donationId,

                                                razorpay_order_id:
                                                    paymentResponse
                                                        .razorpay_order_id,

                                                razorpay_payment_id:
                                                    paymentResponse
                                                        .razorpay_payment_id,

                                                razorpay_signature:
                                                    paymentResponse
                                                        .razorpay_signature
                                            })
                                    }
                                );


                            console.log(
                                "Verify HTTP status:",
                                verifyResponse.status
                            );


                            const verifyResult =
                                await verifyResponse.json();


                            console.log(
                                "Verify response:",
                                verifyResult
                            );


                            // ==========================================
                            // CHECK VERIFICATION
                            // ==========================================

                            if (
                                !verifyResponse.ok
                            ) {

                                throw new Error(
                                    verifyResult.error ||
                                    "Payment verification failed."
                                );
                            }


                            if (
                                !verifyResult.success
                            ) {

                                throw new Error(
                                    "Payment could not be verified."
                                );
                            }


                            // ==========================================
                            // SAVE VERIFIED DONATION
                            // ==========================================

                            if (
                                verifyResult.donation
                            ) {

                                localStorage.setItem(
                                    "lastDonation",
                                    JSON.stringify(
                                        verifyResult.donation
                                    )
                                );

                            } else {

                                // Fallback donation object
                                const localDonation = {

                                    id:
                                        donationId,

                                    donor_name:
                                        name,

                                    donor_surname:
                                        surname,

                                    mobile:
                                        mobile,

                                    is_whatsapp:
                                        isWhatsapp,

                                    address:
                                        address,

                                    amount:
                                        amount,

                                    payment_type:
                                        "Online",

                                    payment_status:
                                        "Success",

                                    transaction_id:
                                        paymentResponse
                                            .razorpay_payment_id,

                                    payment_order_id:
                                        paymentResponse
                                            .razorpay_order_id,

                                    payment_payment_id:
                                        paymentResponse
                                            .razorpay_payment_id
                                };


                                localStorage.setItem(
                                    "lastDonation",
                                    JSON.stringify(
                                        localDonation
                                    )
                                );
                            }


                            // ==========================================
                            // REDIRECT
                            // ==========================================

                            console.log(
                                "Payment verified successfully."
                            );

                            console.log(
                                "Redirecting to success.html"
                            );


                            window.location.href =
                                `success.html?id=${encodeURIComponent(
                                    donationId
                                )}&type=online`;


                        } catch (error) {

                            console.error(
                                "Verification error:",
                                error
                            );


                            showMessage(
                                error.message ||
                                "Payment verification failed.",
                                "red"
                            );


                            appUpiButton.disabled =
                                false;

                            appUpiButton.textContent =
                                `💳 Pay ₹${amount.toFixed(2)} Now`;
                        }
                    },


                // ==================================================
                // CHECKOUT CLOSED
                // ==================================================

                modal: {

                    ondismiss:
                        function () {

                            console.log(
                                "Razorpay checkout closed"
                            );


                            appUpiButton.disabled =
                                false;

                            appUpiButton.textContent =
                                `💳 Pay ₹${amount.toFixed(2)} Now`;


                            showMessage(
                                "Payment cancelled. Your donation has not been marked as successful.",
                                "red"
                            );
                        }
                }
            };


            // ==================================================
            // CREATE RAZORPAY INSTANCE
            // ==================================================

            const razorpay =
                new Razorpay(options);


            // ==================================================
            // PAYMENT FAILED
            // ==================================================

            razorpay.on(
                "payment.failed",
                function (response) {

                    console.error(
                        "Razorpay payment failed:",
                        response
                    );


                    const reason =
                        response?.error?.description ||
                        "Payment failed. Please try again.";


                    showMessage(
                        reason,
                        "red"
                    );


                    appUpiButton.disabled =
                        false;

                    appUpiButton.textContent =
                        `💳 Pay ₹${amount.toFixed(2)} Now`;
                }
            );


            // ==================================================
            // OPEN RAZORPAY
            // ==================================================

            console.log(
                "Opening Razorpay..."
            );


            razorpay.open();


        } catch (error) {

            console.error(
                "Online payment error:",
                error
            );


            showMessage(
                error.message ||
                "Something went wrong. Please try again.",
                "red"
            );


            appUpiButton.disabled =
                false;

            appUpiButton.textContent =
                `💳 Pay ₹${amount.toFixed(2)} Now`;
        }

    }
);


// ======================================================
// MESSAGE HELPER
// ======================================================

function showMessage(
    text,
    color
) {

    messageBox.textContent =
        text;

    messageBox.style.color =
        color;
}

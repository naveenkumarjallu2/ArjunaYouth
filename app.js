// app.js
// Arujuna Youth - Ganesh Chanda
// Razorpay payment integration

const donationForm =
    document.getElementById("donationForm");

const messageBox =
    document.getElementById("message");

const submitButton =
    document.querySelector(".submitBtn");

const upiButton=document.getElementById("upiButton");

upiButton.addEventListener("click",async()=>{

donationForm.requestSubmit();

});

// Supabase Edge Function URLs

const CREATE_ORDER_URL =
    `${SUPABASE_URL}/functions/v1/create-payment-order`;

const VERIFY_PAYMENT_URL =
    `${SUPABASE_URL}/functions/v1/verify-payment`;


// --------------------------------------------------
// Form Submit
// --------------------------------------------------

donationForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        messageBox.textContent = "";
        messageBox.style.color = "green";


        // --------------------------------------------
        // Get form values
        // --------------------------------------------

        const name =
            document.getElementById("name")
                .value.trim();

        const surname =
            document.getElementById("surname")
                .value.trim();

        const mobile =
            document.getElementById("mobile")
                .value.trim();

        const isWhatsapp =
            document.getElementById("whatsapp")
                .checked;

        const address =
            document.getElementById("address")
                .value.trim();

        const amount =
            Number(
                document.getElementById("amount")
                    .value
            );

        const paymentType =
            document.querySelector(
                "input[name='payment']:checked"
            ).value;


        // --------------------------------------------
        // Validation
        // --------------------------------------------

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


        // --------------------------------------------
        // Start processing
        // --------------------------------------------

        try {

            submitButton.disabled = true;

            submitButton.textContent =
                "Processing...";


            // ==================================================
            // CASH PAYMENT
            // ==================================================

            if (paymentType === "Cash") {

                const donationData = {

                    title:
                        "Arujuna Youth",

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
                        "Cash",

                    payment_status:
                        "Success"
                };


                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from("donations")
                        .insert([
                            donationData
                        ])
                        .select()
                        .single();


                if (error) {

                    console.error(
                        "Cash donation error:",
                        error
                    );

                    throw error;
                }


                // Save donation for success page

                localStorage.setItem(
                    "lastDonation",
                    JSON.stringify(data)
                );


                // Redirect

                window.location.href =
                    `success.html?id=${encodeURIComponent(
                        data.id
                    )}&type=cash`;


                return;
            }


            // ==================================================
            // ONLINE PAYMENT
            // ==================================================

            submitButton.textContent =
                "Creating Payment...";


            // --------------------------------------------
            // Create Razorpay order
            // --------------------------------------------

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

                throw new Error(
                    "Invalid payment order response."
                );
            }


            // ==================================================
            // Razorpay Checkout
            // ==================================================

            submitButton.textContent =
                "Opening Payment...";


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


                // ----------------------------------------
                // Donor information
                // ----------------------------------------

                prefill: {

                    name:
                        `${name} ${surname}`,

                    contact:
                        mobile
                },


                // ----------------------------------------
                // Extra information
                // ----------------------------------------

                notes: {

                    donation_id:
                        donationId,

                    donor_name:
                        name,

                    donor_surname:
                        surname
                },


                // ----------------------------------------
                // Theme
                // ----------------------------------------

                theme: {

                    color:
                        "#3399cc"
                },


                // ==================================================
                // Payment successful
                // ==================================================

                handler:
                    async function (
                        paymentResponse
                    ) {

                        console.log(
                            "Razorpay payment response:",
                            paymentResponse
                        );


                        try {

                            submitButton.disabled =
                                true;

                            submitButton.textContent =
                                "Verifying Payment...";


                            // ----------------------------------------
                            // Verify payment on server
                            // ----------------------------------------

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


                            const verifyResult =
                                await verifyResponse.json();


                            console.log(
                                "Verify payment response:",
                                verifyResult
                            );


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


                            // ----------------------------------------
                            // Save donation locally
                            // ----------------------------------------

                            if (
                                verifyResult.donation
                            ) {

                                localStorage.setItem(
                                    "lastDonation",
                                    JSON.stringify(
                                        verifyResult.donation
                                    )
                                );
                            }


                            // ----------------------------------------
                            // Payment successful
                            // ----------------------------------------

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
                                "Payment was received, but verification failed. Please contact Arujuna Youth with your payment details.",
                                "orange"
                            );


                            submitButton.disabled =
                                false;

                            submitButton.textContent =
                                "Submit Donation";
                        }
                    },


                // ==================================================
                // Checkout closed
                // ==================================================

                modal: {

                    ondismiss:
                        function () {

                            submitButton.disabled =
                                false;

                            submitButton.textContent =
                                "Submit Donation";


                            showMessage(
                                "Payment cancelled. Your donation has not been marked as successful.",
                                "red"
                            );
                        }
                }
            };


            // --------------------------------------------
            // Check Razorpay loaded
            // --------------------------------------------

            if (
                typeof Razorpay ===
                "undefined"
            ) {

                throw new Error(
                    "Razorpay Checkout could not be loaded. Please check your internet connection."
                );
            }


            // --------------------------------------------
            // Open Razorpay
            // --------------------------------------------

            const razorpay =
                new Razorpay(options);


            // --------------------------------------------
            // Payment failed
            // --------------------------------------------

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


                    submitButton.disabled =
                        false;

                    submitButton.textContent =
                        "Submit Donation";
                }
            );


            razorpay.open();


        } catch (error) {

            console.error(
                "Donation error:",
                error
            );


            showMessage(
                error.message ||
                "Something went wrong. Please try again.",
                "red"
            );


            submitButton.disabled =
                false;

            submitButton.textContent =
                "Submit Donation";
        }

    }
);


// --------------------------------------------------
// Message helper
// --------------------------------------------------

function showMessage(
    text,
    color
) {

    messageBox.textContent =
        text;

    messageBox.style.color =
        color;
}
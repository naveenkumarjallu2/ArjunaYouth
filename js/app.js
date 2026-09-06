// Ganesh Chanda - Main Application


const donationForm = document.getElementById("donationForm");
const messageBox = document.getElementById("message");

donationForm.addEventListener("submit", async function (event) {

    event.preventDefault();

    messageBox.textContent = "";
    messageBox.style.color = "green";

    const name = document.getElementById("name").value.trim();
    const surname = document.getElementById("surname").value.trim();
    const mobile = document.getElementById("mobile").value.trim();
    const isWhatsapp = document.getElementById("whatsapp").checked;
    const address = document.getElementById("address").value.trim();
    const amount = Number(document.getElementById("amount").value);

    const paymentType =
        document.querySelector("input[name='payment']:checked").value;

    // Basic validation
    if (!name || !surname || !mobile || !address || !amount) {
        showMessage("Please fill in all required fields.", "red");
        return;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
        showMessage("Please enter a valid 10-digit mobile number.", "red");
        return;
    }

    if (amount <= 0) {
        showMessage("Donation amount must be greater than ₹0.", "red");
        return;
    }

    try {

        const submitButton =
            document.querySelector(".submitBtn");

        submitButton.disabled = true;
        submitButton.textContent = "Saving...";

        const donationData = {
            title: "Arujuna Youth",

            donor_name: name,
            donor_surname: surname,

            mobile: mobile,
            is_whatsapp: isWhatsapp,

            address: address,

            amount: amount,

            payment_type: paymentType,

            payment_status:
                paymentType === "Cash"
                    ? "Success"
                    : "Pending"
        };

        const { data, error } =
            await supabaseClient
                .from("donations")
                .insert([donationData])
                .select()
                .single();

        if (error) {
            console.error(error);
            throw error;
        }

        /*
         * Store donation temporarily so success.html
         * can display the correct donor information.
         */
        localStorage.setItem(
            "lastDonation",
            JSON.stringify(data)
        );

        /*
         * CASH
         *
         * Cash is considered received when the form is submitted.
         */
        if (paymentType === "Cash") {

            window.location.href =
                `success.html?id=${encodeURIComponent(data.id)}&type=cash`;

            return;
        }

        /*
         * ONLINE
         *
         * At this stage the donation is Pending.
         *
         * The donor can now open the UPI app using
         * the QR code / Open UPI App button.
         *
         * A future payment-gateway integration should
         * change this record to Success after verification.
         */

        showMessage(
            "Donation details saved. Please complete your UPI payment using the QR code above.",
            "green"
        );

        submitButton.disabled = false;
        submitButton.textContent = "Submit Donation";

    } catch (error) {

        console.error("Donation error:", error);

        showMessage(
            "Something went wrong. Please try again.",
            "red"
        );

        const submitButton =
            document.querySelector(".submitBtn");

        submitButton.disabled = false;
        submitButton.textContent = "Submit Donation";
    }

});


function showMessage(text, color) {

    messageBox.textContent = text;
    messageBox.style.color = color;

}
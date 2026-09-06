// Admin Dashboard Application
const loginSection =
    document.getElementById("loginSection");

const dashboardSection =
    document.getElementById("dashboardSection");

const loginForm =
    document.getElementById("loginForm");

const loginMessage =
    document.getElementById("loginMessage");

const dashboardMessage =
    document.getElementById("dashboardMessage");

const logoutButton =
    document.getElementById("logoutButton");

const refreshButton =
    document.getElementById("refreshButton");

const exportButton =
    document.getElementById("exportButton");

const searchInput =
    document.getElementById("searchInput");

const donationsTable =
    document.getElementById("donationsTable");


let allDonations = [];



/* ==========================================
   CHECK EXISTING LOGIN
========================================== */

checkLogin();



async function checkLogin() {

    const {
        data: {
            session
        }
    } = await supabaseClient.auth.getSession();


    if (session) {

        showDashboard();

    } else {

        showLogin();

    }

}



/* ==========================================
   LOGIN
========================================== */

loginForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();


        const email =
            document
                .getElementById("adminEmail")
                .value
                .trim();


        const password =
            document
                .getElementById("adminPassword")
                .value;


        loginMessage.textContent =
            "Logging in...";


        const {
            data,
            error
        } =
            await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });


        if (error) {

            console.error(error);

            loginMessage.textContent =
                "Invalid email or password.";

            loginMessage.style.color =
                "red";

            return;

        }


        loginMessage.textContent =
            "";


        showDashboard();

    }
);



/* ==========================================
   LOGOUT
========================================== */

logoutButton.addEventListener(
    "click",
    async function () {

        await supabaseClient.auth.signOut();

        allDonations = [];

        showLogin();

    }
);



/* ==========================================
   SHOW LOGIN
========================================== */

function showLogin() {

    loginSection.classList.remove(
        "hidden"
    );

    dashboardSection.classList.add(
        "hidden"
    );

}



/* ==========================================
   SHOW DASHBOARD
========================================== */

function showDashboard() {

    loginSection.classList.add(
        "hidden"
    );

    dashboardSection.classList.remove(
        "hidden"
    );


    loadDonations();

}



/* ==========================================
   LOAD DONATIONS
========================================== */

async function loadDonations() {

    dashboardMessage.textContent =
        "Loading donations...";


    const {
        data,
        error
    } =
        await supabaseClient
            .from("donations")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(error);

        dashboardMessage.textContent =
            "Unable to load donations.";

        dashboardMessage.style.color =
            "red";

        return;

    }


    allDonations = data || [];


    updateStatistics(
        allDonations
    );


    displayDonations(
        allDonations
    );


    dashboardMessage.textContent =
        "";

}



/* ==========================================
   STATISTICS
========================================== */

function updateStatistics(
    donations
) {

    let total =
        0;

    let cash =
        0;

    let online =
        0;


    donations.forEach(
        donation => {

            const amount =
                Number(
                    donation.amount
                );


            /*
             * Only count successful
             * donations in collection totals.
             */

            if (
                donation.payment_status ===
                "Success"
            ) {

                total += amount;


                if (
                    donation.payment_type ===
                    "Cash"
                ) {

                    cash += amount;

                }


                if (
                    donation.payment_type ===
                    "Online"
                ) {

                    online += amount;

                }

            }

        }
    );


    document.getElementById(
        "totalCollection"
    ).textContent =
        formatCurrency(total);


    document.getElementById(
        "totalDonors"
    ).textContent =
        donations.length;


    document.getElementById(
        "cashCollection"
    ).textContent =
        formatCurrency(cash);


    document.getElementById(
        "onlineCollection"
    ).textContent =
        formatCurrency(online);

}



/* ==========================================
   DISPLAY TABLE
========================================== */

function displayDonations(
    donations
) {

    donationsTable.innerHTML =
        "";


    if (!donations.length) {

        donationsTable.innerHTML = `
            <tr>
                <td colspan="9">
                    No donations found.
                </td>
            </tr>
        `;

        return;

    }


    donations.forEach(
        donation => {

            const row =
                document.createElement(
                    "tr"
                );


            const date =
                new Date(
                    donation.created_at
                ).toLocaleString(
                    "en-IN"
                );


            const whatsapp =
                donation.is_whatsapp
                    ? "Yes"
                    : "No";


            const status =
                donation.payment_status;


            row.innerHTML = `

                <td>
                    ${escapeHTML(date)}
                </td>

                <td>
                    ${escapeHTML(
                        donation.donor_name
                    )}
                    ${escapeHTML(
                        donation.donor_surname
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        donation.mobile
                    )}
                </td>

                <td>
                    ${whatsapp}
                </td>

                <td>
                    ${escapeHTML(
                        donation.address
                    )}
                </td>

                <td>
                    ₹${Number(
                        donation.amount
                    ).toLocaleString(
                        "en-IN"
                    )}
                </td>

                <td>
                    ${escapeHTML(
                        donation.payment_type
                    )}
                </td>

                <td>
                    ${escapeHTML(status)}
                </td>

                <td>

                    <button
                        class="deleteBtn"
                        onclick="deleteDonation('${donation.id}')"
                    >
                        Delete
                    </button>

                </td>

            `;


            donationsTable.appendChild(
                row
            );

        }
    );

}



/* ==========================================
   SEARCH
========================================== */

searchInput.addEventListener(
    "input",
    function () {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();


        if (!query) {

            displayDonations(
                allDonations
            );

            return;

        }


        const filtered =
            allDonations.filter(
                donation => {

                    const name =
                        `${donation.donor_name}
                        ${donation.donor_surname}`
                            .toLowerCase();


                    const mobile =
                        donation.mobile
                            .toLowerCase();


                    return (
                        name.includes(query) ||
                        mobile.includes(query)
                    );

                }
            );


        displayDonations(
            filtered
        );

    }
);



/* ==========================================
   REFRESH
========================================== */

refreshButton.addEventListener(
    "click",
    function () {

        loadDonations();

    }
);



/* ==========================================
   DELETE DONATION
========================================== */

async function deleteDonation(
    id
) {

    const confirmed =
        confirm(
            "Are you sure you want to delete this donation?"
        );


    if (!confirmed) {

        return;

    }


    const {
        error
    } =
        await supabaseClient
            .from("donations")
            .delete()
            .eq(
                "id",
                id
            );


    if (error) {

        console.error(error);

        alert(
            "Unable to delete donation."
        );

        return;

    }


    await loadDonations();

}



/* ==========================================
   EXPORT CSV
========================================== */

exportButton.addEventListener(
    "click",
    function () {

        if (!allDonations.length) {

            alert(
                "There are no donations to export."
            );

            return;

        }


        const headers = [

            "Date",

            "Donor Name",

            "Surname",

            "Mobile",

            "WhatsApp",

            "Address",

            "Amount",

            "Payment Type",

            "Payment Status",

            "Transaction ID"

        ];


        const rows =
            allDonations.map(
                donation => [

                    new Date(
                        donation.created_at
                    ).toLocaleString(
                        "en-IN"
                    ),

                    donation.donor_name,

                    donation.donor_surname,

                    donation.mobile,

                    donation.is_whatsapp
                        ? "Yes"
                        : "No",

                    donation.address,

                    donation.amount,

                    donation.payment_type,

                    donation.payment_status,

                    donation.transaction_id || ""

                ]
            );


        const csvData = [

            headers,

            ...rows

        ];


        const csv =
            csvData
                .map(
                    row =>
                        row
                            .map(
                                value =>
                                    `"${String(
                                        value
                                    ).replace(
                                        /"/g,
                                        '""'
                                    )}"`
                            )
                            .join(",")
                )
                .join("\n");


        const blob =
            new Blob(
                [csv],
                {
                    type:
                        "text/csv;charset=utf-8;"
                }
            );


        const url =
            URL.createObjectURL(
                blob
            );


        const link =
            document.createElement(
                "a"
            );


        link.href =
            url;


        link.download =
            `arujuna-youth-donations-${new Date()
                .toISOString()
                .slice(0,10)}.csv`;


        document.body.appendChild(
            link
        );


        link.click();


        document.body.removeChild(
            link
        );


        URL.revokeObjectURL(
            url
        );

    }
);



/* ==========================================
   CURRENCY
========================================== */

function formatCurrency(
    amount
) {

    return (
        "₹" +
        Number(amount).toLocaleString(
            "en-IN",
            {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }
        )
    );

}



/* ==========================================
   SECURITY
========================================== */

function escapeHTML(
    value
) {

    return String(value)
        .replace(
            /&/g,
            "&amp;"
        )
        .replace(
            /</g,
            "&lt;"
        )
        .replace(
            />/g,
            "&gt;"
        )
        .replace(
            /"/g,
            "&quot;"
        )
        .replace(
            /'/g,
            "&#039;"
        );

}

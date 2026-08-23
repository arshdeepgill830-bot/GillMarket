"use strict";

/*
    =========================================================
    GILL MARKET
    FINAL FRONT-END VERSION
    =========================================================

    This version works without Supabase.

    Orders and seller services are saved in localStorage.

    IMPORTANT:
    localStorage is only browser/device storage.
    It is NOT a real online database.

    Real online payments and permanent multi-user
    database will need a backend/payment gateway later.
*/


/* =========================================================
   SETTINGS
   ========================================================= */

const COMMISSION = 30;

let selectedService = "";
let selectedPrice = 0;


/* =========================================================
   HELPERS
   ========================================================= */

function get(id) {
    return document.getElementById(id);
}


function showMessage(message) {
    alert(message);
}


function openModal(id) {

    const modal = get(id);

    if (modal) {
        modal.classList.add("show");
    }
}


function closeModal(id) {

    const modal = get(id);

    if (modal) {
        modal.classList.remove("show");
    }
}


/* =========================================================
   MOBILE MENU
   ========================================================= */

const menuBtn = get("menuBtn");
const nav = get("nav");

if (menuBtn && nav) {

    menuBtn.addEventListener("click", function () {

        nav.classList.toggle("open");

    });

}


/* Close mobile menu after navigation */

if (nav) {

    nav.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {

            nav.classList.remove("open");

        });

    });

}


/* =========================================================
   FIND SERVICE
   ========================================================= */

const findBtn = get("findBtn");

if (findBtn) {

    findBtn.addEventListener("click", function () {

        const services = get("services");

        if (services) {

            services.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

}


/* =========================================================
   LOGIN
   ========================================================= */

const loginBtn = get("loginBtn");

if (loginBtn) {

    loginBtn.addEventListener("click", function () {

        const savedName =
            localStorage.getItem("gillMarketName") || "";

        const savedEmail =
            localStorage.getItem("gillMarketEmail") || "";


        if (get("loginName")) {
            get("loginName").value = savedName;
        }

        if (get("loginEmail")) {
            get("loginEmail").value = savedEmail;
        }


        openModal("loginModal");

    });

}


/* Continue login */

const continueBtn = get("continueBtn");

if (continueBtn) {

    continueBtn.addEventListener("click", function () {

        const name =
            get("loginName")?.value.trim();

        const email =
            get("loginEmail")?.value.trim();


        if (!name) {

            showMessage(
                "Please enter your name."
            );

            return;
        }


        if (!email) {

            showMessage(
                "Please enter your email."
            );

            return;
        }


        if (!email.includes("@")) {

            showMessage(
                "Please enter a valid email address."
            );

            return;
        }


        localStorage.setItem(
            "gillMarketName",
            name
        );

        localStorage.setItem(
            "gillMarketEmail",
            email
        );


        showMessage(
            "Welcome to GillMarket, " +
            name +
            "! 🎉"
        );


        closeModal("loginModal");

    });

}


/* =========================================================
   SELLER MODAL
   ========================================================= */

function openSeller() {

    openModal("sellerModal");

}


const sellBtn = get("sellBtn");

if (sellBtn) {

    sellBtn.addEventListener(
        "click",
        openSeller
    );

}


const sellHeroBtn = get("sellHeroBtn");

if (sellHeroBtn) {

    sellHeroBtn.addEventListener(
        "click",
        openSeller
    );

}


/* =========================================================
   CLOSE BUTTONS
   ========================================================= */

document
    .querySelectorAll("[data-close]")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                const modalId =
                    button.getAttribute("data-close");

                closeModal(modalId);

            }
        );

    });


/* =========================================================
   CLOSE MODAL BY CLICKING OUTSIDE
   ========================================================= */

document
    .querySelectorAll(".modal")
    .forEach(function (modal) {

        modal.addEventListener(
            "click",
            function (event) {

                if (event.target === modal) {

                    modal.classList.remove("show");

                }

            }
        );

    });


/* =========================================================
   ESC KEY CLOSE
   ========================================================= */

document.addEventListener(
    "keydown",
    function (event) {

        if (event.key === "Escape") {

            document
                .querySelectorAll(".modal.show")
                .forEach(function (modal) {

                    modal.classList.remove("show");

                });

        }

    }
);


/* =========================================================
   ORDER BUTTONS
   ========================================================= */

document
    .querySelectorAll(".order-btn")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                selectedService =
                    button.dataset.name || "";

                selectedPrice =
                    Number(
                        button.dataset.price || 0
                    );


                if (
                    !selectedService ||
                    selectedPrice <= 0
                ) {

                    showMessage(
                        "Service information is unavailable."
                    );

                    return;
                }


                const commissionAmount =
                    selectedPrice *
                    COMMISSION /
                    100;


                const sellerAmount =
                    selectedPrice -
                    commissionAmount;


                const summary =
                    get("orderSummary");


                if (summary) {

                    summary.innerHTML =

                        "<strong>" +
                        selectedService +
                        "</strong>" +

                        "<br><br>" +

                        "Order Price: ₹" +
                        selectedPrice.toFixed(2) +

                        "<br>" +

                        "GillMarket 30%: ₹" +
                        commissionAmount.toFixed(2) +

                        "<br>" +

                        "Seller 70%: ₹" +
                        sellerAmount.toFixed(2);

                }


                /* Prefill saved customer information */

                const savedName =
                    localStorage.getItem(
                        "gillMarketName"
                    ) || "";

                const savedEmail =
                    localStorage.getItem(
                        "gillMarketEmail"
                    ) || "";


                if (get("customerName")) {
                    get("customerName").value =
                        savedName;
                }

                if (get("customerEmail")) {
                    get("customerEmail").value =
                        savedEmail;
                }


                openModal("orderModal");

            }
        );

    });


/* =========================================================
   SUBMIT ORDER
   ========================================================= */

const submitOrder = get("submitOrder");

if (submitOrder) {

    submitOrder.addEventListener(
        "click",
        function () {

            const customerName =
                get("customerName")
                    ?.value
                    .trim();

            const customerEmail =
                get("customerEmail")
                    ?.value
                    .trim();

            const details =
                get("details")
                    ?.value
                    .trim();


            if (!selectedService) {

                showMessage(
                    "Please select a service first."
                );

                return;
            }


            if (!customerName) {

                showMessage(
                    "Please enter your name."
                );

                return;
            }


            if (!customerEmail) {

                showMessage(
                    "Please enter your email."
                );

                return;
            }


            if (!customerEmail.includes("@")) {

                showMessage(
                    "Please enter a valid email address."
                );

                return;
            }


            if (!details) {

                showMessage(
                    "Please describe what you need."
                );

                return;
            }


            const commissionAmount =
                selectedPrice *
                COMMISSION /
                100;


            const sellerAmount =
                selectedPrice -
                commissionAmount;


            const order = {

                id:
                    "GM-" +
                    Date.now(),

                service:
                    selectedService,

                customer_name:
                    customerName,

                customer_email:
                    customerEmail,

                details:
                    details,

                price:
                    selectedPrice,

                commission_percent:
                    COMMISSION,

                commission_amount:
                    commissionAmount,

                seller_amount:
                    sellerAmount,

                status:
                    "pending",

                created_at:
                    new Date().toISOString()

            };


            /* Get old orders */

            let orders = [];

            try {

                orders =
                    JSON.parse(
                        localStorage.getItem(
                            "gillMarketOrders"
                        ) || "[]"
                    );

                if (!Array.isArray(orders)) {
                    orders = [];
                }

            } catch (error) {

                orders = [];

            }


            /* Add new order */

            orders.push(order);


            /* Save */

            localStorage.setItem(
                "gillMarketOrders",
                JSON.stringify(orders)
            );


            /* Success */

            showMessage(

                "Order successfully submitted! 🎉" +

                "\n\nOrder ID: " +
                order.id +

                "\nService: " +
                order.service +

                "\nPrice: ₹" +
                order.price +

                "\nGillMarket 30%: ₹" +
                commissionAmount.toFixed(2) +

                "\nSeller 70%: ₹" +
                sellerAmount.toFixed(2)

            );


            closeModal("orderModal");


            /* Clear details */

            if (get("details")) {
                get("details").value = "";
            }


            /* Keep customer name/email */

            selectedService = "";
            selectedPrice = 0;

        }
    );

}


/* =========================================================
   SELLER SERVICE SUBMISSION
   ========================================================= */

const submitSeller = get("submitSeller");

if (submitSeller) {

    submitSeller.addEventListener(
        "click",
        function () {

            const sellerName =
                get("sellerName")
                    ?.value
                    .trim();

            const sellerService =
                get("sellerService")
                    ?.value
                    .trim();

            const sellerPrice =
                Number(
                    get("sellerPrice")
                        ?.value
                );

            const sellerDescription =
                get("sellerDescription")
                    ?.value
                    .trim();


            if (!sellerName) {

                showMessage(
                    "Please enter your name."
                );

                return;
            }


            if (!sellerService) {

                showMessage(
                    "Please enter your service name."
                );

                return;
            }


            if (
                !sellerPrice ||
                sellerPrice <= 0
            ) {

                showMessage(
                    "Please enter a valid price."
                );

                return;
            }


            if (!sellerDescription) {

                showMessage(
                    "Please describe your service."
                );

                return;
            }


            const service = {

                id:
                    "SERVICE-" +
                    Date.now(),

                seller_name:
                    sellerName,

                service_name:
                    sellerService,

                price:
                    sellerPrice,

                description:
                    sellerDescription,

                commission_percent:
                    COMMISSION,

                status:
                    "pending",

                created_at:
                    new Date().toISOString()

            };


            let services = [];

            try {

                services =
                    JSON.parse(
                        localStorage.getItem(
                            "gillMarketServices"
                        ) || "[]"
                    );

                if (!Array.isArray(services)) {
                    services = [];
                }

            } catch (error) {

                services = [];

            }


            services.push(service);


            localStorage.setItem(
                "gillMarketServices",
                JSON.stringify(services)
            );


            showMessage(

                "Your service was submitted successfully! 🎉" +

                "\n\nService: " +
                sellerService +

                "\nPrice: ₹" +
                sellerPrice +

                "\nCommission: " +
                COMMISSION +
                "%"

            );


            closeModal("sellerModal");


            /* Clear seller form */

            if (get("sellerName")) {
                get("sellerName").value = "";
            }

            if (get("sellerService")) {
                get("sellerService").value = "";
            }

            if (get("sellerPrice")) {
                get("sellerPrice").value = "";
            }

            if (get("sellerDescription")) {
                get("sellerDescription").value = "";
            }

        }
    );

}


/* =========================================================
   DEBUG / TEST
   ========================================================= */

console.log(
    "GillMarket loaded successfully."
);

console.log(
    "Saved orders:",
    JSON.parse(
        localStorage.getItem(
            "gillMarketOrders"
        ) || "[]"
    )
);

console.log(
    "Saved services:",
    JSON.parse(
        localStorage.getItem(
            "gillMarketServices"
        ) || "[]"
    )
);
"use strict";

/*
=========================================================
GILL MARKET
Final frontend JavaScript
No Vercel required
Data is saved in browser LocalStorage
=========================================================
*/

const COMMISSION = 30;

let selectedService = "";
let selectedPrice = 0;


/* =====================================================
   HELPERS
===================================================== */

function $(id) {
    return document.getElementById(id);
}

function showMessage(message) {
    alert(message);
}

function openModal(id) {
    const modal = $(id);

    if (modal) {
        modal.classList.add("show");
    }
}

function closeModal(id) {
    const modal = $(id);

    if (modal) {
        modal.classList.remove("show");
    }
}

function saveData(key, data) {
    localStorage.setItem(key, JSON.stringify(data));
}

function getData(key) {
    try {
        return JSON.parse(
            localStorage.getItem(key) || "[]"
        );
    } catch (error) {
        return [];
    }
}


/* =====================================================
   MOBILE MENU
===================================================== */

const menuBtn = $("menuBtn");
const nav = $("nav");

if (menuBtn && nav) {

    menuBtn.addEventListener("click", function () {
        nav.classList.toggle("open");
    });

    nav.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {
            nav.classList.remove("open");
        });

    });
}


/* =====================================================
   FIND SERVICE
===================================================== */

const findBtn = $("findBtn");

if (findBtn) {

    findBtn.addEventListener("click", function () {

        const services = $("services");

        if (services) {
            services.scrollIntoView({
                behavior: "smooth"
            });
        }

    });
}


/* =====================================================
   LOGIN
===================================================== */

const loginBtn = $("loginBtn");
const continueBtn = $("continueBtn");

if (loginBtn) {

    loginBtn.addEventListener("click", function () {

        const savedName =
            localStorage.getItem("gillMarketName") || "";

        const savedEmail =
            localStorage.getItem("gillMarketEmail") || "";

        if ($("loginName")) {
            $("loginName").value = savedName;
        }

        if ($("loginEmail")) {
            $("loginEmail").value = savedEmail;
        }

        openModal("loginModal");
    });
}


if (continueBtn) {

    continueBtn.addEventListener("click", function () {

        const name =
            $("loginName").value.trim();

        const email =
            $("loginEmail").value.trim();


        if (!name) {
            showMessage("Please enter your name.");
            return;
        }


        if (!email || !email.includes("@")) {
            showMessage("Please enter a valid email.");
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


/* =====================================================
   SELLER MODAL
===================================================== */

function openSellerModal() {
    openModal("sellerModal");
}

const sellBtn = $("sellBtn");
const sellHeroBtn = $("sellHeroBtn");

if (sellBtn) {
    sellBtn.addEventListener(
        "click",
        openSellerModal
    );
}

if (sellHeroBtn) {
    sellHeroBtn.addEventListener(
        "click",
        openSellerModal
    );
}


/* =====================================================
   CLOSE BUTTONS
===================================================== */

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


/* =====================================================
   CLOSE MODAL BY CLICKING OUTSIDE
===================================================== */

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


/* =====================================================
   ESCAPE KEY CLOSES MODAL
===================================================== */

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


/* =====================================================
   ORDER BUTTONS
===================================================== */

document
    .querySelectorAll(".order-btn")
    .forEach(function (button) {

        button.addEventListener(
            "click",
            function () {

                selectedService =
                    button.dataset.name || "";

                selectedPrice =
                    Number(button.dataset.price || 0);


                if (!selectedService || selectedPrice <= 0) {

                    showMessage(
                        "This service is currently unavailable."
                    );

                    return;
                }


                const commissionAmount =
                    selectedPrice * COMMISSION / 100;

                const sellerAmount =
                    selectedPrice - commissionAmount;


                const summary = $("summary");

                if (summary) {

                    summary.innerHTML =
                        "<strong>" +
                        selectedService +
                        "</strong><br><br>" +

                        "Order Price: ₹" +
                        selectedPrice.toFixed(2) +

                        "<br>GillMarket 30%: ₹" +
                        commissionAmount.toFixed(2) +

                        "<br>Seller 70%: ₹" +
                        sellerAmount.toFixed(2);

                }


                const savedName =
                    localStorage.getItem(
                        "gillMarketName"
                    ) || "";

                const savedEmail =
                    localStorage.getItem(
                        "gillMarketEmail"
                    ) || "";


                if ($("customerName")) {
                    $("customerName").value =
                        savedName;
                }

                if ($("customerEmail")) {
                    $("customerEmail").value =
                        savedEmail;
                }


                openModal("orderModal");
            }
        );

    });


/* =====================================================
   SUBMIT ORDER
===================================================== */

const submitOrder = $("submitOrder");

if (submitOrder) {

    submitOrder.addEventListener(
        "click",
        function () {

            const customerName =
                $("customerName").value.trim();

            const customerEmail =
                $("customerEmail").value.trim();

            const details =
                $("details").value.trim();


            if (!customerName) {

                showMessage(
                    "Please enter your name."
                );

                return;
            }


            if (
                !customerEmail ||
                !customerEmail.includes("@")
            ) {

                showMessage(
                    "Please enter a valid email."
                );

                return;
            }


            if (!details) {

                showMessage(
                    "Please describe what you need."
                );

                return;
            }


            if (
                !selectedService ||
                selectedPrice <= 0
            ) {

                showMessage(
                    "Please select a service first."
                );

                return;
            }


            const commissionAmount =
                selectedPrice * COMMISSION / 100;

            const sellerAmount =
                selectedPrice - commissionAmount;


            const orderId =
                "GM-" +
                Date.now();


            const order = {

                id: orderId,

                service_name:
                    selectedService,

                customer_name:
                    customerName,

                customer_email:
                    customerEmail,

                details:
                    details,

                price:
                    selectedPrice,

                commission:
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


            const orders =
                getData("gillMarketOrders");


            orders.push(order);


            saveData(
                "gillMarketOrders",
                orders
            );


            showMessage(
                "Order submitted successfully! 🎉" +

                "\n\nOrder ID: " +
                orderId +

                "\nService: " +
                selectedService +

                "\nPrice: ₹" +
                selectedPrice +

                "\nGillMarket 30%: ₹" +
                commissionAmount.toFixed(2) +

                "\nSeller 70%: ₹" +
                sellerAmount.toFixed(2)
            );


            closeModal("orderModal");


            $("customerName").value = "";
            $("customerEmail").value = "";
            $("details").value = "";

            selectedService = "";
            selectedPrice = 0;

        }
    );
}


/* =====================================================
   SELLER SERVICE SUBMISSION
===================================================== */

const submitSeller = $("submitSeller");

if (submitSeller) {

    submitSeller.addEventListener(
        "click",
        function () {

            const sellerName =
                $("sellerName").value.trim();

            const sellerService =
                $("sellerService").value.trim();

            const sellerPrice =
                Number(
                    $("sellerPrice").value
                );

            const sellerDescription =
                $("sellerDescription")
                    .value
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


            if (!sellerPrice || sellerPrice <= 0) {

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

                commission:
                    COMMISSION,

                seller_amount:
                    sellerPrice -
                    (sellerPrice * COMMISSION / 100),

                status:
                    "pending",

                created_at:
                    new Date().toISOString()

            };


            const services =
                getData("gillMarketServices");


            services.push(service);


            saveData(
                "gillMarketServices",
                services
            );


            showMessage(
                "Your service was submitted successfully! 🎉" +

                "\n\nService: " +
                sellerService +

                "\nPrice: ₹" +
                sellerPrice +

                "\nGillMarket commission: " +
                COMMISSION +
                "%"
            );


            closeModal("sellerModal");


            $("sellerName").value = "";
            $("sellerService").value = "";
            $("sellerPrice").value = "";
            $("sellerDescription").value = "";

        }
    );
}


/* =====================================================
   START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        console.log(
            "GillMarket loaded successfully."
        );

        console.log(
            "Orders:",
            getData("gillMarketOrders")
        );

        console.log(
            "Services:",
            getData("gillMarketServices")
        );

    }
);
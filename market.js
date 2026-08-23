/* =====================================================
   GILL MARKET - MARKET.JS
   Works with existing index.html
   Does NOT require deleting old script.js
   ===================================================== */

(function () {

    "use strict";

    /* =========================
       SETTINGS
    ========================= */

    const COMMISSION = 30;

    let selectedService = "";
    let selectedPrice = 0;


    /* =========================
       HELPERS
    ========================= */

    function get(id) {
        return document.getElementById(id);
    }

    function message(text) {
        alert(text);
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


    /* =========================
       MOBILE MENU
    ========================= */

    const menuBtn = get("menuBtn");
    const nav = get("nav");

    if (menuBtn && nav) {

        menuBtn.addEventListener("click", function () {

            nav.classList.toggle("open");

        });

    }


    /* =========================
       FIND SERVICE
    ========================= */

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


    /* =========================
       LOGIN
    ========================= */

    const loginBtn = get("loginBtn");

    if (loginBtn) {

        loginBtn.addEventListener("click", function () {

            openModal("loginModal");

        });

    }


    const continueBtn = get("continueBtn");

    if (continueBtn) {

        continueBtn.addEventListener(
            "click",
            function () {

                const name =
                    get("loginName")?.value.trim();

                const email =
                    get("loginEmail")?.value.trim();


                if (!name || !email) {

                    message(
                        "Please enter your name and email."
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


                message(
                    "Welcome to Gill Market, " +
                    name +
                    "! 🎉"
                );


                closeModal("loginModal");

            }
        );

    }


    /* =========================
       SELLER
    ========================= */

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


    /* =========================
       CLOSE BUTTONS
    ========================= */

    document
        .querySelectorAll("[data-close]")
        .forEach(function (button) {

            button.addEventListener(
                "click",
                function () {

                    const modalId =
                        button.getAttribute(
                            "data-close"
                        );

                    closeModal(modalId);

                }
            );

        });


    /* =========================
       CLOSE MODAL
       BY CLICKING OUTSIDE
    ========================= */

    document
        .querySelectorAll(".modal")
        .forEach(function (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target === modal
                    ) {

                        modal.classList.remove(
                            "show"
                        );

                    }

                }
            );

        });


    /* =========================
       ORDER BUTTONS
    ========================= */

    document
        .querySelectorAll(".order")
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

                        message(
                            "Service information is missing."
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
                        get("summary");


                    if (summary) {

                        summary.innerHTML =
                            "<strong>" +
                            selectedService +
                            "</strong>" +
                            "<br><br>" +

                            "Order Price: ₹" +
                            selectedPrice.toFixed(2) +

                            "<br>" +

                            "Gill Market 30%: ₹" +
                            commissionAmount.toFixed(2) +

                            "<br>" +

                            "Seller 70%: ₹" +
                            sellerAmount.toFixed(2);

                    }


                    openModal("orderModal");

                }
            );

        });


    /* =========================
       SUBMIT ORDER
    ========================= */

    const submitOrder =
        get("submitOrder");

    if (submitOrder) {

        submitOrder.addEventListener(
            "click",
            function () {

                const name =
                    get("customerName")
                        ?.value
                        .trim();

                const email =
                    get("customerEmail")
                        ?.value
                        .trim();

                const details =
                    get("details")
                        ?.value
                        .trim();


                if (
                    !name ||
                    !email ||
                    !details
                ) {

                    message(
                        "Please fill all order details."
                    );

                    return;
                }


                if (
                    !selectedService ||
                    !selectedPrice
                ) {

                    message(
                        "Please select a service first."
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
                        name,

                    customer_email:
                        email,

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


                /* =====================
                   SAVE ORDER LOCALLY
                ===================== */

                const oldOrders =
                    JSON.parse(
                        localStorage.getItem(
                            "gillMarketOrders"
                        ) || "[]"
                    );


                oldOrders.push(order);


                localStorage.setItem(
                    "gillMarketOrders",
                    JSON.stringify(
                        oldOrders
                    )
                );


                /* =====================
                   SUCCESS
                ===================== */

                message(
                    "Order successfully submitted! 🎉" +

                    "\n\nOrder ID: " +
                    order.id +

                    "\nService: " +
                    selectedService +

                    "\nPrice: ₹" +
                    selectedPrice +

                    "\nGill Market 30%: ₹" +
                    commissionAmount.toFixed(2) +

                    "\nSeller 70%: ₹" +
                    sellerAmount.toFixed(2)
                );


                closeModal("orderModal");


                /* Clear form */

                if (get("customerName")) {
                    get("customerName").value = "";
                }

                if (get("customerEmail")) {
                    get("customerEmail").value = "";
                }

                if (get("details")) {
                    get("details").value = "";
                }

            }
        );

    }


    /* =========================
       SELLER SERVICE
    ========================= */

    const submitSeller =
        get("submitSeller");

    if (submitSeller) {

        submitSeller.addEventListener(
            "click",
            function () {

                const sellerName =
                    get("sellerName")
                        ?.value
                        .trim();

                const serviceName =
                    get("sellerService")
                        ?.value
                        .trim();

                const price =
                    Number(
                        get("sellerPrice")
                            ?.value
                    );

                const description =
                    get("sellerDescription")
                        ?.value
                        .trim();


                if (
                    !sellerName ||
                    !serviceName ||
                    !price ||
                    !description
                ) {

                    message(
                        "Please fill all service details."
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
                        serviceName,

                    price:
                        price,

                    description:
                        description,

                    commission:
                        COMMISSION,

                    status:
                        "pending",

                    created_at:
                        new Date().toISOString()

                };


                /* =====================
                   SAVE SERVICE
                ===================== */

                const oldServices =
                    JSON.parse(
                        localStorage.getItem(
                            "gillMarketServices"
                        ) || "[]"
                    );


                oldServices.push(service);


                localStorage.setItem(
                    "gillMarketServices",
                    JSON.stringify(
                        oldServices
                    )
                );


                message(
                    "Your service was submitted successfully! 🎉" +

                    "\n\nService: " +
                    serviceName +

                    "\nPrice: ₹" +
                    price +

                    "\nCommission: " +
                    COMMISSION +
                    "%"
                );


                closeModal("sellerModal");


                /* Clear form */

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


    /* =========================
       START
    ========================= */

    console.log(
        "GillMarket market.js loaded successfully."
    );

})();
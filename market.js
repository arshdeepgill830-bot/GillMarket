"use strict";

/* =====================================================
   GILL MARKET — SUPABASE CONFIG
===================================================== */

const SUPABASE_URL =
    "https://sbdadnfeutymqoelaydo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "sb_publishable_iMewXbi3FBgyRzCZBorsGg_ibGLrrAe";

const COMMISSION = 30;

let selectedService = "";
let selectedPrice = 0;


/* =====================================================
   SUPABASE API
===================================================== */

async function supabaseRequest(
    table,
    method,
    data = null,
    query = ""
) {
    const url =
        SUPABASE_URL +
        "/rest/v1/" +
        table +
        query;

    const options = {
        method: method,

        headers: {
            "apikey":
                SUPABASE_PUBLISHABLE_KEY,

            "Authorization":
                "Bearer " +
                SUPABASE_PUBLISHABLE_KEY,

            "Content-Type":
                "application/json",

            "Accept":
                "application/json"
        }
    };

    if (data !== null) {
        options.body =
            JSON.stringify(data);
    }

    const response =
        await fetch(
            url,
            options
        );

    const text =
        await response.text();

    let result = null;

    try {
        result =
            text
                ? JSON.parse(text)
                : null;
    } catch (error) {
        result = text;
    }

    if (!response.ok) {

        console.error(
            "Supabase error:",
            response.status,
            result
        );

        throw new Error(
            typeof result === "string"
                ? result
                : result?.message ||
                  result?.hint ||
                  "Supabase request failed."
        );
    }

    return result;
}


/* =====================================================
   BASIC HELPERS
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


/* =====================================================
   LOCAL STORAGE BACKUP
===================================================== */

function saveData(key, data) {

    localStorage.setItem(
        key,
        JSON.stringify(data)
    );
}


function getData(key) {

    try {

        return JSON.parse(
            localStorage.getItem(
                key
            ) || "[]"
        );

    } catch (error) {

        return [];
    }
}


/* =====================================================
   MOBILE MENU
===================================================== */

const menuBtn =
    $("menuBtn");

const nav =
    $("nav");


if (menuBtn && nav) {

    menuBtn.addEventListener(
        "click",
        function () {

            nav.classList.toggle(
                "open"
            );

        }
    );


    nav
        .querySelectorAll("a")
        .forEach(
            function (link) {

                link.addEventListener(
                    "click",
                    function () {

                        nav.classList.remove(
                            "open"
                        );

                    }
                );

            }
        );
}


/* =====================================================
   FIND SERVICE BUTTON
===================================================== */

const findBtn =
    $("findBtn");


if (findBtn) {

    findBtn.addEventListener(
        "click",
        function () {

            const services =
                $("services");

            if (services) {

                services.scrollIntoView({
                    behavior:
                        "smooth"
                });

            }

        }
    );
}


/* =====================================================
   LOGIN
===================================================== */

const loginBtn =
    $("loginBtn");

const continueBtn =
    $("continueBtn");


if (loginBtn) {

    loginBtn.addEventListener(
        "click",
        function () {

            const savedName =
                localStorage.getItem(
                    "gillMarketName"
                ) || "";


            const savedEmail =
                localStorage.getItem(
                    "gillMarketEmail"
                ) || "";


            if ($("loginName")) {

                $("loginName").value =
                    savedName;
            }


            if ($("loginEmail")) {

                $("loginEmail").value =
                    savedEmail;
            }


            openModal(
                "loginModal"
            );

        }
    );
}


if (continueBtn) {

    continueBtn.addEventListener(
        "click",
        function () {

            const name =
                $("loginName")
                    ?.value
                    .trim() || "";


            const email =
                $("loginEmail")
                    ?.value
                    .trim() || "";


            if (!name) {

                showMessage(
                    "Please enter your name."
                );

                return;
            }


            if (
                !email ||
                !email.includes("@")
            ) {

                showMessage(
                    "Please enter a valid email."
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


            closeModal(
                "loginModal"
            );

        }
    );
}


/* =====================================================
   SELLER MODAL
===================================================== */

function openSellerModal() {

    openModal(
        "sellerModal"
    );
}


const sellBtn =
    $("sellBtn");

const sellHeroBtn =
    $("sellHeroBtn");


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
    .querySelectorAll(
        "[data-close]"
    )
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    const modalId =
                        button.getAttribute(
                            "data-close"
                        );

                    closeModal(
                        modalId
                    );

                }
            );

        }
    );


/* =====================================================
   CLOSE MODAL BY CLICKING OUTSIDE
===================================================== */

document
    .querySelectorAll(
        ".modal"
    )
    .forEach(
        function (modal) {

            modal.addEventListener(
                "click",
                function (event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        modal.classList.remove(
                            "show"
                        );

                    }

                }
            );

        }
    );


/* =====================================================
   ESCAPE KEY
===================================================== */

document.addEventListener(
    "keydown",
    function (event) {

        if (
            event.key ===
            "Escape"
        ) {

            document
                .querySelectorAll(
                    ".modal.show"
                )
                .forEach(
                    function (modal) {

                        modal.classList.remove(
                            "show"
                        );

                    }
                );
        }

    }
);


/* =====================================================
   ORDER BUTTONS
===================================================== */

document
    .querySelectorAll(
        ".order-btn"
    )
    .forEach(
        function (button) {

            button.addEventListener(
                "click",
                function () {

                    selectedService =
                        button.dataset.name ||
                        "";


                    selectedPrice =
                        Number(
                            button.dataset.price ||
                            0
                        );


                    if (
                        !selectedService ||
                        selectedPrice <= 0
                    ) {

                        showMessage(
                            "This service is currently unavailable."
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
                        $("summary");


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


                    openModal(
                        "orderModal"
                    );

                }
            );

        }
    );
/* =====================================================
   SUBMIT ORDER
===================================================== */

const submitOrder =
    $("submitOrder");


if (submitOrder) {

    submitOrder.addEventListener(
        "click",
        async function () {

            const customerName =
                $("customerName")
                    ?.value
                    .trim() || "";


            const customerEmail =
                $("customerEmail")
                    ?.value
                    .trim() || "";


            const details =
                $("details")
                    ?.value
                    .trim() || "";


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
                Number(
                    (
                        selectedPrice *
                        COMMISSION /
                        100
                    ).toFixed(2)
                );


            const sellerAmount =
                Number(
                    (
                        selectedPrice -
                        commissionAmount
                    ).toFixed(2)
                );


            const orderId =
                "GM-" +
                Date.now();


            const order = {

                order_id:
                    orderId,

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

                commission_percent:
                    COMMISSION,

                commission_amount:
                    commissionAmount,

                seller_amount:
                    sellerAmount,

                status:
                    "pending",

                payment_status:
                    "unpaid"

            };


            /* LOCAL BACKUP */

            const localOrders =
                getData(
                    "gillMarketOrders"
                );


            localOrders.push({

                ...order,

                id:
                    orderId,

                created_at:
                    new Date().toISOString()

            });


            saveData(
                "gillMarketOrders",
                localOrders
            );


            submitOrder.disabled =
                true;

            submitOrder.textContent =
                "Saving Order...";


            try {

                await supabaseRequest(
                    "orders",
                    "POST",
                    order,
                    "?select=*"
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


                closeModal(
                    "orderModal"
                );


                if ($("customerName")) {
                    $("customerName").value =
                        "";
                }


                if ($("customerEmail")) {
                    $("customerEmail").value =
                        "";
                }


                if ($("details")) {
                    $("details").value =
                        "";
                }


                selectedService =
                    "";

                selectedPrice =
                    0;


            } catch (error) {

                console.error(
                    "Order save failed:",
                    error
                );


                showMessage(

                    "Order saved on this device, " +
                    "but Supabase connection failed." +

                    "\n\nPlease check your internet " +
                    "connection and database setup."

                );

            } finally {

                submitOrder.disabled =
                    false;

                submitOrder.textContent =
                    "Submit Order";

            }

        }
    );
}


/* =====================================================
   SELLER SERVICE SUBMISSION
===================================================== */

const submitSeller =
    $("submitSeller");


if (submitSeller) {

    submitSeller.addEventListener(
        "click",
        async function () {

            const sellerName =
                $("sellerName")
                    ?.value
                    .trim() || "";


            const sellerService =
                $("sellerService")
                    ?.value
                    .trim() || "";


            const sellerPrice =
                Number(
                    $("sellerPrice")
                        ?.value || 0
                );


            const sellerDescription =
                $("sellerDescription")
                    ?.value
                    .trim() || "";


            const sellerEmail =
                localStorage.getItem(
                    "gillMarketEmail"
                ) || null;


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


            const commissionAmount =
                Number(
                    (
                        sellerPrice *
                        COMMISSION /
                        100
                    ).toFixed(2)
                );


            const sellerAmount =
                Number(
                    (
                        sellerPrice -
                        commissionAmount
                    ).toFixed(2)
                );


            const service = {

                seller_name:
                    sellerName,

                seller_email:
                    sellerEmail,

                service_name:
                    sellerService,

                price:
                    sellerPrice,

                description:
                    sellerDescription,

                commission_percent:
                    COMMISSION,

                seller_amount:
                    sellerAmount,

                status:
                    "pending"

            };


            /* LOCAL BACKUP */

            const localServices =
                getData(
                    "gillMarketServices"
                );


            localServices.push({

                ...service,

                id:
                    "SERVICE-" +
                    Date.now(),

                created_at:
                    new Date().toISOString()

            });


            saveData(
                "gillMarketServices",
                localServices
            );


            submitSeller.disabled =
                true;

            submitSeller.textContent =
                "Saving Service...";


            try {

                await supabaseRequest(
                    "sellers",
                    "POST",
                    service,
                    "?select=*"
                );


                showMessage(

                    "Your service was submitted successfully! 🎉" +

                    "\n\nService: " +
                    sellerService +

                    "\nPrice: ₹" +
                    sellerPrice +

                    "\nGillMarket commission: " +
                    COMMISSION +
                    "%" +

                    "\nYour amount: ₹" +
                    sellerAmount

                );


                closeModal(
                    "sellerModal"
                );


                if ($("sellerName")) {
                    $("sellerName").value =
                        "";
                }


                if ($("sellerService")) {
                    $("sellerService").value =
                        "";
                }


                if ($("sellerPrice")) {
                    $("sellerPrice").value =
                        "";
                }


                if ($("sellerDescription")) {
                    $("sellerDescription").value =
                        "";
                }


            } catch (error) {

                console.error(
                    "Seller service save failed:",
                    error
                );


                showMessage(

                    "Service saved on this device, " +
                    "but Supabase connection failed."

                );

            } finally {

                submitSeller.disabled =
                    false;

                submitSeller.textContent =
                    "Submit Service";

            }

        }
    );
}


/* =====================================================
   SUPABASE CONNECTION TEST
===================================================== */

async function testSupabaseConnection() {

    try {

        await supabaseRequest(
            "orders",
            "GET",
            null,
            "?select=id&limit=1"
        );


        console.log(
            "✅ GillMarket Supabase connected."
        );


        return true;

    } catch (error) {

        console.error(
            "❌ GillMarket Supabase connection failed:",
            error
        );


        return false;
    }
}


/* =====================================================
   PAGE START
===================================================== */

document.addEventListener(
    "DOMContentLoaded",
    async function () {

        console.log(
            "🚀 GillMarket loaded."
        );


        console.log(
            "Local Orders:",
            getData(
                "gillMarketOrders"
            )
        );


        console.log(
            "Local Services:",
            getData(
                "gillMarketServices"
            )
        );


        await testSupabaseConnection();

    }
);
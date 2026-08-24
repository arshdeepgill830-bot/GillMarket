"use strict";

/*
=========================================================
 GILL MARKET
 Supabase Connected Market JS
 Part 1 / 2
=========================================================
*/

const SUPABASE_URL =
    "https://sbdadnfeutymqoelaydo.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_iMewXbi3FBgyRzCZBorsGg_ibGLrrAe";

const COMMISSION = 30;

let selectedService = "";
let selectedPrice = 0;
let supabaseClient = null;


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

function saveData(key, data) {
    try {
        localStorage.setItem(
            key,
            JSON.stringify(data)
        );
    } catch (error) {
        console.error(
            "LocalStorage save error:",
            error
        );
    }
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
   SUPABASE LOAD
===================================================== */

function loadSupabaseLibrary() {
    return new Promise((resolve, reject) => {

        if (
            window.supabase &&
            typeof window.supabase.createClient ===
                "function"
        ) {
            resolve();
            return;
        }

        const oldScript =
            document.querySelector(
                'script[data-gillmarket-supabase="true"]'
            );

        if (oldScript) {

            oldScript.addEventListener(
                "load",
                () => resolve()
            );

            oldScript.addEventListener(
                "error",
                () =>
                    reject(
                        new Error(
                            "Supabase library failed."
                        )
                    )
            );

            return;
        }

        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

        script.async = true;

        script.dataset.gillmarketSupabase =
            "true";

        script.onload = () => {
            if (
                window.supabase &&
                typeof window.supabase.createClient ===
                    "function"
            ) {
                resolve();
            } else {
                reject(
                    new Error(
                        "Supabase library loaded but client is unavailable."
                    )
                );
            }
        };

        script.onerror = () => {
            reject(
                new Error(
                    "Could not load Supabase library."
                )
            );
        };

        document.head.appendChild(script);
    });
}


/* =====================================================
   INITIALIZE SUPABASE
===================================================== */

async function initSupabase() {

    try {

        await loadSupabaseLibrary();

        supabaseClient =
            window.supabase.createClient(
                SUPABASE_URL,
                SUPABASE_KEY
            );

        console.log(
            "GillMarket: Supabase connected."
        );

        return true;

    } catch (error) {

        console.error(
            "Supabase connection error:",
            error
        );

        supabaseClient = null;

        return false;
    }
}


/* =====================================================
   MOBILE MENU
===================================================== */

function setupMobileMenu() {

    const menuBtn = $("menuBtn");
    const nav = $("nav");

    if (!menuBtn || !nav) {
        return;
    }

    menuBtn.addEventListener(
        "click",
        function () {

            nav.classList.toggle("open");

        }
    );

    nav
        .querySelectorAll("a")
        .forEach(function (link) {

            link.addEventListener(
                "click",
                function () {

                    nav.classList.remove(
                        "open"
                    );

                }
            );

        });
}


/* =====================================================
   FIND SERVICE
===================================================== */

function setupFindService() {

    const findBtn = $("findBtn");

    if (!findBtn) {
        return;
    }

    findBtn.addEventListener(
        "click",
        function () {

            const services =
                $("services");

            if (services) {

                services.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );
}


/* =====================================================
   LOGIN
===================================================== */

function setupLogin() {

    const loginBtn = $("loginBtn");
    const continueBtn = $("continueBtn");

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
}


/* =====================================================
   SELLER MODAL
===================================================== */

function openSellerModal() {
    openModal("sellerModal");
}


function setupSellerButtons() {

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
}


/* =====================================================
   MODAL CLOSE BUTTONS
===================================================== */

function setupModalClosing() {

    document
        .querySelectorAll(
            "[data-close]"
        )
        .forEach(function (button) {

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

        });


    document
        .querySelectorAll(
            ".modal"
        )
        .forEach(function (modal) {

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

        });


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
}


/* =====================================================
   ORDER BUTTONS
===================================================== */

function setupOrderButtons() {

    document
        .querySelectorAll(
            ".order-btn"
        )
        .forEach(function (button) {

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


                    const summary =
                        $("summary");


                    if (summary) {

                        summary.innerHTML =
                            "<strong>" +
                            escapeHTML(
                                selectedService
                            ) +
                            "</strong><br><br>" +

                            "Order Price: ₹" +
                            selectedPrice.toFixed(
                                2
                            ) +

                            "<br>GillMarket 30%: ₹" +
                            commissionAmount.toFixed(
                                2
                            ) +

                            "<br>Seller 70%: ₹" +
                            sellerAmount.toFixed(
                                2
                            );

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

        });
}


/* =====================================================
   ESCAPE HTML
===================================================== */

function escapeHTML(value) {

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


/* =====================================================
   CREATE ORDER OBJECT
===================================================== */

function createOrderObject(
    orderId,
    customerName,
    customerEmail,
    details
) {

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


    return {

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

        created_at:
            new Date().toISOString()

    };
}


/* =====================================================
   SAVE ORDER TO SUPABASE
===================================================== */

async function saveOrderToSupabase(order) {

    if (!supabaseClient) {

        throw new Error(
            "Supabase is not connected."
        );

    }


    const result =
        await supabaseClient
            .from("orders")
            .insert([order])
            .select();


    if (result.error) {

        console.error(
            "Supabase order error:",
            result.error
        );

        throw result.error;
    }


    return result.data;
}


/* =====================================================
   LOCAL BACKUP
===================================================== */

function saveOrderLocally(order) {

    const orders =
        getData(
            "gillMarketOrders"
        );


    orders.push({

        ...order,

        id:
            order.order_id

    });


    saveData(
        "gillMarketOrders",
        orders
    );
}


/* =====================================================
   RESET ORDER FORM
===================================================== */

function resetOrderForm() {

    if ($("customerName")) {
        $("customerName").value = "";
    }

    if ($("customerEmail")) {
        $("customerEmail").value = "";
    }

    if ($("details")) {
        $("details").value = "";
    }

    selectedService = "";

    selectedPrice = 0;
}


/* =====================================================
   ORDER SUCCESS
===================================================== */

function showOrderSuccess(
    orderId,
    service,
    price,
    commissionAmount,
    sellerAmount
) {

    showMessage(
        "Order submitted successfully! 🎉" +

        "\n\nOrder ID: " +
        orderId +

        "\nService: " +
        service +

        "\nPrice: ₹" +
        Number(price).toFixed(2) +

        "\nGillMarket 30%: ₹" +
        Number(
            commissionAmount
        ).toFixed(2) +

        "\nSeller 70%: ₹" +
        Number(
            sellerAmount
        ).toFixed(2)
    );
}


/* =====================================================
   END OF PART 1
===================================================== */
/* =====================================================
   GILL MARKET
   Part 2 / 2
===================================================== */


/* =====================================================
   SUBMIT ORDER
===================================================== */

function setupOrderSubmit() {

    const submitOrder =
        $("submitOrder");


    if (!submitOrder) {

        console.warn(
            "submitOrder button not found."
        );

        return;
    }


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


            /* ---------- Validation ---------- */

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


            /* ---------- Prevent Double Click ---------- */

            if (submitOrder.disabled) {
                return;
            }


            submitOrder.disabled = true;

            const oldText =
                submitOrder.textContent;


            submitOrder.textContent =
                "Submitting...";


            try {

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


                const order =
                    createOrderObject(
                        orderId,
                        customerName,
                        customerEmail,
                        details
                    );


                /*
                -------------------------------------------------
                IMPORTANT

                First try Supabase.

                If Supabase fails, DO NOT show fake success.
                The user will see the real error.
                -------------------------------------------------
                */


                await saveOrderToSupabase(
                    order
                );


                /*
                Supabase success.
                Local backup is also saved.
                */

                saveOrderLocally(
                    order
                );


                showOrderSuccess(
                    orderId,
                    selectedService,
                    selectedPrice,
                    commissionAmount,
                    sellerAmount
                );


                closeModal(
                    "orderModal"
                );


                resetOrderForm();


            } catch (error) {

                console.error(
                    "ORDER SUBMISSION FAILED:",
                    error
                );


                let message =
                    "Order save nahi hua.";


                if (
                    error &&
                    error.message
                ) {

                    message +=
                        "\n\nSupabase error: " +
                        error.message;

                }


                if (
                    error &&
                    error.code
                ) {

                    message +=
                        "\nError code: " +
                        error.code;

                }


                message +=
                    "\n\nSupabase Dashboard → orders table check karein.";


                showMessage(
                    message
                );


            } finally {

                submitOrder.disabled =
                    false;

                submitOrder.textContent =
                    oldText;

            }

        }
    );
}


/* =====================================================
   SELLER SERVICE
===================================================== */

async function saveSellerServiceToSupabase(
    service
) {

    if (!supabaseClient) {

        throw new Error(
            "Supabase is not connected."
        );

    }


    const result =
        await supabaseClient
            .from("services")
            .insert([service])
            .select();


    if (result.error) {

        console.error(
            "Supabase service error:",
            result.error
        );

        throw result.error;
    }


    return result.data;
}


/* =====================================================
   SELLER SERVICE SUBMIT
===================================================== */

function setupSellerSubmit() {

    const submitSeller =
        $("submitSeller");


    if (!submitSeller) {
        return;
    }


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


            if (submitSeller.disabled) {
                return;
            }


            submitSeller.disabled =
                true;


            const oldText =
                submitSeller.textContent;


            submitSeller.textContent =
                "Submitting...";


            try {

                const sellerAmount =
                    Number(
                        (
                            sellerPrice -
                            (
                                sellerPrice *
                                COMMISSION /
                                100
                            )
                        ).toFixed(2)
                    );


                /*
                -------------------------------------------------
                Seller table data

                This will work if public.services table
                exists with matching columns.
                -------------------------------------------------
                */

                const service = {

                    service_id:
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

                    seller_amount:
                        sellerAmount,

                    status:
                        "pending",

                    created_at:
                        new Date().toISOString()

                };


                try {

                    await saveSellerServiceToSupabase(
                        service
                    );

                } catch (serviceError) {

                    /*
                    Seller table may not exist yet.
                    Keep seller submission locally so the
                    website itself doesn't break.
                    */

                    console.warn(
                        "Supabase services table unavailable:",
                        serviceError
                    );

                    saveData(
                        "gillMarketServices",
                        [
                            ...getData(
                                "gillMarketServices"
                            ),
                            service
                        ]
                    );

                }


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


                closeModal(
                    "sellerModal"
                );


                if ($("sellerName")) {
                    $("sellerName").value = "";
                }

                if ($("sellerService")) {
                    $("sellerService").value = "";
                }

                if ($("sellerPrice")) {
                    $("sellerPrice").value = "";
                }

                if ($("sellerDescription")) {
                    $("sellerDescription").value = "";
                }


            } finally {

                submitSeller.disabled =
                    false;

                submitSeller.textContent =
                    oldText;

            }

        }
    );
}


/* =====================================================
   PAYMENT INFO
===================================================== */

function openPaymentInfo(
    orderId,
    amount
) {

    const existing =
        $("gm-payment-modal");


    if (existing) {
        existing.remove();
    }


    const modal =
        document.createElement(
            "div"
        );


    modal.id =
        "gm-payment-modal";


    modal.className =
        "gm-payment-wrapper";


    modal.innerHTML = `

        <div class="gm-payment-backdrop"></div>

        <div class="gm-payment-box">

            <button
                type="button"
                class="gm-payment-close"
                aria-label="Close"
            >
                ×
            </button>

            <h2>Payment</h2>

            <p>
                Order ID:
                <strong>
                    ${escapeHTML(orderId)}
                </strong>
            </p>

            <p>
                Amount:
                <strong>
                    ₹${Number(amount).toFixed(2)}
                </strong>
            </p>

            <div class="gm-payment-note">

                <strong>
                    Payment gateway not connected yet.
                </strong>

                <p>
                    Abhi ye order/payment testing
                    ke liye hai. Real UPI payment
                    ke liye payment gateway alag se
                    connect karna hoga.
                </p>

            </div>

            <button
                type="button"
                class="gm-payment-done"
            >
                Close
            </button>

        </div>
    `;


    document.body.appendChild(
        modal
    );


    const close =
        modal.querySelector(
            ".gm-payment-close"
        );


    const done =
        modal.querySelector(
            ".gm-payment-done"
        );


    function removePaymentModal() {

        modal.remove();

        document.body.style.overflow =
            "";

    }


    close.addEventListener(
        "click",
        removePaymentModal
    );


    done.addEventListener(
        "click",
        removePaymentModal
    );


    modal
        .querySelector(
            ".gm-payment-backdrop"
        )
        .addEventListener(
            "click",
            removePaymentModal
        );


    document.body.style.overflow =
        "hidden";
}


/* =====================================================
   SEARCH SERVICES
===================================================== */

function setupSearch() {

    const search =
        document.querySelector(
            "#searchInput, #serviceSearch, input[type='search']"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        function () {

            const query =
                search.value
                    .trim()
                    .toLowerCase();


            document
                .querySelectorAll(
                    ".service-card"
                )
                .forEach(
                    function (card) {

                        const text =
                            card.textContent
                                .toLowerCase();


                        card.style.display =
                            !query ||
                            text.includes(
                                query
                            )
                                ? ""
                                : "none";

                    }
                );

        }
    );
}


/* =====================================================
   ADD SMALL PAYMENT CSS
===================================================== */

function addPaymentStyles() {

    if (
        $("gillmarket-payment-styles")
    ) {
        return;
    }


    const style =
        document.createElement(
            "style"
        );


    style.id =
        "gillmarket-payment-styles";


    style.textContent = `

        .gm-payment-wrapper {
            position: fixed;
            inset: 0;
            z-index: 99999;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        .gm-payment-backdrop {
            position: absolute;
            inset: 0;
            background: rgba(0,0,0,.65);
        }

        .gm-payment-box {
            position: relative;
            z-index: 2;
            width: min(480px, 100%);
            background: #ffffff;
            color: #111827;
            border-radius: 20px;
            padding: 25px;
            box-sizing: border-box;
            box-shadow:
                0 25px 80px
                rgba(0,0,0,.35);
        }

        .gm-payment-box h2 {
            margin-top: 0;
        }

        .gm-payment-close {
            position: absolute;
            top: 10px;
            right: 12px;
            width: 36px;
            height: 36px;
            border: 0;
            border-radius: 50%;
            background: #f3f4f6;
            font-size: 25px;
            cursor: pointer;
        }

        .gm-payment-note {
            margin-top: 18px;
            padding: 15px;
            border-radius: 12px;
            background: #f3f4f6;
        }

        .gm-payment-done {
            width: 100%;
            margin-top: 18px;
            border: 0;
            border-radius: 10px;
            padding: 13px;
            background: #2563eb;
            color: white;
            font-weight: 700;
            cursor: pointer;
        }

        #submitOrder:disabled,
        #submitSeller:disabled {
            opacity: .6;
            cursor: wait;
        }

    `;


    document.head.appendChild(
        style
    );
}


/* =====================================================
   HEALTH CHECK
===================================================== */

async function checkSupabaseConnection() {

    if (!supabaseClient) {

        console.warn(
            "GillMarket: Supabase client not ready."
        );

        return false;
    }


    try {

        /*
        This only checks that the API client
        can communicate with Supabase.

        It does not require a database row.
        */

        const result =
            await supabaseClient
                .from("orders")
                .select("id")
                .limit(1);


        if (result.error) {

            console.error(
                "Supabase health check:",
                result.error
            );

            return false;
        }


        console.log(
            "GillMarket: orders table connected."
        );

        return true;

    } catch (error) {

        console.error(
            "Supabase health check failed:",
            error
        );

        return false;
    }
}


/* =====================================================
   START GILL MARKET
===================================================== */

async function startGillMarket() {

    console.log(
        "GillMarket starting..."
    );


    addPaymentStyles();


    setupMobileMenu();

    setupFindService();

    setupLogin();

    setupSellerButtons();

    setupModalClosing();

    setupOrderButtons();

    setupOrderSubmit();

    setupSellerSubmit();

    setupSearch();


    const connected =
        await initSupabase();


    if (connected) {

        console.log(
            "✅ GillMarket Supabase connected."
        );


        await checkSupabaseConnection();

    } else {

        console.error(
            "❌ GillMarket Supabase connection failed."
        );

    }


    console.log(
        "GillMarket loaded successfully."
    );


    console.log(
        "Local orders:",
        getData(
            "gillMarketOrders"
        )
    );


    console.log(
        "Local services:",
        getData(
            "gillMarketServices"
        )
    );
}


/* =====================================================
   PUBLIC API
===================================================== */

window.GillMarket = {

    openSellerModal,

    openPaymentInfo,

    closeModal,

    startGillMarket,

    getLocalOrders:
        function () {
            return getData(
                "gillMarketOrders"
            );
        },

    getLocalServices:
        function () {
            return getData(
                "gillMarketServices"
            );
        }

};


/* =====================================================
   START
===================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        startGillMarket
    );

} else {

    startGillMarket();

}


/* =====================================================
   END OF MARKET.JS
============================
"use strict";

/*
========================================================
 GILLMARKET - FINAL MARKET.JS
 Part 1 / 2

 Connected with:
 index.html
 index.css
 Supabase

 IMPORTANT:
 This file is in the ROOT of the repository.
========================================================
*/


/* ======================================================
   SUPABASE CONFIG
====================================================== */

const GILLMARKET_SUPABASE_URL =
    "https://sbdadnfeutymqoelaydo.supabase.co";

const GILLMARKET_SUPABASE_KEY =
    "sb_publishable_iMewXbi3FBgyRzCZBorsGg_ibGLrrAe";


/* ======================================================
   GLOBAL VARIABLES
====================================================== */

let gillSupabase = null;

let selectedService = "";

let selectedPrice = 0;

const GILLMARKET_COMMISSION = 30;


/* ======================================================
   SHORT ID HELPER
====================================================== */

function gm(id) {
    return document.getElementById(id);
}


/* ======================================================
   HTML ESCAPE
====================================================== */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ======================================================
   LOAD SUPABASE LIBRARY
====================================================== */

function loadSupabase() {

    return new Promise(function(resolve, reject) {

        if (
            window.supabase &&
            typeof window.supabase.createClient ===
                "function"
        ) {
            resolve();
            return;
        }


        const existing =
            document.querySelector(
                'script[data-gillmarket-supabase="1"]'
            );


        if (existing) {

            existing.addEventListener(
                "load",
                function() {
                    resolve();
                },
                { once: true }
            );


            existing.addEventListener(
                "error",
                function() {
                    reject(
                        new Error(
                            "Supabase library load failed."
                        )
                    );
                },
                { once: true }
            );

            return;
        }


        const script =
            document.createElement("script");


        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";


        script.async = true;


        script.dataset.gillmarketSupabase = "1";


        script.onload = function() {

            if (
                window.supabase &&
                typeof window.supabase.createClient ===
                    "function"
            ) {
                resolve();
            } else {
                reject(
                    new Error(
                        "Supabase client not available."
                    )
                );
            }

        };


        script.onerror = function() {

            reject(
                new Error(
                    "Could not load Supabase."
                )
            );

        };


        document.head.appendChild(script);

    });
}


/* ======================================================
   INITIALIZE SUPABASE
====================================================== */

async function initializeGillMarket() {

    try {

        await loadSupabase();


        gillSupabase =
            window.supabase.createClient(
                GILLMARKET_SUPABASE_URL,
                GILLMARKET_SUPABASE_KEY
            );


        console.log(
            "✅ GillMarket: Supabase connected."
        );


        return true;

    } catch (error) {

        console.error(
            "❌ GillMarket: Supabase connection failed:",
            error
        );


        gillSupabase = null;


        return false;
    }
}


/* ======================================================
   MOBILE MENU
====================================================== */

function setupMenu() {

    const menuBtn =
        gm("menuBtn");

    const nav =
        gm("nav");


    if (!menuBtn || !nav) {
        return;
    }


    menuBtn.addEventListener(
        "click",
        function() {

            nav.classList.toggle(
                "open"
            );

        }
    );


    nav.querySelectorAll("a")
        .forEach(function(link) {

            link.addEventListener(
                "click",
                function() {

                    nav.classList.remove(
                        "open"
                    );

                }
            );

        });
}


/* ======================================================
   FIND SERVICE BUTTON
====================================================== */

function setupFindService() {

    const button =
        gm("findBtn");


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function() {

            const services =
                gm("services");


            if (services) {

                services.scrollIntoView({
                    behavior: "smooth",
                    block: "start"
                });

            }

        }
    );
}


/* ======================================================
   LOGIN
====================================================== */

function setupLogin() {

    const loginBtn =
        gm("loginBtn");

    const continueBtn =
        gm("continueBtn");


    if (loginBtn) {

        loginBtn.addEventListener(
            "click",
            function() {

                const savedName =
                    localStorage.getItem(
                        "gillMarketName"
                    ) || "";


                const savedEmail =
                    localStorage.getItem(
                        "gillMarketEmail"
                    ) || "";


                if (gm("loginName")) {
                    gm("loginName").value =
                        savedName;
                }


                if (gm("loginEmail")) {
                    gm("loginEmail").value =
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
            function() {

                const name =
                    gm("loginName")
                        ?.value
                        .trim() || "";


                const email =
                    gm("loginEmail")
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


                closeModal(
                    "loginModal"
                );


                showMessage(
                    "Welcome to GillMarket, " +
                    name +
                    "! 🎉"
                );

            }
        );

    }
}


/* ======================================================
   SELLER BUTTONS
====================================================== */

function setupSellerButtons() {

    const sellBtn =
        gm("sellBtn");

    const sellHeroBtn =
        gm("sellHeroBtn");


    if (sellBtn) {

        sellBtn.addEventListener(
            "click",
            function() {

                openModal(
                    "sellerModal"
                );

            }
        );

    }


    if (sellHeroBtn) {

        sellHeroBtn.addEventListener(
            "click",
            function() {

                openModal(
                    "sellerModal"
                );

            }
        );

    }
}


/* ======================================================
   MODALS
====================================================== */

function openModal(id) {

    const modal =
        gm(id);


    if (!modal) {
        return;
    }


    modal.classList.add(
        "show"
    );


    document.body.style.overflow =
        "hidden";
}


function closeModal(id) {

    const modal =
        gm(id);


    if (!modal) {
        return;
    }


    modal.classList.remove(
        "show"
    );


    if (
        !document.querySelector(
            ".modal.show"
        )
    ) {

        document.body.style.overflow =
            "";

    }
}


/* ======================================================
   MODAL CLOSE CONTROLS
====================================================== */

function setupModalControls() {

    document
        .querySelectorAll(
            "[data-close]"
        )
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

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
        .forEach(function(modal) {

            modal.addEventListener(
                "click",
                function(event) {

                    if (
                        event.target ===
                        modal
                    ) {

                        modal.classList.remove(
                            "show"
                        );


                        document.body.style.overflow =
                            "";

                    }

                }
            );

        });


    document.addEventListener(
        "keydown",
        function(event) {

            if (
                event.key ===
                "Escape"
            ) {

                document
                    .querySelectorAll(
                        ".modal.show"
                    )
                    .forEach(function(modal) {

                        modal.classList.remove(
                            "show"
                        );

                    });


                document.body.style.overflow =
                    "";

            }

        }
    );
}


/* ======================================================
   SERVICE ORDER BUTTONS
====================================================== */

function setupOrderButtons() {

    document
        .querySelectorAll(
            ".order-btn"
        )
        .forEach(function(button) {

            button.addEventListener(
                "click",
                function() {

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
                            "Service information is missing."
                        );

                        return;
                    }


                    const commission =
                        (
                            selectedPrice *
                            GILLMARKET_COMMISSION /
                            100
                        ).toFixed(2);


                    const sellerAmount =
                        (
                            selectedPrice -
                            Number(commission)
                        ).toFixed(2);


                    const summary =
                        gm("summary");


                    if (summary) {

                        summary.innerHTML =

                            "<strong>" +
                            escapeHTML(
                                selectedService
                            ) +
                            "</strong><br><br>" +

                            "Order Price: ₹" +
                            selectedPrice.toFixed(2) +

                            "<br>GillMarket 30%: ₹" +
                            commission +

                            "<br>Seller 70%: ₹" +
                            sellerAmount;

                    }


                    const savedName =
                        localStorage.getItem(
                            "gillMarketName"
                        ) || "";


                    const savedEmail =
                        localStorage.getItem(
                            "gillMarketEmail"
                        ) || "";


                    if (gm("customerName")) {

                        gm("customerName").value =
                            savedName;

                    }


                    if (gm("customerEmail")) {

                        gm("customerEmail").value =
                            savedEmail;

                    }


                    openModal(
                        "orderModal"
                    );

                }
            );

        });
}


/* ======================================================
   SEARCH
====================================================== */

function setupSearch() {

    const search =
        gm("searchInput");


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        function() {

            const query =
                search.value
                    .trim()
                    .toLowerCase();


            document
                .querySelectorAll(
                    ".service-card"
                )
                .forEach(function(card) {

                    const text =
                        card.textContent
                            .toLowerCase();


                    if (
                        !query ||
                        text.includes(query)
                    ) {

                        card.style.display =
                            "";

                    } else {

                        card.style.display =
                            "none";

                    }

                });

        }
    );
}


/* ======================================================
   MESSAGE
====================================================== */

function showMessage(message) {

    alert(
        String(message)
    );
}


/* ======================================================
   GENERATE ORDER ID
====================================================== */

function generateOrderId() {

    const now =
        Date.now();


    const random =
        Math.floor(
            1000 +
            Math.random() *
            9000
        );


    return (
        "GM-" +
        now +
        "-" +
        random
    );
}


/* ======================================================
   RESET ORDER FORM
====================================================== */

function resetOrderForm() {

    if (gm("customerName")) {
        gm("customerName").value = "";
    }


    if (gm("customerEmail")) {
        gm("customerEmail").value = "";
    }


    if (gm("details")) {
        gm("details").value = "";
    }


    selectedService = "";

    selectedPrice = 0;
}


/* ======================================================
   LOCAL BACKUP
====================================================== */

function saveLocalOrder(order) {

    try {

        const existing =
            JSON.parse(
                localStorage.getItem(
                    "gillMarketOrders"
                ) || "[]"
            );


        existing.push(
            order
        );


        localStorage.setItem(
            "gillMarketOrders",
            JSON.stringify(
                existing
            )
        );

    } catch (error) {

        console.warn(
            "Local backup failed:",
            error
        );

    }
}


/* ======================================================
   ORDER DATA
====================================================== */

function createOrderData(
    name,
    email,
    details
) {

    const orderId =
        generateOrderId();


    const commission =
        Number(
            (
                selectedPrice *
                GILLMARKET_COMMISSION /
                100
            ).toFixed(2)
        );


    const sellerAmount =
        Number(
            (
                selectedPrice -
                commission
            ).toFixed(2)
        );


    /*
    IMPORTANT:

    The current Supabase table shown in your
    dashboard definitely contains:

    id
    customer_name
    customer_email
    details

    Therefore the actual database insert will
    use these safe columns.

    Service/price/order information is included
    inside details so the insert doesn't fail
    because of missing database columns.
    */


    const completeDetails =

        "GillMarket Order ID: " +
        orderId +

        "\nService: " +
        selectedService +

        "\nOrder Price: ₹" +
        selectedPrice.toFixed(2) +

        "\nGillMarket Commission (30%): ₹" +
        commission.toFixed(2) +

        "\nSeller Amount (70%): ₹" +
        sellerAmount.toFixed(2) +

        "\n\nCustomer Request:\n" +
        details;


    return {

        orderId:
            orderId,

        customer_name:
            name,

        customer_email:
            email,

        details:
            completeDetails,

        price:
            selectedPrice,

        commission:
            commission,

        sellerAmount:
            sellerAmount

    };
}


/* ======================================================
   SUPABASE ORDER INSERT
====================================================== */

async function insertOrder(order) {

    if (!gillSupabase) {

        throw new Error(
            "Supabase is not connected."
        );

    }


    /*
    Only columns that are confirmed to exist
    in your current orders table are inserted.
    */


    const result =
        await gillSupabase
            .from("orders")
            .insert([
                {
                    customer_name:
                        order.customer_name,

                    customer_email:
                        order.customer_email,

                    details:
                        order.details
                }
            ]);


    if (result.error) {

        console.error(
            "Supabase INSERT ERROR:",
            result.error
        );


        throw result.error;
    }


    return true;
}


/* ======================================================
   END PART 1
====================================================== */
/* ======================================================
   GILLMARKET - FINAL MARKET.JS
   Part 2 / 2
====================================================== */


/* ======================================================
   PLACE ORDER
====================================================== */

function setupPlaceOrder() {

    const submitOrder =
        gm("submitOrder");


    if (!submitOrder) {

        console.error(
            "submitOrder button not found."
        );

        return;
    }


    submitOrder.addEventListener(
        "click",
        async function() {

            /* ------------------------------------------
               GET FORM DATA
            ------------------------------------------ */

            const name =
                gm("customerName")
                    ?.value
                    .trim() || "";


            const email =
                gm("customerEmail")
                    ?.value
                    .trim() || "";


            const details =
                gm("details")
                    ?.value
                    .trim() || "";


            /* ------------------------------------------
               VALIDATION
            ------------------------------------------ */

            if (!selectedService) {

                showMessage(
                    "Please select a service first."
                );

                return;
            }


            if (
                !selectedPrice ||
                selectedPrice <= 0
            ) {

                showMessage(
                    "Invalid service price."
                );

                return;
            }


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


            if (!details) {

                showMessage(
                    "Please describe what you need."
                );

                return;
            }


            /* ------------------------------------------
               PREVENT DOUBLE CLICK
            ------------------------------------------ */

            if (
                submitOrder.disabled
            ) {

                return;
            }


            submitOrder.disabled =
                true;


            const oldText =
                submitOrder.textContent;


            submitOrder.textContent =
                "Submitting...";


            try {

                /* --------------------------------------
                   CREATE ORDER
                -------------------------------------- */

                const order =
                    createOrderData(
                        name,
                        email,
                        details
                    );


                console.log(
                    "GillMarket order:",
                    order
                );


                /* --------------------------------------
                   SUPABASE MUST BE CONNECTED
                -------------------------------------- */

                if (!gillSupabase) {

                    const connected =
                        await initializeGillMarket();


                    if (!connected) {

                        throw new Error(
                            "Supabase connection failed."
                        );

                    }

                }


                /* --------------------------------------
                   INSERT INTO SUPABASE
                -------------------------------------- */

                await insertOrder(
                    order
                );


                /* --------------------------------------
                   LOCAL BACKUP
                -------------------------------------- */

                saveLocalOrder(
                    order
                );


                /* --------------------------------------
                   SUCCESS
                -------------------------------------- */

                showMessage(

                    "✅ Order Successful!" +

                    "\n\n" +

                    "Order ID: " +
                    order.orderId +

                    "\nService: " +
                    selectedService +

                    "\nPrice: ₹" +
                    selectedPrice.toFixed(2) +

                    "\n\nYour order has been saved."
                );


                /* --------------------------------------
                   CLOSE MODAL
                -------------------------------------- */

                closeModal(
                    "orderModal"
                );


                /* --------------------------------------
                   RESET
                -------------------------------------- */

                resetOrderForm();


            } catch (error) {

                console.error(
                    "GillMarket order error:",
                    error
                );


                let errorText =
                    "❌ Order save nahi hua.";


                if (
                    error &&
                    error.message
                ) {

                    errorText +=
                        "\n\n" +
                        error.message;

                }


                if (
                    error &&
                    error.code
                ) {

                    errorText +=
                        "\nCode: " +
                        error.code;

                }


                showMessage(
                    errorText
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


/* ======================================================
   SELLER SERVICE
====================================================== */

function setupSellerSubmit() {

    const submitSeller =
        gm("submitSeller");


    if (!submitSeller) {
        return;
    }


    submitSeller.addEventListener(
        "click",
        async function() {

            const name =
                gm("sellerName")
                    ?.value
                    .trim() || "";


            const service =
                gm("sellerService")
                    ?.value
                    .trim() || "";


            const price =
                Number(
                    gm("sellerPrice")
                        ?.value || 0
                );


            const description =
                gm("sellerDescription")
                    ?.value
                    .trim() || "";


            /* ------------------------------------------
               VALIDATION
            ------------------------------------------ */

            if (!name) {

                showMessage(
                    "Please enter your name."
                );

                return;
            }


            if (!service) {

                showMessage(
                    "Please enter your service name."
                );

                return;
            }


            if (
                !price ||
                price <= 0
            ) {

                showMessage(
                    "Please enter a valid price."
                );

                return;
            }


            if (!description) {

                showMessage(
                    "Please describe your service."
                );

                return;
            }


            if (
                submitSeller.disabled
            ) {

                return;
            }


            submitSeller.disabled =
                true;


            const oldText =
                submitSeller.textContent;


            submitSeller.textContent =
                "Submitting...";


            try {

                const commission =
                    Number(
                        (
                            price *
                            GILLMARKET_COMMISSION /
                            100
                        ).toFixed(2)
                    );


                const sellerAmount =
                    Number(
                        (
                            price -
                            commission
                        ).toFixed(2)
                    );


                const serviceData = {

                    seller_name:
                        name,

                    service_name:
                        service,

                    price:
                        price,

                    description:
                        description,

                    commission:
                        commission,

                    seller_amount:
                        sellerAmount,

                    created_at:
                        new Date().toISOString()

                };


                /* --------------------------------------
                   LOCAL SAVE
                -------------------------------------- */

                try {

                    const existing =
                        JSON.parse(
                            localStorage.getItem(
                                "gillMarketServices"
                            ) || "[]"
                        );


                    existing.push(
                        serviceData
                    );


                    localStorage.setItem(
                        "gillMarketServices",
                        JSON.stringify(
                            existing
                        )
                    );

                } catch (localError) {

                    console.warn(
                        "Seller local save failed:",
                        localError
                    );

                }


                /* --------------------------------------
                   SUCCESS
                -------------------------------------- */

                showMessage(

                    "✅ Service submitted successfully!" +

                    "\n\nService: " +
                    service +

                    "\nStarting Price: ₹" +
                    price +

                    "\n\nGillMarket Commission: 30%" +

                    "\nSeller Amount: ₹" +
                    sellerAmount

                );


                closeModal(
                    "sellerModal"
                );


                /* --------------------------------------
                   RESET SELLER FORM
                -------------------------------------- */

                if (gm("sellerName")) {
                    gm("sellerName").value =
                        "";
                }


                if (gm("sellerService")) {
                    gm("sellerService").value =
                        "";
                }


                if (gm("sellerPrice")) {
                    gm("sellerPrice").value =
                        "";
                }


                if (gm("sellerDescription")) {
                    gm("sellerDescription").value =
                        "";
                }


            } catch (error) {

                console.error(
                    "Seller submission error:",
                    error
                );


                showMessage(
                    "❌ Service submit nahi hua."
                );

            } finally {

                submitSeller.disabled =
                    false;


                submitSeller.textContent =
                    oldText;

            }

        }
    );
}


/* ======================================================
   LOGIN DATA FOR ORDER FORM
====================================================== */

function loadSavedUser() {

    const name =
        localStorage.getItem(
            "gillMarketName"
        ) || "";


    const email =
        localStorage.getItem(
            "gillMarketEmail"
        ) || "";


    if (
        gm("customerName") &&
        name
    ) {

        gm("customerName").value =
            name;

    }


    if (
        gm("customerEmail") &&
        email
    ) {

        gm("customerEmail").value =
            email;

    }
}


/* ======================================================
   SUPABASE TEST
====================================================== */

async function testGillMarketDatabase() {

    if (!gillSupabase) {

        console.warn(
            "Supabase client is not ready."
        );

        return false;
    }


    try {

        const result =
            await gillSupabase
                .from("orders")
                .select("id")
                .limit(1);


        if (result.error) {

            console.error(
                "Supabase database test failed:",
                result.error
            );

            return false;
        }


        console.log(
            "✅ Supabase orders table is reachable."
        );


        return true;

    } catch (error) {

        console.error(
            "Database test error:",
            error
        );


        return false;
    }
}


/* ======================================================
   INITIALIZE ALL GILLMARKET FEATURES
====================================================== */

async function startGillMarket() {

    console.log(
        "🚀 GillMarket starting..."
    );


    /* ------------------------------------------
       UI
    ------------------------------------------ */

    setupMenu();

    setupFindService();

    setupLogin();

    setupSellerButtons();

    setupModalControls();

    setupOrderButtons();

    setupPlaceOrder();

    setupSellerSubmit();

    setupSearch();

    loadSavedUser();


    /* ------------------------------------------
       SUPABASE
    ------------------------------------------ */

    const connected =
        await initializeGillMarket();


    if (connected) {

        await testGillMarketDatabase();

    } else {

        console.error(
            "❌ GillMarket started without Supabase."
        );

    }


    console.log(
        "✅ GillMarket is ready."
    );
}


/* ======================================================
   GLOBAL GILLMARKET API
====================================================== */

window.GillMarket = {

    openModal:
        openModal,

    closeModal:
        closeModal,

    start:
        startGillMarket,

    getSelectedService:
        function() {
            return selectedService;
        },

    getSelectedPrice:
        function() {
            return selectedPrice;
        },

    getLocalOrders:
        function() {

            try {

                return JSON.parse(
                    localStorage.getItem(
                        "gillMarketOrders"
                    ) || "[]"
                );

            } catch (error) {

                return [];

            }

        }

};


/* ======================================================
   START APPLICATION
====================================================== */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        function() {

            startGillMarket();

        },
        { once: true }
    );

} else {

    startGillMarket();

}


/* ======================================================
   END OF FINAL MARKET.JS
====================================================== */
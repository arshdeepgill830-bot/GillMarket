"use strict";

/* =====================================================
   GILLMARKET
   FINAL market.js
   PART 1 / 5
===================================================== */

/* =========================
   CONFIG
========================= */

const GILLMARKET_SUPABASE_URL =
    "https://sbdadnfeutymqoelaydo.supabase.co";

const GILLMARKET_SUPABASE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";sb_publishable_iMewXbi3FBgyRzCZBorsGg_ibGLrrAe

const GILLMARKET_RAZORPAY_KEY_ID =
    "YOUR_RAZORPAY_TEST_KEY_ID";rzp_live_6NEMkMwtW0VXWs

const GILLMARKET_CREATE_ORDER_API =
    "/api/create-order";

const GILLMARKET_VERIFY_PAYMENT_API =
    "/api/verify-payment";

const GILLMARKET_COMMISSION =
    30;


/* =========================
   GLOBAL VARIABLES
========================= */

let gillSupabase = null;

let selectedService = "";

let selectedPrice = 0;

let selectedServiceId = "";


/* =========================
   ELEMENT HELPER
========================= */

function gm(id) {

    return document.getElementById(id);

}


/* =========================
   SAFE HTML
========================= */

function escapeHTML(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");

}


/* =========================
   MESSAGE
========================= */

function showMessage(message) {

    alert(
        String(message)
    );

}


/* =========================
   COMMISSION
========================= */

function calculateCommission(amount) {

    const total =
        Number(amount) || 0;

    return Number(
        (
            total *
            GILLMARKET_COMMISSION /
            100
        ).toFixed(2)
    );

}


/* =========================
   SELLER AMOUNT
========================= */

function calculateSellerAmount(amount) {

    const total =
        Number(amount) || 0;

    return Number(
        (
            total -
            calculateCommission(total)
        ).toFixed(2)
    );

}


/*
   Example:

   ₹149 order
   Commission = ₹44.70
   Seller = ₹104.30
*/


/* =========================
   SAFE JSON RESPONSE
========================= */

async function readJSONResponse(response) {

    const text =
        await response.text();

    let data = null;

    try {

        data =
            text
                ? JSON.parse(text)
                : null;

    } catch (error) {

        console.error(
            "Invalid JSON response:",
            text
        );

        throw new Error(
            "Server ने valid JSON नहीं भेजा."
        );

    }

    return data;

}


/* =========================
   SUPABASE LIBRARY
========================= */

function loadSupabase() {

    return new Promise(
        function(resolve, reject) {

            if (
                window.supabase &&
                typeof
                window.supabase.createClient ===
                "function"
            ) {

                resolve();

                return;

            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";


            script.onload =
                function() {

                    if (
                        window.supabase &&
                        typeof
                        window.supabase.createClient ===
                        "function"
                    ) {

                        resolve();

                    } else {

                        reject(
                            new Error(
                                "Supabase library नहीं मिली."
                            )
                        );

                    }

                };


            script.onerror =
                function() {

                    reject(
                        new Error(
                            "Supabase library load नहीं हुई."
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


/* =========================
   INITIALIZE SUPABASE
========================= */

async function initializeGillMarket() {

    try {

        await loadSupabase();


        if (
            !GILLMARKET_SUPABASE_KEY ||
            GILLMARKET_SUPABASE_KEY ===
            "YOUR_SUPABASE_PUBLISHABLE_KEY"
        ) {

            throw new Error(
                "market.js में Supabase Publishable/anon key डालें."
            );

        }


        gillSupabase =
            window.supabase.createClient(
                GILLMARKET_SUPABASE_URL,
                GILLMARKET_SUPABASE_KEY
            );


        console.log(
            "✅ GillMarket Supabase connected"
        );


        return true;


    } catch (error) {

        console.error(
            "❌ Supabase error:",
            error
        );


        gillSupabase = null;


        return false;

    }

}


/* =========================
   RAZORPAY LIBRARY
========================= */

function loadRazorpay() {

    return new Promise(
        function(resolve, reject) {

            if (
                window.Razorpay
            ) {

                resolve();

                return;

            }


            const script =
                document.createElement(
                    "script"
                );


            script.src =
                "https://checkout.razorpay.com/v1/checkout.js";


            script.onload =
                function() {

                    if (
                        window.Razorpay
                    ) {

                        resolve();

                    } else {

                        reject(
                            new Error(
                                "Razorpay load नहीं हुआ."
                            )
                        );

                    }

                };


            script.onerror =
                function() {

                    reject(
                        new Error(
                            "Razorpay script load failed."
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


/* =========================
   GLOBAL EXPORTS
========================= */

window.gm =
    gm;

window.showMessage =
    showMessage;

window.calculateCommission =
    calculateCommission;

window.calculateSellerAmount =
    calculateSellerAmount;

window.initializeGillMarket =
    initializeGillMarket;

window.loadRazorpay =
    loadRazorpay;

window.readJSONResponse =
    readJSONResponse;


/* =========================
   PART 1 END
========================= */
/* =====================================================
   GILLMARKET
   FINAL market.js
   PART 2 / 5
   SERVICES + SEARCH + ORDER MODAL
===================================================== */


/* =========================
   SERVICES
========================= */

const GILLMARKET_SERVICES = [

    {
        id: "thumbnail",
        name: "Thumbnail Design",
        icon: "🎨",
        description:
            "Professional YouTube and social media thumbnails.",
        price: 99
    },

    {
        id: "video-editing",
        name: "Video Editing",
        icon: "🎬",
        description:
            "Reels, Shorts and YouTube video editing.",
        price: 199
    },

    {
        id: "social-media",
        name: "Social Media Design",
        icon: "📱",
        description:
            "Instagram posts, banners and social graphics.",
        price: 149
    },

    {
        id: "website",
        name: "Website Design",
        icon: "💻",
        description:
            "Modern websites for businesses and creators.",
        price: 499
    },

    {
        id: "ai-image",
        name: "AI Image Design",
        icon: "🤖",
        description:
            "AI posters, creative images and designs.",
        price: 99
    },

    {
        id: "content-writing",
        name: "Content Writing",
        icon: "✍️",
        description:
            "Scripts, captions and social media content.",
        price: 99
    }

];


/* =========================
   GET SERVICE
========================= */

function getGillMarketService(
    serviceId
) {

    return GILLMARKET_SERVICES.find(
        function(service) {

            return (
                service.id ===
                serviceId
            );

        }
    );

}


/* =========================
   RENDER SERVICES
========================= */

function renderGillMarketServices(
    services = GILLMARKET_SERVICES
) {

    const container =
        gm("services") ||
        gm("servicesGrid") ||
        gm("serviceGrid") ||
        gm("popularServices");


    if (!container) {

        console.warn(
            "Services container नहीं मिला."
        );

        return;

    }


    container.innerHTML = "";


    services.forEach(
        function(service) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "service-card";


            card.dataset.serviceId =
                service.id;


            card.innerHTML = `

                <div class="service-icon">
                    ${escapeHTML(service.icon)}
                </div>

                <h3>
                    ${escapeHTML(service.name)}
                </h3>

                <p>
                    ${escapeHTML(service.description)}
                </p>

                <div class="service-bottom">

                    <span class="service-price">
                        From ₹${service.price}
                    </span>

                    <button
                        type="button"
                        class="order-service-btn"
                        data-service-id="${escapeHTML(service.id)}"
                    >
                        Order
                    </button>

                </div>

            `;


            container.appendChild(
                card
            );

        }
    );


    attachServiceButtons();

}


/* =========================
   ORDER BUTTONS
========================= */

function attachServiceButtons() {

    const buttons =
        document.querySelectorAll(
            ".order-service-btn"
        );


    buttons.forEach(
        function(button) {

            /*
             * clone करके पुराने listener
             * duplicate होने से बचाते हैं.
             */

            const newButton =
                button.cloneNode(true);


            button.replaceWith(
                newButton
            );


            newButton.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();
                    event.stopPropagation();


                    openGillMarketOrder(
                        newButton.dataset.serviceId
                    );

                }
            );

        }
    );

}


/* =========================
   OPEN ORDER MODAL
========================= */

function openGillMarketOrder(
    serviceId
) {

    const service =
        getGillMarketService(
            serviceId
        );


    if (!service) {

        showMessage(
            "Service नहीं मिली."
        );

        return;

    }


    selectedServiceId =
        service.id;

    selectedService =
        service.name;

    selectedPrice =
        Number(service.price);


    const modal =
        gm("orderModal");


    if (modal) {

        modal.style.display =
            "flex";

        modal.classList.add(
            "active"
        );

    }


    const selectedName =
        gm("selectedServiceName");


    if (selectedName) {

        selectedName.textContent =
            service.name;

    }


    const selectedPriceElement =
        gm("selectedServicePrice");


    if (selectedPriceElement) {

        selectedPriceElement.textContent =
            `₹${service.price}`;

    }


    const amount =
        gm("orderAmount");


    if (amount) {

        amount.value =
            service.price;

        /*
         * Customer को amount बदलने नहीं देंगे.
         */
        amount.readOnly =
            true;

    }


    const details =
        gm("details") ||
        gm("orderDetails");


    if (details) {

        details.value = "";

    }


    const name =
        gm("customerName") ||
        gm("customer_name");


    if (name) {

        name.focus();

    }

}


/* =========================
   CLOSE ORDER
========================= */

function closeGillMarketOrder() {

    const modal =
        gm("orderModal");


    if (!modal) {

        return;

    }


    modal.classList.remove(
        "active"
    );


    modal.style.display =
        "none";

}


/* =========================
   SEARCH
========================= */

function searchGillMarket(
    searchText
) {

    const query =
        String(
            searchText || ""
        )
            .trim()
            .toLowerCase();


    if (!query) {

        renderGillMarketServices();

        return;

    }


    const filtered =
        GILLMARKET_SERVICES.filter(
            function(service) {

                return (

                    service.name
                        .toLowerCase()
                        .includes(query)

                    ||

                    service.description
                        .toLowerCase()
                        .includes(query)

                );

            }
        );


    renderGillMarketServices(
        filtered
    );

}


/* =========================
   SEARCH INPUT
========================= */

function attachGillMarketSearch() {

    const inputs =
        document.querySelectorAll(
            "#serviceSearch, #searchServices, .service-search"
        );


    inputs.forEach(
        function(input) {

            input.addEventListener(
                "input",
                function() {

                    searchGillMarket(
                        input.value
                    );

                }
            );

        }
    );

}


/* =========================
   GLOBAL
========================= */

window.getGillMarketService =
    getGillMarketService;

window.renderGillMarketServices =
    renderGillMarketServices;

window.openGillMarketOrder =
    openGillMarketOrder;

window.closeGillMarketOrder =
    closeGillMarketOrder;

window.searchGillMarket =
    searchGillMarket;

window.orderService =
    openGillMarketOrder;


/* =========================
   PART 2 END
========================= */
/* =====================================================
   GILLMARKET
   FINAL market.js
   PART 3 / 5
   CUSTOMER + SUPABASE ORDER
===================================================== */


/* =========================
   CUSTOMER DETAILS
========================= */

function getGillMarketCustomer() {

    const nameElement =
        gm("customerName") ||
        gm("customer_name");

    const emailElement =
        gm("customerEmail") ||
        gm("customer_email");


    const name =
        nameElement
            ? nameElement.value.trim()
            : "";


    const email =
        emailElement
            ? emailElement.value.trim()
            : "";


    return {

        name:
            name,

        email:
            email

    };

}


/* =========================
   WORK DETAILS
========================= */

function getGillMarketDetails() {

    const detailsElement =
        gm("details") ||
        gm("orderDetails");


    if (!detailsElement) {

        return "";

    }


    return detailsElement.value.trim();

}


/* =========================
   VALIDATE ORDER
========================= */

function validateGillMarketOrder() {

    if (!selectedServiceId) {

        showMessage(
            "पहले service चुनें."
        );

        return false;

    }


    if (
        !selectedPrice ||
        selectedPrice <= 0
    ) {

        showMessage(
            "Service price गलत है."
        );

        return false;

    }


    const customer =
        getGillMarketCustomer();


    if (!customer.name) {

        showMessage(
            "अपना नाम डालें."
        );

        return false;

    }


    if (!customer.email) {

        showMessage(
            "अपना email डालें."
        );

        return false;

    }


    if (
        !customer.email.includes("@")
    ) {

        showMessage(
            "सही email डालें."
        );

        return false;

    }


    const details =
        getGillMarketDetails();


    if (!details) {

        showMessage(
            "काम की details लिखें."
        );

        return false;

    }


    return true;

}


/* =========================
   BUILD ORDER
========================= */

function buildGillMarketOrder() {

    const customer =
        getGillMarketCustomer();


    const amount =
        Number(
            selectedPrice
        );


    const commission =
        calculateCommission(
            amount
        );


    const sellerAmount =
        calculateSellerAmount(
            amount
        );


    return {

        customer_name:
            customer.name,

        customer_email:
            customer.email,

        service_id:
            selectedServiceId,

        service_name:
            selectedService,

        details:
            getGillMarketDetails(),

        amount:
            amount,

        commission_percent:
            GILLMARKET_COMMISSION,

        commission_amount:
            commission,

        seller_amount:
            sellerAmount,

        status:
            "pending",

        payment_status:
            "pending"

    };

}


/* =========================
   CREATE ORDER
========================= */

async function createGillMarketOrder() {

    if (!gillSupabase) {

        const connected =
            await initializeGillMarket();


        if (!connected) {

            throw new Error(
                "Supabase connect नहीं हुआ."
            );

        }

    }


    const orderData =
        buildGillMarketOrder();


    const result =
        await gillSupabase
            .from("orders")
            .insert(
                orderData
            )
            .select()
            .single();


    if (result.error) {

        console.error(
            "❌ Supabase order error:",
            result.error
        );


        throw new Error(
            result.error.message
        );

    }


    return result.data;

}


/* =========================
   UPDATE ORDER
========================= */

async function updateGillMarketOrder(
    orderId,
    data
) {

    if (!gillSupabase) {

        const connected =
            await initializeGillMarket();


        if (!connected) {

            throw new Error(
                "Supabase connect नहीं हुआ."
            );

        }

    }


    const result =
        await gillSupabase
            .from("orders")
            .update(data)
            .eq(
                "id",
                orderId
            )
            .select()
            .single();


    if (result.error) {

        console.error(
            "❌ Supabase update error:",
            result.error
        );


        throw new Error(
            result.error.message
        );

    }


    return result.data;

}


/* =========================
   START ORDER
========================= */

async function startGillMarketOrder() {

    try {

        if (
            !validateGillMarketOrder()
        ) {

            return;

        }


        showMessage(
            "Order बनाया जा रहा है..."
        );


        const order =
            await createGillMarketOrder();


        if (
            !order ||
            !order.id
        ) {

            throw new Error(
                "Order ID नहीं मिली."
            );

        }


        console.log(
            "✅ Pending order:",
            order
        );


        /*
         * अब payment शुरू होगा.
         */

        await startGillMarketPayment(
            order
        );


    } catch (error) {

        console.error(
            "❌ Order error:",
            error
        );


        showMessage(
            error.message ||
            "Order बनाने में समस्या हुई."
        );

    }

}


/* =========================
   ORDER SUBMIT BUTTONS
========================= */

function attachGillMarketOrderButton() {

    const buttons =
        document.querySelectorAll(
            "#submitOrder, #placeOrderBtn, .place-order-btn"
        );


    buttons.forEach(
        function(button) {

            /*
             * पुराने listeners हटाने के लिए
             * button clone किया जा रहा है.
             */

            const newButton =
                button.cloneNode(true);


            button.replaceWith(
                newButton
            );


            newButton.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();
                    event.stopPropagation();


                    startGillMarketOrder();

                }
            );

        }
    );

}


/* =========================
   GLOBAL
========================= */

window.getGillMarketCustomer =
    getGillMarketCustomer;

window.getGillMarketDetails =
    getGillMarketDetails;

window.validateGillMarketOrder =
    validateGillMarketOrder;

window.buildGillMarketOrder =
    buildGillMarketOrder;

window.createGillMarketOrder =
    createGillMarketOrder;

window.updateGillMarketOrder =
    updateGillMarketOrder;

window.startGillMarketOrder =
    startGillMarketOrder;


/* =========================
   PART 3 END
========================= */
/* =====================================================
   GILLMARKET
   FINAL market.js
   PART 4 / 5
   RAZORPAY PAYMENT + VERIFY
===================================================== */


/* =========================
   START PAYMENT
========================= */

async function startGillMarketPayment(order) {

    try {

        await loadRazorpay();


        if (
            !GILLMARKET_RAZORPAY_KEY_ID ||
            GILLMARKET_RAZORPAY_KEY_ID ===
            "YOUR_RAZORPAY_TEST_KEY_ID"
        ) {

            throw new Error(
                "Razorpay Test Key ID अभी डालें."
            );

        }


        /*
         * Browser से amount नहीं भेजा जा रहा.
         * Backend Supabase order से amount लेगा.
         */

        const response =
            await fetch(
                GILLMARKET_CREATE_ORDER_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        order_id:
                            order.id

                    })

                }
            );


        const razorpayOrder =
            await readJSONResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                razorpayOrder?.message ||
                "Razorpay order create नहीं हुआ."
            );

        }


        if (
            !razorpayOrder ||
            !razorpayOrder.id
        ) {

            throw new Error(
                "Razorpay Order ID नहीं मिली."
            );

        }


        /* =========================
           RAZORPAY CHECKOUT
        ========================= */

        const options = {

            key:
                GILLMARKET_RAZORPAY_KEY_ID,

            amount:
                Number(
                    razorpayOrder.amount
                ),

            currency:
                razorpayOrder.currency ||
                "INR",

            name:
                "GillMarket",

            description:
                order.service_name,

            order_id:
                razorpayOrder.id,


            prefill: {

                name:
                    order.customer_name,

                email:
                    order.customer_email

            },


            notes: {

                gillmarket_order_id:
                    String(order.id)

            },


            theme: {

                color:
                    "#2563eb"

            },


            handler:
                async function(payment) {

                    await verifyGillMarketPayment(
                        order,
                        payment
                    );

                },


            modal: {

                ondismiss:
                    function() {

                        console.log(
                            "Payment popup बंद हुआ."
                        );

                    }

            }

        };


        const razorpay =
            new window.Razorpay(
                options
            );


        /* =========================
           PAYMENT FAILED
        ========================= */

        razorpay.on(
            "payment.failed",
            async function(response) {

                console.error(
                    "❌ Payment failed:",
                    response
                );


                try {

                    await updateGillMarketOrder(
                        order.id,
                        {

                            payment_status:
                                "failed",

                            status:
                                "payment_failed",

                            payment_error:
                                response.error?.description ||
                                "Payment failed"

                        }
                    );

                } catch (error) {

                    console.error(
                        "Failed status update error:",
                        error
                    );

                }


                showMessage(
                    "Payment failed. कृपया फिर से कोशिश करें."
                );

            }
        );


        razorpay.open();


    } catch (error) {

        console.error(
            "❌ Payment start error:",
            error
        );


        showMessage(
            error.message ||
            "Payment शुरू नहीं हो पाया."
        );

    }

}


/* =========================
   VERIFY PAYMENT
========================= */

async function verifyGillMarketPayment(
    order,
    payment
) {

    try {

        if (
            !payment ||
            !payment.razorpay_payment_id ||
            !payment.razorpay_order_id ||
            !payment.razorpay_signature
        ) {

            throw new Error(
                "Payment verification data अधूरा है."
            );

        }


        showMessage(
            "Payment verify किया जा रहा है..."
        );


        const response =
            await fetch(
                GILLMARKET_VERIFY_PAYMENT_API,
                {
                    method: "POST",

                    headers: {
                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        gillmarket_order_id:
                            order.id,

                        razorpay_order_id:
                            payment.razorpay_order_id,

                        razorpay_payment_id:
                            payment.razorpay_payment_id,

                        razorpay_signature:
                            payment.razorpay_signature

                    })

                }
            );


        const result =
            await readJSONResponse(
                response
            );


        if (!response.ok) {

            throw new Error(
                result?.message ||
                "Payment verification failed."
            );

        }


        if (
            result?.verified !== true
        ) {

            throw new Error(
                "Payment verify नहीं हुआ."
            );

        }


        /*
         * IMPORTANT:
         *
         * Razorpay signature server पर
         * verify होने के बाद ही
         * order को paid करेंगे.
         */


        const updatedOrder =
            await updateGillMarketOrder(
                order.id,
                {

                    payment_status:
                        "paid",

                    status:
                        "paid",

                    razorpay_order_id:
                        payment.razorpay_order_id,

                    razorpay_payment_id:
                        payment.razorpay_payment_id,

                    payment_verified:
                        true,

                    paid_at:
                        new Date().toISOString(),

                    commission_amount:
                        calculateCommission(
                            order.amount
                        ),

                    seller_amount:
                        calculateSellerAmount(
                            order.amount
                        )

                }
            );


        console.log(
            "✅ Payment verified:",
            updatedOrder
        );


        showMessage(
            "✅ Payment successful!\n\n" +
            "Order ID: " +
            order.id
        );


        closeGillMarketOrder();


    } catch (error) {

        console.error(
            "❌ Verification error:",
            error
        );


        /*
         * Verification fail होने पर
         * paid status नहीं लगाएँगे.
         */

        try {

            await updateGillMarketOrder(
                order.id,
                {

                    payment_status:
                        "verification_failed",

                    status:
                        "verification_failed"

                }
            );

        } catch (updateError) {

            console.error(
                "Order status update error:",
                updateError
            );

        }


        showMessage(
            error.message ||
            "Payment verification failed."
        );

    }

}


/* =========================
   GLOBAL
========================= */

window.startGillMarketPayment =
    startGillMarketPayment;

window.verifyGillMarketPayment =
    verifyGillMarketPayment;


/* =========================
   PART 4 END
========================= */
/* =====================================================
   GILLMARKET
   FINAL market.js
   PART 5 / 5
   BUTTONS + INITIALIZATION
===================================================== */


/* =========================
   MENU
========================= */

function setupMenu() {

    const menuButton =
        gm("menuBtn") ||
        gm("menuButton") ||
        document.querySelector(
            '[aria-label="Menu"]'
        );


    const menu =
        gm("mobileMenu") ||
        gm("menu") ||
        gm("navMenu");


    if (
        !menuButton ||
        !menu
    ) {

        console.warn(
            "Menu button या menu नहीं मिला."
        );

        return;

    }


    menuButton.addEventListener(
        "click",
        function(event) {

            event.preventDefault();
            event.stopPropagation();


            const open =
                menu.classList.contains(
                    "active"
                );


            if (open) {

                menu.classList.remove(
                    "active"
                );

                menu.style.display =
                    "none";

            } else {

                menu.classList.add(
                    "active"
                );

                menu.style.display =
                    "flex";

            }

        }
    );

}


/* =========================
   FIND SERVICE
========================= */

function setupFindService() {

    const buttons =
        document.querySelectorAll(
            "#findBtn, #findServiceBtn, .find-service-btn"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    const search =
                        gm("serviceSearch") ||
                        gm("searchServices");


                    if (search) {

                        search.scrollIntoView({
                            behavior:
                                "smooth",

                            block:
                                "center"

                        });


                        setTimeout(
                            function() {

                                search.focus();

                            },
                            400
                        );


                        return;

                    }


                    const services =
                        gm("services") ||
                        gm("servicesGrid") ||
                        gm("popularServices");


                    if (services) {

                        services.scrollIntoView({
                            behavior:
                                "smooth",

                            block:
                                "start"

                        });

                    }

                }
            );

        }
    );

}


/* =========================
   SELL SERVICE
========================= */

function setupSellerButtons() {

    const buttons =
        document.querySelectorAll(
            "#sellBtn, #sellHeroBtn, #startSellingBtn, .sell-service-btn, .start-selling-btn"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    const sellerModal =
                        gm("sellerModal") ||
                        gm("sellModal");


                    if (sellerModal) {

                        sellerModal.style.display =
                            "flex";

                        sellerModal.classList.add(
                            "active"
                        );

                        return;

                    }


                    const sellerSection =
                        gm("sellerSection") ||
                        gm("freelancerSection");


                    if (sellerSection) {

                        sellerSection.scrollIntoView({
                            behavior:
                                "smooth",

                            block:
                                "start"

                        });

                        return;

                    }


                    showMessage(
                        "Seller section जल्द उपलब्ध होगा."
                    );

                }
            );

        }
    );

}


/* =========================
   LOGIN
========================= */

function setupLogin() {

    const buttons =
        document.querySelectorAll(
            "#loginBtn, #loginButton, .login-btn"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    const loginModal =
                        gm("loginModal");


                    if (loginModal) {

                        loginModal.style.display =
                            "flex";

                        loginModal.classList.add(
                            "active"
                        );

                    } else {

                        showMessage(
                            "Login feature जल्द उपलब्ध होगा."
                        );

                    }

                }
            );

        }
    );

}


/* =========================
   MODAL CLOSE
========================= */

function setupModalControls() {

    const buttons =
        document.querySelectorAll(
            "#closeOrder, " +
            ".close-order, " +
            ".close-modal, " +
            ".modal-close, " +
            "[data-close-modal]"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();


                    const modal =
                        button.closest(
                            ".modal"
                        );


                    if (modal) {

                        modal.classList.remove(
                            "active"
                        );

                        modal.style.display =
                            "none";

                    } else {

                        closeGillMarketOrder();

                    }

                }
            );

        }
    );

}


/* =========================
   ESC KEY
========================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key ===
            "Escape"
        ) {

            closeGillMarketOrder();


            document
                .querySelectorAll(
                    ".modal.active"
                )
                .forEach(
                    function(modal) {

                        modal.classList.remove(
                            "active"
                        );

                        modal.style.display =
                            "none";

                    }
                );

        }

    }
);


/* =========================
   OUTSIDE MODAL CLICK
========================= */

document.addEventListener(
    "click",
    function(event) {

        const modal =
            gm("orderModal");


        if (
            modal &&
            event.target === modal
        ) {

            closeGillMarketOrder();

        }

    }
);


/* =========================
   ORDER BUTTON
========================= */

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                ".order-service-btn"
            );


        if (!button) {

            return;

        }


        event.preventDefault();
        event.stopPropagation();


        openGillMarketOrder(
            button.dataset.serviceId
        );

    }
);


/* =========================
   CONFIGURATION CHECK
========================= */

function checkGillMarketConfiguration() {

    const problems = [];


    if (
        !GILLMARKET_SUPABASE_URL
    ) {

        problems.push(
            "Supabase URL missing"
        );

    }


    if (
        !GILLMARKET_SUPABASE_KEY ||
        GILLMARKET_SUPABASE_KEY ===
        "YOUR_SUPABASE_PUBLISHABLE_KEY"
    ) {

        problems.push(
            "Supabase Publishable/anon key missing"
        );

    }


    if (
        !GILLMARKET_RAZORPAY_KEY_ID ||
        GILLMARKET_RAZORPAY_KEY_ID ===
        "YOUR_RAZORPAY_TEST_KEY_ID"
    ) {

        problems.push(
            "Razorpay Key ID missing"
        );

    }


    if (
        problems.length > 0
    ) {

        console.warn(
            "⚠️ GillMarket configuration:",
            problems
        );


        return false;

    }


    return true;

}


/* =========================
   DEBUG
========================= */

window.GillMarketDebug = {

    services:
        GILLMARKET_SERVICES,

    commission:
        GILLMARKET_COMMISSION,

    calculateCommission:
        calculateCommission,

    calculateSellerAmount:
        calculateSellerAmount,

    checkConfiguration:
        checkGillMarketConfiguration

};


/* =========================
   DOM READY
========================= */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "🚀 GillMarket loading..."
        );


        try {

            await initializeGillMarket();


            renderGillMarketServices();


            attachGillMarketSearch();


            attachGillMarketOrderButton();


            setupMenu();


            setupFindService();


            setupSellerButtons();


            setupLogin();


            setupModalControls();


            console.log(
                "✅ GillMarket ready!"
            );


        } catch (error) {

            console.error(
                "❌ GillMarket initialization error:",
                error
            );

        }

    }
);


/* =========================
   GLOBAL FUNCTIONS
========================= */

window.setupMenu =
    setupMenu;

window.setupFindService =
    setupFindService;

window.setupSellerButtons =
    setupSellerButtons;

window.setupLogin =
    setupLogin;

window.setupModalControls =
    setupModalControls;


/* =========================
   FINAL LOG
========================= */

console.log(
    "✅ GillMarket market.js loaded successfully."
);

console.log(
    "💰 Commission:",
    GILLMARKET_COMMISSION + "%"
);

console.log(
    "🛒 Order system: READY"
);

console.log(
    "💳 Razorpay system: READY"
);


/* =====================================================
   ALL 5 PARTS COMPLETE
===================================================== */
"use strict";

/* =====================================================
   GILLMARKET FINAL market.js
   PART 1 / 5
===================================================== */

const GILLMARKET_SUPABASE_URL =
    "https://sbdadnfeutymqoelaydo.supabase.co";

/*
  अपनी Supabase Publishable/anon key यहाँ रखें.
  Secret/service_role key यहाँ कभी नहीं डालनी.
*/
const GILLMARKET_SUPABASE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";

const GILLMARKET_RAZORPAY_KEY_ID =
    "YOUR_RAZORPAY_TEST_KEY_ID";

const GILLMARKET_CREATE_ORDER_API =
    "/api/create-order";

const GILLMARKET_VERIFY_PAYMENT_API =
    "/api/verify-payment";

const GILLMARKET_COMMISSION =
    30;

let gillSupabase = null;
let selectedService = "";
let selectedPrice = 0;
let selectedServiceId = "";


/* =========================
   HELPER
========================= */

function gm(id) {
    return document.getElementById(id);
}


function escapeHTML(value) {
    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


function showMessage(message) {
    alert(String(message));
}


function calculateCommission(amount) {
    return Number(
        (
            Number(amount) *
            GILLMARKET_COMMISSION /
            100
        ).toFixed(2)
    );
}


function calculateSellerAmount(amount) {
    const total = Number(amount) || 0;

    return Number(
        (
            total -
            calculateCommission(total)
        ).toFixed(2)
    );
}


/* =========================
   SUPABASE
========================= */

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

        const script =
            document.createElement("script");

        script.src =
            "https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2";

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
                        "Supabase library नहीं मिली."
                    )
                );
            }

        };

        script.onerror = function() {

            reject(
                new Error(
                    "Supabase library load नहीं हुई."
                )
            );

        };

        document.head.appendChild(script);

    });

}


async function initializeGillMarket() {

    try {

        await loadSupabase();

        if (
            !GILLMARKET_SUPABASE_KEY ||
            GILLMARKET_SUPABASE_KEY ===
            "YOUR_SUPABASE_PUBLISHABLE_KEY"
        ) {

            throw new Error(
                "Supabase Publishable/anon key डालें."
            );

        }

        gillSupabase =
            window.supabase.createClient(
                GILLMARKET_SUPABASE_URL,
                GILLMARKET_SUPABASE_KEY
            );

        console.log(
            "✅ GillMarket: Supabase connected"
        );

        return true;

    } catch (error) {

        console.error(
            "Supabase error:",
            error
        );

        gillSupabase = null;

        return false;

    }

}


/* =========================
   RAZORPAY
========================= */

function loadRazorpay() {

    return new Promise(function(resolve, reject) {

        if (window.Razorpay) {
            resolve();
            return;
        }

        const script =
            document.createElement("script");

        script.src =
            "https://checkout.razorpay.com/v1/checkout.js";

        script.onload = function() {

            if (window.Razorpay) {
                resolve();
            } else {
                reject(
                    new Error(
                        "Razorpay load नहीं हुआ."
                    )
                );
            }

        };

        script.onerror = function() {

            reject(
                new Error(
                    "Razorpay script load failed."
                )
            );

        };

        document.head.appendChild(script);

    });

}


/* =========================
   PART 1 END
========================= */
/* =====================================================
   GILLMARKET FINAL market.js
   PART 2 / 5
   SERVICES + SEARCH + ORDER FORM
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
   FIND SERVICE
========================= */

function getGillMarketService(serviceId) {

    return GILLMARKET_SERVICES.find(
        function(service) {
            return service.id === serviceId;
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
                document.createElement("div");

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

            container.appendChild(card);

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

            button.onclick =
                function() {

                    openGillMarketOrder(
                        button.dataset.serviceId
                    );

                };

        }
    );

}


/* =========================
   OPEN ORDER
========================= */

function openGillMarketOrder(
    serviceId
) {

    const service =
        getGillMarketService(serviceId);

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
        service.price;


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

    }


    const details =
        gm("details") ||
        gm("orderDetails");

    if (details) {

        details.value = "";

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
        String(searchText || "")
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
   GLOBAL FUNCTIONS
========================= */

window.openGillMarketOrder =
    openGillMarketOrder;

window.closeGillMarketOrder =
    closeGillMarketOrder;

window.orderService =
    openGillMarketOrder;


/* =========================
   PART 2 END
========================= */
/* =====================================================
   GILLMARKET FINAL market.js
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
        name: name,
        email: email
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
   ORDER DATA
========================= */

function buildGillMarketOrder() {

    const customer =
        getGillMarketCustomer();

    const commission =
        calculateCommission(
            selectedPrice
        );

    const sellerAmount =
        calculateSellerAmount(
            selectedPrice
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
            Number(selectedPrice),

        commission_percent:
            GILLMARKET_COMMISSION,

        commission_amount:
            commission,

        seller_amount:
            sellerAmount,

        status:
            "pending",

        payment_status:
            "pending",

        created_at:
            new Date().toISOString()

    };

}


/* =========================
   CREATE SUPABASE ORDER
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
            "Supabase order error:",
            result.error
        );

        throw new Error(
            result.error.message
        );

    }


    return result.data;

}


/* =========================
   UPDATE SUPABASE ORDER
========================= */

async function updateGillMarketOrder(
    orderId,
    data
) {

    if (!gillSupabase) {

        throw new Error(
            "Supabase connected नहीं है."
        );

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
            "Supabase update error:",
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
          Part 4 में इसी order.id
          को Razorpay payment से जोड़ा जाएगा.
        */


        await startGillMarketPayment(
            order
        );


    } catch (error) {

        console.error(
            "Order error:",
            error
        );


        showMessage(
            error.message ||
            "Order बनाने में समस्या हुई."
        );

    }

}


/* =========================
   SUBMIT BUTTON
========================= */

function attachGillMarketOrderButton() {

    const buttons =
        document.querySelectorAll(
            "#submitOrder, #placeOrderBtn, .place-order-btn"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function(event) {

                    event.preventDefault();

                    startGillMarketOrder();

                }
            );

        }
    );

}


/* =========================
   GLOBAL
========================= */

window.startGillMarketOrder =
    startGillMarketOrder;


/* =========================
   PART 3 END
========================= */
/* =====================================================
   GILLMARKET FINAL market.js
   PART 4 / 5
   RAZORPAY TEST PAYMENT
===================================================== */


/* =========================
   START RAZORPAY PAYMENT
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
                "Razorpay Test Key ID डालें."
            );

        }


        /*
         * IMPORTANT:
         * Amount server से बनेगा.
         * Browser पर amount बदलकर payment
         * manipulate नहीं किया जाएगा.
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
                        order_id: order.id
                    })
                }
            );


        if (!response.ok) {

            throw new Error(
                "Razorpay order create नहीं हुआ."
            );

        }


        const razorpayOrder =
            await response.json();


        if (
            !razorpayOrder ||
            !razorpayOrder.id
        ) {

            throw new Error(
                "Razorpay Order ID नहीं मिली."
            );

        }


        const options = {

            key:
                GILLMARKET_RAZORPAY_KEY_ID,

            amount:
                razorpayOrder.amount,

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
                            "Payment popup बंद किया गया."
                        );

                    }

            }

        };


        const razorpay =
            new Razorpay(options);


        razorpay.on(
            "payment.failed",
            function(response) {

                console.error(
                    "❌ Payment failed:",
                    response
                );


                updateGillMarketOrder(
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
                ).catch(
                    console.error
                );


                showMessage(
                    "Payment failed. कृपया फिर से कोशिश करें."
                );

            }
        );


        razorpay.open();


    } catch (error) {

        console.error(
            "Razorpay error:",
            error
        );


        /*
         * Order pending ही रहेगा.
         * Payment successful मानकर
         * यहाँ paid नहीं करेंगे.
         */

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
            await response.json();


        if (!response.ok) {

            throw new Error(
                result.message ||
                "Payment verification failed."
            );

        }


        /*
         * Server verification successful होने
         * के बाद ही database में paid मानेंगे.
         */

        if (
            result.verified !== true
        ) {

            throw new Error(
                "Payment verify नहीं हुआ."
            );

        }


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
         * paid नहीं करना है.
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
                "Order status update failed:",
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
   GILLMARKET FINAL market.js
   PART 5 / 5
   INITIALIZATION + EVENTS
===================================================== */


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

            /*
             * Supabase connection
             */
            await initializeGillMarket();


            /*
             * Services दिखाएँ
             */
            renderGillMarketServices();


            /*
             * Search चालू करें
             */
            attachGillMarketSearch();


            /*
             * Order button चालू करें
             */
            attachGillMarketOrderButton();


            /*
             * Close button
             */
            const closeButtons =
                document.querySelectorAll(
                    "#closeOrder, .close-order, .close-modal"
                );


            closeButtons.forEach(
                function(button) {

                    button.addEventListener(
                        "click",
                        function() {

                            closeGillMarketOrder();

                        }
                    );

                }
            );


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
   ESC KEY → CLOSE MODAL
========================= */

document.addEventListener(
    "keydown",
    function(event) {

        if (
            event.key === "Escape"
        ) {

            closeGillMarketOrder();

        }

    }
);


/* =========================
   CLICK OUTSIDE MODAL
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
   SERVICE CARD CLICK
========================= */

document.addEventListener(
    "click",
    function(event) {

        const button =
            event.target.closest(
                "[data-service-id]"
            );


        if (!button) {
            return;
        }


        /*
         * अगर Order button नहीं है,
         * तो card से भी order खोल सकते हैं.
         */

        if (
            button.classList.contains(
                "order-service-btn"
            )
        ) {

            return;

        }


        const serviceId =
            button.dataset.serviceId;


        if (serviceId) {

            openGillMarketOrder(
                serviceId
            );

        }

    }
);


/* =========================
   CHECK GILLMARKET CONFIG
========================= */

function checkGillMarketConfiguration() {

    const problems = [];


    if (
        typeof GILLMARKET_SUPABASE_URL ===
        "undefined"
    ) {

        problems.push(
            "Supabase URL missing"
        );

    }


    if (
        typeof GILLMARKET_SUPABASE_ANON_KEY ===
        "undefined"
    ) {

        problems.push(
            "Supabase anon key missing"
        );

    }


    if (
        typeof GILLMARKET_RAZORPAY_KEY_ID ===
        "undefined"
    ) {

        problems.push(
            "Razorpay Key ID missing"
        );

    }


    if (problems.length) {

        console.warn(
            "⚠️ GillMarket configuration:",
            problems
        );

        return false;

    }


    return true;

}


/* =========================
   DEBUG INFORMATION
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
   FINAL MESSAGE
========================= */

console.log(
    "✅ GillMarket market.js loaded successfully."
);

console.log(
    "💰 Commission:",
    GILLMARKET_COMMISSION + "%"
);


/* =====================================================
   GILLMARKET market.js
   ALL 5 PARTS COMPLETE
===================================================== */
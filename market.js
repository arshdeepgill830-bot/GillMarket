/* =====================================================
   GILLMARKET - market.js
   FINAL VERSION
   PART 1 / 5
===================================================== */


/* ================================
   CONFIG
================================ */

const GILLMARKET_CONFIG = {

    SUPABASE_URL:
        "YOUR_SUPABASE_URL",

    SUPABASE_ANON_KEY:
        "YOUR_SUPABASE_ANON_KEY",

    RAZORPAY_KEY_ID:
        "YOUR_RAZORPAY_TEST_KEY_ID",

    CREATE_ORDER_URL:
        "/api/create-order",

    VERIFY_PAYMENT_URL:
        "/api/verify-payment",

    COMMISSION_PERCENT:
        30

};


/* ================================
   GLOBAL VARIABLES
================================ */

let supabaseClient = null;

let selectedService = "";

let selectedPrice = 0;

let selectedServiceId = "";


/* ================================
   SHORT ID HELPER
================================ */

function gm(id) {

    return document.getElementById(id);

}


/* ================================
   SUPABASE INITIALIZATION
================================ */

async function initializeGillMarket() {

    try {

        if (
            typeof window.supabase ===
            "undefined"
        ) {

            console.warn(
                "Supabase library नहीं मिली."
            );

            return false;
        }


        if (
            GILLMARKET_CONFIG
                .SUPABASE_URL ===
            "YOUR_SUPABASE_URL"
        ) {

            console.warn(
                "Supabase URL configure नहीं है."
            );

            return false;
        }


        if (
            GILLMARKET_CONFIG
                .SUPABASE_ANON_KEY ===
            "YOUR_SUPABASE_ANON_KEY"
        ) {

            console.warn(
                "Supabase ANON key configure नहीं है."
            );

            return false;
        }


        supabaseClient =
            window.supabase.createClient(

                GILLMARKET_CONFIG
                    .SUPABASE_URL,

                GILLMARKET_CONFIG
                    .SUPABASE_ANON_KEY

            );


        console.log(
            "✅ Supabase connected."
        );


        return true;


    } catch (error) {

        console.error(
            "Supabase error:",
            error
        );

        return false;

    }

}


/* ================================
   RAZORPAY SCRIPT
================================ */

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

                    console.log(
                        "✅ Razorpay loaded."
                    );

                    resolve();

                };


            script.onerror =
                function() {

                    reject(
                        new Error(
                            "Razorpay load नहीं हुआ."
                        )
                    );

                };


            document.head.appendChild(
                script
            );

        }
    );

}


/* ================================
   COMMISSION
================================ */

function calculateCommission(
    amount
) {

    const price =
        Number(amount) || 0;


    return Number(

        (
            price *
            GILLMARKET_CONFIG
                .COMMISSION_PERCENT /
            100

        ).toFixed(2)

    );

}


/* ================================
   SELLER AMOUNT
================================ */

function calculateSellerAmount(
    amount
) {

    const price =
        Number(amount) || 0;


    const commission =
        calculateCommission(
            price
        );


    return Number(

        (
            price -
            commission

        ).toFixed(2)

    );

}


/* ================================
   ORDER BREAKDOWN
================================ */

function calculateOrderBreakdown(
    amount
) {

    const total =
        Number(amount) || 0;


    const commission =
        calculateCommission(
            total
        );


    const seller =
        calculateSellerAmount(
            total
        );


    return {

        total:
            total,

        commission:
            commission,

        seller:
            seller

    };

}


/*
   Example:

   ₹149
   30% = ₹44.70
   Seller = ₹104.30
*/


/* ================================
   HTML ESCAPE
================================ */

function escapeHTML(
    value
) {

    return String(
        value ?? ""
    )

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


/* ================================
   MESSAGE
================================ */

function showMessage(
    message
) {

    console.log(
        "GillMarket:",
        message
    );


    let box =
        gm("gmMessage");


    if (!box) {

        box =
            document.createElement(
                "div"
            );


        box.id =
            "gmMessage";


        box.style.position =
            "fixed";

        box.style.left =
            "50%";

        box.style.bottom =
            "20px";

        box.style.transform =
            "translateX(-50%)";

        box.style.zIndex =
            "99999";

        box.style.padding =
            "14px 18px";

        box.style.borderRadius =
            "12px";

        box.style.background =
            "#111827";

        box.style.color =
            "#ffffff";

        box.style.maxWidth =
            "90%";

        box.style.fontSize =
            "15px";


        document.body.appendChild(
            box
        );

    }


    box.textContent =
        message;


    box.style.display =
        "block";


    clearTimeout(
        box._timer
    );


    box._timer =
        setTimeout(
            function() {

                box.style.display =
                    "none";

            },
            4000
        );

}


/* ================================
   PART 1 END
================================ */
/* =====================================================
   GILLMARKET - market.js
   PART 2 / 5
   SERVICES + SEARCH + ORDER SELECTION
===================================================== */


/* ================================
   SERVICES DATA
================================ */

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


/* ================================
   GET SERVICE
================================ */

function getServiceById(
    serviceId
) {

    return GILLMARKET_SERVICES.find(
        function(service) {

            return service.id ===
                serviceId;

        }
    );

}


/* ================================
   RENDER SERVICES
================================ */

function renderGillMarketServices(
    services = GILLMARKET_SERVICES
) {

    const containers = [

        gm("services"),

        gm("servicesGrid"),

        gm("serviceGrid"),

        gm("popularServices")

    ];


    let container =
        containers.find(
            function(element) {

                return element !== null;

            }
        );


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


/* ================================
   SERVICE BUTTONS
================================ */

function attachServiceButtons() {

    const buttons =
        document.querySelectorAll(
            ".order-service-btn"
        );


    buttons.forEach(
        function(button) {

            button.addEventListener(
                "click",
                function() {

                    const serviceId =
                        button.dataset
                            .serviceId;


                    openOrderForm(
                        serviceId
                    );

                }
            );

        }
    );

}


/* ================================
   OPEN ORDER FORM
================================ */

function openOrderForm(
    serviceId
) {

    const service =
        getServiceById(
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


    const serviceName =
        gm("selectedServiceName");


    if (serviceName) {

        serviceName.textContent =
            service.name;

    }


    const price =
        gm("selectedServicePrice");


    if (price) {

        price.textContent =
            `₹${service.price}`;

    }


    const amountInput =
        gm("orderAmount");


    if (amountInput) {

        amountInput.value =
            service.price;

    }


    const details =
        gm("orderDetails");


    if (details) {

        details.value = "";

    }

}


/* ================================
   CLOSE ORDER FORM
================================ */

function closeOrderForm() {

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


/* ================================
   SEARCH SERVICES
================================ */

function searchGillMarketServices(
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


/* ================================
   SEARCH INPUT
================================ */

function attachSearch() {

    const inputs =
        document.querySelectorAll(
            "#serviceSearch, #searchServices, .service-search"
        );


    inputs.forEach(
        function(input) {

            input.addEventListener(
                "input",
                function() {

                    searchGillMarketServices(
                        input.value
                    );

                }
            );

        }
    );

}


/* ================================
   GLOBAL ORDER BUTTON
================================ */

window.orderService =
    function(serviceId) {

        openOrderForm(
            serviceId
        );

    };


/* ================================
   GLOBAL CLOSE BUTTON
================================ */

window.closeOrderForm =
    closeOrderForm;


/* ================================
   INITIAL SERVICE LOAD
================================ */

function initializeServices() {

    renderGillMarketServices();

    attachSearch();

}


/* ================================
   PART 2 END
================================ */
/* =====================================================
   GILLMARKET - market.js
   PART 3 / 5
   ORDER FORM + SUPABASE ORDER CREATION
===================================================== */


/* ================================
   GET USER DETAILS
================================ */

function getCustomerDetails() {

    const nameInput =
        gm("customerName") ||
        gm("customer_name");

    const emailInput =
        gm("customerEmail") ||
        gm("customer_email");


    const name =
        nameInput
            ? nameInput.value.trim()
            : "";


    const email =
        emailInput
            ? emailInput.value.trim()
            : "";


    return {

        name: name,

        email: email

    };

}


/* ================================
   GET ORDER DETAILS
================================ */

function getOrderDetails() {

    const detailsInput =
        gm("orderDetails") ||
        gm("details");


    if (!detailsInput) {

        return "";

    }


    return detailsInput.value.trim();

}


/* ================================
   VALIDATE ORDER
================================ */

function validateOrder() {

    if (!selectedServiceId) {

        showMessage(
            "पहले कोई service चुनें."
        );

        return false;

    }


    if (!selectedPrice || selectedPrice <= 0) {

        showMessage(
            "Service price सही नहीं है."
        );

        return false;

    }


    const customer =
        getCustomerDetails();


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
        getOrderDetails();


    if (!details) {

        showMessage(
            "अपने काम की details लिखें."
        );

        return false;

    }


    return true;

}


/* ================================
   CREATE ORDER DATA
================================ */

function buildOrderData() {

    const customer =
        getCustomerDetails();


    const breakdown =
        calculateOrderBreakdown(
            selectedPrice
        );


    return {

        customer_name:
            customer.name,

        customer_email:
            customer.email,

        details:
            getOrderDetails(),

        service_id:
            selectedServiceId,

        service_name:
            selectedService,

        amount:
            breakdown.total,

        seller_amount:
            breakdown.seller,

        commission_percent:
            GILLMARKET_CONFIG
                .COMMISSION_PERCENT,

        commission_amount:
            breakdown.commission,

        status:
            "pending",

        payment_status:
            "pending",

        created_at:
            new Date().toISOString()

    };

}


/* ================================
   SAVE ORDER IN SUPABASE
================================ */

async function createPendingOrder() {

    if (!supabaseClient) {

        throw new Error(
            "Supabase connected नहीं है."
        );

    }


    const orderData =
        buildOrderData();


    const result =
        await supabaseClient
            .from("orders")
            .insert(
                orderData
            )
            .select()
            .single();


    if (result.error) {

        console.error(
            "Order insert error:",
            result.error
        );


        throw new Error(
            result.error.message
        );

    }


    return result.data;

}


/* ================================
   UPDATE ORDER
================================ */

async function updateGillMarketOrder(
    orderId,
    updateData
) {

    if (!supabaseClient) {

        throw new Error(
            "Supabase connected नहीं है."
        );

    }


    const result =
        await supabaseClient
            .from("orders")
            .update(
                updateData
            )
            .eq(
                "id",
                orderId
            )
            .select()
            .single();


    if (result.error) {

        console.error(
            "Order update error:",
            result.error
        );


        throw new Error(
            result.error.message
        );

    }


    return result.data;

}


/* ================================
   DELETE PENDING ORDER
================================ */

async function deletePendingOrder(
    orderId
) {

    if (!supabaseClient) {

        return;

    }


    const result =
        await supabaseClient
            .from("orders")
            .delete()
            .eq(
                "id",
                orderId
            )
            .eq(
                "payment_status",
                "pending"
            );


    if (result.error) {

        console.warn(
            "Pending order delete failed:",
            result.error
        );

    }

}


/* ================================
   START ORDER
================================ */

async function startGillMarketOrder() {

    try {

        if (!validateOrder()) {

            return;

        }


        if (!supabaseClient) {

            const connected =
                await initializeGillMarket();


            if (!connected) {

                showMessage(
                    "Payment शुरू करने से पहले Supabase configure करें."
                );

                return;

            }

        }


        showMessage(
            "Order बनाया जा रहा है..."
        );


        const order =
            await createPendingOrder();


        if (!order || !order.id) {

            throw new Error(
                "Order ID नहीं मिली."
            );

        }


        console.log(
            "Pending order created:",
            order
        );


        /*
          Part 4 में इसी order को
          Razorpay payment से जोड़ा जाएगा.
        */


        await startGillMarketPayment(
            order
        );


    } catch (error) {

        console.error(
            "Start order error:",
            error
        );


        showMessage(
            error.message ||
            "Order बनाने में समस्या हुई."
        );

    }

}


/* ================================
   ORDER SUBMIT BUTTONS
================================ */

function attachOrderSubmitButtons() {

    const buttons =
        document.querySelectorAll(
            "#placeOrderBtn, #submitOrder, .place-order-btn"
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


/* ================================
   PART 3 END
================================ */
/* =====================================================
   GILLMARKET - market.js
   PART 4 / 5
   RAZORPAY PAYMENT
===================================================== */


/* ================================
   START PAYMENT
================================ */

async function startGillMarketPayment(
    order
) {

    try {

        if (!order || !order.id) {

            throw new Error(
                "Valid order नहीं मिला."
            );

        }


        await loadRazorpay();


        if (
            !GILLMARKET_CONFIG
                .RAZORPAY_KEY_ID ||
            GILLMARKET_CONFIG
                .RAZORPAY_KEY_ID ===
                "YOUR_RAZORPAY_TEST_KEY_ID"
        ) {

            throw new Error(
                "Razorpay Test Key ID अभी configure नहीं है."
            );

        }


        /*
          IMPORTANT:

          Amount हमेशा server से
          verify होना चाहिए.

          यहाँ order.amount केवल
          checkout display के लिए है.
        */


        const response =
            await fetch(
                GILLMARKET_CONFIG
                    .CREATE_ORDER_URL,
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


        if (!response.ok) {

            throw new Error(
                "Payment order create नहीं हुआ."
            );

        }


        const razorpayOrder =
            await response.json();


        if (
            !razorpayOrder ||
            !razorpayOrder.id
        ) {

            throw new Error(
                "Razorpay order ID नहीं मिली."
            );

        }


        const customer =
            getCustomerDetails();


        const options = {

            key:
                GILLMARKET_CONFIG
                    .RAZORPAY_KEY_ID,

            amount:
                razorpayOrder.amount,

            currency:
                razorpayOrder.currency ||
                "INR",

            name:
                "GillMarket",

            description:
                selectedService,

            order_id:
                razorpayOrder.id,


            prefill: {

                name:
                    customer.name,

                email:
                    customer.email

            },


            theme: {

                color:
                    "#2563eb"

            },


            handler:
                async function(
                    paymentResponse
                ) {

                    await verifyGillMarketPayment(

                        order.id,

                        paymentResponse

                    );

                },


            modal: {

                ondismiss:
                    function() {

                        showMessage(
                            "Payment बंद कर दिया गया."
                        );

                    }

            }

        };


        const payment =
            new window.Razorpay(
                options
            );


        payment.on(
            "payment.failed",
            function(
                response
            ) {

                console.error(
                    "Payment failed:",
                    response
                );


                showMessage(
                    "Payment failed. कृपया फिर से कोशिश करें."
                );

            }
        );


        payment.open();


    } catch (error) {

        console.error(
            "Payment error:",
            error
        );


        /*
          Pending order को paid नहीं करेंगे.
        */


        showMessage(
            error.message ||
            "Payment शुरू नहीं हो सका."
        );

    }

}


/* ================================
   VERIFY PAYMENT
================================ */

async function verifyGillMarketPayment(
    orderId,
    paymentResponse
) {

    try {

        if (!orderId) {

            throw new Error(
                "Order ID missing."
            );

        }


        if (
            !paymentResponse ||
            !paymentResponse.razorpay_payment_id ||
            !paymentResponse.razorpay_order_id ||
            !paymentResponse.razorpay_signature
        ) {

            throw new Error(
                "Payment response incomplete है."
            );

        }


        showMessage(
            "Payment verify हो रहा है..."
        );


        const response =
            await fetch(
                GILLMARKET_CONFIG
                    .VERIFY_PAYMENT_URL,
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json"

                    },

                    body: JSON.stringify({

                        order_id:
                            orderId,

                        razorpay_payment_id:
                            paymentResponse
                                .razorpay_payment_id,

                        razorpay_order_id:
                            paymentResponse
                                .razorpay_order_id,

                        razorpay_signature:
                            paymentResponse
                                .razorpay_signature

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


        if (
            result.verified !== true
        ) {

            throw new Error(
                "Payment verify नहीं हुआ."
            );

        }


        /*
          Server verification successful.
          अब Part 5 में Supabase order को
          paid किया जाएगा और commission
          calculate/update होगी.
        */


        await handleVerifiedPayment(
            orderId,
            result
        );


    } catch (error) {

        console.error(
            "Payment verification error:",
            error
        );


        showMessage(
            error.message ||
            "Payment verification में समस्या हुई."
        );

    }

}


/* ================================
   PAYMENT FAILED UPDATE
================================ */

async function markPaymentFailed(
    orderId
) {

    try {

        if (!supabaseClient) {

            return;

        }


        await updateGillMarketOrder(

            orderId,

            {

                payment_status:
                    "failed",

                status:
                    "payment_failed"

            }

        );


    } catch (error) {

        console.warn(
            "Failed payment update error:",
            error
        );

    }

}


/* ================================
   PART 4 END
================================ */
/* =====================================================
   GILLMARKET - market.js
   PART 5 / 5
   VERIFIED PAYMENT + SUPABASE + INITIALIZATION
===================================================== */


/* ================================
   VERIFIED PAYMENT HANDLER
================================ */

async function handleVerifiedPayment(
    orderId,
    verificationResult
) {

    try {

        if (!supabaseClient) {

            const connected =
                await initializeGillMarket();


            if (!connected) {

                throw new Error(
                    "Supabase connection नहीं है."
                );

            }

        }


        /*
          IMPORTANT:
          Payment को केवल server verification
          successful होने के बाद paid करेंगे.
        */


        const existing =
            await supabaseClient
                .from("orders")
                .select("*")
                .eq(
                    "id",
                    orderId
                )
                .single();


        if (existing.error) {

            throw new Error(
                existing.error.message
            );

        }


        const order =
            existing.data;


        if (!order) {

            throw new Error(
                "Order नहीं मिला."
            );

        }


        const total =
            Number(
                order.amount
            ) || 0;


        const breakdown =
            calculateOrderBreakdown(
                total
            );


        /*
          Example:
          ₹149
          Commission = ₹44.70
          Seller = ₹104.30
        */


        const updateData = {

            payment_status:
                "paid",

            status:
                "paid",

            commission_percent:
                GILLMARKET_CONFIG
                    .COMMISSION_PERCENT,

            commission_amount:
                breakdown.commission,

            seller_amount:
                breakdown.seller,

            razorpay_payment_id:
                verificationResult
                    .razorpay_payment_id ||
                null,

            razorpay_order_id:
                verificationResult
                    .razorpay_order_id ||
                null,

            paid_at:
                new Date().toISOString()

        };


        const updated =
            await updateGillMarketOrder(

                orderId,

                updateData

            );


        console.log(
            "✅ Payment verified and order updated:",
            updated
        );


        showPaymentSuccess(
            breakdown
        );


    } catch (error) {

        console.error(
            "Verified payment handler error:",
            error
        );


        showMessage(
            error.message ||
            "Payment successful होने के बाद order update नहीं हो पाया."
        );

    }

}


/* ================================
   PAYMENT SUCCESS UI
================================ */

function showPaymentSuccess(
    breakdown
) {

    const message =
        `Payment successful! ₹${breakdown.total.toFixed(2)} received. ` +
        `Platform commission: ₹${breakdown.commission.toFixed(2)}. ` +
        `Seller amount: ₹${breakdown.seller.toFixed(2)}.`;


    showMessage(
        message
    );


    const successBox =
        gm("paymentSuccess");


    if (successBox) {

        successBox.style.display =
            "block";


        successBox.innerHTML = `

            <div>
                <strong>
                    ✅ Payment Successful
                </strong>
            </div>

            <div>
                Total:
                ₹${breakdown.total.toFixed(2)}
            </div>

            <div>
                Platform commission:
                ₹${breakdown.commission.toFixed(2)}
            </div>

            <div>
                Seller amount:
                ₹${breakdown.seller.toFixed(2)}
            </div>

        `;

    }


    closeOrderForm();

}


/* ================================
   PAYMENT TEST CALCULATOR
================================ */

function testPaymentCalculation(
    amount = 149
) {

    const result =
        calculateOrderBreakdown(
            amount
        );


    console.log(
        "========== GillMarket Payment Test =========="
    );


    console.log(
        "Total:",
        `₹${result.total.toFixed(2)}`
    );


    console.log(
        "Commission 30%:",
        `₹${result.commission.toFixed(2)}`
    );


    console.log(
        "Seller amount:",
        `₹${result.seller.toFixed(2)}`
    );


    console.log(
        "============================================="
    );


    return result;

}


/* ================================
   GLOBAL TEST FUNCTION
================================ */

window.testGillMarketPayment =
    testPaymentCalculation;


/* ================================
   DOM READY
================================ */

document.addEventListener(
    "DOMContentLoaded",
    async function() {

        console.log(
            "🚀 GillMarket starting..."
        );


        try {

            /*
              Supabase initialize
            */

            await initializeGillMarket();


            /*
              Services load
            */

            initializeServices();


            /*
              Order buttons
            */

            attachOrderSubmitButtons();


            /*
              Razorpay अभी load नहीं करेंगे.
              Payment click होने पर load होगा.
            */


            console.log(
                "✅ GillMarket initialized."
            );


        } catch (error) {

            console.error(
                "GillMarket initialization error:",
                error
            );

        }

    }
);


/* ================================
   GLOBAL FUNCTIONS
================================ */

window.openOrderForm =
    openOrderForm;


window.closeOrderForm =
    closeOrderForm;


window.startGillMarketOrder =
    startGillMarketOrder;


window.calculateCommission =
    calculateCommission;


window.calculateSellerAmount =
    calculateSellerAmount;


window.calculateOrderBreakdown =
    calculateOrderBreakdown;


/* ================================
   PART 5 END
   market.js COMPLETE
================================ */
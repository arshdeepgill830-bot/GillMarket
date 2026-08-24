/* =========================================================
   GillMarket - market.js
   Supabase-connected marketplace
   PART 1/2
   ========================================================= */

const SUPABASE_URL = "https://sbdadnfeutymqoelaydo.supabase.co";
const SUPABASE_KEY = "sb_publishable_iMewXbi3FBgyRzCZBorsGg_ibGLrrAe";

let supabaseClient = null;

/* ---------- Supabase ---------- */
function initSupabase() {
    if (window.supabase && SUPABASE_URL && SUPABASE_KEY) {
        supabaseClient = window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_KEY
        );
        return true;
    }

    console.error("Supabase library load nahi hui.");
    return false;
}

/* ---------- Helpers ---------- */
function $(selector) {
    return document.querySelector(selector);
}

function escapeHTML(value) {
    if (value === null || value === undefined) return "";

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}

function money(value) {
    const number = Number(value || 0);

    return "₹" + number.toLocaleString("en-IN", {
        maximumFractionDigits: 2
    });
}

function createOrderId() {
    const now = Date.now().toString(36).toUpperCase();
    const random = Math.random()
        .toString(36)
        .substring(2, 8)
        .toUpperCase();

    return `GM-${now}-${random}`;
}

function showMessage(message, type = "info") {
    let box = $("#gm-message");

    if (!box) {
        box = document.createElement("div");
        box.id = "gm-message";

        box.style.position = "fixed";
        box.style.left = "50%";
        box.style.bottom = "25px";
        box.style.transform = "translateX(-50%)";
        box.style.zIndex = "99999";
        box.style.padding = "13px 18px";
        box.style.borderRadius = "12px";
        box.style.fontSize = "14px";
        box.style.fontWeight = "600";
        box.style.maxWidth = "90%";
        box.style.textAlign = "center";
        box.style.boxShadow = "0 10px 30px rgba(0,0,0,.2)";

        document.body.appendChild(box);
    }

    box.textContent = message;

    if (type === "error") {
        box.style.background = "#dc2626";
        box.style.color = "#fff";
    } else if (type === "success") {
        box.style.background = "#16a34a";
        box.style.color = "#fff";
    } else {
        box.style.background = "#111827";
        box.style.color = "#fff";
    }

    clearTimeout(box._timer);

    box._timer = setTimeout(() => {
        box.remove();
    }, 3500);
}

/* ---------- Services ---------- */
const DEFAULT_SERVICES = [
    {
        name: "Thumbnail Design",
        description: "Professional YouTube and social media thumbnails.",
        price: 99,
        icon: "🎨"
    },
    {
        name: "Video Editing",
        description: "Reels, Shorts and YouTube video editing.",
        price: 199,
        icon: "🎬"
    },
    {
        name: "Social Media Design",
        description: "Instagram posts, banners and social graphics.",
        price: 149,
        icon: "📱"
    },
    {
        name: "Website Design",
        description: "Modern websites for businesses and creators.",
        price: 499,
        icon: "💻"
    },
    {
        name: "AI Image Design",
        description: "AI posters, creative images and designs.",
        price: 99,
        icon: "🤖"
    },
    {
        name: "Content Writing",
        description: "Scripts, captions and social media content.",
        price: 99,
        icon: "✍️"
    }
];

/* ---------- Load Services ---------- */
async function loadServices() {
    if (!supabaseClient) {
        renderServices(DEFAULT_SERVICES);
        return;
    }

    try {
        const { data, error } = await supabaseClient
            .from("services")
            .select("*")
            .eq("active", true)
            .order("created_at", { ascending: false });

        if (error) {
            console.warn("Services table unavailable:", error.message);
            renderServices(DEFAULT_SERVICES);
            return;
        }

        if (!data || data.length === 0) {
            renderServices(DEFAULT_SERVICES);
            return;
        }

        renderServices(data);
    } catch (error) {
        console.error(error);
        renderServices(DEFAULT_SERVICES);
    }
}

/* ---------- Render Services ---------- */
function renderServices(services) {
    const possibleContainers = [
        "#services",
        "#service-list",
        ".services-grid",
        ".service-grid",
        "#popular-services"
    ];

    let container = null;

    for (const selector of possibleContainers) {
        const found = $(selector);

        if (found) {
            container = found;
            break;
        }
    }

    if (!container) {
        console.warn("Services container nahi mila.");
        return;
    }

    container.innerHTML = "";

    services.forEach((service) => {
        const card = document.createElement("div");

        card.className = "service-card";

        const serviceName =
            service.name ||
            service.service_name ||
            "Service";

        const description =
            service.description ||
            "Professional digital service.";

        const price =
            service.price ??
            service.starting_price ??
            0;

        const icon =
            service.icon ||
            "✨";

        card.innerHTML = `
            <div class="service-icon">
                ${escapeHTML(icon)}
            </div>

            <h3>
                ${escapeHTML(serviceName)}
            </h3>

            <p>
                ${escapeHTML(description)}
            </p>

            <strong>
                From ${money(price)}
            </strong>

            <button
                type="button"
                class="order-service-btn"
                data-service="${escapeHTML(serviceName)}"
                data-price="${Number(price)}"
            >
                Order
            </button>
        `;

        container.appendChild(card);
    });

    container.querySelectorAll(".order-service-btn")
        .forEach((button) => {
            button.addEventListener("click", () => {
                openOrderForm(
                    button.dataset.service,
                    Number(button.dataset.price)
                );
            });
        });
}

/* ---------- Order Modal ---------- */
function createOrderModal() {
    if ($("#gm-order-modal")) return;

    const modal = document.createElement("div");

    modal.id = "gm-order-modal";

    modal.innerHTML = `
        <div class="gm-modal-backdrop"></div>

        <div class="gm-modal">
            <button
                type="button"
                id="gm-close-modal"
                class="gm-close"
                aria-label="Close"
            >
                ×
            </button>

            <h2>Place Your Order</h2>

            <form id="gm-order-form">

                <label>
                    Service
                </label>

                <input
                    id="gm-service"
                    type="text"
                    readonly
                >

                <label>
                    Your Name
                </label>

                <input
                    id="gm-customer-name"
                    type="text"
                    placeholder="Enter your name"
                    required
                >

                <label>
                    Mobile Number
                </label>

                <input
                    id="gm-customer-phone"
                    type="tel"
                    placeholder="Enter mobile number"
                    maxlength="10"
                    required
                >

                <label>
                    What do you need?
                </label>

                <textarea
                    id="gm-order-description"
                    rows="4"
                    placeholder="Tell the seller what you need..."
                    required
                ></textarea>

                <label>
                    Budget / Price
                </label>

                <input
                    id="gm-order-price"
                    type="number"
                    min="1"
                    step="1"
                    required
                >

                <button
                    id="gm-submit-order"
                    type="submit"
                >
                    Place Order
                </button>

            </form>
        </div>
    `;

    document.body.appendChild(modal);

    $("#gm-close-modal").addEventListener(
        "click",
        closeOrderForm
    );

    $(".gm-modal-backdrop").addEventListener(
        "click",
        closeOrderForm
    );

    $("#gm-order-form").addEventListener(
        "submit",
        submitOrder
    );
}

/* ---------- Open Order ---------- */
function openOrderForm(serviceName, price) {
    createOrderModal();

    $("#gm-service").value = serviceName;
    $("#gm-order-price").value = price;

    $("#gm-order-modal").classList.add("active");

    document.body.style.overflow = "hidden";
}

/* ---------- Close Order ---------- */
function closeOrderForm() {
    const modal = $("#gm-order-modal");

    if (!modal) return;

    modal.classList.remove("active");

    document.body.style.overflow = "";
}

/* ---------- Validate Phone ---------- */
function validPhone(phone) {
    return /^[6-9][0-9]{9}$/.test(phone);
}

/* ---------- Submit Order ---------- */
async function submitOrder(event) {
    event.preventDefault();

    const button = $("#gm-submit-order");

    const serviceName =
        $("#gm-service").value.trim();

    const customerName =
        $("#gm-customer-name").value.trim();

    const customerPhone =
        $("#gm-customer-phone").value.trim();

    const description =
        $("#gm-order-description").value.trim();

    const price =
        Number($("#gm-order-price").value);

    if (!customerName) {
        showMessage(
            "Apna naam enter karein.",
            "error"
        );
        return;
    }

    if (!validPhone(customerPhone)) {
        showMessage(
            "Valid 10-digit mobile number enter karein.",
            "error"
        );
        return;
    }

    if (!description) {
        showMessage(
            "Apne order ki details likhein.",
            "error"
        );
        return;
    }

    if (!price || price <= 0) {
        showMessage(
            "Valid price enter karein.",
            "error"
        );
        return;
    }

    const orderId = createOrderId();

    button.disabled = true;
    button.textContent = "Placing Order...";

    try {
        if (!supabaseClient) {
            throw new Error(
                "Supabase connection available nahi hai."
            );
        }

        const orderData = {
            order_id: orderId,
            service_name: serviceName,
            customer_name: customerName,
            customer_phone: customerPhone,
            description: description,
            price: price,
            commission_percent: 30
        };

        const { data, error } = await supabaseClient
            .from("orders")
            .insert([orderData])
            .select()
            .single();

        if (error) {
            console.error(error);
            throw error;
        }

        closeOrderForm();

        showMessage(
            `Order ${orderId} successfully place ho gaya!`,
            "success"
        );

        $("#gm-order-form").reset();

        if (data) {
            console.log(
                "GillMarket Order:",
                data
            );
        }

    } catch (error) {
        console.error(
            "Order error:",
            error
        );

        showMessage(
            error.message ||
            "Order place nahi ho saka.",
            "error"
        );
    } finally {
        button.disabled = false;
        button.textContent = "Place Order";
    }
}

/* ---------- Seller Modal ---------- */
function createSellerModal() {
    if ($("#gm-seller-modal")) return;

    const modal = document.createElement("div");

    modal.id = "gm-seller-modal";

    modal.innerHTML = `
        <div class="gm-modal-backdrop"></div>

        <div class="gm-modal">

            <button
                type="button"
                id="gm-close-seller"
                class="gm-close"
            >
                ×
            </button>

            <h2>Sell Your Service</h2>

            <form id="gm-seller-form">

                <label>
                    Your Name
                </label>

                <input
                    id="gm-seller-name"
                    type="text"
                    placeholder="Your name"
                    required
                >

                <label>
                    Mobile Number
                </label>

                <input
                    id="gm-seller-phone"
                    type="tel"
                    maxlength="10"
                    placeholder="10-digit mobile"
                    required
                >

                <label>
                    Service Name
                </label>

                <input
                    id="gm-seller-service"
                    type="text"
                    placeholder="e.g. Logo Design"
                    required
                >

                <label>
                    Description
                </label>

                <textarea
                    id="gm-seller-description"
                    rows="4"
                    placeholder="Describe your service..."
                    required
                ></textarea>

                <label>
                    Starting Price
                </label>

                <input
                    id="gm-seller-price"
                    type="number"
                    min="1"
                    step="1"
                    placeholder="₹99"
                    required
                >

                <button
                    type="submit"
                    id="gm-submit-seller"
                >
                    Submit Service
                </button>

            </form>
        </div>
    `;

    document.body.appendChild(modal);

    $("#gm-close-seller").addEventListener(
        "click",
        closeSellerForm
    );

    document.querySelector(
        "#gm-seller-modal .gm-modal-backdrop"
    ).addEventListener(
        "click",
        closeSellerForm
    );

    $("#gm-seller-form").addEventListener(
        "submit",
        submitSeller
    );
}

/* ---------- Open Seller ---------- */
function openSellerForm() {
    createSellerModal();

    $("#gm-seller-modal")
        .classList
        .add("active");

    document.body.style.overflow = "hidden";
}

/* ---------- Close Seller ---------- */
function closeSellerForm() {
    const modal = $("#gm-seller-modal");

    if (!modal) return;

    modal.classList.remove("active");

    document.body.style.overflow = "";
}

/* ---------- Submit Seller ---------- */
async function submitSeller(event) {
    event.preventDefault();

    const button = $("#gm-submit-seller");

    const name =
        $("#gm-seller-name").value.trim();

    const phone =
        $("#gm-seller-phone").value.trim();

    const service =
        $("#gm-seller-service").value.trim();

    const description =
        $("#gm-seller-description").value.trim();

    const price =
        Number($("#gm-seller-price").value);

    if (!name) {
        showMessage(
            "Name enter karein.",
            "error"
        );
        return;
    }

    if (!validPhone(phone)) {
        showMessage(
            "Valid mobile number enter karein.",
            "error"
        );
        return;
    }

    if (!service || !description) {
        showMessage(
            "Service details complete karein.",
            "error"
        );
        return;
    }

    if (!price || price <= 0) {
        showMessage(
            "Valid starting price enter karein.",
            "error"
        );
        return;
    }

    button.disabled = true;
    button.textContent = "Submitting...";

    try {
        const { error } = await supabaseClient
            .from("services")
            .insert([{
                name: service,
                description: description,
                price: price,
                active: true
            }]);

        if (error) {
            throw error;
        }

        closeSellerForm();

        showMessage(
            "Service successfully submit ho gayi!",
            "success"
        );

        $("#gm-seller-form").reset();

        await loadServices();

    } catch (error) {
        console.error(error);

        showMessage(
            error.message ||
            "Service submit nahi ho saki.",
            "error"
        );
    } finally {
        button.disabled = false;
        button.textContent = "Submit Service";
    }
}
/* =========================================================
   GillMarket - market.js
   PART 2/2
   ========================================================= */

/* ---------- Payment / Order Summary ---------- */

function openPaymentInfo(orderId, amount) {
    const existing = document.getElementById("gm-payment-modal");

    if (existing) existing.remove();

    const modal = document.createElement("div");

    modal.id = "gm-payment-modal";

    modal.innerHTML = `
        <div class="gm-modal-backdrop"></div>

        <div class="gm-modal">
            <button
                type="button"
                class="gm-close"
                id="gm-payment-close"
            >
                ×
            </button>

            <h2>Payment</h2>

            <p>
                Order ID:
                <strong>${escapeHTML(orderId)}</strong>
            </p>

            <p>
                Amount:
                <strong>${money(amount)}</strong>
            </p>

            <div class="payment-info">
                <p>
                    Payment gateway connect karne ke baad
                    customer yahin se online payment kar sakega.
                </p>

                <p>
                    Abhi payment ko manually verify karein.
                </p>
            </div>

            <button
                type="button"
                id="gm-payment-done"
            >
                Payment Done
            </button>
        </div>
    `;

    document.body.appendChild(modal);

    modal.classList.add("active");

    document.body.style.overflow = "hidden";

    document
        .getElementById("gm-payment-close")
        .addEventListener("click", () => {
            modal.remove();
            document.body.style.overflow = "";
        });

    document
        .getElementById("gm-payment-done")
        .addEventListener("click", () => {
            showMessage(
                "Payment verification ke liye order details save hain.",
                "success"
            );

            modal.remove();
            document.body.style.overflow = "";
        });
}


/* ---------- Find Service Button ---------- */

function setupFindServiceButton() {
    const buttons = document.querySelectorAll(
        "button, a"
    );

    buttons.forEach((button) => {
        const text =
            button.textContent
                .trim()
                .toLowerCase();

        if (
            text === "find a service" ||
            text.includes("find a service")
        ) {
            button.addEventListener("click", (event) => {
                event.preventDefault();

                const target =
                    document.querySelector(
                        "#services, #service-list, .services-grid, .service-grid"
                    );

                if (target) {
                    target.scrollIntoView({
                        behavior: "smooth",
                        block: "start"
                    });
                }
            });
        }
    });
}


/* ---------- Sell Your Service Button ---------- */

function setupSellerButton() {
    const buttons = document.querySelectorAll(
        "button, a"
    );

    buttons.forEach((button) => {
        const text =
            button.textContent
                .trim()
                .toLowerCase();

        if (
            text === "sell your service" ||
            text === "start selling" ||
            text.includes("sell your service")
        ) {
            button.addEventListener("click", (event) => {
                event.preventDefault();
                openSellerForm();
            });
        }
    });
}


/* ---------- Mobile Menu ---------- */

function setupMobileMenu() {
    const menuButton =
        document.querySelector(
            "#menu-button, .menu-button, .hamburger, .menu-toggle"
        );

    const nav =
        document.querySelector(
            "#mobile-menu, .mobile-menu, nav"
        );

    if (!menuButton || !nav) {
        return;
    }

    menuButton.addEventListener("click", () => {
        nav.classList.toggle("open");

        menuButton.classList.toggle("active");
    });
}


/* ---------- Search ---------- */

function setupSearch() {
    const searchInput =
        document.querySelector(
            "#search-service, #service-search, input[type='search']"
        );

    if (!searchInput) {
        return;
    }

    searchInput.addEventListener("input", () => {
        const query =
            searchInput.value
                .trim()
                .toLowerCase();

        const cards =
            document.querySelectorAll(
                ".service-card"
            );

        cards.forEach((card) => {
            const text =
                card.textContent
                    .toLowerCase();

            if (!query || text.includes(query)) {
                card.style.display = "";
            } else {
                card.style.display = "none";
            }
        });
    });
}


/* ---------- Add Basic Modal CSS ---------- */

function addModalStyles() {
    if (
        document.getElementById(
            "gillmarket-modal-styles"
        )
    ) {
        return;
    }

    const style =
        document.createElement("style");

    style.id =
        "gillmarket-modal-styles";

    style.textContent = `
        .gm-modal-backdrop {
            position: fixed;
            inset: 0;
            background: rgba(0,0,0,.65);
            z-index: 9998;
        }

        #gm-order-modal,
        #gm-seller-modal,
        #gm-payment-modal {
            display: none;
            position: fixed;
            inset: 0;
            z-index: 9999;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }

        #gm-order-modal.active,
        #gm-seller-modal.active,
        #gm-payment-modal.active {
            display: flex;
        }

        .gm-modal {
            position: relative;
            width: min(500px, 100%);
            max-height: 90vh;
            overflow-y: auto;
            background: #ffffff;
            color: #111827;
            border-radius: 20px;
            padding: 25px;
            box-shadow: 0 25px 70px rgba(0,0,0,.35);
            z-index: 10000;
        }

        .gm-modal h2 {
            margin-top: 0;
            margin-bottom: 20px;
        }

        .gm-modal label {
            display: block;
            margin-top: 14px;
            margin-bottom: 6px;
            font-weight: 600;
        }

        .gm-modal input,
        .gm-modal textarea {
            width: 100%;
            box-sizing: border-box;
            border: 1px solid #d1d5db;
            border-radius: 10px;
            padding: 12px;
            font-size: 15px;
            outline: none;
        }

        .gm-modal input:focus,
        .gm-modal textarea:focus {
            border-color: #2563eb;
        }

        .gm-modal button[type="submit"],
        #gm-payment-done {
            width: 100%;
            margin-top: 18px;
            border: 0;
            border-radius: 10px;
            padding: 13px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            background: #2563eb;
            color: #fff;
        }

        .gm-modal button:disabled {
            opacity: .6;
            cursor: not-allowed;
        }

        .gm-close {
            position: absolute;
            right: 14px;
            top: 10px;
            width: 36px;
            height: 36px;
            border: 0;
            border-radius: 50%;
            background: #f3f4f6;
            color: #111827;
            font-size: 25px;
            cursor: pointer;
        }

        .payment-info {
            padding: 15px;
            margin-top: 15px;
            border-radius: 12px;
            background: #f3f4f6;
        }

        .service-card {
            transition:
                transform .2s ease,
                box-shadow .2s ease;
        }

        .service-card:hover {
            transform: translateY(-3px);
        }

        nav.open {
            display: block !important;
        }
    `;

    document.head.appendChild(style);
}


/* ---------- Global Error Handler ---------- */

window.addEventListener(
    "error",
    (event) => {
        console.error(
            "GillMarket error:",
            event.error || event.message
        );
    }
);


/* ---------- Start Application ---------- */

async function startGillMarket() {
    console.log(
        "GillMarket starting..."
    );

    addModalStyles();

    const connected =
        initSupabase();

    if (!connected) {
        showMessage(
            "Supabase connect nahi hua.",
            "error"
        );
    }

    await loadServices();

    setupFindServiceButton();

    setupSellerButton();

    setupMobileMenu();

    setupSearch();

    console.log(
        "GillMarket ready."
    );
}


/* ---------- DOM Ready ---------- */

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


/* ---------- Public Functions ---------- */

window.GillMarket = {
    openOrderForm,
    closeOrderForm,
    openSellerForm,
    closeSellerForm,
    loadServices,
    showMessage
};
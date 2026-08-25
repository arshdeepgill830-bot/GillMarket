/* =========================================================
   GillMarket — market.js
   PART 1 / 5
   Frontend setup + safe configuration
   ========================================================= */

"use strict";

/* ================= CONFIG ================= */

const GILLMARKET_SUPABASE_URL =
    "YOUR_SUPABASE_URL";

const GILLMARKET_SUPABASE_KEY =
    "YOUR_SUPABASE_PUBLISHABLE_KEY";

const GILLMARKET_RAZORPAY_KEY_ID =
    "YOUR_RAZORPAY_KEY_ID";


/* ================= HELPERS ================= */

const $ = (selector) => document.querySelector(selector);

const $$ = (selector) =>
    Array.from(document.querySelectorAll(selector));


function byId(id) {
    return document.getElementById(id);
}


function showModal(id) {
    const modal = byId(id);

    if (!modal) return;

    modal.classList.add("active");
    modal.style.display = "flex";
}


function hideModal(id) {
    const modal = byId(id);

    if (!modal) return;

    modal.classList.remove("active");
    modal.style.display = "none";
}


function closeAllModals() {
    $$(".modal").forEach((modal) => {
        modal.classList.remove("active");
        modal.style.display = "none";
    });
}


/* ================= STATE ================= */

const GillMarketState = {
    selectedService: null,
    loggedIn: false,
    currentUser: null
};


/* ================= NOTIFICATION ================= */

function showMessage(message) {

    let box = byId("gmMessage");

    if (!box) {

        box = document.createElement("div");

        box.id = "gmMessage";

        box.style.position = "fixed";
        box.style.left = "50%";
        box.style.bottom = "25px";
        box.style.transform = "translateX(-50%)";
        box.style.zIndex = "99999";
        box.style.padding = "12px 18px";
        box.style.borderRadius = "10px";
        box.style.background = "#111827";
        box.style.color = "#ffffff";
        box.style.fontSize = "14px";
        box.style.boxShadow =
            "0 10px 30px rgba(0,0,0,.25)";

        document.body.appendChild(box);
    }

    box.textContent = message;

    box.style.display = "block";

    clearTimeout(window.gmMessageTimer);

    window.gmMessageTimer = setTimeout(() => {

        box.style.display = "none";

    }, 3000);
}


/* ================= SERVICE ================= */

function selectService(name, price) {

    GillMarketState.selectedService = {
        name: name,
        price: Number(price) || 0
    };

    const summary = byId("summary");

    if (summary) {

        summary.innerHTML = `
            <strong>${escapeHtml(name)}</strong>
            <br>
            Starting price:
            ₹${Number(price) || 0}
        `;
    }

    showModal("orderModal");
}


/* ================= SECURITY ================= */

function escapeHtml(value) {

    return String(value ?? "")
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ================= DOM READY ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        console.log(
            "GillMarket JavaScript loaded successfully."
        );

    }
);
/* =========================================================
   GillMarket — market.js
   PART 2 / 5
   Buttons + Navigation + Modals
   ========================================================= */


/* ================= MENU ================= */

const menuBtn = byId("menuBtn");
const nav = byId("nav");

if (menuBtn) {

    menuBtn.addEventListener("click", () => {

        if (!nav) return;

        nav.classList.toggle("active");

    });

}


/* ================= NAVIGATION ================= */

$$(".nav a").forEach((link) => {

    link.addEventListener("click", () => {

        if (nav) {
            nav.classList.remove("active");
        }

    });

});


/* ================= LOGIN BUTTON ================= */

const loginBtn = byId("loginBtn");

if (loginBtn) {

    loginBtn.addEventListener("click", () => {

        showModal("loginModal");

    });

}


/* ================= HERO FIND BUTTON ================= */

const findBtn = byId("findBtn");

if (findBtn) {

    findBtn.addEventListener("click", () => {

        const services = byId("services");

        if (services) {

            services.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

}


/* ================= HERO SELL BUTTON ================= */

const sellHeroBtn = byId("sellHeroBtn");

if (sellHeroBtn) {

    sellHeroBtn.addEventListener("click", () => {

        showModal("sellerModal");

    });

}


/* ================= SELL BUTTON ================= */

const sellBtn = byId("sellBtn");

if (sellBtn) {

    sellBtn.addEventListener("click", () => {

        showModal("sellerModal");

    });

}


/* ================= ORDER BUTTONS ================= */

$$(".order-btn").forEach((button) => {

    button.addEventListener("click", () => {

        const name =
            button.dataset.name ||
            button.getAttribute("data-name") ||
            "Service";

        const price =
            button.dataset.price ||
            button.getAttribute("data-price") ||
            0;

        selectService(name, price);

    });

});


/* ================= CLOSE BUTTONS ================= */

$$("[data-close]").forEach((button) => {

    button.addEventListener("click", () => {

        const modalId =
            button.getAttribute("data-close");

        if (modalId) {

            hideModal(modalId);

        }

    });

});


/* ================= MODAL BACKDROP ================= */

$$(".modal").forEach((modal) => {

    modal.addEventListener("click", (event) => {

        if (event.target === modal) {

            modal.classList.remove("active");
            modal.style.display = "none";

        }

    });

});


/* ================= ESC KEY ================= */

document.addEventListener("keydown", (event) => {

    if (event.key === "Escape") {

        closeAllModals();

    }

});


/* ================= LOGIN CONTINUE ================= */

const continueBtn = byId("continueBtn");

if (continueBtn) {

    continueBtn.addEventListener("click", () => {

        const name =
            (byId("loginName")?.value || "").trim();

        const email =
            (byId("loginEmail")?.value || "").trim();


        if (!name) {

            showMessage("Please enter your name.");

            return;

        }


        if (!email || !email.includes("@")) {

            showMessage(
                "Please enter a valid email."
            );

            return;

        }


        GillMarketState.loggedIn = true;

        GillMarketState.currentUser = {
            name: name,
            email: email
        };


        localStorage.setItem(
            "gillmarket_user",
            JSON.stringify(
                GillMarketState.currentUser
            )
        );


        hideModal("loginModal");

        showMessage(
            `Welcome to GillMarket, ${name}!`
        );

    });

}


/* ================= RESTORE LOGIN ================= */

try {

    const savedUser =
        localStorage.getItem(
            "gillmarket_user"
        );


    if (savedUser) {

        const user =
            JSON.parse(savedUser);


        if (user && user.name && user.email) {

            GillMarketState.loggedIn = true;

            GillMarketState.currentUser = user;

        }

    }

} catch (error) {

    console.warn(
        "Could not restore GillMarket user.",
        error
    );

}
/* =========================================================
   GillMarket — market.js
   PART 3 / 5
   Search + Order Form + Seller Form
   ========================================================= */


/* ================= SEARCH ================= */

const searchInput = byId("searchInput");
const servicesGrid = byId("servicesGrid");

if (searchInput && servicesGrid) {

    searchInput.addEventListener("input", () => {

        const query =
            searchInput.value
                .trim()
                .toLowerCase();

        const cards =
            servicesGrid.querySelectorAll(
                ".service-card"
            );


        cards.forEach((card) => {

            const text =
                card.textContent
                    .toLowerCase();

            if (
                query === "" ||
                text.includes(query)
            ) {

                card.style.display = "";

            } else {

                card.style.display = "none";

            }

        });

    });

}


/* ================= ORDER FORM ================= */

const submitOrder = byId("submitOrder");

if (submitOrder) {

    submitOrder.addEventListener(
        "click",
        async () => {

            const name =
                (byId("customerName")?.value || "")
                    .trim();

            const email =
                (byId("customerEmail")?.value || "")
                    .trim();

            const details =
                (byId("details")?.value || "")
                    .trim();


            /* ---------- VALIDATION ---------- */

            if (!GillMarketState.selectedService) {

                showMessage(
                    "Please select a service first."
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
                !email.includes("@") ||
                !email.includes(".")
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


            /* ---------- TEMPORARY ORDER ---------- */

            const order = {

                id:
                    "GM-" +
                    Date.now(),

                service:
                    GillMarketState
                        .selectedService
                        .name,

                price:
                    GillMarketState
                        .selectedService
                        .price,

                customerName:
                    name,

                customerEmail:
                    email,

                details:
                    details,

                status:
                    "pending",

                createdAt:
                    new Date().toISOString()

            };


            /* ---------- SAVE LOCALLY ---------- */

            try {

                const oldOrders =
                    JSON.parse(
                        localStorage.getItem(
                            "gillmarket_orders"
                        ) || "[]"
                    );


                oldOrders.push(order);


                localStorage.setItem(
                    "gillmarket_orders",
                    JSON.stringify(
                        oldOrders
                    )
                );


            } catch (error) {

                console.error(
                    "Order save error:",
                    error
                );

            }


            /* ---------- BUTTON STATE ---------- */

            submitOrder.disabled = true;

            const oldText =
                submitOrder.textContent;

            submitOrder.textContent =
                "Order Saved";


            hideModal("orderModal");


            showMessage(
                `Order ${order.id} created successfully!`
            );


            /* ---------- CLEAR FORM ---------- */

            if (byId("customerName")) {

                byId("customerName").value = "";

            }


            if (byId("customerEmail")) {

                byId("customerEmail").value = "";

            }


            if (byId("details")) {

                byId("details").value = "";

            }


            setTimeout(() => {

                submitOrder.disabled = false;

                submitOrder.textContent =
                    oldText;

            }, 1500);

        }
    );

}


/* ================= SELLER FORM ================= */

const submitSeller = byId("submitSeller");

if (submitSeller) {

    submitSeller.addEventListener(
        "click",
        () => {

            const name =
                (byId("sellerName")?.value || "")
                    .trim();

            const service =
                (byId("sellerService")?.value || "")
                    .trim();

            const price =
                (byId("sellerPrice")?.value || "")
                    .trim();

            const description =
                (byId("sellerDescription")?.value || "")
                    .trim();


            /* ---------- VALIDATION ---------- */

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
                Number(price) <= 0
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


            /* ---------- SELLER SERVICE ---------- */

            const sellerService = {

                id:
                    "SELL-" +
                    Date.now(),

                name:
                    name,

                service:
                    service,

                price:
                    Number(price),

                description:
                    description,

                createdAt:
                    new Date().toISOString(),

                status:
                    "pending"

            };


            /* ---------- SAVE ---------- */

            try {

                const oldServices =
                    JSON.parse(
                        localStorage.getItem(
                            "gillmarket_seller_services"
                        ) || "[]"
                    );


                oldServices.push(
                    sellerService
                );


                localStorage.setItem(
                    "gillmarket_seller_services",
                    JSON.stringify(
                        oldServices
                    )
                );


            } catch (error) {

                console.error(
                    "Seller service save error:",
                    error
                );

            }


            /* ---------- SUCCESS ---------- */

            hideModal("sellerModal");


            showMessage(
                "Your service has been submitted!"
            );


            /* ---------- CLEAR ---------- */

            if (byId("sellerName")) {

                byId("sellerName").value = "";

            }


            if (byId("sellerService")) {

                byId("sellerService").value = "";

            }


            if (byId("sellerPrice")) {

                byId("sellerPrice").value = "";

            }


            if (byId("sellerDescription")) {

                byId("sellerDescription").value = "";

            }

        }
    );

}
/* =========================================================
   GillMarket — market.js
   PART 4 / 5
   Order Management + Service Management + UI Helpers
   ========================================================= */


/* ================= GET SAVED ORDERS ================= */

function getSavedOrders() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "gillmarket_orders"
            ) || "[]"
        );

    } catch (error) {

        console.error(
            "Could not read orders:",
            error
        );

        return [];

    }

}


/* ================= GET SELLER SERVICES ================= */

function getSellerServices() {

    try {

        return JSON.parse(
            localStorage.getItem(
                "gillmarket_seller_services"
            ) || "[]"
        );

    } catch (error) {

        console.error(
            "Could not read seller services:",
            error
        );

        return [];

    }

}


/* ================= ADD SELLER SERVICES ================= */

function renderSellerServices() {

    const grid =
        byId("servicesGrid");

    if (!grid) return;


    const services =
        getSellerServices();


    services.forEach((service) => {

        const article =
            document.createElement("article");

        article.className =
            "service-card";


        article.innerHTML = `

            <div class="service-icon">
                🛍️
            </div>

            <h3>
                ${escapeHtml(service.service)}
            </h3>

            <p>
                ${escapeHtml(service.description)}
            </p>

            <div class="service-bottom">

                <strong>
                    From ₹${Number(service.price)}
                </strong>

                <button
                    class="order-btn"
                    type="button"
                    data-name="${escapeHtml(service.service)}"
                    data-price="${Number(service.price)}"
                >
                    Order
                </button>

            </div>
        `;


        grid.appendChild(article);


        const orderButton =
            article.querySelector(
                ".order-btn"
            );


        if (orderButton) {

            orderButton.addEventListener(
                "click",
                () => {

                    selectService(
                        service.service,
                        service.price
                    );

                }
            );

        }

    });

}


/* ================= REFRESH SERVICE SEARCH ================= */

function refreshServiceSearch() {

    if (!searchInput) return;

    searchInput.dispatchEvent(
        new Event("input")
    );

}


/* ================= SMOOTH SCROLL ================= */

function scrollToServices() {

    const services =
        byId("services");

    if (!services) return;


    services.scrollIntoView({
        behavior: "smooth",
        block: "start"
    });

}


/* ================= SERVICE BUTTON FALLBACK ================= */

document.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                ".order-btn"
            );

        if (!button) return;


        const name =
            button.getAttribute(
                "data-name"
            );

        const price =
            button.getAttribute(
                "data-price"
            );


        if (!name) return;


        selectService(
            name,
            price || 0
        );

    }
);


/* ================= CLOSE MODAL FALLBACK ================= */

document.addEventListener(
    "click",
    (event) => {

        const button =
            event.target.closest(
                "[data-close]"
            );

        if (!button) return;


        const modalId =
            button.getAttribute(
                "data-close"
            );


        if (modalId) {

            hideModal(modalId);

        }

    }
);


/* ================= LOGOUT SUPPORT ================= */

function logoutGillMarket() {

    GillMarketState.loggedIn =
        false;

    GillMarketState.currentUser =
        null;


    localStorage.removeItem(
        "gillmarket_user"
    );


    showMessage(
        "You have been logged out."
    );

}


/* ================= CLEAR CURRENT ORDER ================= */

function clearCurrentOrder() {

    GillMarketState.selectedService =
        null;


    const summary =
        byId("summary");


    if (summary) {

        summary.textContent =
            "Select a service to continue.";

    }

}


/* ================= INITIALIZE SELLER SERVICES ================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        renderSellerServices();

        refreshServiceSearch();

    }
);


/* ================= GLOBAL API ================= */

window.GillMarket = {

    selectService,

    showModal,

    hideModal,

    closeAllModals,

    getSavedOrders,

    getSellerServices,

    logoutGillMarket,

    clearCurrentOrder,

    scrollToServices

};


/* ================= ERROR HANDLER ================= */

window.addEventListener(
    "error",
    (event) => {

        console.error(
            "GillMarket JavaScript error:",
            event.error || event.message
        );

    }
);
/* =========================================================
   GillMarket — market.js
   PART 5 / 5
   Final Initialization + Safety Checks
   ========================================================= */


/* ================= INITIALIZATION ================= */

function initializeGillMarket() {

    console.log(
        "GillMarket initializing..."
    );


    /* ---------- CHECK IMPORTANT ELEMENTS ---------- */

    const requiredElements = [
        "menuBtn",
        "loginBtn",
        "findBtn",
        "sellHeroBtn",
        "sellBtn",
        "services",
        "servicesGrid",
        "loginModal",
        "orderModal",
        "sellerModal",
        "continueBtn",
        "submitOrder",
        "submitSeller"
    ];


    const missingElements = [];


    requiredElements.forEach((id) => {

        if (!byId(id)) {

            missingElements.push(id);

        }

    });


    if (missingElements.length > 0) {

        console.warn(
            "GillMarket missing elements:",
            missingElements
        );

    }


    /* ---------- LOAD USER ---------- */

    try {

        const savedUser =
            localStorage.getItem(
                "gillmarket_user"
            );


        if (savedUser) {

            const user =
                JSON.parse(savedUser);


            if (
                user &&
                user.name &&
                user.email
            ) {

                GillMarketState.loggedIn =
                    true;

                GillMarketState.currentUser =
                    user;

            }

        }

    } catch (error) {

        console.warn(
            "User loading failed:",
            error
        );

    }


    /* ---------- ADD CURRENT USER INFO ---------- */

    if (
        GillMarketState.loggedIn &&
        GillMarketState.currentUser
    ) {

        console.log(
            "Logged in as:",
            GillMarketState.currentUser.name
        );

    }


    /* ---------- READY ---------- */

    document.body.classList.add(
        "gillmarket-ready"
    );


    console.log(
        "GillMarket is ready. Buttons are active."
    );

}


/* ================= START ================= */

if (
    document.readyState ===
    "loading"
) {

    document.addEventListener(
        "DOMContentLoaded",
        initializeGillMarket,
        {
            once: true
        }
    );

} else {

    initializeGillMarket();

}


/* =========================================================
   FINAL SAFETY
   ========================================================= */

window.addEventListener(
    "unhandledrejection",
    (event) => {

        console.error(
            "GillMarket promise error:",
            event.reason
        );

    }
);


/* ================= VERSION ================= */

window.GILLMARKET_VERSION =
    "1.0.0";


console.log(
    "GillMarket v1.0.0 loaded successfully."
);
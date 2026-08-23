/* =========================================================
   GILL MARKET - SUPABASE + WEBSITE
   Platform Commission: 30%
   ========================================================= */


/* =========================
   SUPABASE CONFIG
   ========================= */

const SUPABASE_URL =
    "https://sbdadnfeutymqoelaydo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY = 
    "PASTE_YOUR_PUBLISHABLE_KEY_HERE"

/* =========================
   SUPABASE CLIENT
   ========================= */

let supabaseClient = null;

if (
    typeof window.supabase !== "undefined" &&
    SUPABASE_PUBLISHABLE_KEY !==
    "PASTE_YOUR_PUBLISHABLE_KEY_HERE"
) {
    supabaseClient =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );
}


/* =========================
   SETTINGS
   ========================= */

const COMMISSION = 30;

let selectedName = "";
let selectedPrice = 0;


/* =========================
   HELPER
   ========================= */

function getElement(id) {
    return document.getElementById(id);
}


function showMessage(message) {
    alert(message);
}


/* =========================
   MENU
   ========================= */

const menuBtn = getElement("menuBtn");
const nav = getElement("nav");

if (menuBtn && nav) {

    menuBtn.addEventListener("click", function () {

        nav.classList.toggle("open");

    });

}


/* =========================
   CLOSE MOBILE MENU
   ========================= */

if (nav) {

    nav.querySelectorAll("a").forEach(function (link) {

        link.addEventListener("click", function () {

            nav.classList.remove("open");

        });

    });

}


/* =========================
   FIND SERVICE
   ========================= */

const findBtn = getElement("findBtn");

if (findBtn) {

    findBtn.addEventListener("click", function () {

        const services =
            getElement("services");

        if (services) {

            services.scrollIntoView({
                behavior: "smooth"
            });

        }

    });

}


/* =========================
   MODAL FUNCTIONS
   ========================= */

function openModal(id) {

    const modal = getElement(id);

    if (modal) {

        modal.classList.add("show");

    }

}


function closeModal(id) {

    const modal = getElement(id);

    if (modal) {

        modal.classList.remove("show");

    }

}


/* =========================
   LOGIN
   ========================= */

const loginBtn = getElement("loginBtn");

if (loginBtn) {

    loginBtn.addEventListener("click", function () {

        openModal("loginModal");

    });

}


const continueBtn =
    getElement("continueBtn");

if (continueBtn) {

    continueBtn.addEventListener(
        "click",
        function () {

            const name =
                getElement("loginName")
                    ?.value
                    .trim();

            const email =
                getElement("loginEmail")
                    ?.value
                    .trim();


            if (!name || !email) {

                showMessage(
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


            showMessage(
                "Welcome to Gill Market, " +
                name +
                "!"
            );


            closeModal("loginModal");

        }
    );

}


/* =========================
   SELLER MODAL
   ========================= */

function openSeller() {

    openModal("sellerModal");

}


const sellBtn =
    getElement("sellBtn");

if (sellBtn) {

    sellBtn.addEventListener(
        "click",
        openSeller
    );

}


const sellHeroBtn =
    getElement("sellHeroBtn");

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
   CLOSE MODAL ON BACKDROP
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

                selectedName =
                    button.dataset.name || "";

                selectedPrice =
                    Number(
                        button.dataset.price
                    );


                const commissionAmount =
                    selectedPrice *
                    COMMISSION /
                    100;


                const sellerAmount =
                    selectedPrice -
                    commissionAmount;


                const summary =
                    getElement("summary");


                if (summary) {

                    summary.innerHTML =

                        "<strong>" +
                        selectedName +
                        "</strong><br><br>" +

                        "Order Price: ₹" +
                        selectedPrice.toFixed(2) +

                        "<br>Gill Market 30%: ₹" +
                        commissionAmount.toFixed(2) +

                        "<br>Seller 70%: ₹" +
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
    getElement("submitOrder");

if (submitOrder) {

    submitOrder.addEventListener(
        "click",
        async function () {

            const customerName =
                getElement("customerName")
                    ?.value
                    .trim();

            const customerEmail =
                getElement("customerEmail")
                    ?.value
                    .trim();

            const details =
                getElement("details")
                    ?.value
                    .trim();


            if (
                !customerName ||
                !customerEmail ||
                !details
            ) {

                showMessage(
                    "Please fill all order details."
                );

                return;

            }


            if (
                !selectedName ||
                !selectedPrice
            ) {

                showMessage(
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

                service_name:
                    selectedName,

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
                    "pending"

            };


            /* =========================
               SAVE TO SUPABASE
               ========================= */

            if (supabaseClient) {

                submitOrder.disabled = true;

                submitOrder.textContent =
                    "Saving...";


                const {
                    error
                } =
                    await supabaseClient
                        .from("orders")
                        .insert([order]);


                submitOrder.disabled = false;

                submitOrder.textContent =
                    "Submit Order";


                if (error) {

                    console.error(
                        "Supabase order error:",
                        error
                    );


                    showMessage(
                        "Order database में save नहीं हुआ.\n\n" +
                        error.message
                    );

                    return;

                }

            }


            /* =========================
               LOCAL BACKUP
               ========================= */

            const oldOrders =
                JSON.parse(
                    localStorage.getItem(
                        "gillMarketOrders"
                    ) || "[]"
                );


            const localOrder = {

                id:
                    "GM-" +
                    Date.now(),

                ...order,

                created_at:
                    new Date().toISOString()

            };


            oldOrders.push(
                localOrder
            );


            localStorage.setItem(
                "gillMarketOrders",
                JSON.stringify(
                    oldOrders
                )
            );


            showMessage(

                "Order submitted successfully! 🎉" +

                "\n\nOrder ID: " +
                localOrder.id +

                "\nService: " +
                selectedName +

                "\nPrice: ₹" +
                selectedPrice +

                "\nGill Market 30%: ₹" +
                commissionAmount.toFixed(2) +

                "\nSeller 70%: ₹" +
                sellerAmount.toFixed(2)

            );


            closeModal(
                "orderModal"
            );


            /* Clear form */

            getElement(
                "customerName"
            ).value = "";

            getElement(
                "customerEmail"
            ).value = "";

            getElement(
                "details"
            ).value = "";

        }
    );

}


/* =========================
   SUBMIT SELLER SERVICE
   ========================= */

const submitSeller =
    getElement("submitSeller");

if (submitSeller) {

    submitSeller.addEventListener(
        "click",
        async function () {

            const sellerName =
                getElement("sellerName")
                    ?.value
                    .trim();

            const sellerService =
                getElement("sellerService")
                    ?.value
                    .trim();

            const sellerPrice =
                Number(
                    getElement("sellerPrice")
                        ?.value
                );

            const sellerDescription =
                getElement(
                    "sellerDescription"
                )
                ?.value
                .trim();


            if (
                !sellerName ||
                !sellerService ||
                !sellerPrice ||
                !sellerDescription
            ) {

                showMessage(
                    "Please fill all service details."
                );

                return;

            }


            const serviceData = {

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

                status:
                    "pending"

            };


            /* =========================
               SAVE SERVICE TO SUPABASE
               ========================= */

            if (supabaseClient) {

                submitSeller.disabled = true;

                submitSeller.textContent =
                    "Saving...";


                const {
                    data,
                    error
                } =
                    await supabaseClient
                        .from("services")
                        .insert([
                            serviceData
                        ])
                        .select();


                submitSeller.disabled = false;

                submitSeller.textContent =
                    "Submit Service";


                if (error) {

                    console.error(
                        "Supabase service error:",
                        error
                    );


                    showMessage(
                        "Service database में save नहीं हुई.\n\n" +
                        error.message
                    );

                    return;

                }

            }


            /* =========================
               LOCAL BACKUP
               ========================= */

            const oldServices =
                JSON.parse(
                    localStorage.getItem(
                        "gillMarketServices"
                    ) || "[]"
                );


            const localService = {

                id:
                    "SERVICE-" +
                    Date.now(),

                ...serviceData,

                created_at:
                    new Date().toISOString()

            };


            oldServices.push(
                localService
            );


            localStorage.setItem(
                "gillMarketServices",
                JSON.stringify(
                    oldServices
                )
            );


            showMessage(

                "Your service was submitted successfully! 🎉" +

                "\n\nService: " +
                sellerService +

                "\nPrice: ₹" +
                sellerPrice +

                "\nGill Market commission: " +
                COMMISSION +
                "%"

            );


            closeModal(
                "sellerModal"
            );


            /* Clear form */

            getElement(
                "sellerName"
            ).value = "";

            getElement(
                "sellerService"
            ).value = "";

            getElement(
                "sellerPrice"
            ).value = "";

            getElement(
                "sellerDescription"
            ).value = "";

        }
    );

}


/* =========================
   LOAD SERVICES FROM SUPABASE
   ========================= */

async function loadServices() {

    if (!supabaseClient) {

        console.log(
            "Supabase key not added yet."
        );

        return;

    }


    const {
        data,
        error
    } =
        await supabaseClient
            .from("services")
            .select("*")
            .order(
                "id",
                {
                    ascending: false
                }
            );


    if (error) {

        console.error(
            "Could not load services:",
            error
        );

        return;

    }


    console.log(
        "Gill Market services:",
        data
    );

}


/* =========================
   START
   ========================= */

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadServices();

        console.log(
            "Gill Market loaded successfully."
        );

    }
);

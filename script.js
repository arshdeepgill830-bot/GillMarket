/* =====================================================
   GILL MARKET
   Final working JavaScript
   Commission: 30%
   ===================================================== */


/* =========================
   SUPABASE CONFIG
========================= */

const SUPABASE_URL =
    "https://sbdadnfeutymqoelaydo.supabase.co";

const SUPABASE_PUBLISHABLE_KEY =
    "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY";


/* =========================
   SUPABASE CLIENT
========================= */

let supabaseClient = null;

if (
    window.supabase &&
    SUPABASE_PUBLISHABLE_KEY !==
    "PASTE_YOUR_SUPABASE_PUBLISHABLE_KEY"
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
   HELPERS
========================= */

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


/* =========================
   MOBILE MENU
========================= */

const menuBtn = $("menuBtn");
const nav = $("nav");

if (menuBtn && nav) {

    menuBtn.addEventListener("click", () => {
        nav.classList.toggle("open");
    });

}


if (nav) {

    nav.querySelectorAll("a").forEach(link => {

        link.addEventListener("click", () => {
            nav.classList.remove("open");
        });

    });

}


/* =========================
   FIND SERVICE
========================= */

const findBtn = $("findBtn");

if (findBtn) {

    findBtn.addEventListener("click", () => {

        const services = $("services");

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

const loginBtn = $("loginBtn");

if (loginBtn) {

    loginBtn.addEventListener("click", () => {
        openModal("loginModal");
    });

}


const continueBtn = $("continueBtn");

if (continueBtn) {

    continueBtn.addEventListener("click", () => {

        const name =
            $("loginName")?.value.trim();

        const email =
            $("loginEmail")?.value.trim();


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
            "Welcome to GillMarket, " +
            name +
            "! 🎉"
        );


        closeModal("loginModal");

    });

}


/* =========================
   SELLER
========================= */

function openSeller() {
    openModal("sellerModal");
}


const sellBtn = $("sellBtn");

if (sellBtn) {

    sellBtn.addEventListener(
        "click",
        openSeller
    );

}


const sellHeroBtn = $("sellHeroBtn");

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
    .forEach(button => {

        button.addEventListener("click", () => {

            const id =
                button.getAttribute("data-close");

            closeModal(id);

        });

    });


/* =========================
   CLOSE MODAL
   CLICK OUTSIDE
========================= */

document
    .querySelectorAll(".modal")
    .forEach(modal => {

        modal.addEventListener("click", event => {

            if (event.target === modal) {

                modal.classList.remove("show");

            }

        });

    });


/* =========================
   ORDER BUTTONS
========================= */

document
    .querySelectorAll(".order")
    .forEach(button => {

        button.addEventListener("click", () => {

            selectedName =
                button.dataset.name || "";

            selectedPrice =
                Number(button.dataset.price) || 0;


            if (!selectedName || !selectedPrice) {

                showMessage(
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


            const summary = $("summary");

            if (summary) {

                summary.innerHTML = `
                    <strong>${selectedName}</strong>
                    <br><br>
                    Order Price:
                    ₹${selectedPrice.toFixed(2)}
                    <br>
                    GillMarket 30%:
                    ₹${commissionAmount.toFixed(2)}
                    <br>
                    Seller 70%:
                    ₹${sellerAmount.toFixed(2)}
                `;

            }


            openModal("orderModal");

        });

    });


/* =========================
   SUBMIT ORDER
========================= */

const submitOrder = $("submitOrder");

if (submitOrder) {

    submitOrder.addEventListener(
        "click",
        async () => {

            const customerName =
                $("customerName")?.value.trim();

            const customerEmail =
                $("customerEmail")?.value.trim();

            const details =
                $("details")?.value.trim();


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


            if (!selectedName || !selectedPrice) {

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


            /* =====================
               SUPABASE SAVE
            ===================== */

            if (supabaseClient) {

                submitOrder.disabled = true;

                submitOrder.textContent =
                    "Saving...";


                const result =
                    await supabaseClient
                        .from("orders")
                        .insert([order]);


                submitOrder.disabled = false;

                submitOrder.textContent =
                    "Submit Order";


                if (result.error) {

                    console.error(
                        result.error
                    );

                    showMessage(
                        "Supabase order save failed:\n\n" +
                        result.error.message
                    );

                    return;
                }

            }


            /* =====================
               LOCAL BACKUP
            ===================== */

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


            oldOrders.push(localOrder);


            localStorage.setItem(
                "gillMarketOrders",
                JSON.stringify(oldOrders)
            );


            showMessage(
                "Order successfully submitted! 🎉" +
                "\n\nOrder ID: " +
                localOrder.id +
                "\nService: " +
                selectedName +
                "\nPrice: ₹" +
                selectedPrice +
                "\nGillMarket 30%: ₹" +
                commissionAmount.toFixed(2) +
                "\nSeller 70%: ₹" +
                sellerAmount.toFixed(2)
            );


            closeModal("orderModal");


            $("customerName").value = "";
            $("customerEmail").value = "";
            $("details").value = "";

        }
    );

}


/* =========================
   SUBMIT SELLER SERVICE
========================= */

const submitSeller = $("submitSeller");

if (submitSeller) {

    submitSeller.addEventListener(
        "click",
        async () => {

            const sellerName =
                $("sellerName")?.value.trim();

            const sellerService =
                $("sellerService")?.value.trim();

            const sellerPrice =
                Number(
                    $("sellerPrice")?.value
                );

            const sellerDescription =
                $("sellerDescription")
                    ?.value.trim();


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


            /* =====================
               SUPABASE SAVE
            ===================== */

            if (supabaseClient) {

                submitSeller.disabled = true;

                submitSeller.textContent =
                    "Saving...";


                const result =
                    await supabaseClient
                        .from("services")
                        .insert([serviceData]);


                submitSeller.disabled = false;

                submitSeller.textContent =
                    "Submit Service";


                if (result.error) {

                    console.error(
                        result.error
                    );

                    showMessage(
                        "Supabase service save failed:\n\n" +
                        result.error.message
                    );

                    return;
                }

            }


            /* =====================
               LOCAL BACKUP
            ===================== */

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


            oldServices.push(localService);


            localStorage.setItem(
                "gillMarketServices",
                JSON.stringify(oldServices)
            );


            showMessage(
                "Your service was submitted successfully! 🎉" +
                "\n\nService: " +
                sellerService +
                "\nPrice: ₹" +
                sellerPrice +
                "\nCommission: " +
                COMMISSION +
                "%"
            );


            closeModal("sellerModal");


            $("sellerName").value = "";
            $("sellerService").value = "";
            $("sellerPrice").value = "";
            $("sellerDescription").value = "";

        }
    );

}


/* =========================
   LOAD SERVICES
========================= */

async function loadServices() {

    if (!supabaseClient) {

        console.log(
            "Supabase is not connected yet."
        );

        return;
    }


    const result =
        await supabaseClient
            .from("services")
            .select("*")
            .order(
                "created_at",
                {
                    ascending: false
                }
            );


    if (result.error) {

        console.error(
            "Could not load services:",
            result.error
        );

        return;
    }


    console.log(
        "GillMarket services:",
        result.data
    );

}


/* =========================
   START
========================= */

document.addEventListener(
    "DOMContentLoaded",
    () => {

        loadServices();

        console.log(
            "GillMarket loaded successfully."
        );

    }
);
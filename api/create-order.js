// =====================================================
// GillMarket
// /api/create-order.js
// Creates a Razorpay Order from a Supabase order
// =====================================================

export default async function handler(req, res) {

    // Only POST is allowed
    if (req.method !== "POST") {
        return res.status(405).json({
            success: false,
            message: "Method not allowed"
        });
    }

    try {

        const {
            order_id
        } = req.body || {};

        if (!order_id) {
            return res.status(400).json({
                success: false,
                message: "order_id is required"
            });
        }


        // -------------------------------------------------
        // Environment variables
        // -------------------------------------------------

        const supabaseUrl =
            process.env.SUPABASE_URL;

        const supabaseServiceKey =
            process.env.SUPABASE_SERVICE_ROLE_KEY;

        const razorpayKeyId =
            process.env.RAZORPAY_KEY_ID;

        const razorpayKeySecret =
            process.env.RAZORPAY_KEY_SECRET;


        if (
            !supabaseUrl ||
            !supabaseServiceKey ||
            !razorpayKeyId ||
            !razorpayKeySecret
        ) {

            console.error(
                "Missing server environment variables"
            );

            return res.status(500).json({
                success: false,
                message:
                    "Payment server configuration incomplete"
            });

        }


        // -------------------------------------------------
        // Get order from Supabase
        // -------------------------------------------------

        const supabaseResponse =
            await fetch(
                `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order_id)}&select=*`,
                {
                    method: "GET",

                    headers: {
                        "apikey":
                            supabaseServiceKey,

                        "Authorization":
                            `Bearer ${supabaseServiceKey}`
                    }
                }
            );


        if (!supabaseResponse.ok) {

            const errorText =
                await supabaseResponse.text();

            console.error(
                "Supabase fetch error:",
                errorText
            );

            return res.status(500).json({
                success: false,
                message:
                    "Could not read order from Supabase"
            });

        }


        const orders =
            await supabaseResponse.json();


        if (
            !Array.isArray(orders) ||
            orders.length === 0
        ) {

            return res.status(404).json({
                success: false,
                message: "Order not found"
            });

        }


        const order =
            orders[0];


        // -------------------------------------------------
        // Validate order
        // -------------------------------------------------

        const amount =
            Number(order.amount);


        if (
            !Number.isFinite(amount) ||
            amount <= 0
        ) {

            return res.status(400).json({
                success: false,
                message: "Invalid order amount"
            });

        }


        if (
            order.payment_status === "paid"
        ) {

            return res.status(400).json({
                success: false,
                message:
                    "This order is already paid"
            });

        }


        // -------------------------------------------------
        // Convert INR to paise
        // ₹149 = 14900 paise
        // -------------------------------------------------

        const amountInPaise =
            Math.round(amount * 100);


        // -------------------------------------------------
        // Create Razorpay Order
        // -------------------------------------------------

        const razorpayAuth =
            Buffer
                .from(
                    `${razorpayKeyId}:${razorpayKeySecret}`
                )
                .toString("base64");


        const razorpayResponse =
            await fetch(
                "https://api.razorpay.com/v1/orders",
                {

                    method: "POST",

                    headers: {

                        "Content-Type":
                            "application/json",

                        "Authorization":
                            `Basic ${razorpayAuth}`

                    },

                    body: JSON.stringify({

                        amount:
                            amountInPaise,

                        currency:
                            "INR",

                        receipt:
                            `gm_${order.id}`,

                        notes: {

                            gillmarket_order_id:
                                String(order.id),

                            service:
                                String(
                                    order.service_name ||
                                    ""
                                )

                        }

                    })

                }
            );


        const razorpayData =
            await razorpayResponse.json();


        if (!razorpayResponse.ok) {

            console.error(
                "Razorpay error:",
                razorpayData
            );

            return res.status(
                razorpayResponse.status
            ).json({

                success: false,

                message:
                    razorpayData.error?.description ||
                    "Razorpay order creation failed"

            });

        }


        // -------------------------------------------------
        // Save Razorpay Order ID in Supabase
        // -------------------------------------------------

        const updateResponse =
            await fetch(
                `${supabaseUrl}/rest/v1/orders?id=eq.${encodeURIComponent(order.id)}`,
                {

                    method: "PATCH",

                    headers: {

                        "apikey":
                            supabaseServiceKey,

                        "Authorization":
                            `Bearer ${supabaseServiceKey}`,

                        "Content-Type":
                            "application/json",

                        "Prefer":
                            "return=minimal"

                    },

                    body: JSON.stringify({

                        razorpay_order_id:
                            razorpayData.id

                    })

                }
            );


        if (!updateResponse.ok) {

            const updateError =
                await updateResponse.text();

            console.error(
                "Supabase update error:",
                updateError
            );

            return res.status(500).json({
                success: false,
                message:
                    "Razorpay order created but database update failed"
            });

        }


        // -------------------------------------------------
        // Return only safe information to browser
        // -------------------------------------------------

        return res.status(200).json({

            success: true,

            id:
                razorpayData.id,

            amount:
                razorpayData.amount,

            currency:
                razorpayData.currency

        });


    } catch (error) {

        console.error(
            "create-order error:",
            error
        );

        return res.status(500).json({

            success: false,

            message:
                "Internal server error"

        });

    }

}
"use strict";

const Razorpay = require("razorpay");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
});

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {

    const { order_id } = req.body || {};

    if (!order_id) {
      return res.status(400).json({
        message: "order_id is required"
      });
    }

    const { data: order, error } =
      await supabase
        .from("orders")
        .select("id, amount, status, payment_status")
        .eq("id", order_id)
        .single();

    if (error || !order) {
      return res.status(404).json({
        message: "Order not found"
      });
    }

    if (order.payment_status === "paid") {
      return res.status(400).json({
        message: "Order already paid"
      });
    }

    const amount = Number(order.amount);

    if (!Number.isFinite(amount) || amount <= 0) {
      return res.status(400).json({
        message: "Invalid order amount"
      });
    }

    const razorpayOrder =
      await razorpay.orders.create({

        amount: Math.round(amount * 100),

        currency: "INR",

        receipt:
          "GM_" +
          String(order.id).slice(0, 20),

        notes: {
          gillmarket_order_id:
            String(order.id)
        }

      });

    return res.status(200).json({

      id:
        razorpayOrder.id,

      amount:
        razorpayOrder.amount,

      currency:
        razorpayOrder.currency

    });

  } catch (error) {

    console.error(
      "Create Razorpay order error:",
      error
    );

    return res.status(500).json({
      message:
        error.message ||
        "Unable to create payment order"
    });

  }

};
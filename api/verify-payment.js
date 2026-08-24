"use strict";

const crypto = require("crypto");
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({
      message: "Method not allowed"
    });
  }

  try {

    const {
      gillmarket_order_id,
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature
    } = req.body || {};

    if (
      !gillmarket_order_id ||
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      return res.status(400).json({
        verified: false,
        message: "Payment data incomplete"
      });
    }

    /* =========================
       GET ORDER
    ========================= */

    const { data: order, error } =
      await supabase
        .from("orders")
        .select(
          "id, amount, payment_status, razorpay_order_id"
        )
        .eq("id", gillmarket_order_id)
        .single();

    if (error || !order) {
      return res.status(404).json({
        verified: false,
        message: "GillMarket order not found"
      });
    }

    /* =========================
       PREVENT DUPLICATE PAYMENT
    ========================= */

    if (
      order.payment_status === "paid"
    ) {
      return res.status(200).json({
        verified: true,
        message: "Order already paid"
      });
    }

    /* =========================
       CHECK RAZORPAY ORDER
    ========================= */

    if (
      order.razorpay_order_id &&
      order.razorpay_order_id !==
        razorpay_order_id
    ) {
      return res.status(400).json({
        verified: false,
        message: "Razorpay order mismatch"
      });
    }

    /* =========================
       VERIFY SIGNATURE
    ========================= */

    const body =
      razorpay_order_id +
      "|" +
      razorpay_payment_id;

    const expectedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(body)
        .digest("hex");

    const received =
      Buffer.from(
        razorpay_signature,
        "utf8"
      );

    const expected =
      Buffer.from(
        expectedSignature,
        "utf8"
      );

    if (
      received.length !==
      expected.length
    ) {
      return res.status(400).json({
        verified: false,
        message: "Invalid payment signature"
      });
    }

    if (
      !crypto.timingSafeEqual(
        received,
        expected
      )
    ) {
      return res.status(400).json({
        verified: false,
        message: "Invalid payment signature"
      });
    }

    /* =========================
       PAYMENT VERIFIED
    ========================= */

    const { data: updatedOrder, error: updateError } =
      await supabase
        .from("orders")
        .update({

          payment_status:
            "paid",

          status:
            "paid",

          razorpay_order_id:
            razorpay_order_id,

          razorpay_payment_id:
            razorpay_payment_id,

          payment_verified:
            true,

          paid_at:
            new Date().toISOString(),

          commission_amount:
            Number(
              (
                Number(order.amount) *
                30 /
                100
              ).toFixed(2)
            ),

          seller_amount:
            Number(
              (
                Number(order.amount) *
                70 /
                100
              ).toFixed(2)
            )

        })
        .eq(
          "id",
          gillmarket_order_id
        )
        .select()
        .single();

    if (updateError) {

      console.error(
        "Supabase update error:",
        updateError
      );

      return res.status(500).json({
        verified: false,
        message:
          "Payment verified but order update failed"
      });

    }

    return res.status(200).json({

      verified:
        true,

      message:
        "Payment verified successfully",

      order_id:
        updatedOrder.id

    });

  } catch (error) {

    console.error(
      "Verify payment error:",
      error
    );

    return res.status(500).json({

      verified:
        false,

      message:
        error.message ||
        "Payment verification failed"

    });

  }

};
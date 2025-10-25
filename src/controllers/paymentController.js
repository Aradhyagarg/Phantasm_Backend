const Razorpay = require('razorpay');
const crypto = require('crypto');
const Order = require('../models/Order');

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

exports.createRazorpayOrder = async (req, res) => {
    try {
        const order = await Order.findById(req.params.orderId);
        if (!order) return res.status(404).json({ message: 'Order not found' });

        if (order.status !== 'PAYMENT_PENDING') {
            return res.status(400).json({ message: 'Order already paid or cancelled' });
        }

        const options = {
            amount: Math.round(order.total * 100), 
            currency: 'INR',
            receipt: order._id.toString(),
            payment_capture: 1
        };

        const rzpOrder = await razorpay.orders.create(options);

        order.razorpay_order_id = rzpOrder.id;
        await order.save();

        res.json({
            orderId: order._id,
            razorpayOrderId: rzpOrder.id,
            amount: rzpOrder.amount,
            currency: rzpOrder.currency
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
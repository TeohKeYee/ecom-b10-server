const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Order = require("../models/Order");
const auth = require("../middleware/auth");

//GET YOUR OWN ORDERS
router.get("/", auth, async (req, res) => {
  try {
    let orders = await Order.find({ user: req.user._id });
    if (!orders) return res.json({ msg: "Order is empty" });
    return res.json(orders);
  } catch (e) {
    return res.json({ error: e.message });
  }
});

//GET ALL USERS ORDERS (ADMIN ONLY)
router.get("/all", auth, async (req, res) => {
  try {
    if (!req.user.isAdmin) return res.json({ msg: "Not allowed" });
    let orders = await Order.find();
    if (!orders) return res.json({ msg: "Order is empty" });
    return res.json(orders);
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

//CREATE/ADD ORDER
router.post("/", auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    console.log(cart);
    if (cart) {
        let myOrder = await Order.create({
            user: req.user._id,
            items: cart.items,
            total: cart.total,
        });
        
        await myOrder.save();
        //then empty the cart
        await Cart.findByIdAndDelete(cart._id);
        console.log("myOrder");
        return res.status(200).json({ msg: "Checkout successfully" });
    } else {
        return res.json({ msg: "Your cart is empty" });
    }
  } catch (e) {
    return res.status(400).json({ error: e.message });
  }
});

module.exports = router;

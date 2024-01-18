const express = require("express");
const router = express.Router();
const Cart = require("../models/Cart");
const Product = require("../models/Product");
const auth = require("../middleware/auth");

//GET CART localhost:8000/carts/
router.get("/", auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id }).populate("items.product");

        if (!cart || !cart.items.length) return res.json({ msg: "Your cart is empty" });

        return res.json(cart);
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
});

//ADD TO CART
router.post("/", auth, async (req, res) => {
    try {
        if (req.user.isAdmin) return res.json({ msg: "You're not allowed to shop" });
        const { productId, quantity } = req.body;
        const product = await Product.findById(productId);
        const cart = await Cart.findOne({ user: req.user._id });

        if (quantity > product.quantity) {
            return res.json({ msg: "Cannot exceed quantity available" });
        }

        //IF CART IS EMPTY
        if (cart === null) {
            const myCart = await Cart.create({
                user: req.user._id,
                items: [
                    {
                        product: productId,
                        quantity,
                        subtotal: parseFloat(product.price) * parseInt(quantity),
                    },
                ],
                total: parseFloat(product.price) * parseInt(quantity),
            });
            await myCart.save();
            return res.json({ msg: "Product added to cart successfully", cart: myCart });
        }

        if (cart) {
            const foundItem = cart.items.find((item) => item.product._id == productId);
            if (foundItem) {
                foundItem.quantity += quantity;
                if (foundItem.quantity > product.quantity) {
                    return res.json({ msg: "Cannot exceed available quantity" });
                }
                foundItem.subtotal = foundItem.quantity * product.price;
                let total = 0;
                cart.items.map((p) => (total += p.subtotal));
                cart.total = total;
            } else {
                cart.items.push({
                    product: productId,
                    quantity,
                    subtotal: product.price * quantity,
                });
                cart.total += product.price * quantity;
            }
            await cart.save();
            return res.json({ msg: "Added to cart successfully", cart });
        }
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
});

//DELETE A SINGLE ITEM INSIDE THE CART
router.delete("/:id", auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });

        cart.items = cart.items.filter((item) => item.product._id != req.params.id);
        let total = 0;
        cart.items.map((p) => (total += p.subtotal));
        cart.total = total;
        await cart.save();
        return res.json({ msg: "Cart item deleted", cart });
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
});

//EMPTY CART
router.delete("/", auth, async (req, res) => {
    try {
        let cart = await Cart.findOne({ user: req.user._id });
        if (!cart) return res.json({ msg: "Cart doesn't exist" });
        await Cart.findOneAndDelete({ user: req.user._id });
        return res.json({ msg: "Cart deleted successfully" });
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
});
module.exports = router;

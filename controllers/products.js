const express = require("express");
const router = express.Router();
const Product = require("../models/Product");
const auth = require("../middleware/auth");
const fs = require("fs"); //allows you to read and write on the file system
const path = require("path"); //allows you to change directories
const multer = require("multer"); //handle file upload

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, "./public");
    }, //where to save the images
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    }, //format the filename before storing it
});

const upload = multer({ storage });

router.post("/", auth, upload.single("image"), async (req, res) => {
    try {
        if (!req.user.isAdmin) return res.status(400).json({ msg: "This action is not allowed" });
        
        let product = new Product(req.body);
        if (req.file) product.image = req.file.filename;
        product.save();
        return res.json({ product, msg: "Product added successfully" });
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
});

//GET ALL PRODUCTS
router.get("/", async (req, res) => {
    try {
        const products = await Product.find();
        return res.json(products);
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
});

//GET PRODUCT BY ID
router.get("/:id", async (req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        return res.json(product);
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
});

//DELETE A PRODUCT
router.delete("/:id", auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) return res.status(401).json({ msg: "You are not allowed to delete this product" });

        const product = await Product.findById(req.params.id);
        if (product.image) {
            const filename = product.image;
            const filepath = path.join(__dirname, "../public/" + filename);
            fs.unlinkSync(filepath);
        }
        await Product.findByIdAndDelete(req.params.id);
        return res.json({ msg: "Product successfully deleted" });
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
});

//UPDATE A PRODUCT
router.put("/:id", auth, upload.single("image"), async (req, res) => {
    try {
        if (!req.user.isAdmin) return res.status(401).json({ msg: "You are not allowed to update this product" });

        let product = await Product.findById(req.params.id);

        if (req.file && product.image) {
            const filename = product.image;
            const filepath = path.join(__dirname, "../public/" + filename);
            fs.unlinkSync(filepath);
        }

        let updated = await Product.findByIdAndUpdate(
            req.params.id,
            {
                ...req.body,
                image: req.file ? req.file.filename : product.image,
            },
            { new: true }
        );

        return res.json({ msg: "Product has been updated", product: updated });
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
});

router.patch("/:id", auth, async (req, res) => {
    try {
        if (!req.user.isAdmin) return res.json({ msg: "Action not allowed", status: 400 });
        let product = await Product.findById(req.params.id);
        if (!product) return res.json({ msg: "Product doesn't exist", status: 400 });

        await Product.findByIdAndUpdate(req.params.id, { ...product, isActive: !product.isActive });
        return res.json({ msg: "Product status has been updated." });
    } catch (e) {
        return res.status(400).json({ error: e.message });
    }
});

module.exports = router;

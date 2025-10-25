const { validationResult } = require("express-validator");
const Product = require("../models/Product");
const Brand = require("../models/Brand");
const Category = require("../models/Category");
const Store = require("../models/Store");
const mongoose = require("mongoose");
const cloudinary = require("../config/cloudinary");

exports.createProduct = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(400).json({ errors: errors.array() });

  try {
    const {
      name,
      sku,
      description,
      price,
      status,
      brand: brandId,
      categories: categoryIds,
      stores: storeIds,
    } = req.body;
    const createdBy = req.user._id;

    const brand = await Brand.findOne({ _id: brandId, createdBy });
    if (!brand)
      return res
        .status(400)
        .json({ message: "Brand not found or not in your account" });

    // Categories validation
    const cats = await Category.find({ _id: { $in: categoryIds } });
    if (cats.length !== categoryIds.length)
      return res
        .status(400)
        .json({ message: "One or more categories not found" });
    const invalidCat = cats.find((c) => !c.createdBy.equals(createdBy));
    if (invalidCat)
      return res
        .status(403)
        .json({ message: "Category not in your account scope" });

    let stores = [];
    if (storeIds && storeIds.length) {
      stores = await Store.find({ _id: { $in: storeIds }, account: createdBy });
      if (stores.length !== storeIds.length)
        return res
          .status(400)
          .json({
            message: "One or more stores not found or not in your account",
          });
    }

    const images = [];
    if (req.files && req.files.length) {
      for (const file of req.files) {
        const result = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            { folder: "ecommerce_products" },
            (error, res) => {
              if (error) reject(error);
              else resolve(res);
            }
          );
          stream.end(file.buffer);
        });
        images.push(result.secure_url);
      }
    }

    const product = await Product.create({
      name,
      sku,
      description,
      price,
      status: status || "active",
      images,
      brand: brand._id,
      categories: categoryIds,
      stores: stores.map((s) => s._id),
      createdBy,
    });

    res.status(201).json({ message: "Product created", product });
  } catch (err) {
    if (err.code === 11000)
      return res
        .status(400)
        .json({ message: "Duplicate SKU for this account" });
    res.status(500).json({ message: err.message });
  }
};

exports.getAllProducts = async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;
    const search = req.query.search || "";
    const store_id = req.query.store_id;
    const brand_id = req.query.brand_id;
    const category_id = req.query.category_id;

    const filter = { status: "active" };
    if (search) filter.name = { $regex: search, $options: "i" };
    if (store_id) filter.stores = mongoose.Types.ObjectId(store_id);
    if (brand_id) filter.brand = mongoose.Types.ObjectId(brand_id);
    if (category_id) filter.categories = mongoose.Types.ObjectId(category_id);

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("brand", "name")
        .populate("categories", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("brand", "name")
      .populate("categories", "name");
    if (!product) return res.status(404).json({ message: "Product not found" });
    res.json({ product });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getProductsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 10);
    const skip = (page - 1) * limit;

    const filter = { categories: categoryId, status: "active" };

    const [products, total] = await Promise.all([
      Product.find(filter)
        .populate("brand", "name")
        .populate("categories", "name")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Product.countDocuments(filter),
    ]);

    res.json({
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

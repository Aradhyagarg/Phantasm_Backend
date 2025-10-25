const Store = require('../models/Store');
const { validationResult } = require('express-validator');

exports.createStore = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, code, contact, address, latitude, longitude } = req.body;
    const account = req.user._id;

    const store = await Store.create({
      name, code, contact, address,
      location: { type: 'Point', coordinates: [parseFloat(longitude), parseFloat(latitude)] },
      account
    });

    res.status(201).json({ message: 'Store created', store });
  } catch (err) {
    if (err.code === 11000) return res.status(400).json({ message: 'Store code must be unique' });
    res.status(500).json({ message: err.message });
  }
};

exports.getAllStores = async (req, res) => {
  try {
    const filter = req.query.account ? { account: req.query.account } : {};
    const stores = await Store.find(filter).sort({ createdAt: -1 });
    res.json({ count: stores.length, stores });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.getStoreById = async (req, res) => {
  try {
    const store = await Store.findById(req.params.id);
    if (!store) return res.status(404).json({ message: 'Store not found' });
    res.json({ store });
  } catch (err) { res.status(500).json({ message: err.message }); }
};

exports.nearbyStores = async (req, res) => {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    if (Number.isNaN(lat) || Number.isNaN(lng)) return res.status(400).json({ message: 'lat and lng query params required' });

    const maxDistance = parseInt(req.query.radius) || 5000;

    const stores = await Store.aggregate([
      {
        $geoNear: {
          near: { type: "Point", coordinates: [lng, lat] },
          distanceField: "dist.calculated",
          spherical: true,
          maxDistance
        }
      },
      {
        $addFields: { distance_km: { $divide: ["$dist.calculated", 1000] } }
      },
      { $sort: { "dist.calculated": 1 } }
    ]);

    res.json({ count: stores.length, stores });
  } catch (err) { res.status(500).json({ message: err.message }); }
};
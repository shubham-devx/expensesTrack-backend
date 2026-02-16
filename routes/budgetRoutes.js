const express = require("express");
const Budget = require("../models/Budget");
const auth = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/set", auth, async (req, res) => {
  const { month, year, amount } = req.body;

  const existing = await Budget.findOne({
    userId: req.userId,
    month,
    year
  });

  if (existing) {
    existing.amount = amount;
    await existing.save();
  } else {
    await Budget.create({
      userId: req.userId,
      month,
      year,
      amount
    });
  }

  res.json({ message: "Budget saved" });
});

module.exports = router;
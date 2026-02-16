const express = require("express");
const Expense = require("../models/Expense");
const Budget = require("../models/Budget");
const auth = require("../middleware/authMiddleware");

const router = express.Router();


// ➜ Add Expense
router.post("/add", auth, async (req, res) => {
  try {
    const { title, amount, category } = req.body;

    if (!amount) {
      return res.status(400).json({
        message: "Amount is required"
      });
    }

    const expense = await Expense.create({
      userId: req.userId,
      title: title || "Expense",
      amount: Number(amount),
      category: category || "General"
    });

    res.json({
      message: "Expense added successfully",
      expense
    });

  } catch (error) {
    console.error("Add expense error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ➜ Get Monthly Summary + Warning
router.get("/summary", auth, async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required"
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startDate, $lt: endDate }
    });

    const totalSpent = expenses.reduce(
      (sum, e) => sum + e.amount,
      0
    );

    const budget = await Budget.findOne({
      userId: req.userId,
      month: Number(month),
      year: Number(year)
    });

    const budgetAmount = budget ? budget.amount : 0;

    const percentage = budgetAmount
      ? (totalSpent / budgetAmount) * 100
      : 0;

    let warning = "Safe";

    if (percentage >= 90) warning = "Red Alert 🚨";
    else if (percentage >= 80) warning = "High Warning ⚠️";
    else if (percentage >= 70) warning = "Warning";

    res.json({
      totalSpent,
      budget: budgetAmount,
      remaining: budgetAmount - totalSpent,
      percentage: percentage.toFixed(2),
      warning
    });

  } catch (error) {
    console.error("Summary error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ➜ Get Monthly Expense List
router.get("/list", auth, async (req, res) => {
  try {
    const { month, year } = req.query;

    if (!month || !year) {
      return res.status(400).json({
        message: "Month and year are required"
      });
    }

    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const expenses = await Expense.find({
      userId: req.userId,
      date: { $gte: startDate, $lt: endDate }
    }).sort({ date: -1 });

    res.json(expenses);

  } catch (error) {
    console.error("List error:", error);
    res.status(500).json({ message: "Server error" });
  }
});


// ➜ Delete Expense (Secure)
router.delete("/delete/:id", auth, async (req, res) => {
  try {
    const expense = await Expense.findOne({
      _id: req.params.id,
      userId: req.userId
    });

    if (!expense) {
      return res.status(404).json({
        message: "Expense not found"
      });
    }

    await expense.deleteOne();

    res.json({
      message: "Expense deleted successfully"
    });

  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
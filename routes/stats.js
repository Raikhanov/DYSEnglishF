const express = require("express");
const router = express.Router();
const Purchase = require("../models/purchase");

// Получение количества купленных курсов пользователем
router.get("/user-purchases", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.status(401).json({ error: "User not authenticated" });
        }

        const userId = req.session.user.id;
        const count = await Purchase.countDocuments({ userId });

        res.json({ purchasedCourses: count });
    } catch (err) {
        console.error("Ошибка при получении количества покупок:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Распределение пользователей по купленным курсам
router.get("/course-distribution", async (req, res) => {
    try {
        const distribution = await Purchase.aggregate([
            { $group: { _id: "$courseName", count: { $sum: 1 } } }
        ]);

        res.json(distribution);
    } catch (err) {
        console.error("Ошибка при получении распределения курсов:", err);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Отображение профиля с данными о статистике
router.get("/profile", async (req, res) => {
    try {
        if (!req.session.user) {
            return res.redirect("/login"); // Если пользователь не авторизован, перенаправляем на логин
        }

        const userId = req.session.user.id;

        // Запрос количества купленных курсов
        const purchasedCoursesCount = await Purchase.countDocuments({ userId });

        // Запрос распределения пользователей по курсам
        const courseDistribution = await Purchase.aggregate([
            { $group: { _id: "$courseName", count: { $sum: 1 } } }
        ]);

        // Передаем данные в EJS-шаблон
        res.render("profile", {
            stats: {
                purchasedCourses: purchasedCoursesCount,
                courseDistribution: courseDistribution
            }
        });
    } catch (err) {
        console.error("Ошибка при загрузке профиля:", err);
        res.status(500).send("Ошибка сервера");
    }
});


module.exports = router;

const express = require("express");
const router = express.Router();
const Purchase = require("../models/purchase");
const session = require("express-session");

router.post("/buy", async (req, res) => {
    try {
        // Получаем userId из сессии
        const userId = req.session.user.id;

        // Получаем название курса из тела запроса
        const courseName = req.body.courseName;

        // Проверяем, что данные о пользователе и курс получены
        if (!userId || !courseName) {
            return res.status(400).send("Missing userId or courseName.");
        }

        // Цены на курсы
        const coursePrices = {
            "English Basic": 49,
            "English Intermediate": 79,
            "English Advanced": 99,
        };

        // Определяем цену выбранного курса
        const coursePrice = coursePrices[courseName];

        // Если курс не найден, возвращаем ошибку
        if (!coursePrice) {
            return res.status(400).send("Invalid course selected.");
        }

        // Создаем новый документ о покупке
        const purchase = new Purchase({
            userId,
            courseName,
            coursePrice,
        });

        // Сохраняем покупку в базе данных
        await purchase.save();

        // Отправляем успешный ответ
        res.render('paymentdone')
    } catch (err) {
        console.error("Error during purchase:", err);
        res.status(500).send("An error occurred.");
    }
});

module.exports = router;

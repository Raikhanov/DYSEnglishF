const express = require("express");
const router = express.Router();
const Quiz = require("../models/quiz");  // Убедитесь, что путь к модели правильный

router.post("/create-quiz", async (req, res) => {
    try {
        // Логирование данных, чтобы убедиться, что они приходят
        console.log(req.body); 

        const { title, question, options, correctAnswer } = req.body;

        if (!title || !question || !options || !correctAnswer) {
            return res.status(400).send("Missing required fields.");
        }

        // Подготовка вопросов
        const questions = question.map((q, index) => ({
            question: q,
            options: options.slice(index * 2, index * 2 + 2), // Опции для каждого вопроса
            correctAnswer: correctAnswer[index],
        }));

        // Создание викторины
        const quiz = new Quiz({
            title,
            questions,
        });

        await quiz.save();
        res.status(201).send("Quiz created successfully!");
    } catch (error) {
        console.error("Error creating quiz:", error);
        return res.status(500).send("An error occurred while creating the quiz.");
    }
});

module.exports = router;

const express = require('express');
const multer = require('multer');
const path = require('path');
const User = require('./user'); // Подключение модели пользователя
const router = express.Router();

// Настройка для загрузки аватаров
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/avatars'); // Папка для сохранения аватаров
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Уникальное имя файла
    },
});
const upload = multer({ storage: storage });

// Обработчик POST-запроса для обновления профиля
router.post('/profile/updateProfile', upload.single('avatar'), async (req, res) => {
    try {
        const userId = req.session.user.id; // Получаем ID пользователя из сессии
        const updatedData = {
            name: req.body.name,
            surname: req.body.surname,
            email: req.body.email,
            education: req.body.education,
            country: req.body.country,
            state: req.body.state,
        };

        // Если аватар загружен, добавляем путь к файлу
        if (req.file) {
            updatedData.avatar = req.file.path;
        }

        // Обновление данных пользователя в базе данных
        await User.updateOne({ _id: userId }, { $set: updatedData });

        res.redirect('/profile'); // Перенаправляем на страницу профиля
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).send("An error occurred while updating profile.");
    }
});

module.exports = router;

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    surname: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: { type: String }, // Путь к аватару
    education: { type: String },
    country: { type: String },
    state: { type: String },
    courses: [{ courseName: String, coursePrice: Number }], // Добавляем курсы
});

const User = mongoose.model('User', userSchema);

module.exports = User;
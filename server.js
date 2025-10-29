// --- ТЕСТОВАЯ ВЕРСИЯ SERVER.JS (ХРАНЕНИЕ В ПАМЯТИ) ---

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// --- ИЗМЕНЕНИЕ 1: Убрали работу с файлами, создали массив в памяти ---
let logs = []; // Все логи будут храниться здесь

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


// 1. Обработчик для ПРИЕМА данных
app.post('/log-data', (req, res) => {
    const newLogEntry = req.body;
    console.log('Получена новая запись:', newLogEntry);

    // --- ИЗМЕНЕНИЕ 2: Просто добавляем запись в массив, без записи в файл ---
    logs.unshift(newLogEntry);
    
    // Ограничиваем размер массива, чтобы не переполнить память
    if (logs.length > 100) {
        logs.pop();
    }
    
    res.status(200).send({ status: 'ok' });
});


// 2. Обработчик для ОТДАЧИ данных
app.get('/get-data', (req, res) => {
    // --- ИЗМЕНЕНИЕ 3: Просто отдаем массив, без чтения файла ---
    res.json(logs);
});


// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер успешно запущен и работает на порту ${PORT}`);
});

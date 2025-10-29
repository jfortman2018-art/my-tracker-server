const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Render предоставляет специальный путь для хранения данных, которые не удаляются при перезапуске
const LOG_DIR = process.env.RENDER_DISK_PATH || __dirname;
const LOG_FILE = path.join(LOG_DIR, 'log.json');

// --- Начальная проверка и создание файла логов при старте сервера ---
// Это гарантирует, что файл всегда существует перед тем, как мы попытаемся его прочитать
try {
    if (!fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, '[]', 'utf8');
        console.log('Файл log.json успешно создан.');
    } else {
        console.log('Файл log.json уже существует.');
    }
} catch (err) {
    console.error('Ошибка при инициализации лог-файла:', err);
}

app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));


// 1. Обработчик для ПРИЕМА данных
app.post('/log-data', (req, res) => {
    const newLogEntry = req.body;
    console.log('Получена новая запись:', newLogEntry);

    // Читаем файл асинхронно
    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка чтения лог-файла:', err);
            return res.status(500).send('Ошибка сервера при чтении лога');
        }

        let logs = [];
        try {
            logs = JSON.parse(data);
        } catch (parseErr) {
            console.error('Ошибка парсинга JSON, файл будет перезаписан:', parseErr);
            // Если файл поврежден, начинаем с чистого листа
        }

        logs.unshift(newLogEntry);

        // Записываем в файл асинхронно
        fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Ошибка записи в лог-файл:', writeErr);
                return res.status(500).send('Ошибка сервера при записи лога');
            }
            res.status(200).send({ status: 'ok' });
        });
    });
});


// 2. Обработчик для ОТДАЧИ данных
app.get('/get-data', (req, res) => {
    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Ошибка чтения лог-файла для отдачи:', err);
            return res.status(500).send('Ошибка сервера');
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});


// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер успешно запущен и работает на порту ${PORT}`);
});

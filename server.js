const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Render предоставляет специальный путь для хранения данных
// Используем его как основную директорию для логов
const LOG_DIR = process.env.RENDER_DISK_PATH || __dirname;
const LOG_FILE = path.join(LOG_DIR, 'log.json');

// --- Начальная проверка и создание файла логов ---
try {
    if (!fs.existsSync(LOG_DIR)) {
        // Если директория для данных не существует, создаем ее
        fs.mkdirSync(LOG_DIR, { recursive: true });
    }
    if (!fs.existsSync(LOG_FILE)) {
        fs.writeFileSync(LOG_FILE, '[]', 'utf8');
        console.log('log.json file successfully created.');
    } else {
        console.log('log.json file already exists.');
    }
} catch (err) {
    console.error('Error initializing log file:', err);
}

app.use(cors());
app.use(express.json());

// 1. Обработчик для ПРИЕМА данных
app.post('/log-data', (req, res) => {
    const newLogEntry = req.body;
    console.log('New entry received:', newLogEntry);
    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file:', err);
            return res.status(500).send('Server error while reading log');
        }
        let logs = [];
        try {
            logs = JSON.parse(data);
        } catch (parseErr) {
            console.error('Error parsing JSON, file will be overwritten:', parseErr);
        }
        logs.unshift(newLogEntry);
        fs.writeFile(LOG_FILE, JSON.stringify(logs, null, 2), (writeErr) => {
            if (writeErr) {
                console.error('Error writing to log file:', writeErr);
                return res.status(500).send('Server error while writing log');
            }
            res.status(200).send({ status: 'ok' });
        });
    });
});

// 2. Обработчик для ОТДАЧИ данных
app.get('/get-data', (req, res) => {
    fs.readFile(LOG_FILE, 'utf8', (err, data) => {
        if (err) {
            console.error('Error reading log file for delivery:', err);
            return res.status(500).send('Server error');
        }
        res.setHeader('Content-Type', 'application/json');
        res.send(data);
    });
});

// 3. Обработчик для очистки логов
app.get('/clear-logs-please', (req, res) => {
    fs.writeFile(LOG_FILE, '[]', 'utf8', (err) => {
        if (err) {
            console.error('Failed to clear log file:', err);
            return res.status(500).send('Error clearing log');
        }
        console.log('--- LOG FILE WAS SUCCESSFULLY CLEARED ---');
        res.status(200).send('<h1>Logs cleared successfully!</h1><p>You can now close this page.</p>');
    });
});

// 4. Отдача статичных файлов (index.html, dashboard.html и т.д.)
// Важно, чтобы это было в конце, после всех API-обработчиков
app.use(express.static(__dirname));

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Server is successfully running on port ${PORT}`);
});

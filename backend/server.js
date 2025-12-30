const express = require('express');
const path = require('path');
const fs = require('fs');
const archiver = require('archiver');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

// Конфигурация
const GAME_VERSION = '1.21.11'; 
const LOADER = 'fabric';

// Категории для группировки
// optimization, visuals, utility, core

const MODS_CONFIG = [
    // --- CORE (Библиотеки) ---
    { id: 'fabric_api', name: 'Fabric API', slug: 'fabric-api', category: 'core', required: true, deps: [] },
    { id: 'modmenu', name: 'Mod Menu', slug: 'modmenu', category: 'core', deps: ['fabric_api'] },
    { id: 'cloth_config', name: 'Cloth Config API', slug: 'cloth-config', category: 'core', description: 'Библиотека конфигов, нужна многим модам.', deps: ['fabric_api'] },
    { id: 'fabric_language_kotlin', name: 'Fabric Language Kotlin', slug: 'fabric-language-kotlin', category: 'core', description: 'Нужен для работы модов на Kotlin (например, Inv. Profiles).', deps: ['fabric_api'] },
    { id: 'indium', name: 'Indium', slug: 'indium', category: 'core', description: 'Аддон для Sodium, обеспечивающий совместимость с модами на рендеринг (Connected Textures и др).', deps: ['sodium', 'fabric_api'] },
    { id: 'reese_sodium_options', name: 'Reese\'s Sodium Options', slug: 'reeses-sodium-options', category: 'core', description: 'Улучшенное меню настроек для Sodium.', deps: ['sodium'] },
    { id: 'yet_another_config_lib', name: 'YetAnotherConfigLib', slug: 'yacl', category: 'core', description: 'Библиотека конфигов (нужна для Zoomify и др).', deps: ['fabric_api'] },
    { id: 'malilib', name: 'MaLiLib', slug: 'malilib', category: 'core', description: 'Библиотека, необходимая для Litematica.', deps: ['fabric_api'] },

    // --- OPTIMIZATION ---
    { id: 'sodium', name: 'Sodium', slug: 'sodium', category: 'optimization', description: 'Мощный движок рендеринга. +FPS.', deps: ['fabric_api'] },
    { id: 'lithium', name: 'Lithium', slug: 'lithium', category: 'optimization', description: 'Оптимизация серверной логики и физики.', deps: ['fabric_api'] },
    { id: 'ferritecore', name: 'FerriteCore', slug: 'ferrite-core', category: 'optimization', description: 'Уменьшает потребление оперативной памяти (RAM).', deps: ['fabric_api'] },
    { id: 'immediatelyfast', name: 'ImmediatelyFast', slug: 'immediatelyfast', category: 'optimization', description: 'Оптимизирует рендеринг GUI, карт и сущностей.', deps: ['fabric_api'] },
    { id: 'c2me', name: 'C2ME', slug: 'c2me-fabric', category: 'optimization', description: 'Ускоряет генерацию и загрузку чанков.', deps: ['fabric_api'] },
    { id: 'voxy', name: 'Voxy', slug: 'voxy', category: 'optimization', description: 'LOD-рендеринг для огромной дальности прорисовки. Требует мощный ПК.', deps: ['sodium', 'fabric_api'] },
    
    // --- VISUALS ---
    { id: 'iris', name: 'Iris Shaders', slug: 'iris', category: 'visuals', description: 'Поддержка шейдеров.', deps: ['sodium', 'fabric_api'] },
    { id: 'sodium_extra', name: 'Sodium Extra', slug: 'sodium-extra', category: 'visuals', description: 'Дополнительные настройки графики для Sodium.', deps: ['sodium', 'fabric_api', 'reese_sodium_options'] },
    { id: 'zoomify', name: 'Zoomify', slug: 'zoomify', category: 'visuals', description: 'Бесконечный зум колесиком мыши.', deps: ['fabric_api', 'yet_another_config_lib'] },
    { id: 'lamb_dynamic_lights', name: 'LambDynamicLights', slug: 'lambdynamiclights', category: 'visuals', description: 'Динамическое освещение (факел светится в руке).', deps: ['fabric_api'] },
    { id: 'continuity', name: 'Continuity', slug: 'continuity', category: 'visuals', description: 'Соединенные текстуры стекла (Connected Textures).', deps: ['fabric_api', 'indium'] }, 
    { id: 'puzzle', name: 'Puzzle', slug: 'puzzle', category: 'visuals', description: 'Фиксы текстур и моделей для ресурсовпаков.', deps: ['fabric_api'] },
    { id: 'not_enough_animations', name: 'Not Enough Animations', slug: 'not-enough-animations', category: 'visuals', description: 'Добавляет недостающие анимации (еда, карта, лодка от 3 лица).', deps: ['fabric_api'] },
    { id: 'emotecraft', name: 'Emotecraft', slug: 'emotecraft', category: 'visuals', description: 'Эмоции и анимации персонажа.', deps: ['fabric_api'] },
    
    // --- UTILITY ---
    { id: 'voicechat', name: 'Simple Voice Chat', slug: 'simple-voice-chat', category: 'utility', description: 'Голосовой чат внутри игры.', deps: ['fabric_api'] },
    { id: 'xaeros_map', name: 'Xaero\'s World Map', slug: 'xaeros-world-map', category: 'utility', description: 'Полноэкранная карта мира.', deps: ['fabric_api'] },
    { id: 'xaeros_minimap', name: 'Xaero\'s Minimap', slug: 'xaeros-minimap', category: 'utility', description: 'Мини-карта.', deps: ['fabric_api'] },
    { id: 'appleskin', name: 'AppleSkin', slug: 'appleskin', category: 'utility', description: 'Показывает насыщение еды и истощение.', deps: ['fabric_api'] },
    { id: 'chat_heads', name: 'Chat Heads', slug: 'chat-heads', category: 'utility', description: 'Показывает головы игроков в чате.', deps: ['fabric_api'] },
    { id: 'shulkerboxtooltip', name: 'Shulker Box Tooltip', slug: 'shulkerboxtooltip', category: 'utility', description: 'Просмотр содержимого шалкеров в инвентаре.', deps: ['fabric_api'] },
    { id: 'litematica', name: 'Litematica', slug: 'litematica', category: 'utility', description: 'Схематика для строительства. Позволяет видеть проекции построек.', deps: ['malilib', 'fabric_api'] },
    { id: 'inventory_profiles_next', name: 'Inventory Profiles Next', slug: 'inventory-profiles-next', category: 'utility', description: 'Сортировка инвентаря и быстрая замена инструментов.', deps: ['fabric_api', 'fabric_language_kotlin'] },
];

// Кэш
let modsCache = null;
let lastCacheUpdate = 0;
const CACHE_TTL = 60 * 60 * 1000; 

app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/public')));
app.use('/archive-map', express.static(path.join(__dirname, '../Pl3xMap')));

app.get('/', (req, res) => res.sendFile(path.join(__dirname, '../frontend/public/index.html')));
app.get('/seasons', (req, res) => res.sendFile(path.join(__dirname, '../frontend/public/seasons.html')));
app.get('/mods', (req, res) => res.sendFile(path.join(__dirname, '../frontend/public/mods.html')));
app.get('/map', (req, res) => res.sendFile(path.join(__dirname, '../frontend/public/map.html')));


// --- API: Mods List ---
app.get('/api/mods-list', async (req, res) => {
    const now = Date.now();

    if (modsCache && (now - lastCacheUpdate < CACHE_TTL)) {
        return res.json(modsCache);
    }

    console.log('Обновление кэша модов с Modrinth...');
    
    try {
        const promises = MODS_CONFIG.map(async (mod) => {
            try {
                // Ищем версию
                const url = `https://api.modrinth.com/v2/project/${mod.slug}/version?game_versions=["${GAME_VERSION}"]&loaders=["${LOADER}"]`;
                const response = await axios.get(url, {
                    headers: { 'User-Agent': 'Mineshish-Website/1.0' }
                });
                const versions = response.data;

                if (versions && versions.length > 0) {
                    const version = versions[0];
                    const file = version.files.find(f => f.primary) || version.files[0];
                    
                    return {
                        ...mod,
                        available: true,
                        version: version.version_number,
                        url: file.url,
                        filename: file.filename
                    };
                } else {
                    console.log(`Нет версии для ${mod.slug} на ${GAME_VERSION}`);
                }
            } catch (err) {
                console.error(`Ошибка для ${mod.slug}:`, err.message);
            }
            return { ...mod, available: false };
        });

        const results = await Promise.all(promises);
        
        const modsMap = {};
        results.forEach(item => {
            modsMap[item.id] = item;
        });

        modsCache = modsMap;
        lastCacheUpdate = now;
        res.json(modsCache);

    } catch (err) {
        console.error('Ошибка кэша:', err);
        res.status(500).json({ error: 'Failed to fetch mods data' });
    }
});


// --- API: Download ---
app.post('/api/download-mods', async (req, res) => {
    const requestedMods = req.body.mods;

    if (!requestedMods || !Array.isArray(requestedMods) || requestedMods.length === 0) {
        return res.status(400).send('Список модов пуст');
    }

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.on('error', err => {
        if (!res.headersSent) res.status(500).send({error: err.message});
    });

    res.attachment('mineshish_mods.zip');
    archive.pipe(res);

    try {
        const uniqueMods = new Map();
        requestedMods.forEach(m => uniqueMods.set(m.url, m));

        for (const mod of uniqueMods.values()) {
            if (!mod.url) continue;
            try {
                const response = await axios({
                    method: 'get',
                    url: mod.url,
                    responseType: 'stream'
                });
                archive.append(response.data, { name: mod.filename });
            } catch (err) {
                console.error(`Ошибка скачивания ${mod.filename}:`, err.message);
                archive.append(`Ошибка: ${err.message}`, { name: `ERROR_${mod.filename}.txt` });
            }
        }
        await archive.finalize();

    } catch (err) {
        console.error('Общая ошибка:', err);
    }
});

// --- API: Minecraft Server Stats (Proxy) ---
// Проксируем запрос с сайта к плагину, добавляя секретный токен
let statsCache = null;
let lastStatsUpdate = 0;
const STATS_CACHE_TTL = 10000; // Кэшируем статистику на 10 секунд

app.get('/api/stats', async (req, res) => {
    // URL плагина (Если плагин и этот сайт на одной машине - localhost:8081)
    // Если на разных - IP майнкрафт сервера
    const MINECRAFT_PLUGIN_URL = process.env.MINECRAFT_PLUGIN_URL || 'http://localhost:8081/stats'; 
    const SECRET_TOKEN = process.env.SECRET_TOKEN || 'mineshishauthtokenpaws';
    
    const now = Date.now();

    // Если кэш свежий - отдаем его
    if (statsCache && (now - lastStatsUpdate < STATS_CACHE_TTL)) {
        return res.json(statsCache);
    }

    try {
        const response = await axios.get(MINECRAFT_PLUGIN_URL, {
            headers: {
                'Authorization': SECRET_TOKEN
            },
            timeout: 5000 // Тайм-аут 5 сек
        });
        
        // Обновляем кэш
        statsCache = response.data;
        lastStatsUpdate = now;

        // Отдаем данные фронтенду
        res.json(response.data);
    } catch (err) {
        console.warn('Не удалось получить статистику от плагина:', err.message);
        
        // Если есть хоть какой-то кэш (даже старый), лучше отдать его, чем ошибку
        if (statsCache) {
            return res.json(statsCache);
        }

        // Если плагин не отвечает и кэша нет - 503
        res.status(503).json({ error: 'Minecraft Server API unavailable' });
    }
});

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`Server is running on http://localhost:${PORT}`);
        console.log(`Mineshish v1.0 is live!`);
    });
}

module.exports = app;

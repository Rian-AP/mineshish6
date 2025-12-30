document.addEventListener('DOMContentLoaded', () => {
    
    // Категории для отображения
    const CATEGORIES = {
        'optimization': '🚀 Оптимизация',
        'visuals': '🎨 Графика и Атмосфера',
        'utility': '🛠️ Полезные Утилиты',
        'core': '⚙️ Библиотеки (Core)'
    };

    const modsGrid = document.getElementById('modsGrid');
    const selectedCountSpan = document.getElementById('selectedCount');
    const totalModsSpan = document.getElementById('totalMods');
    const downloadBar = document.getElementById('downloadBar');
    const downloadBtn = document.getElementById('downloadBtn');
    const selectAllBtn = document.getElementById('selectAll');
    const deselectAllBtn = document.getElementById('deselectAll');

    // Хранилище всех модов (полученное с сервера)
    let allModsData = {};

    // Загрузка данных
    async function init() {
        modsGrid.innerHTML = '<div class="col-span-full text-center py-20"><i class="ph-bold ph-spinner animate-spin text-4xl text-brand-light"></i><p class="mt-4 text-gray-500">Загрузка списка модов...</p></div>';

        try {
            const response = await fetch('/api/mods-list');
            allModsData = await response.json();
            renderCategories();
            updateSelection();
        } catch (error) {
            modsGrid.innerHTML = '<div class="col-span-full text-center py-20 text-red-500">Ошибка загрузки списка модов. Попробуйте позже.</div>';
            console.error(error);
        }
    }

    // Рендер категорий и модов
    function renderCategories() {
        modsGrid.innerHTML = '';
        
        // Группируем моды по категориям
        const groups = { optimization: [], visuals: [], utility: [], core: [] };
        
        Object.values(allModsData).forEach(mod => {
            if (groups[mod.category]) {
                groups[mod.category].push(mod);
            } else {
                // Fallback
                groups['utility'].push(mod);
            }
        });

        // Отрисовка
        Object.keys(groups).forEach(catKey => {
            if (groups[catKey].length === 0) return;

            // Заголовок категории
            const title = document.createElement('h2');
            title.className = 'col-span-full text-2xl font-bold text-white mt-8 mb-4 flex items-center gap-2 border-b border-white/10 pb-2';
            title.textContent = CATEGORIES[catKey] || catKey.toUpperCase();
            modsGrid.appendChild(title);

            // Карточки
            groups[catKey].forEach(mod => {
                const card = createModCard(mod);
                modsGrid.appendChild(card);
            });
        });
    }

    function createModCard(mod) {
        const card = document.createElement('div');
        const isAvailable = mod.available;
        
        const borderClass = isAvailable ? 'border-white/5 bg-[#0F0F16] hover:border-brand-light/50 cursor-pointer' : 'border-red-900/20 bg-red-950/10 opacity-60';
        const activeClass = mod.required ? 'bg-brand-light/5 border-brand-light/20' : '';

        card.className = `relative p-4 rounded-xl border transition-all duration-200 group select-none ${borderClass} ${activeClass}`;
        card.id = `card-${mod.id}`;

        const icon = getIconForMod(mod);
        
        card.innerHTML = `
            <div class="flex items-start gap-4">
                <div class="w-10 h-10 rounded-lg bg-brand-dark/20 flex items-center justify-center text-brand-light text-xl shrink-0">
                    <i class="ph-fill ${icon}"></i>
                </div>
                <div class="flex-grow">
                    <div class="flex justify-between items-start">
                        <h3 class="font-bold text-white">${mod.name}</h3>
                        <div class="relative flex items-center">
                            <input type="checkbox" id="check-${mod.id}" 
                                data-id="${mod.id}"
                                data-url="${mod.url || ''}" 
                                data-filename="${mod.filename || ''}"
                                data-deps='${JSON.stringify(mod.deps || [])}'
                                class="peer w-5 h-5 appearance-none rounded border border-gray-600 checked:bg-brand-light checked:border-brand-light transition-colors cursor-pointer"
                                ${!isAvailable ? 'disabled' : ''}
                                ${mod.required ? 'checked disabled' : ''}>
                            <i class="ph-bold ph-check absolute inset-0 text-white pointer-events-none opacity-0 peer-checked:opacity-100 text-xs flex items-center justify-center"></i>
                        </div>
                    </div>
                    <p class="text-xs text-gray-500 mt-1 leading-relaxed">${mod.description || 'Описание отсутствует'}</p>
                    <div class="mt-2 text-[10px] font-bold uppercase tracking-wider text-gray-600 flex flex-wrap gap-2">
                        ${isAvailable 
                            ? `<span class="text-green-500/70">v${mod.version}</span>` 
                            : `<span class="text-red-500/70">Недоступно</span>`}
                        ${mod.required ? `<span class="text-brand-light/70 bg-brand-light/10 px-2 py-0.5 rounded">Обязательно</span>` : ''}
                    </div>
                </div>
            </div>
        `;

        if (isAvailable && !mod.required) {
            card.onclick = (e) => {
                if (e.target.type !== 'checkbox') {
                    const cb = document.getElementById(`check-${mod.id}`);
                    cb.checked = !cb.checked;
                    cb.dispatchEvent(new Event('change'));
                }
            };
        }

        // Обработчик зависимостей
        const checkbox = card.querySelector('input');
        checkbox.addEventListener('change', () => {
            if (checkbox.checked) {
                // Если включили мод, включаем зависимости
                (mod.deps || []).forEach(depId => {
                    const depCb = document.getElementById(`check-${depId}`);
                    if (depCb && !depCb.checked && !depCb.disabled) {
                        depCb.checked = true;
                        // Можно добавить визуальный эффект (мигание) карточке зависимости
                        const depCard = document.getElementById(`card-${depId}`);
                        depCard.classList.add('ring-1', 'ring-brand-light');
                        setTimeout(() => depCard.classList.remove('ring-1', 'ring-brand-light'), 500);
                        // Рекурсивно вызываем change для цепочки зависимостей? 
                        // Пока нет, чтобы не зациклить, но для одного уровня достаточно.
                        depCb.dispatchEvent(new Event('change')); 
                    }
                });
            }
            updateSelection();
        });

        return card;
    }

    function getIconForMod(mod) {
        // Простая эвристика иконок
        if (mod.id.includes('map')) return 'ph-map-trifold';
        if (mod.id.includes('voice')) return 'ph-microphone';
        if (mod.id.includes('chat')) return 'ph-chat-circle-text';
        if (mod.id.includes('inventory')) return 'ph-package';
        if (mod.id.includes('sodium') || mod.id.includes('iris') || mod.id.includes('opti')) return 'ph-lightning';
        if (mod.category === 'visuals') return 'ph-eye';
        if (mod.category === 'optimization') return 'ph-rocket-launch';
        if (mod.category === 'core') return 'ph-gear';
        return 'ph-cube';
    }

    // Обновление счетчика
    function updateSelection() {
        const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
        const count = checkboxes.length;
        selectedCountSpan.textContent = count;
        totalModsSpan.textContent = count;
        
        if (count > 0) downloadBar.classList.remove('translate-y-[150%]');
        else downloadBar.classList.add('translate-y-[150%]');
    }

    // Кнопки управления
    selectAllBtn.onclick = () => {
        document.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach(cb => {
             cb.checked = true;
             cb.dispatchEvent(new Event('change')); // Чтобы сработали зависимости
        });
        // updateSelection вызывается внутри слушателя change
    };

    deselectAllBtn.onclick = () => {
        document.querySelectorAll('input[type="checkbox"]:not(:disabled)').forEach(cb => {
             cb.checked = false;
        });
        updateSelection();
    };

    // Скачивание
    downloadBtn.onclick = async () => {
        const checkboxes = Array.from(document.querySelectorAll('input[type="checkbox"]:checked'));
        if (checkboxes.length === 0) return;

        // Собираем данные
        const modsToDownload = checkboxes.map(cb => ({
            url: cb.getAttribute('data-url'),
            filename: cb.getAttribute('data-filename')
        })).filter(m => m.url); // Фильтр пустых

        const originalText = downloadBtn.innerHTML;
        downloadBtn.innerHTML = '<i class="ph-bold ph-spinner animate-spin text-xl"></i> <span>Сборка...</span>';
        downloadBtn.disabled = true;

        try {
            const response = await fetch('/api/download-mods', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ mods: modsToDownload })
            });

            if (!response.ok) throw new Error(await response.text());

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'mineshish_mods.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error(error);
            alert('Ошибка: ' + error.message);
        } finally {
            downloadBtn.innerHTML = originalText;
            downloadBtn.disabled = false;
        }
    };

    init();
});

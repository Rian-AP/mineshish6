document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. PARTICLE SYSTEM (Embers) ---
    const canvas = document.getElementById('embersCanvas');
    const ctx = canvas.getContext('2d');
    let width, height;

    function resize() {
        width = window.innerWidth;
        height = window.innerHeight;
        canvas.width = width;
        canvas.height = height;
    }
    window.addEventListener('resize', resize);
    resize();

    class Ember {
        constructor() {
            this.reset();
            this.y = Math.random() * height;
        }

        reset() {
            this.x = Math.random() * width;
            this.y = height + Math.random() * 100;
            this.vx = (Math.random() - 0.5) * 0.5; 
            this.vy = -0.5 - Math.random() * 1.5; 
            this.size = Math.random() * 2 + 1; 
            this.alpha = Math.random() * 0.5 + 0.1; 
            this.fadeRate = Math.random() * 0.005 + 0.002;
            
            const colors = ['160, 107, 255', '91, 28, 224', '200, 150, 255'];
            if (Math.random() > 0.95) colors.push('255, 200, 100'); 
            this.color = colors[Math.floor(Math.random() * colors.length)];
        }

        update() {
            this.x += this.vx + Math.sin(this.y * 0.01) * 0.2; 
            this.y += this.vy;
            this.alpha -= this.fadeRate;

            if (this.y < -50 || this.alpha <= 0) {
                this.reset();
            }
        }

        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(${this.color}, ${this.alpha})`;
            ctx.shadowBlur = 10;
            ctx.shadowColor = `rgba(${this.color}, 0.8)`;
            ctx.fill();
        }
    }

    const embers = [];
    const emberCount = width < 768 ? 50 : 150; 

    for (let i = 0; i < emberCount; i++) {
        embers.push(new Ember());
    }

    function animate() {
        ctx.clearRect(0, 0, width, height);
        embers.forEach(ember => {
            ember.update();
            ember.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();


    // --- 2. DISCORD BUTTON ---
    const discordBtn = document.getElementById('discordBtn');
    if(discordBtn) {
        discordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            const rect = discordBtn.getBoundingClientRect();
            const x = (rect.left + rect.width / 2) / window.innerWidth;
            const y = (rect.top + rect.height / 2) / window.innerHeight;

            confetti({
                particleCount: 150,
                spread: 70,
                origin: { x: x, y: y },
                colors: ['#5B1CE0', '#A06BFF', '#ffffff'],
                disableForReducedMotion: true
            });

            setTimeout(() => {
                window.location.href = "https://discord.gg/hB8RgPMxYV";
            }, 1200);
        });
    }

    // --- 3. COUNTERS ---
    const animateValue = (obj, start, end, duration, isFloat) => {
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            let current = progress * (end - start) + start;
            obj.innerHTML = isFloat ? current.toFixed(1) : Math.floor(current);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            } else {
                 obj.innerHTML = isFloat ? end.toFixed(1) : end;
            }
        };
        window.requestAnimationFrame(step);
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counters = document.querySelectorAll('.counter');
                counters.forEach(counter => {
                    const target = parseFloat(counter.getAttribute('data-target'));
                    const isFloat = target % 1 !== 0 || target === 20.0; 
                    animateValue(counter, 0, target, 2000, isFloat);
                });
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const statsSection = document.getElementById('stats');
    if (statsSection) observer.observe(statsSection);

    // --- 4. RANDOM CONTENT (Screenshots & Quotes) ---
    const bgElement = document.getElementById('dynamicBg');
    const quoteElement = document.getElementById('dynamicQuote');

    if (bgElement && quoteElement) {
        // Список цитат (философские, без пацанских)
        const quotes = [
            "История, написанная тобою",
            "Путь, рождённый шагами",
            "Оставь свой след в вечности",
            "Твое воображение — твой единственный инструмент",
            "Здесь рождаются легенды",
            "Свобода творить, свобода быть собой",
            "Мгновения, ставшие эпохой",
            "Создавай. Исследуй. Воплощай.",
            "Где мечты обретают форму",
            "Каждый блок — часть великой истории",
        ];

        // Список картинок. СЮДА ВСТАВЛЯЙ СВОИ СКРИНЫ: 'assets/screenshots/1.png' и т.д.
        const images = [
            '/assets/screenshots/home_1.jpg',
            '/assets/screenshots/home_2.jpg',
            '/assets/screenshots/home_3.jpg',
            '/assets/screenshots/home_4.jpg',
            '/assets/screenshots/home_5.png',
            '/assets/screenshots/home_6.png',
            '/assets/screenshots/home_7.png',
            '/assets/screenshots/home_8.png',
            '/assets/screenshots/home_9.png',
            '/assets/screenshots/home_10.png',
            '/assets/screenshots/home_11.png',
            '/assets/screenshots/home_12.png',
            '/assets/screenshots/home_13.png',
            '/assets/screenshots/home_14.png',
            '/assets/screenshots/home_15.png',
            '/assets/screenshots/home_16.png',
            '/assets/screenshots/home_17.png',
            '/assets/screenshots/home_18.png',
            '/assets/screenshots/home_19.png',
            '/assets/screenshots/home_20.png',
            '/assets/screenshots/home_21.png',
            '/assets/screenshots/home_22.png',
            '/assets/screenshots/home_23.png',
            '/assets/screenshots/home_24.png',
            '/assets/screenshots/home_25.png',
            '/assets/screenshots/home_26.png',
            '/assets/screenshots/home_27.png',
            '/assets/screenshots/home_28.png',
            '/assets/screenshots/home_29.png',
            '/assets/screenshots/home_30.png',
            '/assets/screenshots/home_31.png',
            '/assets/screenshots/home_32.png',
            '/assets/screenshots/home_33.png',
            '/assets/screenshots/home_34.png',
            '/assets/screenshots/home_35.png',
            '/assets/screenshots/home_36.png',
        ];

        // Функция выбора случайного элемента
        const getRandom = (arr) => arr[Math.floor(Math.random() * arr.length)];

        // Устанавливаем фон
        bgElement.style.backgroundImage = `url('${getRandom(images)}')`;
        
        // Устанавливаем текст
        quoteElement.textContent = getRandom(quotes);
    }
    
    // --- 5. SERVER STATS SYNC ---
    // Теперь обращаемся не к плагину напрямую, а к нашему же бэкенду (Node.js)
    // Он работает как прокси и скрывает токен
    const MINESHISH_API_URL = "/api/stats"; 
    
    async function updateStats() {
        try {
            const response = await fetch(MINESHISH_API_URL);
            if (!response.ok) throw new Error("API Error");
            
            const data = await response.json();
            
            // Обновляем атрибуты data-target для анимации (если нужно перезапускать анимацию)
            // Но лучше просто обновлять текст, если анимация уже прошла
            
            const onlineEl = document.getElementById("online-count");
            const tpsEl = document.getElementById("tps-count");
            const whitelistEl = document.getElementById("whitelist-count");
            
            if (onlineEl) onlineEl.innerHTML = data.online;
            if (tpsEl) tpsEl.innerHTML = data.tps;
            if (whitelistEl) whitelistEl.innerHTML = data.whitelist;
            
            console.log("Mineshish Stats:", data);
        } catch (error) {
            console.warn("Could not fetch server stats (server might be offline):", error);
            // Можно поставить дефолтные значения или "..."
        }
    }
    
    // Запускаем обновление раз в 10 секунд
    setInterval(updateStats, 10000);
    // И пробуем обновить через 1 секунду после загрузки (чтобы не перебить начальную анимацию)
    setTimeout(updateStats, 1000);
});
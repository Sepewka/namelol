    // ================================================================
    // ГЛОБАЛЬНЫЙ TOAST
    // ================================================================
    let globalToastTimer = null;
    function showToast(msg) {
        const toastEl = document.getElementById('globalToast');
        if (!toastEl) return;
        toastEl.textContent = msg;
        toastEl.classList.add('show');
        clearTimeout(globalToastTimer);
        globalToastTimer = setTimeout(() => {
            toastEl.classList.remove('show');
        }, 2500);
    }

    // Сплошной цвет фона темы для PNG-экспорта — карточки полупрозрачные
    // (glass-эффект), поэтому их computed backgroundColor не годится для canvas.
    function getExportBgColor() {
        const val = getComputedStyle(document.documentElement).getPropertyValue('--bg-gradient-2').trim();
        return val || '#ffffff';
    }

    // ================================================================
    // 1. ПЕРЕКЛЮЧЕНИЕ ВКЛАДОК
    // ================================================================
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            const target = this.dataset.tab;
            document.querySelectorAll('.tab-content').forEach(tc => tc.classList.remove('active'));
            document.getElementById('tab-' + target).classList.add('active');
        });
    });

    // ================================================================
    // 2. ПЕРЕКЛЮЧАТЕЛЬ ТЕМЫ (общий)
    // ================================================================
    function getTheme() { return document.documentElement.getAttribute('data-theme') || 'light'; }
    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.querySelector('.theme-toggle').textContent = theme === 'dark' ? '☀️' : '🌙';
        localStorage.setItem('dopkiTheme', theme);
        if (theme === 'dark') document.body.classList.add('dark');
        else document.body.classList.remove('dark');
    }
    function toggleTheme() { setTheme(getTheme() === 'dark' ? 'light' : 'dark'); }
    document.querySelector('.theme-toggle').addEventListener('click', toggleTheme);

    (function loadTheme() {
        const saved = localStorage.getItem('dopkiTheme');
        if (saved) setTheme(saved);
        else setTheme('dark');
    })();

    // ================================================================
    // 3. КОПИРОВАНИЕ ID
    // ================================================================
    document.getElementById('copyIdBtn').addEventListener('click', function() {
        const id = '241586110';
        if (navigator.clipboard && navigator.clipboard.writeText) {
            navigator.clipboard.writeText(id).then(() => {
                showToast('✅ ID скопирован');
            }).catch(() => fallbackCopy(id));
        } else {
            fallbackCopy(id);
        }
    });

    function fallbackCopy(text) {
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.left = '-9999px';
        document.body.appendChild(ta);
        ta.select();
        try {
            document.execCommand('copy');
            showToast('✅ ID скопирован');
        } catch (e) {
            showToast('⚠️ Не удалось скопировать');
        }
        document.body.removeChild(ta);
    }

    // ================================================================
    // 4. СКРИПТ КАЛЬКУЛЯТОРА (первый файл) — с обновлёнными допками для Контрабаса
    // ================================================================
    (function calculator() {
        'use strict';

        const MODES = {
            '1': { label: 'Пацанский', multiplier: 1 },
            '3': { label: 'Блатной', multiplier: 3 },
            '6': { label: 'Авторитетный', multiplier: 6 },
            '12': { label: 'Воровской', multiplier: 12 }
        };

        const BOSSES = {
            'Бугор': {
                hp: 1000000000,
                modes: {
                    '1': { dmg: 10000000, max: 2 },
                    '3': { dmg: 12000000, max: 3 },
                    '6': { dmg: null, max: 0 },
                    '12': { dmg: 45000000, max: 2 }
                }
            },
            'Немой': {
                hp: 100000000,
                modes: {
                    '1': { dmg: 6000000, max: 2 },
                    '3': { dmg: 7200000, max: 2 },
                    '6': { dmg: null, max: 0 },
                    '12': { dmg: 15000000, max: 2 }
                }
            },
            'Бидон': {
                hp: 300000000,
                modes: {
                    '1': { dmg: null, max: 0 },
                    '3': { dmg: 7500000, max: 2 },
                    '6': { dmg: null, max: 0 },
                    '12': { dmg: 20000000, max: 2 }
                }
            },
            'Змей': {
                hp: 13000000000,
                modes: {
                    '1': { dmg: 27500000, max: 2 },
                    '3': { dmg: null, max: 0 },
                    '6': {
                        dmg: 28000000,
                        max: 4,
                        thresholds: [0, 28000000, 55000000, 83000000, 110000000]
                    },
                    '12': { dmg: null, max: 0 }
                }
            },
            'Чугун': {
                hp: 400000000,
                modes: {
                    '1': { dmg: 12000000, max: 2 },
                    '3': { dmg: 10000000, max: 3 },
                    '6': { dmg: null, max: 0 },
                    '12': { dmg: 35000000, max: 2 }
                }
            },
            'Кнут': {
                hp: 500000000,
                modes: {
                    '1': { dmg: 15000000, max: 2 },
                    '3': { dmg: null, max: 0 },
                    '6': { dmg: 20000000, max: 3 },
                    '12': { dmg: 40000000, max: 2 }
                }
            },
            'Крест': {
                hp: 5000000000,
                modes: {
                    '1': { dmg: 23000000, max: 2 },
                    '3': { dmg: null, max: 0 },
                    '6': { dmg: 25000000, max: 3 },
                    '12': { dmg: null, max: 0 }
                }
            },
            'Гвоздь': {
                hp: 25000000000,
                modes: {
                    '1': { dmg: null, max: 0 },
                    '3': { dmg: 50000000, max: 3 },
                    '6': { dmg: 70000000, max: 4 },
                    '12': { dmg: null, max: 0 }
                }
            },
            // Боссы без допок (не будут в выпадающем списке)
            'Мазай': {
                hp: 25000000,
                modes: {
                    '1': { dmg: null, max: 0 },
                    '3': { dmg: null, max: 0 },
                    '6': { dmg: null, max: 0 }
                }
            },
            'Ёхан': {
                hp: 7000000,
                modes: {
                    '1': { dmg: null, max: 0 },
                    '3': { dmg: null, max: 0 },
                    '6': { dmg: null, max: 0 }
                }
            },
            'Чебот': {
                hp: 75000000,
                modes: {
                    '1': { dmg: null, max: 0 },
                    '3': { dmg: null, max: 0 },
                    '6': { dmg: null, max: 0 }
                }
            },
            // Боссы с допками
            'Старшой': {
                hp: 600000000,
                modes: {
                    '1': { dmg: 18000000, max: 2 },
                    '3': { dmg: null, max: 0 },
                    '6': { dmg: 24000000, max: 3 },
                    '12': { dmg: 52500000, max: 2 }
                }
            },
            'Дантист': {
                hp: 100000000,
                modes: {
                    '1': { dmg: null, max: 0 },
                    '3': { dmg: 9000000, max: 2 },
                    '6': { dmg: 12000000, max: 2 }
                }
            },
            'Контрабас': {
                hp: 200000000,
                modes: {
                    '1': { dmg: null, max: 0 },
                    '3': { dmg: 24000000, max: 2 },
                    '6': { dmg: null, max: 0 }
                }
            }
        };

        // Делаем BOSSES доступным глобально для tooltip
        window._BOSSES = BOSSES;
        window._MODES = MODES;

        const container = document.getElementById('tab-calculator');
        const bossSelect = container.querySelector('#bossSelect');
        const modeSelect = container.querySelector('#modeSelect');
        const tatuSelect = container.querySelector('#tatuSelect');
        const attackLimitInput = container.querySelector('#attackLimitInput');
        const displayBaseHp = container.querySelector('#displayBaseHp');
        const displayDmgPerTatu = container.querySelector('#displayDmgPerTatu');
        const displayMaxTatu = container.querySelector('#displayMaxTatu');
        const noDopMessage = container.querySelector('#noDopMessage');
        const noDopCard = container.querySelector('#noDopCard');
        const addBtn = container.querySelector('#addBtn');
        const tableBody = container.querySelector('#tableBody');
        const tableFoot = container.querySelector('#tableFoot');
        const emptyMessage = container.querySelector('#emptyMessage');
        const totalDmg = container.querySelector('#totalDmg');
        const totalExtraTatu = container.querySelector('#totalExtraTatu');
        const totalWinTatu = container.querySelector('#totalWinTatu');
        const totalAllTatu = container.querySelector('#totalAllTatu');
        const totalHp = container.querySelector('#totalHp');
        const exportBtnExcel = document.getElementById('exportBtnExcel');
        const exportBtnPng = document.getElementById('exportBtnPng');
        const importBtn = container.querySelector('#importBtn');
        const clearBtn = container.querySelector('#clearBtn');
        const deleteSelectedBtn = document.getElementById('deleteSelectedBtn');
        const fileInput = container.querySelector('#fileInput');
        const statBosses = container.querySelector('#statBosses');
        const statTotalHp = container.querySelector('#statTotalHp');
        const statTotalDmg = container.querySelector('#statTotalDmg');
        const statExtraTatu = container.querySelector('#statExtraTatu');
        const statAllTatu = container.querySelector('#statAllTatu');

        let bosses = [];
        let nextId = 1;

        function fmt(n) {
            if (n === undefined || n === null || isNaN(n)) return '0';
            return Math.round(n).toLocaleString('ru-RU');
        }

        function parseNumber(str) {
            if (typeof str === 'number') return str;
            if (typeof str === 'string') {
                const cleaned = str.replace(/\s/g, '').replace(/,/g, '');
                const num = parseFloat(cleaned);
                return isNaN(num) ? 0 : num;
            }
            return 0;
        }

        function getModeMultiplier(modeValue) {
            return parseFloat(modeValue) || 1;
        }

        function getModeLabel(modeValue) {
            return MODES[modeValue] ? MODES[modeValue].label : modeValue;
        }

        function isZmei6(boss) {
            return boss.name === 'Змей' && boss.mode === '6';
        }

        function getZmeiThreshold(boss) {
            if (!isZmei6(boss)) return 0;
            const thresholds = BOSSES['Змей'].modes['6'].thresholds;
            const idx = Math.min(boss.tatuPerAttack, thresholds.length - 1);
            return thresholds[idx] || 0;
        }

        function getHpPerAttack(boss) {
            return boss.baseHp * getModeMultiplier(boss.mode);
        }

        function getTotalHp(boss) {
            return getHpPerAttack(boss) * boss.attackLimit;
        }

        // Единый расчёт показателей урона/тату для одного босса.
        // Используется в updateStats(), renderTable(), exportTSV() и exportXLS(),
        // чтобы логика подсчёта (включая особый случай Змея реж.6) не расходилась.
        function calcBossRow(boss) {
            let dmgPerAttack, displayDmg;
            if (isZmei6(boss)) {
                dmgPerAttack = getZmeiThreshold(boss);
                const thresholds = BOSSES['Змей'].modes['6'].thresholds;
                const idx = Math.min(boss.tatuPerAttack, thresholds.length - 1);
                displayDmg = thresholds[idx] || 0;
            } else {
                dmgPerAttack = boss.dmgPerTatu * boss.tatuPerAttack;
                displayDmg = boss.dmgPerTatu;
            }
            const totalDmg = dmgPerAttack * boss.attackLimit;
            const extraTatu = boss.tatuPerAttack * boss.attackLimit;
            const winTatu = boss.attackLimit;
            const allTatu = extraTatu + winTatu;
            return { dmgPerAttack, displayDmg, totalDmg, extraTatu, winTatu, allTatu };
        }

        function isModeLabel(text) {
            return /Пацанский|Блатной|Авторитетный|Воровской/.test(text);
        }

        function parseModeFromLabel(modeLabel) {
            if (modeLabel.includes('Блатной')) return '3';
            if (modeLabel.includes('Авторитетный')) return '6';
            if (modeLabel.includes('Воровской')) return '12';
            return '1';
        }

        function resolveBaseHp(name, baseHpFromFile, mode, hpPerAttackFromFile) {
            if (BOSSES[name]) return BOSSES[name].hp;
            if (baseHpFromFile > 0) return baseHpFromFile;
            if (hpPerAttackFromFile > 0) return hpPerAttackFromFile / getModeMultiplier(mode);
            return 0;
        }

        function parseImportRow(cols) {
            if (cols.length < 7) return null;
            const name = (typeof cols[0] === 'string' ? cols[0] : cols[0].textContent).trim() || 'Босс';
            if (name.toUpperCase() === 'ИТОГО') return null;

            let mode, baseHp, dmgPerTatu, tatuPerAttack, attackLimit;

            if (isModeLabel(typeof cols[1] === 'string' ? cols[1] : cols[1].textContent)) {
                const modeLabel = (typeof cols[1] === 'string' ? cols[1] : cols[1].textContent).trim();
                mode = parseModeFromLabel(modeLabel);
                const hpPerAttack = parseNumber(typeof cols[2] === 'string' ? cols[2] : cols[2].textContent);
                baseHp = resolveBaseHp(name, 0, mode, hpPerAttack);
                dmgPerTatu = parseNumber(typeof cols[4] === 'string' ? cols[4] : cols[4].textContent);
                tatuPerAttack = parseInt(typeof cols[5] === 'string' ? cols[5] : cols[5].textContent) || 0;
                attackLimit = parseInt(typeof cols[6] === 'string' ? cols[6] : cols[6].textContent) || 9;
            } else {
                baseHp = parseNumber(typeof cols[1] === 'string' ? cols[1] : cols[1].textContent);
                const modeLabel = (typeof cols[2] === 'string' ? cols[2] : cols[2].textContent).trim();
                mode = parseModeFromLabel(modeLabel);
                baseHp = resolveBaseHp(name, baseHp, mode, 0);
                dmgPerTatu = parseNumber(typeof cols[4] === 'string' ? cols[4] : cols[4].textContent);
                tatuPerAttack = parseInt(typeof cols[5] === 'string' ? cols[5] : cols[5].textContent) || 0;
                attackLimit = parseInt(typeof cols[6] === 'string' ? cols[6] : cols[6].textContent) || 9;
            }

            if (baseHp > 0 && dmgPerTatu > 0 && attackLimit > 0) {
                return { name, baseHp, mode, dmgPerTatu, tatuPerAttack, attackLimit };
            }
            return null;
        }

        function updateForm() {
            const bossName = bossSelect.value;
            const bossData = BOSSES[bossName];
            if (!bossData) {
                displayBaseHp.textContent = '0';
                displayDmgPerTatu.textContent = '0';
                displayMaxTatu.textContent = '0';
                tatuSelect.innerHTML = '';
                noDopMessage.style.display = 'none';
                noDopCard.style.display = 'none';
                addBtn.disabled = true;
                modeSelect.innerHTML = '<option value="">— Нет босса —</option>';
                return;
            }

            const availableModes = Object.keys(bossData.modes).sort((a,b) => parseInt(a)-parseInt(b));
            modeSelect.innerHTML = '';
            if (availableModes.length === 0) {
                const opt = document.createElement('option');
                opt.value = '';
                opt.textContent = '— Нет режимов —';
                modeSelect.appendChild(opt);
                displayBaseHp.textContent = fmt(bossData.hp);
                displayDmgPerTatu.textContent = '—';
                displayMaxTatu.textContent = '0';
                tatuSelect.innerHTML = '';
                noDopMessage.style.display = 'block';
                noDopCard.style.display = 'block';
                addBtn.disabled = true;
                return;
            }
            availableModes.forEach(m => {
                const opt = document.createElement('option');
                opt.value = m;
                opt.textContent = MODES[m].label + ' (×' + MODES[m].multiplier + ')';
                modeSelect.appendChild(opt);
            });
            const currentMode = modeSelect.value;
            if (availableModes.includes(currentMode)) {
                modeSelect.value = currentMode;
            } else {
                modeSelect.value = availableModes[0];
            }
            updateModeInfo();
        }

        function updateModeInfo() {
            const bossName = bossSelect.value;
            const mode = modeSelect.value;
            const bossData = BOSSES[bossName];
            if (!bossData || !mode) {
                displayBaseHp.textContent = '0';
                displayDmgPerTatu.textContent = '0';
                displayMaxTatu.textContent = '0';
                tatuSelect.innerHTML = '';
                noDopMessage.style.display = 'none';
                noDopCard.style.display = 'none';
                addBtn.disabled = true;
                return;
            }

            const modeData = bossData.modes[mode];
            if (!modeData) {
                displayBaseHp.textContent = fmt(getHpPerAttack({ baseHp: bossData.hp, mode: mode }));
                displayDmgPerTatu.textContent = '—';
                displayMaxTatu.textContent = '0';
                tatuSelect.innerHTML = '';
                noDopMessage.style.display = 'block';
                noDopCard.style.display = 'block';
                addBtn.disabled = true;
                return;
            }

            displayBaseHp.textContent = fmt(getHpPerAttack({ baseHp: bossData.hp, mode: mode }));
            const dmg = modeData.dmg;
            const max = modeData.max;
            const thresholds = modeData.thresholds;

            if (thresholds && thresholds.length > 1) {
                displayDmgPerTatu.textContent = fmt(thresholds[1]) + ' (пороги)';
            } else {
                displayDmgPerTatu.textContent = dmg !== null ? fmt(dmg) : 'нет';
            }

            displayMaxTatu.textContent = max || 0;

            tatuSelect.innerHTML = '';
            if (max > 0 && dmg !== null) {
                for (let i = 1; i <= max; i++) {
                    const opt = document.createElement('option');
                    opt.value = i;
                    opt.textContent = i;
                    tatuSelect.appendChild(opt);
                }
                noDopMessage.style.display = 'none';
                noDopCard.style.display = 'none';
                addBtn.disabled = false;
            } else {
                tatuSelect.innerHTML = '';
                noDopMessage.style.display = 'block';
                noDopCard.style.display = 'block';
                addBtn.disabled = true;
            }
        }

        function populateBossSelect() {
            bossSelect.innerHTML = '';
            const names = Object.keys(BOSSES)
                .filter(name => {
                    const boss = BOSSES[name];
                    return Object.values(boss.modes).some(modeData => modeData.dmg !== null && modeData.max > 0);
                })
                .sort((a, b) => BOSSES[a].hp - BOSSES[b].hp);
            names.forEach(name => {
                const opt = document.createElement('option');
                opt.value = name;
                opt.textContent = name + ' (HP ' + fmt(BOSSES[name].hp) + ')';
                bossSelect.appendChild(opt);
            });
            if (bossSelect.options.length > 0) {
                bossSelect.selectedIndex = 0;
            }
            updateForm();
        }
        bossSelect.addEventListener('change', updateForm);
        modeSelect.addEventListener('change', updateModeInfo);

        function addFromForm() {
            const bossName = bossSelect.value;
            const mode = modeSelect.value;
            const attackLimit = parseInt(attackLimitInput.value) || 9;
            const tatuPerAttack = parseInt(tatuSelect.value) || 0;

            const bossData = BOSSES[bossName];
            if (!bossData) return;
            const modeData = bossData.modes[mode];
            if (!modeData || modeData.max === 0 || modeData.dmg === null) {
                showToast('⚠️ Для выбранного режима нет дополнительных наград');
                return;
            }

            const baseHp = bossData.hp;
            const dmgPerTatu = modeData.dmg;

            addBoss(bossName, baseHp, mode, dmgPerTatu, tatuPerAttack, attackLimit);
        }
        addBtn.addEventListener('click', addFromForm);
        container.querySelector('#addForm').addEventListener('keydown', function(e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                addFromForm();
            }
        });

        function addBoss(name, baseHp, mode, dmgPerTatu, tatuPerAttack, attackLimit) {
            const effectiveHp = getHpPerAttack({ baseHp: baseHp, mode: mode });
            const boss = {
                id: nextId++,
                name: name.trim() || 'Босс',
                baseHp: baseHp,
                mode: mode,
                effectiveHp: effectiveHp,
                dmgPerTatu: dmgPerTatu,
                tatuPerAttack: tatuPerAttack,
                attackLimit: attackLimit
            };
            bosses.push(boss);
            saveToLocalStorage();
            renderTable();
            updateStats();
            showToast(`✅ Босс "${boss.name}" добавлен`);
        }

        function deleteBoss(id) {
            bosses = bosses.filter(b => b.id !== id);
            saveToLocalStorage();
            renderTable();
            updateStats();
            showToast('🗑 Босс удалён');
        }

        function deleteSelected() {
            const checkboxes = container.querySelectorAll('.row-checkbox:checked');
            if (checkboxes.length === 0) {
                showToast('⚠️ Выберите хотя бы одного босса');
                return;
            }
            if (!confirm(`Удалить ${checkboxes.length} выбранных боссов?`)) return;
            const ids = Array.from(checkboxes).map(cb => parseInt(cb.dataset.id));
            bosses = bosses.filter(b => !ids.includes(b.id));
            saveToLocalStorage();
            renderTable();
            updateStats();
            showToast(`🗑 Удалено ${ids.length} боссов`);
        }
        deleteSelectedBtn.addEventListener('click', deleteSelected);

        // Обработчик "выбрать все"
        const selectAll = document.getElementById('selectAll');
        selectAll.addEventListener('change', function() {
            const checkboxes = container.querySelectorAll('.row-checkbox');
            checkboxes.forEach(cb => cb.checked = this.checked);
        });

        function clearAll() {
            if (bosses.length === 0) {
                showToast('⚠️ Нет данных для очистки');
                return;
            }
            if (confirm('Вы уверены, что хотите удалить всех боссов? Данные будут потеряны.')) {
                bosses = [];
                nextId = 1;
                saveToLocalStorage();
                renderTable();
                updateStats();
                showToast('🗑 Все данные очищены');
            }
        }
        clearBtn.addEventListener('click', clearAll);

        function updateStats() {
            statBosses.textContent = bosses.length;
            let sumDmg = 0, sumExtra = 0, sumAll = 0;
            let sumHp = 0;
            bosses.forEach(boss => {
                const row = calcBossRow(boss);
                sumDmg += row.totalDmg;
                sumExtra += row.extraTatu;
                sumAll += row.allTatu;
                sumHp += getTotalHp(boss);
            });
            statTotalHp.textContent = fmt(sumHp);
            statTotalDmg.textContent = fmt(sumDmg);
            statExtraTatu.textContent = fmt(sumExtra);
            statAllTatu.textContent = fmt(sumAll);
            totalDmg.textContent = fmt(sumDmg);
            totalExtraTatu.textContent = fmt(sumExtra);
            totalWinTatu.textContent = fmt(sumDmg > 0 ? bosses.reduce((s, b) => s + b.attackLimit, 0) : 0);
            totalAllTatu.textContent = fmt(sumAll);
            totalHp.textContent = fmt(sumHp);
        }

        function renderTable() {
            if (bosses.length === 0) {
                tableBody.innerHTML = '';
                tableFoot.style.display = 'none';
                emptyMessage.style.display = 'block';
                selectAll.checked = false;
                return;
            }
            emptyMessage.style.display = 'none';
            tableFoot.style.display = 'table-footer-group';

            let html = '';
            bosses.forEach((boss, index) => {
                const { dmgPerAttack, displayDmg, totalDmg, extraTatu, winTatu, allTatu } = calcBossRow(boss);

                html += `<tr class="boss-row" data-index="${index}">`;
                html += `<td><input type="checkbox" class="row-checkbox" data-id="${boss.id}"></td>`;
                html += `<td><span class="static-text">${boss.name}</span></td>`;
                html += `<td><span class="static-text">${getModeLabel(boss.mode)}</span></td>`;
                html += `<td><span class="static-text">${fmt(getHpPerAttack(boss))}</span></td>`;
                html += `<td><span class="static-text">${fmt(getTotalHp(boss))}</span></td>`;
                html += `<td><span class="static-text">${fmt(displayDmg)}</span></td>`;
                html += `<td><span class="static-text">${boss.tatuPerAttack}</span></td>`;
                html += `<td><span class="static-text">${boss.attackLimit}</span></td>`;
                html += `<td><span class="static-text">${fmt(dmgPerAttack)}</span></td>`;
                html += `<td><span class="static-text">${fmt(totalDmg)}</span></td>`;
                html += `<td><span class="static-text">${fmt(extraTatu)}</span></td>`;
                html += `<td><span class="static-text">${fmt(winTatu)}</span></td>`;
                html += `<td><span class="static-text">${fmt(allTatu)}</span></td>`;
                html += `<td><button class="del-btn" data-id="${boss.id}">✕</button></td>`;
                html += `</tr>`;
            });

            tableBody.innerHTML = html;
            updateStats();

            container.querySelectorAll('.del-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    const id = parseInt(this.dataset.id);
                    deleteBoss(id);
                });
            });

            const checkboxes = container.querySelectorAll('.row-checkbox');
            checkboxes.forEach(cb => {
                cb.addEventListener('change', function() {
                    const allChecked = container.querySelectorAll('.row-checkbox:checked').length === checkboxes.length;
                    selectAll.checked = allChecked;
                });
            });
            selectAll.checked = false;
        }

        function saveToLocalStorage() {
            const data = { bosses, nextId };
            localStorage.setItem('bossCalculatorData', JSON.stringify(data));
        }

        function loadFromLocalStorage() {
            const stored = localStorage.getItem('bossCalculatorData');
            if (stored) {
                try {
                    const data = JSON.parse(stored);
                    bosses = data.bosses || [];
                    nextId = data.nextId || 1;
                    return true;
                } catch (e) {
                    console.warn('Ошибка парсинга localStorage', e);
                    return false;
                }
            }
            return false;
        }

        function exportTSV() {
            if (bosses.length === 0) { showToast('⚠️ Нет данных для экспорта'); return null; }
            let header = ['Босс','Режим','HP','Итоговое HP','Урон на 1 доп. тату','Доп. тату за нападение','Лимит нападений','Урон за нападение','Общий урон','Доп. тату','Тату за победы','Всего тату'];
            let rows = [];
            let sumHp=0,sumDmg=0,sumExtra=0,sumWin=0,sumAll=0;
            bosses.forEach(boss => {
                const { dmgPerAttack, displayDmg, totalDmg, extraTatu, winTatu, allTatu } = calcBossRow(boss);
                rows.push([boss.name, getModeLabel(boss.mode), getHpPerAttack(boss), getTotalHp(boss), displayDmg, boss.tatuPerAttack, boss.attackLimit, dmgPerAttack, totalDmg, extraTatu, winTatu, allTatu]);
                sumHp += getTotalHp(boss);
                sumDmg += totalDmg; sumExtra += extraTatu; sumWin += winTatu; sumAll += allTatu;
            });
            rows.push(['ИТОГО','','',sumHp,'','','','',sumDmg,sumExtra,sumWin,sumAll]);
            let tsv = header.join('\t') + '\n';
            rows.forEach(row => tsv += row.join('\t') + '\n');
            return tsv;
        }

        // Числовая ячейка для экспорта: Excel получает настоящее число (можно суммировать,
        // сортировать, использовать в формулах), а mso-number-format задаёт вид "1 234 567".
        function xlsNum(n) {
            const val = Math.round(n) || 0;
            return `<td style="mso-number-format:'#,##0';text-align:right;">${val}</td>`;
        }
        function xlsText(s) {
            return `<td>${s}</td>`;
        }

        function exportXLS() {
            if (bosses.length === 0) { showToast('⚠️ Нет данных для экспорта'); return null; }
            let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Боссы</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--><style>table{border-collapse:collapse;font-family:'Segoe UI',sans-serif;font-size:12pt;}th{background:#dce5f0;font-weight:bold;text-align:center;border:1px solid #999;padding:6px;}td{border:1px solid #999;padding:6px;text-align:center;}.total{background:#0b1a2e;color:#ffffff;font-weight:bold;}.total td{color:#ffffff;}</style></head><body>`;
            const headers = ['Босс','Режим','HP','Итоговое HP','Урон на 1 доп. тату','Доп. тату за нападение','Лимит нападений','Урон за нападение','Общий урон','Доп. тату','Тату за победы','Всего тату'];
            html += '<table><thead><tr>';
            headers.forEach(h => html += `<th>${h}</th>`);
            html += '</tr></thead><tbody>';
            let sumHp=0,sumDmg=0,sumExtra=0,sumWin=0,sumAll=0;
            bosses.forEach(boss => {
                const { dmgPerAttack, displayDmg, totalDmg, extraTatu, winTatu, allTatu } = calcBossRow(boss);
                html += `<tr>${xlsText(boss.name)}${xlsText(getModeLabel(boss.mode))}${xlsNum(getHpPerAttack(boss))}${xlsNum(getTotalHp(boss))}${xlsNum(displayDmg)}${xlsNum(boss.tatuPerAttack)}${xlsNum(boss.attackLimit)}${xlsNum(dmgPerAttack)}${xlsNum(totalDmg)}${xlsNum(extraTatu)}${xlsNum(winTatu)}${xlsNum(allTatu)}</tr>`;
                sumHp += getTotalHp(boss);
                sumDmg += totalDmg; sumExtra += extraTatu; sumWin += winTatu; sumAll += allTatu;
            });
            html += `<tr class="total"><td colspan="2">ИТОГО</td><td></td>${xlsNum(sumHp)}<td colspan="4"></td>${xlsNum(sumDmg)}${xlsNum(sumExtra)}${xlsNum(sumWin)}${xlsNum(sumAll)}</tr>`;
            html += '</tbody></table></body></html>';
            return html;
        }

        function exportPNG() {
            const wrap = document.getElementById('tableWrap');
            if (!wrap) {
                showToast('⚠️ Не найдена таблица для скриншота');
                return;
            }
            showToast('⏳ Генерация изображения...');
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
            script.onload = function() {
                html2canvas(wrap, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: getExportBgColor()
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = 'boss_table.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    showToast('✅ PNG сохранён');
                }).catch(err => {
                    console.error(err);
                    showToast('⚠️ Ошибка при создании PNG');
                });
            };
            script.onerror = function() {
                showToast('⚠️ Не удалось загрузить библиотеку html2canvas');
            };
            document.head.appendChild(script);
        }

        exportBtnExcel.addEventListener('click', function() {
            const content = exportXLS();
            if (!content) return;
            const blob = new Blob([content], { type: 'application/vnd.ms-excel;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'boss_calculator_data.xls';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            showToast('📄 Экспорт Excel выполнен');
        });

        exportBtnPng.addEventListener('click', exportPNG);

        function importFromFile(file) {
            const reader = new FileReader();
            reader.onload = function(e) {
                try {
                    const text = e.target.result;
                    const isHtml = text.trim().startsWith('<') && text.includes('<table');
                    let newBosses = [];
                    if (isHtml) {
                        const parser = new DOMParser();
                        const doc = parser.parseFromString(text, 'text/html');
                        const rows = doc.querySelectorAll('table tbody tr');
                        rows.forEach(row => {
                            const cols = row.querySelectorAll('td');
                            const parsed = parseImportRow(cols);
                            if (parsed) newBosses.push(parsed);
                        });
                    } else {
                        const lines = text.split('\n').filter(line => line.trim() !== '');
                        if (lines.length < 2) { showToast('⚠️ Файл пуст или имеет неверный формат'); return; }
                        for (let i = 1; i < lines.length; i++) {
                            const cols = lines[i].split('\t');
                            const parsed = parseImportRow(cols);
                            if (parsed) newBosses.push(parsed);
                        }
                    }
                    if (newBosses.length === 0) { showToast('⚠️ Не найдено данных для импорта'); return; }

                    newBosses = newBosses.map(b => {
                        if (b.name === 'Змей' && b.mode === '6') {
                            const thresholds = BOSSES['Змей'].modes['6'].thresholds;
                            b.dmgPerTatu = thresholds[1] || 28000000;
                        }
                        return b;
                    });

                    bosses = [];
                    nextId = 1;
                    newBosses.forEach(b => {
                        const effHp = getHpPerAttack({ baseHp: b.baseHp, mode: b.mode });
                        bosses.push({
                            id: nextId++,
                            name: b.name,
                            baseHp: b.baseHp,
                            mode: b.mode,
                            effectiveHp: effHp,
                            dmgPerTatu: b.dmgPerTatu,
                            tatuPerAttack: b.tatuPerAttack,
                            attackLimit: b.attackLimit
                        });
                    });
                    saveToLocalStorage();
                    renderTable();
                    updateStats();
                    showToast(`📂 Импортировано ${newBosses.length} боссов`);
                } catch (err) {
                    console.error(err);
                    showToast('⚠️ Ошибка при импорте');
                }
            };
            reader.readAsText(file, 'UTF-8');
        }
        importBtn.addEventListener('click', function() { fileInput.click(); });
        fileInput.addEventListener('change', function(e) {
            if (this.files && this.files.length > 0) {
                importFromFile(this.files[0]);
                this.value = '';
            }
        });

        function initCalculator() {
            populateBossSelect();
            const hasData = loadFromLocalStorage();
            if (!hasData || bosses.length === 0) {
                const examples = [
                    { name: 'Змей', mode: '1', tatuPerAttack: 2, attackLimit: 3 },
                    { name: 'Бугор', mode: '12', tatuPerAttack: 2, attackLimit: 9 },
                    { name: 'Крест', mode: '6', tatuPerAttack: 2, attackLimit: 7 }
                ];
                examples.forEach(ex => {
                    const bossData = BOSSES[ex.name];
                    if (!bossData) return;
                    const modeData = bossData.modes[ex.mode];
                    if (!modeData || modeData.max === 0 || modeData.dmg === null) return;
                    const effHp = getHpPerAttack({ baseHp: bossData.hp, mode: ex.mode });
                    bosses.push({
                        id: nextId++,
                        name: ex.name,
                        baseHp: bossData.hp,
                        mode: ex.mode,
                        effectiveHp: effHp,
                        dmgPerTatu: modeData.dmg,
                        tatuPerAttack: ex.tatuPerAttack,
                        attackLimit: ex.attackLimit
                    });
                });
                saveToLocalStorage();
            }
            renderTable();
            updateStats();
        }
        initCalculator();

        // ================================================================
        // ФУНКЦИЯ ДЛЯ ЗАПОЛНЕНИЯ ФОРМЫ ИЗ ТАБЛИЦЫ БОССОВ
        // ================================================================
        window.fillCalculatorFromBoss = function(bossName, modeKey) {
            // Переключаемся на вкладку "Калькулятор"
            const calcTab = document.querySelector('.tab-btn[data-tab="calculator"]');
            if (calcTab) calcTab.click();

            // Устанавливаем босса
            const bossSelect = document.querySelector('#bossSelect');
            if (bossSelect) {
                bossSelect.value = bossName;
                bossSelect.dispatchEvent(new Event('change'));
            }

            // После изменения босса, ждём обновления списка режимов, затем выбираем режим
            setTimeout(() => {
                const modeSelect = document.querySelector('#modeSelect');
                if (modeSelect) {
                    const option = Array.from(modeSelect.options).find(opt => opt.value === modeKey);
                    if (option) {
                        modeSelect.value = modeKey;
                        modeSelect.dispatchEvent(new Event('change'));
                    } else {
                        showToast('⚠️ Режим не найден для этого босса');
                    }
                }
            }, 100);

            // После выбора режима, устанавливаем допки на максимум (если есть)
            setTimeout(() => {
                const tatuSelect = document.querySelector('#tatuSelect');
                const maxTatu = parseInt(document.getElementById('displayMaxTatu').textContent) || 0;
                if (tatuSelect && maxTatu > 0) {
                    tatuSelect.value = maxTatu;
                }
            }, 200);

            // Показываем сообщение с названием режима вместо ключа
            const modeLabel = window._MODES && window._MODES[modeKey] ? window._MODES[modeKey].label : modeKey;
            showToast(`✅ Заполнено: ${bossName} - ${modeLabel}`);
        };

    })();

    // ================================================================
    // 5. СКРИПТ СПИСКА БОССОВ (второй файл) — с сортировкой по HP внутри категории
    //     и кнопками экспорта: Excel и PNG, плюс tooltip и клик
    // ================================================================
    (function bossList() {
        'use strict';

        const bosses = [
            // Беспредельщики
            { name: "Кирпич",    category: "Беспредельщики", hp: 1000,      modes: ["Пацанский"] },
            { name: "Сизый",     category: "Беспредельщики", hp: 10000,     modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Махно",     category: "Беспредельщики", hp: 50000,     modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Лютый",     category: "Беспредельщики", hp: 100000,    modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Гастролёр", category: "Беспредельщики", hp: 150000,    modes: ["Пацанский"] },
            { name: "Шайба",     category: "Беспредельщики", hp: 500000,    modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Бурят",     category: "Беспредельщики", hp: 2000000,   modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Дядя Миша", category: "Беспредельщики", hp: 3000000,   modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Бандяк",    category: "Беспредельщики", hp: 5000000,   modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Абу",       category: "Беспредельщики", hp: 8000000,   modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Гризли",    category: "Беспредельщики", hp: 10000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Феня",      category: "Беспредельщики", hp: 15000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Север",     category: "Беспредельщики", hp: 20000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Мазай",     category: "Беспредельщики", hp: 25000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Хирург",    category: "Беспредельщики", hp: 30000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Пресс",     category: "Беспредельщики", hp: 70000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Немой",     category: "Беспредельщики", hp: 100000000, modes: ["Пацанский", "Блатной", "Авторитетный", "Воровской"] },
            { name: "Бидон",     category: "Беспредельщики", hp: 300000000, modes: ["Пацанский", "Блатной", "Авторитетный", "Воровской"] },
            { name: "Воркута",   category: "Беспредельщики", hp: 400000000, modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Старшой",   category: "Беспредельщики", hp: 600000000, modes: ["Пацанский", "Блатной", "Авторитетный", "Воровской"] },
            { name: "Бугор",     category: "Беспредельщики", hp: 1000000000, modes: ["Пацанский", "Блатной", "Авторитетный", "Воровской"] },
            { name: "Змей",      category: "Беспредельщики", hp: 13000000000, modes: ["Пацанский", "Блатной", "Авторитетный", "Воровской"] },
            { name: "Гвоздь",    category: "Беспредельщики", hp: 25000000000, modes: ["Пацанский", "Блатной", "Авторитетный"] },
            // Надзиратели
            { name: "Палыч",     category: "Надзиратели", hp: 100000,    modes: ["Пацанский"] },
            { name: "Циклоп",    category: "Надзиратели", hp: 300000,    modes: ["Пацанский"] },
            { name: "Раиса",     category: "Надзиратели", hp: 300000,    modes: ["Пацанский"] },
            { name: "Бес",       category: "Надзиратели", hp: 700000,    modes: ["Пацанский"] },
            { name: "Паленый",   category: "Надзиратели", hp: 1500000,   modes: ["Пацанский"] },
            { name: "Близнецы",  category: "Надзиратели", hp: 2000000,   modes: ["Пацанский"] },
            { name: "Борзов",    category: "Надзиратели", hp: 3000000,   modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Цербер",    category: "Надзиратели", hp: 5000000,   modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Ёхан",      category: "Надзиратели", hp: 7000000,   modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Конвой",    category: "Надзиратели", hp: 10000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Бульдозер", category: "Надзиратели", hp: 15000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Кусто",     category: "Надзиратели", hp: 20000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Фин",       category: "Надзиратели", hp: 30000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Дюбель",    category: "Надзиратели", hp: 40000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Дантист",   category: "Надзиратели", hp: 100000000, modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Чугун",     category: "Надзиратели", hp: 400000000, modes: ["Пацанский", "Блатной", "Авторитетный", "Воровской"] },
            { name: "Кнут",      category: "Надзиратели", hp: 500000000, modes: ["Пацанский", "Блатной", "Авторитетный", "Воровской"] },
            { name: "Крест",     category: "Надзиратели", hp: 5000000000, modes: ["Пацанский", "Блатной", "Авторитетный"] },
            // Рецидивисты
            { name: "Жестянщики", category: "Рецидивисты", hp: 1000000,   modes: ["Пацанский"] },
            { name: "Отбой",      category: "Рецидивисты", hp: 5000000,   modes: ["Пацанский"] },
            { name: "Боцман",     category: "Рецидивисты", hp: 10000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Жульбаны",   category: "Рецидивисты", hp: 50000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Чебот",      category: "Рецидивисты", hp: 75000000,  modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Шнифер",     category: "Рецидивисты", hp: 100000000, modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Бивень",     category: "Рецидивисты", hp: 150000000, modes: ["Пацанский", "Блатной", "Авторитетный"] },
            { name: "Контрабас",  category: "Рецидивисты", hp: 200000000, modes: ["Пацанский", "Блатной", "Авторитетный"] }
        ];

        // Достаём данные о допках из глобального BOSSES
        const BOSSES = window._BOSSES || {};
        const MODES = window._MODES || {};

        function formatNumber(num) {
            return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
        }

        // Новая тепловая карта
        function getHpClass(hp) {
            if (hp <= 5000000) return 'hp-low';      // зелёный
            if (hp <= 600000000) return 'hp-mid';    // жёлтый
            if (hp <= 5000000000) return 'hp-high';  // оранжевый
            return 'hp-vhigh';                       // красный
        }

        const modeMultipliers = {
            'Пацанский': 1,
            'Блатной': 3,
            'Авторитетный': 6,
            'Воровской': 12
        };

        // Маппинг названия режима на его ключ (используется в BOSSES)
        const modeKeyMap = {
            'Пацанский': '1',
            'Блатной': '3',
            'Авторитетный': '6',
            'Воровской': '12'
        };

        const columnsConfig = {
            'Беспредельщики': ['Босс', 'Пацанский', 'Блатной', 'Авторитетный', 'Воровской'],
            'Надзиратели':    ['Босс', 'Пацанский', 'Блатной', 'Авторитетный', 'Воровской'],
            'Рецидивисты':    ['Босс', 'Пацанский', 'Блатной', 'Авторитетный']
        };

        const categories = ['Беспредельщики', 'Надзиратели', 'Рецидивисты'];
        const grouped = {};
        categories.forEach(cat => {
            grouped[cat] = bosses.filter(b => b.category === cat)
                .sort((a, b) => a.hp - b.hp);
        });

        const container = document.getElementById('tab-bosslist');
        const tablesContainer = container.querySelector('#tablesContainer2');
        tablesContainer.innerHTML = '';

        function buildTable(category, bossList) {
            const wrapper = document.createElement('div');
            wrapper.className = 'table-wrapper';

            let catClass = '';
            if (category === 'Беспредельщики') catClass = 'cat-besprel';
            else if (category === 'Надзиратели') catClass = 'cat-nadzir';
            else if (category === 'Рецидивисты') catClass = 'cat-recidiv';
            wrapper.classList.add(catClass);

            const header = document.createElement('div');
            header.className = 'table-header';
            header.innerHTML = `<span>${category}</span><span class="count">(${bossList.length})</span>`;
            wrapper.appendChild(header);

            const scrollDiv = document.createElement('div');
            scrollDiv.className = 'table-scroll';
            const table = document.createElement('table');
            const thead = document.createElement('thead');
            const trHead = document.createElement('tr');

            const columns = columnsConfig[category] || ['Босс', 'Пацанский', 'Блатной', 'Авторитетный'];
            columns.forEach(col => {
                const th = document.createElement('th');
                th.textContent = col;
                trHead.appendChild(th);
            });
            thead.appendChild(trHead);
            table.appendChild(thead);

            const tbody = document.createElement('tbody');
            bossList.forEach(boss => {
                const tr = document.createElement('tr');
                tr.dataset.name = boss.name.toLowerCase();
                let rowHasDop = false;
                const tdName = document.createElement('td');
                tdName.className = 'col-boss';
                tdName.textContent = boss.name;
                tr.appendChild(tdName);

                // Для каждого режима в столбцах
                for (let i = 1; i < columns.length; i++) {
                    const modeName = columns[i];
                    const td = document.createElement('td');
                    td.className = 'hp-cell';

                    if (boss.modes.includes(modeName)) {
                        const hp = boss.hp * modeMultipliers[modeName];
                        td.textContent = formatNumber(hp);
                        td.classList.add(getHpClass(hp));

                        // Проверяем, есть ли доп. награды для этого босса и режима
                        const modeKey = modeKeyMap[modeName];
                        const bossData = BOSSES[boss.name];
                        let hasDop = false;
                        let dmg = null;
                        let max = 0;
                        let thresholds = null;
                        if (bossData && bossData.modes && bossData.modes[modeKey]) {
                            const modeData = bossData.modes[modeKey];
                            if (modeData.dmg !== null && modeData.max > 0) {
                                hasDop = true;
                                dmg = modeData.dmg;
                                max = modeData.max;
                                thresholds = modeData.thresholds || null;
                            }
                        }

                        if (hasDop) {
                            rowHasDop = true;
                            td.classList.add('has-dop');
                            td.dataset.boss = boss.name;
                            td.dataset.mode = modeKey;
                            td.dataset.hp = hp;
                            td.dataset.dmg = dmg;
                            td.dataset.max = max;
                            if (thresholds) {
                                td.dataset.thresholds = JSON.stringify(thresholds);
                            }
                            td.title = 'Кликните для быстрого заполнения калькулятора';
                        }
                    } else {
                        td.classList.add('empty');
                        td.textContent = '—';
                    }
                    tr.appendChild(td);
                }
                tr.dataset.hasDop = rowHasDop ? '1' : '0';
                tbody.appendChild(tr);
            });
            table.appendChild(tbody);
            scrollDiv.appendChild(table);
            wrapper.appendChild(scrollDiv);
            return wrapper;
        }

        categories.forEach(cat => {
            const list = grouped[cat] || [];
            if (list.length === 0) return;
            const tableEl = buildTable(cat, list);
            tablesContainer.appendChild(tableEl);
        });

        // ================================================================
        // ПОИСК ПО ИМЕНИ + ФИЛЬТР "ТОЛЬКО С ДОПКАМИ"
        // ================================================================
        const bossSearchInput = document.getElementById('bossSearchInput');
        const dopOnlyCheckbox = document.getElementById('dopOnlyCheckbox');
        const dopOnlyToggle = document.getElementById('dopOnlyToggle');
        const noResultsMsg = document.createElement('p');
        noResultsMsg.className = 'no-results';
        noResultsMsg.textContent = 'Ничего не найдено';
        noResultsMsg.style.display = 'none';
        tablesContainer.appendChild(noResultsMsg);

        function applyFilters() {
            const query = bossSearchInput ? bossSearchInput.value.trim().toLowerCase() : '';
            const dopOnly = dopOnlyCheckbox ? dopOnlyCheckbox.checked : false;
            if (dopOnlyToggle) dopOnlyToggle.classList.toggle('active', dopOnly);

            let anyVisible = false;
            tablesContainer.querySelectorAll('.table-wrapper').forEach(wrapper => {
                let visibleInTable = 0;
                wrapper.querySelectorAll('tbody tr').forEach(row => {
                    const matchesName = !query || (row.dataset.name || '').includes(query);
                    const matchesDop = !dopOnly || row.dataset.hasDop === '1';
                    const match = matchesName && matchesDop;
                    row.classList.toggle('filtered-hidden', !match);
                    if (match) visibleInTable++;
                });
                wrapper.classList.toggle('filtered-hidden', visibleInTable === 0);
                const countEl = wrapper.querySelector('.table-header .count');
                if (countEl) countEl.textContent = `(${visibleInTable})`;
                if (visibleInTable > 0) anyVisible = true;
            });
            noResultsMsg.style.display = anyVisible ? 'none' : 'block';
        }

        if (bossSearchInput) bossSearchInput.addEventListener('input', applyFilters);
        if (dopOnlyCheckbox) dopOnlyCheckbox.addEventListener('change', applyFilters);

        // ================================================================
        // ОБРАБОТЧИКИ TOOLTIP И КЛИКА
        // ================================================================
        const tooltip = document.getElementById('bossTooltip');
        let tooltipTimeout = null;
        // На тач-устройствах нет hover — награду сначала показываем по тапу,
        // и только повторный тап по той же ячейке переносит боссов в калькулятор.
        const isTouchDevice = window.matchMedia('(hover: none)').matches || navigator.maxTouchPoints > 0;
        let touchActiveCell = null;

        function showTooltip(e, bossName, modeKey, dmg, max, thresholds, targetEl) {
            const modeLabel = MODES[modeKey] ? MODES[modeKey].label : modeKey;
            let dopListHtml = '';
            let maxTotal = 0;

            if (thresholds && thresholds.length > 1) {
                // Пороговый режим (Змей)
                const list = [];
                for (let i = 1; i < thresholds.length; i++) {
                    const prev = thresholds[i-1];
                    const cur = thresholds[i];
                    const dopDmg = cur - prev;
                    list.push({ num: i, dmg: dopDmg, total: cur });
                }
                maxTotal = thresholds[thresholds.length - 1];
                dopListHtml = list.map(item =>
                    `<div class="dop-item"><span class="dop-label">${item.num}-я допка:</span><span class="dop-value">${formatNumber(item.total)}</span></div>`
                ).join('');
            } else if (dmg && max > 0) {
                // Обычный режим с одинаковым уроном за каждую допку
                const list = [];
                for (let i = 1; i <= max; i++) {
                    list.push({ num: i, total: dmg * i });
                }
                maxTotal = dmg * max;
                dopListHtml = list.map(item =>
                    `<div class="dop-item"><span class="dop-label">${item.num}-я допка:</span><span class="dop-value">${formatNumber(item.total)}</span></div>`
                ).join('');
            } else {
                dopListHtml = '<div class="dop-item">Нет данных о допках</div>';
                maxTotal = 0;
            }

            tooltip.innerHTML = `
                <div class="tt-title">${bossName}</div>
                <div class="tt-mode">${modeLabel}</div>
                <div class="tt-dop-list">${dopListHtml}</div>
                ${maxTotal > 0 ? `<div class="tt-max">Максимальный урон: ${formatNumber(maxTotal)}</div>` : ''}
                <div class="tt-hint">${isTouchDevice ? '👆 Нажмите ещё раз, чтобы заполнить калькулятор' : '🖱 Кликните, чтобы заполнить калькулятор'}</div>
            `;
            // Позиционируем
            const rect = (targetEl || e.target).getBoundingClientRect();
            let left = rect.left + rect.width / 2 - 140;
            let top = rect.bottom + 8;
            if (left < 10) left = 10;
            if (left + 280 > window.innerWidth) left = window.innerWidth - 290;
            if (top + 160 > window.innerHeight) top = rect.top - 160;
            tooltip.style.left = left + 'px';
            tooltip.style.top = top + 'px';
            tooltip.classList.add('visible');
        }

        function hideTooltip() {
            tooltip.classList.remove('visible');
        }

        function readCellReward(cell) {
            const boss = cell.dataset.boss;
            const mode = cell.dataset.mode;
            const dmg = parseInt(cell.dataset.dmg);
            const max = parseInt(cell.dataset.max);
            let thresholds = null;
            if (cell.dataset.thresholds) {
                try { thresholds = JSON.parse(cell.dataset.thresholds); } catch(e) {}
            }
            return { boss, mode, dmg, max, thresholds };
        }

        // Делегирование на таблицах внутри #tab-bosslist
        const bosslistContainer = document.getElementById('tab-bosslist');

        // Наведение мышью (только для устройств с мышью — на тач-экранах это не используется)
        bosslistContainer.addEventListener('mouseover', function(e) {
            if (isTouchDevice) return;
            const cell = e.target.closest('.hp-cell.has-dop');
            if (cell) {
                const { boss, mode, dmg, max, thresholds } = readCellReward(cell);
                if (boss && mode && !isNaN(dmg) && !isNaN(max)) {
                    showTooltip(e, boss, mode, dmg, max, thresholds, cell);
                }
            } else {
                hideTooltip();
            }
        });

        bosslistContainer.addEventListener('mouseout', function(e) {
            if (isTouchDevice) return;
            const related = e.relatedTarget;
            if (!related || !related.closest('.hp-cell.has-dop')) {
                hideTooltip();
            }
        });

        // Клик / тап по ячейке с допками
        bosslistContainer.addEventListener('click', function(e) {
            const cell = e.target.closest('.hp-cell.has-dop');

            if (!cell) {
                if (isTouchDevice) { hideTooltip(); touchActiveCell = null; }
                return;
            }

            if (isTouchDevice) {
                if (touchActiveCell !== cell) {
                    // Первый тап — только показываем награду, в калькулятор не переносим
                    const { boss, mode, dmg, max, thresholds } = readCellReward(cell);
                    if (boss && mode && !isNaN(dmg) && !isNaN(max)) {
                        showTooltip(e, boss, mode, dmg, max, thresholds, cell);
                        touchActiveCell = cell;
                    }
                    return;
                }
                // Повторный тап по той же ячейке — переносим в калькулятор
            }

            const boss = cell.dataset.boss;
            const mode = cell.dataset.mode;
            if (boss && mode && typeof window.fillCalculatorFromBoss === 'function') {
                window.fillCalculatorFromBoss(boss, mode);
                hideTooltip();
                touchActiveCell = null;
            } else {
                showToast('⚠️ Ошибка: функция не найдена');
            }
        });

        // Тап вне ячейки с допками — закрываем открытую подсказку
        document.addEventListener('click', function(e) {
            if (isTouchDevice && touchActiveCell && !e.target.closest('.hp-cell.has-dop')) {
                hideTooltip();
                touchActiveCell = null;
            }
        });

        // Экспорт Excel для списка боссов — единая таблица (одна книга, один лист),
        // чтобы Excel корректно принял все строки как один набор данных
        // (сортировка/фильтры работают, а не 3 несвязанных HTML-таблицы).
        document.getElementById('exportBtn2').addEventListener('click', function() {
            const allModes = ['Пацанский', 'Блатной', 'Авторитетный', 'Воровской'];
            const allBosses = categories.flatMap(cat => grouped[cat] || []);

            let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40"><head><meta charset="UTF-8">` +
                `<!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Список боссов</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->` +
                `<style>
                    table { border-collapse: collapse; font-family:'Segoe UI',sans-serif; font-size: 11pt; }
                    th { background:#dce5f0; font-weight:bold; text-align:center; border:1px solid #999; padding:6px; }
                    td { border:1px solid #999; padding:5px 8px; text-align:center; }
                    .col-cat { text-align:left; }
                    .col-boss { text-align:left; font-weight:600; }
                    .hp-low   { background:#e6f4e6; }
                    .hp-mid   { background:#fff9e6; }
                    .hp-high  { background:#ffede0; }
                    .hp-vhigh { background:#fce4e4; }
                    .has-dop  { border-left:3px solid #2f7d32; }
                    .note { font-size:9pt; color:#666; }
                </style></head><body>
                <table>
                <tr><td colspan="${2 + allModes.length}" class="note" style="border:none;text-align:left;">Зелёная полоса слева у ячейки — за нападение в этом режиме даются доп. награды (допки).</td></tr>
                <tr><th>Категория</th><th>Босс</th>${allModes.map(m => `<th>${m}</th>`).join('')}</tr>
            `;

            allBosses.forEach(boss => {
                html += `<tr><td class="col-cat">${boss.category}</td><td class="col-boss">${boss.name}</td>`;
                allModes.forEach(mode => {
                    if (boss.modes.includes(mode)) {
                        const hp = boss.hp * modeMultipliers[mode];
                        const cls = getHpClass(hp);
                        const modeKey = modeKeyMap[mode];
                        const bossData = BOSSES[boss.name];
                        let hasDop = false;
                        if (bossData && bossData.modes && bossData.modes[modeKey]) {
                            const modeData = bossData.modes[modeKey];
                            hasDop = modeData.dmg !== null && modeData.max > 0;
                        }
                        html += `<td class="${cls}${hasDop ? ' has-dop' : ''}" style="mso-number-format:'#,##0';">${Math.round(hp)}</td>`;
                    } else {
                        html += `<td></td>`;
                    }
                });
                html += `</tr>`;
            });

            html += `</table></body></html>`;

            const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8' });
            const link = document.createElement('a');
            const url = URL.createObjectURL(blob);
            link.href = url;
            link.download = 'bosses_list.xls';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
            showToast('📄 Экспорт Excel выполнен');
        });

        // Экспорт PNG для списка боссов
        document.getElementById('exportBtnPng2').addEventListener('click', function() {
            const wrap = document.getElementById('tablesContainer2');
            if (!wrap) {
                showToast('⚠️ Не найдена таблица для скриншота');
                return;
            }
            showToast('⏳ Генерация изображения...');
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js';
            script.onload = function() {
                html2canvas(wrap, {
                    scale: 2,
                    useCORS: true,
                    allowTaint: true,
                    backgroundColor: getExportBgColor()
                }).then(canvas => {
                    const link = document.createElement('a');
                    link.download = 'bosses_list.png';
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    showToast('✅ PNG сохранён');
                }).catch(err => {
                    console.error(err);
                    showToast('⚠️ Ошибка при создании PNG');
                });
            };
            script.onerror = function() {
                showToast('⚠️ Не удалось загрузить библиотеку html2canvas');
            };
            document.head.appendChild(script);
        });

    })();


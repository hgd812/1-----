        /* =========================================
           配置与状态管理
           ========================================= */
        const CONFIG = {
            apiUrl: localStorage.getItem('ai_api_url') || '',
            apiKey: localStorage.getItem('ai_api_key') || '',
            model: localStorage.getItem('ai_model') || 'gpt-3.5-turbo'
        };

        let currentMode = 'love'; // 'express', 'reply', 'love'
        let selectedStyle = null;
        let isGenerating = false;
        let history = JSON.parse(localStorage.getItem('chat_history') || '[]');

        // 24种风格定义（与截图对应）
        const STYLES = [
            { id: 'master', emoji: '💖', name: '恋爱大师', desc: '高情商、拿捏分寸的恋爱专家口吻' },
            { id: 'push-pull', emoji: '😘', name: '暧昧推拉', desc: '欲擒故纵、若即若离的暧昧高手' },
            { id: 'player', emoji: '😎', name: '情场高手', desc: '游刃有余、经验丰富的调情高手' },
            { id: 'coax', emoji: '🧣', name: '哄一哄', desc: '温柔宠溺、哄人开心的语气' },
            { id: 'mature', emoji: '🍵', name: '沉稳爹系', desc: '成熟稳重、包容可靠的爹系男友' },
            { id: 'puppy', emoji: '🐶', name: '年下奶狗', desc: '粘人可爱、热情直率的年下弟弟' },
            { id: 'king', emoji: '👑', name: '恋爱王者', desc: '自信霸气、掌控全场的王者风范' },
            { id: 'roast', emoji: '😏', name: '怼一下', desc: '幽默吐槽、相爱相杀的损友模式' },
            { id: 'deep', emoji: '🧑‍💼', name: '深情男主', desc: '温柔专一、深情款款的偶像剧男主' },
            { id: 'gentle', emoji: '🌟', name: '温柔暖男', desc: '体贴入微、如沐春风的暖男' },
            { id: 'funny', emoji: '😜', name: '逗比男孩', desc: '幽默风趣、轻松搞笑的氛围' },
            { id: 'honest', emoji: '👦', name: '真诚直男', desc: '直球真诚、不绕弯子的直男风格' },
            { id: 'cat', emoji: '🐱', name: '胖橘四郎', desc: '慵懒贵气、带点傲娇的帝王感' },
            { id: 'empress', emoji: '🌺', name: '熹妃嬛嬛', desc: '古风文艺、甄嬛体的高级感' },
            { id: 'naughty', emoji: '😋', name: '调皮小子', desc: '古灵精怪、爱开玩笑的调皮感' },
            { id: 'sarcastic', emoji: '⚡', name: '淋言淋语', desc: '犀利毒舌、一针见血的吐槽' },
            { id: 'ceo', emoji: '🏢', name: '霸道总裁', desc: '强势霸道、不容拒绝的总裁风' },
            { id: 'badboy', emoji: '👨‍🎤', name: '风流浪子', desc: '玩世不恭、浪子回头的反差感' },
            { id: 'ironic', emoji: '🙃', name: '阴阳怪气', desc: '阴阳怪气、反话正说的调侃' },
            { id: 'rap', emoji: '🎤', name: '嘻哈rap', desc: '押韵有节奏、潮流街头感' },
            { id: 'polite', emoji: '🎩', name: '礼貌怼人', desc: '优雅礼貌但暗含锋芒的高情商' },
            { id: 'save', emoji: '🥺', name: '分手挽留', desc: '真诚挽回、不舍哀求的挽留' },
            { id: 'artistic', emoji: '📝', name: '文艺青年', desc: '文艺清新、张爱玲式的文艺腔' },
            { id: 'apologize', emoji: '😔', name: '道歉求和', desc: '诚恳认错、卑微求原谅' }
        ];

        // 恋爱语录场景定义
        const LOVE_SCENES = {
            'self-intro': '生成6条不同风格的自我介绍文案，用于社交软件或初次见面。要求：简洁有趣，突出个性，适合年轻人使用。每条控制在30字以内，风格分别：幽默型、真诚型、文艺型、自信型、可爱型、神秘型。',
            'ice-breaker': '生成6条万能开场白，用于和刚匹配的人开始对话。要求：自然不做作，能引起对方回复兴趣。风格分别：提问式、赞美式、幽默式、场景式、共同话题式、直接式。',
            'goodnight': '生成6条晚安问候语，发给暧昧对象或恋人。要求：温馨甜蜜，带有一点想念或关心。风格：温柔型、调皮型、诗意型、霸道型、可爱型、深情型。',
            'funny-morning': '生成6条搞笑早安问候，用于给喜欢的人发消息。要求：幽默风趣，能让人会心一笑，开启愉快的一天。',
            'flirty': '生成6条撩人短句，用于暧昧期升温。要求：不过分油腻，恰到好处地表达好感，带有一点小调皮或小深情。',
            'daily-thoughts': '生成6条适合发朋友圈或发给朋友的日常碎碎念，关于生活小感悟、小确幸或轻微吐槽，真实自然。',
            'deep-talk': '生成6个深度破冰话题，适合初次见面但想快速了解对方。避免太私人，但能促进交流，如兴趣爱好、价值观等。',
            'dating': '生成6条适合相亲场景的开场或过渡话术，缓解尴尬，展现礼貌和情商。',
            'hobbies': '生成6条挖掘对方兴趣爱好的问句或话题引子，自然不突兀。',
            'daily-life': '生成6条分享日常生活的话题或句子，适合日常聊天维持热度。',
            'about-love': '生成6条关于爱情观的探讨话题或观点分享，适合了解对方感情观。',
            'ambiguous': '生成6条暧昧期说的情话，若隐若现，欲拒还迎，推拉感十足。',
            'romantic': '生成6条浪漫深情的表白句子，适合正式表白或深情时刻，真挚动人。',
            'confession': '生成6条简短有力的表白金句，一句话打动人心。',
            'classical': '生成6条古风浪漫情话或诗词改编，适合喜欢传统文化的情侣。',
            'announce': '生成6条适合公开恋情的"官宣"文案，甜蜜又有趣，适合发朋友圈。',
            'corny': '生成6条土味情话， cheesy但可爱，用于调侃或制造笑点。',
            'ask-wechat': '生成6条自然索要微信的话术，不显得唐突，给对方台阶下。',
            'ask-photo': '生成6条委婉想要对方照片的话术，幽默或温柔，不让对方反感。',
            'dinner': '生成6条约饭的邀请话术，从 casual 到正式各种风格，留有余地不被拒绝。',
            'movie': '生成6条约看电影的邀请，包含具体的话术和理由，降低对方拒绝概率。',
            'meet': '生成6条线下见面邀约话术，安全舒适，给对方选择权。',
            'game': '生成6条约一起打游戏的开黑邀请，轻松随意，强调开心不计较输赢。',
            'compliment': '生成6条彩虹屁夸奖，夸到点子上，真诚不油腻，适合夸外貌、性格或能力。',
            'comfort': '生成6条安慰鼓励的话，对方遇到挫折时发送，温暖有力量，提供情绪价值。',
            'apologize': '生成6条撒娇式认错文案，适合小矛盾后缓和气氛，可爱又诚恳。'
        };

        /* =========================================
           初始化
           ========================================= */
        document.addEventListener('DOMContentLoaded', () => {
            // 加载历史记录
            renderHistory();
            
            // 初始化风格网格
            renderStyleGrid();
            
            // 加载配置
            document.getElementById('apiUrl').value = CONFIG.apiUrl;
            document.getElementById('apiKey').value = CONFIG.apiKey;
            document.getElementById('modelName').value = CONFIG.model;
            
            // 绑定回车事件
            document.getElementById('userInput').addEventListener('keypress', (e) => {
                if (e.key === 'Enter') handleGenerate();
            });
        });

        /* =========================================
           模式切换逻辑
           ========================================= */
        function switchMode(mode) {
            currentMode = mode;
            
            // 更新标签样式
            document.querySelectorAll('.mode-tab').forEach(tab => {
                tab.classList.remove('active');
                if (tab.dataset.mode === mode) {
                    tab.classList.add('active');
                }
            });
            
            // 更新输入框placeholder
            const input = document.getElementById('userInput');
            const styleSelector = document.getElementById('styleSelector');
            const categoryContainer = document.getElementById('categoryContainer');
            const styleHint = document.getElementById('styleHint');
            
            if (mode === 'express') {
                input.placeholder = '告诉我你想和TA说的话...';
                styleSelector.classList.add('active');
                categoryContainer.classList.remove('active');
                styleHint.textContent = '点击下面的风格帮你表达润色';
            } else if (mode === 'reply') {
                input.placeholder = '+ 复制并粘贴TA的话...';
                styleSelector.classList.add('active');
                categoryContainer.classList.remove('active');
                styleHint.textContent = '点击下面的风格，AI帮你生成';
            } else {
                // love mode
                input.placeholder = '选择上方场景，或输入具体情境...';
                styleSelector.classList.remove('active');
                categoryContainer.classList.add('active');
            }
            
            // 重置选中状态
            selectedStyle = null;
            document.querySelectorAll('.style-btn').forEach(btn => {
                btn.classList.remove('selected');
            });
        }

        /* =========================================
           UI渲染
           ========================================= */
        function renderStyleGrid() {
            const grid = document.getElementById('styleGrid');
            grid.innerHTML = STYLES.map(style => `
                <button class="style-btn" onclick="selectStyle('${style.id}')" data-style="${style.id}" title="${style.desc}">
                    <span class="emoji">${style.emoji}</span>
                    <span>${style.name}</span>
                </button>
            `).join('');
        }

        function selectStyle(styleId) {
            selectedStyle = styleId;
            document.querySelectorAll('.style-btn').forEach(btn => {
                btn.classList.remove('selected');
                if (btn.dataset.style === styleId) {
                    btn.classList.add('selected');
                }
            });
            
            // 自动聚焦输入框
            document.getElementById('userInput').focus();
        }

        /* =========================================
           核心生成功能
           ========================================= */
        async function handleGenerate() {
            const input = document.getElementById('userInput').value.trim();
            
            if (currentMode === 'love') {
                if (!input) {
                    showToast('请选择下方场景，或输入具体情境');
                    return;
                }
                // 恋爱模式下，如果有输入就作为context，使用通用场景
                generateLoveContent('general', input);
            } else {
                // express 或 reply 模式
                if (!input) {
                    showToast(currentMode === 'express' ? '请输入你想说的话' : '请输入对方说的话');
                    return;
                }
                if (!selectedStyle) {
                    showToast('请先选择一种风格');
                    return;
                }
                generateStyledContent(input, selectedStyle, currentMode);
            }
        }

        // 生成恋爱语录（原功能）
        async function generateLoveContent(sceneType, customContext = '') {
            if (isGenerating) {
                showToast('正在生成中...');
                return;
            }
            
            if (!checkApiConfig()) return;
            
            isGenerating = true;
            showLoading();
            
            const prompt = LOVE_SCENES[sceneType] || LOVE_SCENES['ice-breaker'];
            const finalPrompt = customContext ? 
                `${prompt}\n\n用户补充情境：${customContext}` : prompt;
            
            try {
                const sentences = await callAPI(finalPrompt);
                addToHistory({
                    type: 'love',
                    scene: sceneType,
                    context: customContext,
                    sentences: sentences,
                    mode: 'love'
                });
                hideLoading();
                showToast('生成成功！点击复制');
            } catch (error) {
                hideLoading();
                showToast('生成失败：' + error.message);
                // 演示模式：使用模拟数据
                // useMockData();
            } finally {
                isGenerating = false;
            }
        }

        // 生成风格化内容（帮我表达/回复）
        async function generateStyledContent(userInput, styleId, mode) {
            if (isGenerating) {
                showToast('正在生成中...');
                return;
            }
            
            if (!checkApiConfig()) return;
            
            isGenerating = true;
            showLoading();
            
            const style = STYLES.find(s => s.id === styleId);
            const isExpress = mode === 'express';
            
            const systemPrompt = isExpress ?
                `你是一位专业的${style.name}风格的恋爱文案润色专家。用户想对喜欢的人说一段话，请你用"${style.name}"(${style.desc})的风格，将其润色优化。生成6个不同版本，每版都要体现该风格特点，长度适中，适合发送给对象。` :
                `你是一位专业的${style.name}风格的恋爱回复专家。对方发来了消息，请你用"${style.name}"(${style.desc})的风格，生成6个不同的回复建议。回复要符合该风格人设，既要有风格特色又要得体，能让对话继续。`;
            
            const userPrompt = isExpress ?
                `我想对TA说：${userInput}` :
                `对方说：${userInput}`;
            
            try {
                const sentences = await callAPI(userPrompt, systemPrompt);
                addToHistory({
                    type: 'styled',
                    mode: mode,
                    style: style,
                    originalText: userInput,
                    sentences: sentences
                });
                hideLoading();
                showToast(`${style.name}风格生成成功！`);
            } catch (error) {
                hideLoading();
                showToast('生成失败：' + error.message);
            } finally {
                isGenerating = false;
            }
        }

        // API调用封装
        async function callAPI(userContent, systemContent = null) {
            const messages = systemContent ? 
                [{ role: 'system', content: systemContent }, { role: 'user', content: userContent }] :
                [
                    { role: 'system', content: '你是专业的恋爱话术助手。请严格按照要求生成6条，每条用换行分隔，前面加上数字序号（1. 2. 等）。' },
                    { role: 'user', content: userContent }
                ];
            
            const response = await fetch(CONFIG.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${CONFIG.apiKey}`
                },
                body: JSON.stringify({
                    model: CONFIG.model,
                    messages: messages,
                    temperature: 0.8,
                    max_tokens: 800
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            
            const data = await response.json();
            const content = data.choices[0].message.content;
            return parseSentences(content);
        }

        function parseSentences(content) {
            // 尝试按数字序号分割
            const regex = /\d[\.、]\s*/g;
            let parts = content.split(regex).filter(p => p.trim());
            
            // 如果没有序号，尝试按换行分割
            if (parts.length < 6) {
                parts = content.split('\n').filter(p => p.trim().length > 5);
            }
            
            return parts.slice(0, 6).map(p => p.trim().replace(/["「」]/g, ''));
        }

        function checkApiConfig() {
            if (!CONFIG.apiUrl || !CONFIG.apiKey) {
                showToast('请先配置API信息');
                openSettings();
                return false;
            }
            return true;
        }

        /* =========================================
           历史记录管理
           ========================================= */
        function addToHistory(item) {
            const historyItem = {
                id: Date.now(),
                ...item,
                timestamp: new Date().toISOString(),
                liked: null
            };
            
            history.push(historyItem);
            if (history.length > 50) history = history.slice(-50);
            
            localStorage.setItem('chat_history', JSON.stringify(history));
            renderHistory();
        }

        function renderHistory() {
            const container = document.getElementById('chatContainer');
            
            if (history.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <div style="font-size: 48px; margin-bottom: 16px; opacity: 0.3;">💬</div>
                        <div>选择模式，开始生成专属文案</div>
                        <div style="margin-top: 8px; font-size: 12px; opacity: 0.7;">支持自定义 OpenAI 格式 API</div>
                    </div>
                `;
                return;
            }
            
            container.innerHTML = history.map((item, index) => {
                let title = '';
                let subtitle = '';
                
                if (item.mode === 'love') {
                    title = '💕 恋爱语录';
                    subtitle = item.context ? `情境：${item.context.substring(0, 20)}...` : '';
                } else if (item.mode === 'express') {
                    title = `💖 帮我表达 · ${item.style.emoji} ${item.style.name}`;
                    subtitle = `原文：${item.originalText.substring(0, 25)}...`;
                } else if (item.mode === 'reply') {
                    title = `💬 帮我回复 · ${item.style.emoji} ${item.style.name}`;
                    subtitle = `对方：${item.originalText.substring(0, 25)}...`;
                }
                
                return `
                    <div class="message-group">
                        <div style="font-size: 12px; color: var(--text-secondary); margin-left: 8px; margin-bottom: 4px;">
                            ${title} ${subtitle ? `<span style="opacity: 0.7;">| ${subtitle}</span>` : ''}
                        </div>
                        <div class="message-bubble">
                            <div class="results-grid">
                                ${item.sentences.map((sentence, idx) => `
                                    <div class="result-card" onclick="copyText('${sentence.replace(/'/g, "\\'")}', this)">
                                        <span class="result-number">${idx + 1}</span>
                                        <div style="margin-top: 4px;">${sentence}</div>
                                    </div>
                                `).join('')}
                            </div>
                            <div class="message-actions">
                                <div class="action-group">
                                    <button class="action-btn ${item.liked === true ? 'active' : ''}" onclick="rateMessage(${index}, true)" title="好用">👍</button>
                                    <button class="action-btn ${item.liked === false ? 'active' : ''}" onclick="rateMessage(${index}, false)" title="不好用">👎</button>
                                    <button class="action-btn danger" onclick="deleteMessage(${index})" title="删除">🗑️</button>
                                </div>
                                <div class="action-group">
                                    <button class="action-btn" onclick="copyAll(${index})" title="复制全部"><span class="action-text">复制全部</span></button>
                                    <button class="action-btn" onclick="regenerate(${index})" title="重新生成">🔄<span class="action-text">换一批</span></button>
                                </div>
                            </div>
                        </div>
                    </div>
                `;
            }).join('');
            
            container.scrollTop = container.scrollHeight;
        }

        /* =========================================
           交互功能
           ========================================= */
        function copyText(text, element) {
            navigator.clipboard.writeText(text).then(() => {
                showToast('已复制');
                document.querySelectorAll('.result-card').forEach(c => c.classList.remove('selected'));
                element.classList.add('selected');
            });
        }

        function copyAll(index) {
            const text = history[index].sentences.join('\n\n');
            copyText(text, { classList: { add: () => {} } });
        }

        function rateMessage(index, isLike) {
            history[index].liked = history[index].liked === isLike ? null : isLike;
            localStorage.setItem('chat_history', JSON.stringify(history));
            renderHistory();
        }

        function deleteMessage(index) {
            if (confirm('确定删除这条记录吗？')) {
                history.splice(index, 1);
                localStorage.setItem('chat_history', JSON.stringify(history));
                renderHistory();
            }
        }

        function regenerate(index) {
            const item = history[index];
            document.getElementById('userInput').value = item.originalText || item.context || '';
            
            if (item.mode === 'love') {
                generateLoveContent(item.scene, item.context);
            } else {
                selectStyle(item.style.id);
                generateStyledContent(item.originalText, item.style.id, item.mode);
            }
            
            history.splice(index, 1);
            localStorage.setItem('chat_history', JSON.stringify(history));
        }

        function clearHistory() {
            if (history.length === 0) return;
            if (confirm('确定清空所有历史记录吗？')) {
                history = [];
                localStorage.setItem('chat_history', '[]');
                renderHistory();
                showToast('历史已清空');
            }
        }

        function showLoading() {
            const container = document.getElementById('chatContainer');
            const loading = document.createElement('div');
            loading.id = 'loadingIndicator';
            loading.className = 'message-bubble';
            loading.innerHTML = `
                <div style="text-align: center; color: var(--text-secondary); font-size: 14px; margin-bottom: 8px;">AI正在思考...</div>
                <div class="loading-dots"><div class="dot"></div><div class="dot"></div><div class="dot"></div></div>
            `;
            container.appendChild(loading);
            container.scrollTop = container.scrollHeight;
        }

        function hideLoading() {
            const loading = document.getElementById('loadingIndicator');
            if (loading) loading.remove();
        }

        /* =========================================
           设置与工具
           ========================================= */
        function openSettings() {
            document.getElementById('settingsModal').classList.add('active');
        }

        function closeSettings() {
            document.getElementById('settingsModal').classList.remove('active');
        }

        function closeSettingsOnOverlay(event) {
            if (event.target === event.currentTarget) closeSettings();
        }

        function saveSettings() {
            const url = document.getElementById('apiUrl').value.trim();
            const key = document.getElementById('apiKey').value.trim();
            const model = document.getElementById('modelName').value.trim() || 'gpt-3.5-turbo';
            
            if (!url || !key) {
                showToast('请填写完整的API信息');
                return;
            }
            
            CONFIG.apiUrl = url;
            CONFIG.apiKey = key;
            CONFIG.model = model;
            
            localStorage.setItem('ai_api_url', url);
            localStorage.setItem('ai_api_key', key);
            localStorage.setItem('ai_model', model);
            
            closeSettings();
            showToast('配置已保存');
        }

        function handleVoiceInput() {
            showToast('语音输入功能需要接入Web Speech API');
        }

        function showToast(message) {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.classList.add('show');
            setTimeout(() => toast.classList.remove('show'), 2000);
        }
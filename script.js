
// ========== Prompt 链式组合架构 ==========
/**
 * 分层设计：基础层 + 技法层 + 风格层 + 场景层
 * 支持灵活的参数配置和链式组合
 */

// 编译正则表达式（性能优化）
const EMOJI_REGEX = /[\u{1F300}-\u{1F9FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2300}-\u{23FF}]|[\u{2B50}]|[\u{1FA00}-\u{1FAFF}]|[\u{1F900}-\u{1F9FF}]|[\u{1F200}-\u{1F2FF}]|[\u{1F0A0}-\u{1F0FF}]|[\u{1F300}-\u{1F5FF}]|[\u{1F600}-\u{1F64F}]|[\u{1F680}-\u{1F6FF}]|[\u{1F700}-\u{1F77F}]|[\u{1F780}-\u{1F7FF}]|[\u{1F800}-\u{1F8FF}]|[\u{1F900}-\u{1F9FF}]|[\u{1FA00}-\u{1FA6F}]|[\u{1FA70}-\u{1FAFF}]|[\u{1FB00}-\u{1FBFF}]|[\u{1FC00}-\u{1FCFF}]|[\u{1FD00}-\u{1FDFF}]|[\u{1FE00}-\u{1FEFF}]|[\u{1FF00}-\u{1FFFF}]|[\u{200D}]|[\u{FE0F}]/gu;
const TEXT_EMOJI_REGEX = /[（(][[^)）]*[眨眼微笑害羞脸红心动坏笑奸笑偷笑得意傲娇撒娇卖萌吐舌委屈哭泣流汗发怒惊恐害怕哭泣尴尬微笑再见祈祷石化呆滞震惊困惑无语晕菜冷汗大哭大笑爆哭灵光一闪][）)]/gi;
const ACTION_REGEX = /[（(][^)）]{2,30}[）)]/g;
const QUOTES_REGEX = /["「」『』【】\[\]""'']/g;
const SEQUENCE_REGEX = /^\d+[\.、:：]\s*/;
const WHITESPACE_REGEX = /[\s]+$/;
const SEQUENCE_SPLIT_REGEX = /(?=\d)[\.、:：]\s*/g;
const PURE_SEQUENCE_REGEX = /^\d+[\.、:：]?\s*$/;

// ========== 配置缓存管理器 ==========
class ConfigManager {
    constructor() {
        this.cache = new Map();
        this.subscribers = new Map();
    }

    get(key, defaultValue = null) {
        if (this.cache.has(key)) {
            return this.cache.get(key);
        }
        
        const value = localStorage.getItem(key);
        const result = value !== null ? value : defaultValue;
        this.cache.set(key, result);
        return result;
    }

    set(key, value) {
        this.cache.set(key, value);
        localStorage.setItem(key, value);
        
        // 通知订阅者
        if (this.subscribers.has(key)) {
            this.subscribers.get(key).forEach(callback => callback(value));
        }
    }

    subscribe(key, callback) {
        if (!this.subscribers.has(key)) {
            this.subscribers.set(key, []);
        }
        this.subscribers.get(key).push(callback);
    }

    unsubscribe(key, callback) {
        if (this.subscribers.has(key)) {
            const index = this.subscribers.get(key).indexOf(callback);
            if (index > -1) {
                this.subscribers.get(key).splice(index, 1);
            }
        }
    }

    clearCache() {
        this.cache.clear();
    }

    // 批量获取设置
    batchGet(keys) {
        return keys.reduce((acc, key) => {
            acc[key] = this.get(key);
            return acc;
        }, {});
    }
}

// 创建全局配置管理器
const config = new ConfigManager();

// ========== Prompt 链式组合架构 ==========

// ----- 技法库定义 -----
const FLIRTATION_TECHNIQUES = {
    'push-pull': {
        name: '推拉法',
        keywords: '先打压后赞美，制造情绪起伏',
        description: '打一下，揉一下（说句好话，接句坏话）',
        instruction: '在对话中运用推拉技巧：打一下，揉一下（说句好话，接句坏话）。像拉橡皮筋，拉紧（推/打压）再放松（拉/赞美），让她在“他到底喜不喜欢我”的琢磨中产生兴奋感，套路示例：“你头发很漂亮（拉）……但好像有几天没洗头了吧？（推）”“我很喜欢你的率真（拉）……但我讨厌你的幼稚。（推）”“你挺可爱，做我新女友一定很好（拉）……但我女人要会做饭，你不会？我们分手（推）……等等，你笑起来挺迷人（拉）……你香水让我过敏，绝对要分手！（推）”。【重要】以上示例仅用于理解推拉的节奏感，严禁在本次回复中直接引用或改编示例原句。你必须针对当前对话场景原创推拉内容，且确保推与拉的转折自然流畅，不生硬。'
    },
    'deliberate-misinterpret': {
        name: '故意曲解',
        keywords: '歪曲对方意思为对你有好感',
        description: '把她的意思故意曲解成“她在追求你”或“她想和你亲热”。',
        instruction: '本质：把她的意思故意曲解成“她在追求你”或“她想和你亲热”。四种套路：借用女人才说的话：她碰你一下，你说：“不要这么着急，我不是那么随便的男人”或“不要乱摸我，这是性骚扰，我要报警啦……不过你蛮可爱的，让你摸三下。”曲解敏感词：她提到“床/睡觉/洗澡”，你说：“什么床不床的，我们没那么熟，我不是你想的那种随便男人。”强加追求框架：她用“你知道吗”开头，你立刻打断：“我知道，我妈考虑了很久，觉得我们俩不合适。”纯粹往性上靠：她开玩笑骂你笨，你说：“是有点笨，灯一关，洞都找不到。”【重要】以上示例仅用于理解曲解的逻辑，严禁直接复制使用。你必须从当前对话中抓取一个具体词句进行曲解，曲解方向要幽默、暧昧但不低俗。'
    },
    'cold-reading': {
        name: '冷读',
        keywords: '猜测对方内心特质，引发好奇',
        description: '瞬间激起兴趣',
        instruction: '核心：通过观察或假设，说出她的一些特质，让她好奇“你怎么知道？”。套路：像赵本山《卖拐》一样，通过细节（脑袋大脖子粗→大款或伙夫）直接下判断，让她产生“他怎么知道？”的疑惑，从而对你紧追不舍。经典套路：你说：“你其实是个坏女孩。” 或 “你是个很有冒险精神的女孩。”她（几乎必然）：“为什么呀？” / “你怎么看出来的？”你（接“想不到+合理”的幽默）效果：让她像玩猜谜游戏一样对你紧追不舍，你开始掌握主动。【重要】冷读的内容必须基于当前对话中透露的细节或对方性格特征原创，不得使用示例中的“坏女孩”等原句。读完你的冷读后，对方应产生强烈的好奇心。'
    },
    '721-model': {
        name: '721模型',
        keywords: '70%有趣性感+20%共鸣+10%强大正义',
        description: '首次深度聊天的节奏框架',
        instruction: '721模型：首次深度聊天的节奏框架。首次聊天70%有趣+性感，20%共鸣，10%强大+正义。起绰号（情人密码）：在聊得欢时（7的部分），根据她说的内容起专属绰号（如她爱吃西瓜→叫她“瓜瓜”或“太郎”）。这潜沟通你们是亲密的“自己人”。示例（模拟对话）：她：“我这条裙子现在很流行的。”你（70%有趣性感 - 推拉调情）：“都？你有很多女朋友啊？可以啊，兄弟，比我还强。还别说，就凭这一点，咱俩说不定还能成哥们。”（曲解“都”，叫她“兄弟”）她：“不是啦！是我朋友们都很时尚。”你（20%共鸣 - 话块连情）：“看来你圈子审美都在线。我有个发小是做服装设计的，上次非拉着我去看面料展，给我讲了一下午‘莫兰迪色系’，我差点睡着。”她：“哈哈哈，我也喜欢莫兰迪色！”你（10%强大正义 - 点到即止）：“那挺好，说明你品味不跟风，有自己主见。现在满大街都是那种扎眼的亮色，其实经不起看。”（潜沟通：你有更高的审美框架）效果：让她觉得你是个“有文化的痞子”，元素丰富，琢磨不透，性张力强。【重要】上述对话仅为比例示范，严禁逐句复制。你必须根据当前实际对话内容，自主分配70/20/10的比例，并原创所有具体回应内容。'
    },
    'nickname': {
        name: '起绰号',
        keywords: '创造专属昵称增加亲密感',
        description: '创造专属昵称增加亲密感',
        instruction: '根据对方特点或对话情境，创造专属的有趣昵称（如“小太阳”、“迷糊虫”），并自然地在对话中使用，增加亲密感和独特性。【重要】昵称必须结合当前对话中对方展现的具体特征来创造，不能使用示例中的“小太阳”等通用称呼。'
    },
    'deep-connection': {
        name: '深层次连情',
        keywords: '共情对方情绪并分享相似故事',
        description: '情感共鸣核武器',
        instruction: '本质：分析她话中的“情绪和情感”，回馈一个带有相同情绪的你的故事，让她觉得你是知音。套路：她说“上班好累”，你不是说“多喝热水”，而是描绘你也感到一模一样的疲惫与孤寂，让她在情感上与你产生共鸣。经典套路：她：“我今天上班上得好累啊。”（情绪：烦躁、无力）你（浅层连接后探索）：“是你老板不好还是你不喜欢你的工作？”她：“是我老板。今天他让我一会做这个一会做那个，我觉得好烦。”你（深层次连情 - 用比喻共鸣情绪）：“就像自己是一头老黄牛，耕了一天的地，还是被指挥来指挥去拉牛车。”（不是给解决方案，而是描绘出她内心的感受）她：“是啊。挺累的。”（此时她感觉被深深理解）你（引导想象，植入画面）：“我有时候在想如果每天不用工作，天天做自己喜欢做的事情…如果想象一下如果下个月你都不用去工作，你会选择玩什么？”【重要】以上对话仅为方法论示范，严禁照搬“老黄牛”等比喻。你必须针对对方当前表达的具体情绪，创造一个属于你自己的、贴切的比喻或故事来共鸣。'
    }
};

// 技法指令构建辅助
const TECHNIQUE_IDS = Object.keys(FLIRTATION_TECHNIQUES);

/**
 * 技法层 - 调情技法开关控制
 */
class TechniqueLayer {
    constructor(config) {
        this.config = config;
        this.parts = [];
    }

    // 应用已启用的技法
    applyEnabledTechniques() {
        const enabledTechniques = [];
        
        TECHNIQUE_IDS.forEach(techId => {
            const key = `technique_${techId.replace(/-/g, '_')}`;
            // 默认为 false (关闭)
            const isEnabled = this.config.techniques?.[key] === 'true' || config.get(key) === 'true';
            if (isEnabled) {
                enabledTechniques.push(techId);
            }
        });

        if (enabledTechniques.length === 0) {
            return this;
        }

        let instruction;
        if (enabledTechniques.length === 1) {
            const tech = FLIRTATION_TECHNIQUES[enabledTechniques[0]];
            instruction = `【调情技法应用】请在生成的 ${this.config.batchSize} 条文案中，每条都侧重使用【${tech.name}】，保持技法的熟练运用。\n`;
        } else {
            instruction = `【调情技法应用】请在生成的 ${this.config.batchSize} 条文案中，每条侧重使用 1-2 种不同技法，确保各条文案的风格有明显差异。例如：第 1 条侧重${FLIRTATION_TECHNIQUES[enabledTechniques[0]]?.name || '推拉法'}，第 2 条侧重${FLIRTATION_TECHNIQUES[enabledTechniques[1]]?.name || '故意曲解'}，以此类推。\n`;
        }
        enabledTechniques.forEach(techId => {
            const tech = FLIRTATION_TECHNIQUES[techId];
            instruction += `- ${tech.name}：${tech.instruction}\n`;
        });
        
        if (enabledTechniques.length > 1) {
            instruction += '请自然融合这些技法，保持对话流畅，不可生硬堆砌。';
        } else {
            instruction += `请熟练运用【${FLIRTATION_TECHNIQUES[enabledTechniques[0]]?.name}】，保持对话流畅。`;
        }

        this.parts.push(instruction);
        return this;
    }

    build() {
        return this.parts.join('\n\n');
    }
}

/**
 * 基础层 - 核心设置和约束
 */
class BaseLayer {
    constructor(config) {
        this.config = config;
        this.parts = [];
    }

    // 性别上下文
    genderContext() {
        const myText = this.config.myGender === 'male' ? '男生' : '女生';
        const targetText = this.config.targetGender === 'male' ? '男生' : '女生';
        this.parts.push(`你是${myText}，对方是${targetText}。生成的文案必须使用${myText}第一人称视角，表达对${targetText}的好感或情感。`);
        return this;
    }

    // 关系阶段
    relationshipContext() {
        const stage = RELATIONSHIP_STAGES[this.config.relationshipStage] || RELATIONSHIP_STAGES['emotional'];
        this.parts.push(`【关系阶段：${stage.name}】${stage.prompt}`);
        return this;
    }

    // 甜度控制（增强参数）
    sweetnessContext() {
        const intimacyDesc = this.config.intimacy <= 3 ? '含蓄内敛' 
                           : this.config.intimacy <= 6 ? '适度亲密' 
                           : '热情直接';
        const depthDesc = this.config.depth <= 3 ? '轻松日常'
                        : this.config.depth <= 6 ? '情感交流'
                        : '深入走心';
        
        // 新增语气强度参数
        const toneStrength = parseInt(this.config.toneStrength || '5');
        const toneDesc = toneStrength <= 3 ? '温和委婉' 
                       : toneStrength <= 7 ? '自然适中'
                       : '强烈直接';
        
        this.parts.push(`【甜度控制】
- 亲密程度：${this.config.intimacy}/10（${intimacyDesc}）
- 话题深度：${this.config.depth}/10（${depthDesc}）
- 甜度百分比：${this.config.sweetness}%
- 语气强度：${toneStrength}/10（${toneDesc}）
- 幽默含量：${this.config.humorLevel || '3'}/10`);
        return this;
    }

    // 长度约束
    lengthContext() {
        const lengthMap = {
            'short': '【生成长度】简短模式：每条文案控制在10-20字以内，1-2句话，简洁有力',
            'medium': '【生成长度】中等模式：每条文案控制在20-40字以内，3-4句话，长度适中',
            'long': '【生成长度】详细模式：每条文案控制在40-80字以内，5句话以上，内容丰富饱满'
        };
        this.parts.push(lengthMap[this.config.contentLength] || lengthMap['medium']);
        return this;
    }

    // 基础约束
    baseConstraints() {
        this.parts.push(`【重要约束】
1. 只输出纯文字文案，禁止添加任何表情符号（😀😁😂等）
2. 禁止添加动作/神态描写，如（挑眉一笑）（靠近耳边）（晃了晃车钥匙）等
3. 禁止添加括号内的表情说明，如（眨眼）（微笑）等
X 错误示范：你今天真好看 (眨眼) 😉
√ 正确示范：你今天真好看，我忍不住多看了两眼。
4. 每条文案为纯中文文字
5. 严格生成${this.config.batchSize}条文案，每条前面加上数字序号（1. 2. 3. 等），不要多也不要少`);
        return this;
    }

    // 构建基础层
    build() {
        return this.parts.join('\n\n');
    }
}

/**
 * 对象上下文层 - 记忆锚点与对话历史
 */
class ObjectContextLayer {
    constructor(config, history = []) {
        this.config = config;
        this.history = history;
        this.parts = [];
    }

    // 应用对象上下文
    applyObjectContext() {
        if (this.history.length > 0) {
            this.parts.push(`【对象上下文】`);
            
            // 提取最近的对话历史作为记忆锚点
            const recentHistory = this.history.slice(-3); // 只取最近3条
            const historyContext = recentHistory.map((item, index) => {
                if (item.type === 'love') {
                    return `历史${index + 1}：${item.scene}场景 - ${item.context || '无特定上下文'}`;
                } else if (item.type === 'styled') {
                    return `历史${index + 1}：${item.mode === 'express' ? '表达' : '回复'} - ${item.originalText.substring(0, 30)}${item.originalText.length > 30 ? '...' : ''}`;
                }
                return '';
            }).filter(Boolean).join('\n');
            
            if (historyContext) {
                this.parts.push(historyContext);
                this.parts.push('请参考以上对话历史，保持对话的连贯性和一致性，避免内容重复或矛盾。');
            }
        }
        return this;
    }

    // 构建对象上下文层
    build() {
        return this.parts.join('\n\n');
    }
}

/**
 * 风格层 - 特定风格修饰
 */
class StyleLayer {
    constructor(config) {
        this.config = config;
        this.parts = [];
    }

    // 应用特定风格
    applyStyle(styleId, mode = 'express') {
        const style = STYLES.find(s => s.id === styleId);
        if (!style) return this;

        const myText = this.config.myGender === 'male' ? '男生' : '女生';
        const targetText = this.config.targetGender === 'male' ? '男生' : '女生';

        if (mode === 'express') {
            this.parts.push(`你是一位专业的${style.name}风格恋爱文案专家。用户想对${targetText}说一段话，请用"${style.name}"的风格润色优化。`);
        } else {
            this.parts.push(`你是一位专业的${style.name}风格恋爱文案专家。对方（${targetText}）发来了消息，请用"${style.name}"的风格回复。回复要符合${myText}的身份和语气。`);
        }

        // 添加风格特定说明
        const styleInstructions = STYLE_INSTRUCTIONS[styleId];
        if (styleInstructions) {
            this.parts.push(`【${style.name}风格要求】${styleInstructions}`);
        }

        return this;
    }

    // 构建风格层
    build() {
        return this.parts.join('\n\n');
    }
}

/**
 * 场景层 - 特定场景应用
 */
class SceneLayer {
    constructor(config) {
        this.config = config;
        this.parts = [];
    }

    // 应用恋爱场景
    applyLoveScene(sceneType) {
        const scene = LOVE_SCENES[sceneType] || LOVE_SCENES['ice-breaker'];
        const sceneName = Object.keys(LOVE_SCENES_NAMES).find(key => LOVE_SCENES_NAMES[key] === sceneType) || sceneType;
        
        this.parts.push(`【场景：${sceneName}】`);
        this.parts.push(scene.replace(/不同数量/g, this.config.batchSize + '条'));
        return this;
    }

    // 应用自定义场景
    applyCustomScene(customContext) {
        if (customContext && customContext.trim()) {
            this.parts.push(`【自定义场景】${customContext}`);
        }
        return this;
    }

    // 构建场景层
    build() {
        return this.parts.join('\n\n');
    }
}

/**
 * Prompt 构建器 - 链式组合主类
 */
class PromptBuilder {
    constructor() {
        this.config = {};
        this.loadSettings();
    }

    /**
     * 从配置管理器加载设置
     */
    loadSettings() {
        this.config = {
            myGender: config.get('my_gender', 'male'),
            targetGender: config.get('target_gender', 'female'),
            relationshipStage: config.get('relationship_stage', 'emotional'),
            intimacy: parseInt(config.get('intimacy', '5')),
            depth: parseInt(config.get('depth', '5')),
            sweetness: parseInt(config.get('sweetness', '50')),
            toneStrength: parseInt(config.get('tone_strength', '5')),
            humorLevel: parseInt(config.get('humor_level', '3')),
            contentLength: config.get('content_length', 'medium'),
            creativity: config.get('creativity', 'medium'),
            batchSize: parseInt(config.get('batch_size', '6')),
            autoEmoji: config.get('auto_emoji', 'false') === 'true',
            // 加载技法开关状态
            techniques: {}
        };

        TECHNIQUE_IDS.forEach(techId => {
            const key = `technique_${techId.replace(/-/g, '_')}`;
            this.config.techniques[key] = config.get(key, 'false');
        });
    }

    /**
     * 刷新设置
     */
    refresh() {
        this.loadSettings();
    }

    /**
     * 构建完整的系统提示词（链式组合）
     * @param {Object} options - 构建选项
     * @returns {String} 完整的系统提示词
     */
    buildSystemPrompt(options = {}) {
        const { styleId = null, mode = 'express', sceneType = null, customContext = '' } = options;

        // 初始化各层
        const baseLayer = new BaseLayer(this.config);
        const objectContextLayer = new ObjectContextLayer(this.config, history);
        const techniqueLayer = new TechniqueLayer(this.config);
        const styleLayer = new StyleLayer(this.config);
        const sceneLayer = new SceneLayer(this.config);

        // 构建基础层（始终包含）
        baseLayer
            .genderContext()
            .relationshipContext()
            .sweetnessContext()
            .lengthContext()
            .baseConstraints();

        // 应用对象上下文层（记忆锚点与对话历史）
        objectContextLayer.applyObjectContext();

        // 添加技法层（根据开关状态）
        techniqueLayer.applyEnabledTechniques();

        // 添加风格层（如果有）
        if (styleId) {
            styleLayer.applyStyle(styleId, mode);
        }

        // 添加场景层
        if (sceneType) {
            sceneLayer.applyLoveScene(sceneType);
        }
        
        if (customContext) {
            sceneLayer.applyCustomScene(customContext);
        }

        // 组合各层
        const layers = [baseLayer.build()];
        
        if (objectContextLayer.parts.length > 0) {
            layers.push(objectContextLayer.build());
        }
        
        if (techniqueLayer.parts.length > 0) {
            layers.push(techniqueLayer.build());
        }
        
        if (styleLayer.parts.length > 0) {
            layers.push(styleLayer.build());
        }
        
        if (sceneLayer.parts.length > 0) {
            layers.push(sceneLayer.build());
        }

        return layers.join('\n\n');
    }

    /**
     * 构建用户提示词
     */
    buildUserPrompt(mode, content, styleId = null) {
        const targetText = this.config.targetGender === 'male' ? '男生' : '女生';
        const myText = this.config.myGender === 'male' ? '男生' : '女生';

        if (mode === 'express') {
            return `我对${targetText}说：${content}`;
        } else if (mode === 'reply') {
            return `对方（${targetText}）说：${content}`;
        } else {
            return content;
        }
    }

    /**
     * 获取恋爱场景提示词
     * @param {String} sceneType - 场景类型
     * @returns {String} 场景提示词
     */
    getLoveScenePrompt(sceneType) {
        const scene = LOVE_SCENES[sceneType] || LOVE_SCENES['ice-breaker'];
        return scene.replace(/不同数量/g, this.config.batchSize + '条');
    }

    /**
     * 获取 temperature 值
     */
    getTemperature() {
        const map = {
            'low': 0.3,
            'medium': 0.7,
            'high': 1.0
        };
        return map[this.config.creativity] || 0.7;
    }
}

// ========== 全局配置 ==========
const CONFIG = {
    providers: JSON.parse(localStorage.getItem('ai_providers') || '[]'),
    activeProvider: localStorage.getItem('active_provider') || null
};

// 创建全局 PromptBuilder 实例
const promptBuilder = new PromptBuilder();

// ========== 数据配置 ==========

const PLATFORMS = {
    openai: { name: 'OpenAI', defaultUrl: 'https://api.openai.com/v1/chat/completions', models: ['gpt-4o', 'gpt-4o-mini', 'gpt-4-turbo', 'gpt-4', 'gpt-3.5-turbo'] },
    claude: { name: 'Claude', defaultUrl: 'https://api.anthropic.com/v1/messages', models: ['claude-sonnet-4-20250514', 'claude-3-5-sonnet-latest', 'claude-3-opus-latest', 'claude-3-haiku-latest'] },
    deepseek: { name: 'DeepSeek', defaultUrl: 'https://api.deepseek.com/v1/chat/completions', models: ['deepseek-chat', 'deepseek-coder'] },
    kimi: { name: 'Kimi', defaultUrl: 'https://api.moonshot.cn/v1/chat/completions', models: ['moonshot-v1-8k', 'moonshot-v1-32k', 'moonshot-v1-128k'] },
    doubao: { name: '豆包', defaultUrl: 'https://ark.cn-beijing.volces.com/api/v3/chat/completions', models: ['doubao-pro-32k', 'doubao-lite-32k'] },
    qwen: { name: '通义千问', defaultUrl: 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions', models: ['qwen-turbo', 'qwen-plus', 'qwen-max'] }
};

// 关系阶段数据
const RELATIONSHIP_STAGES = {
    'emotional': {
        name: '高情商',
        prompt: '需展现极致的情绪洞察与沟通艺术，在精准共情与优雅表达间游刃有余。文案应具备进退得宜的分寸感，既能深度理解对方未言明的情绪需求，又能以恰到好处的方式给予回应，无论是暧昧推拉还是矛盾化解都显得从容不迫。语言风格成熟睿智，善用隐喻与留白营造精神共鸣，强调情绪价值的精准供给与边界感的完美把控，营造"懂你却不压迫你"的舒适氛围，展现超越普通社交层级的认知同频与灵魂契合，让每一次互动都成为滋养关系的智慧型交流。',
        defaultIntimacy: 6,
        defaultTopicDepth: 9,
        defaultSweetness: 50,
        defaultToneStrength: 7,
        defaultHumorLevel: 3
    },
    'friend': {
        name: '朋友',
        prompt: '这时候说话要平等轻松，把握好边界感，怎么舒服怎么来。真心关心对方但别过线，多聊共同爱好、日常琐事，互相提供情绪支持，千万别搞暧昧也别表现出太强占有欲。语言要自然随和，像认识多年的老铁那样有默契，可以开开玩笑互相损损，但得保持尊重。重点是营造出"我懂你"的那种陪伴感，而不是情感绑架。别说太长，给对方留点回话的空档，整体要显出那种成熟稳重的友情质感。',
        defaultIntimacy: 5,
        defaultTopicDepth: 5,
        defaultSweetness: 20,
        defaultToneStrength: 5,
        defaultHumorLevel: 6
    },
    'buddy': {
        name: '兄弟',
        prompt: '这时候就得拿出那种肝胆相照的江湖义气，相处起来完全没包袱，怎么舒服怎么来。说话要豪爽直接，开口就是"哥们""兄弟"的，聊的都是一起开黑打游戏、看球赛、喝酒吹牛逼这些事儿。可以互相损两句、调侃一下，但绝对把握好度，不能真伤了和气。核心是要传递那种"有事你吱声，随叫随到"的仗义劲儿，平时看着大大咧咧，关键时刻也得偶尔流露点细腻的关心。重点就是强调能一起吃苦也能一起享乐，真实不装，别整那些文绉绉的酸词儿。要营造出那种"异姓兄弟"的信任感和归属感，让对方觉得跟你在一块儿完全不用伪装，特别放松，特别有默契。',
        defaultIntimacy: 7,
        defaultTopicDepth: 6,
        defaultSweetness: 5,
        defaultToneStrength: 8,
        defaultHumorLevel: 7
    },
    'new': {
        name: '初识',
        prompt: '这时候说话要客气但带着点好奇，像探路那样，保持合适的距离别太黏糊，但也得亮出点个人魅力。就是聊聊基本情况，找找共同话题，先混个脸熟，别一上来就热情过头或者打听隐私。说话简单直接点，多用开放式问题让对话能继续下去，气氛要轻松没压力。重点是让对方感觉你真诚友善，价值观也对得上，先建立点信任基础，千万别着急或者一股脑把自己全交代了。',
        defaultIntimacy: 2,
        defaultTopicDepth: 2,
        defaultSweetness: 5,
        defaultToneStrength: 4,
        defaultHumorLevel: 4
    },
    'icebreak': {
        name: '破冰',
        prompt: '这时候得带点幽默感，主动找话题，先把那种陌生感和尴尬劲儿破掉。可以翻翻共同点，分享点好玩的内容，或者拿自己开开玩笑来拉近距离，说话可以活泼俏皮点，但得盯着对方反应随时调整别过头。关键是把握好那个度，既主动热情展现想聊天的诚意，又不能给对方造成心理负担。可以用具体场景的话题或者轻松的玩笑打开话匣子，制造出"咱俩真合拍"的错觉，让聊天从表面的寒暄自然顺畅地深入到实质交流。',
        defaultIntimacy: 3,
        defaultTopicDepth: 3,
        defaultSweetness: 10,
        defaultToneStrength: 6,
        defaultHumorLevel: 8
    },
    'ambiguous': {
        name: '暧昧',
        prompt: '你写东西要会欲擒故纵，别一股脑全倒出来。要那种甜甜的但又憋着不说透的感觉，让人看得心里痒痒的、心跳加速。聊点深夜才会聊的话题，多关注小细节，营造出"这是咱俩的秘密"那种私密感。语气要温柔缠绵，多用省略号…语气词呢…还有隐喻，话别说太满。节奏要忽冷忽热，一会儿贴得很近一会儿又推开，让对方忍不住想探索你。重点是写出那种心跳漏一拍的瞬间，给足想象空间，但记住啊——最后那层窗户纸千万别捅破，就要那种吊着胃口、让人上瘾还一直惦记的期待感。',
        defaultIntimacy: 7,
        defaultTopicDepth: 6,
        defaultSweetness: 70,
        defaultToneStrength: 7,
        defaultHumorLevel: 4
    },
    'fwb': {
        name: '炮友',
        prompt: '说话要直球，想要就大胆说，别藏着掖着。重点写身体各个部位的感觉吸引、感官刺激，怎么有张力怎么来——体温、气息、触碰，当下这一刻的感觉写详细点。热情大胆，别搞情感绑架，别问爱不爱、。氛围要写得、愉悦、没负担，像两个成熟的大人玩游戏，玩得开。重点是：欲望要直接，激情描写细致特别是身体的部位细节，让对方想入非非，遐思。',
        defaultIntimacy: 8,
        defaultTopicDepth: 3,
        defaultSweetness: 40,
        defaultToneStrength: 9,
        defaultHumorLevel: 2
    },
    'hot': {
        name: '热恋',
        prompt: '这个阶段要写那种甜到发腻、情感浓度拉满的文案，占有欲和依赖感直接给足，还要不停聊未来规划。说话要热烈直白，别绕弯子，多用亲密昵称（宝贝宝宝之类的），事无巨细都要报备，抓住细节猛夸，再给足浪漫承诺，营造出"我眼里全世界只有你"的沉浸感。要表现出无时无刻不在想TA，不管对错都无条件站TA那边，情感上完全交融不分彼此。语气可以又撒娇又霸道又温柔，混着来。重点是创造强烈的情感共鸣和归属感，多聊具体的生活场景（比如早餐吃什么、下班接不接），还要描绘长远的未来愿景，让TA觉得你们已经是一体了，分不开那种。',
        defaultIntimacy: 10,
        defaultTopicDepth: 8,
        defaultSweetness: 95,
        defaultToneStrength: 9,
        defaultHumorLevel: 5
    },
    'conflict': {
        name: '矛盾',
        prompt: '这时候得稳住别上头，先冷静下来看是什么性质的矛盾——要是对方情绪炸了就先顺着毛摸给情绪价值，要是事理问题就理性分析别掺和情绪。得认账，确实有问题就承认，站在对方角度想想怎么回事，别扣帽子也别发泄情绪。关键是既要安抚好情绪又要给出实际解决办法，给对方留面子也留喘口气的空间。说话多用"我理解""或许咱们可以试试"这种缓冲词。要道歉就别敷衍，具体错哪了说清楚；要沟通就事论事别翻旧账。总之表现出你是个成熟的大人，能把这场危机变成更懂彼此的机会。',
        defaultIntimacy: 3,
        defaultTopicDepth: 7,
        defaultSweetness: 10,
        defaultToneStrength: 4,
        defaultHumorLevel: 2
    },
    'recover': {
        name: '挽回',
        prompt: '这时候得实实在在反思，真心实意想改，别整那些虚头巴脑的保证，也别卖惨绑架对方。要说清楚具体错哪儿了、准备怎么改，同时珍惜以前的好时光，但最重要的是拿出实际行动证明你真的成长了。姿态要放低但态度要坚定，可以提提以前的美好回忆唤起感情，但必须尊重对方的选择，给足空间别逼太紧。重点传递"我现在是更好的人了"这个信息，一点点重建信任，接受慢慢修复的过程，用耐心和持续的表现证明复合值得，千万别急着要回应。',
        defaultIntimacy: 4,
        defaultTopicDepth: 8,
        defaultSweetness: 40,
        defaultToneStrength: 5,
        defaultHumorLevel: 2
    }
};

const STYLES = [
    { id: 'master', emoji: '💖', name: '恋爱大师' },
    { id: 'push-pull', emoji: '😘', name: '暧昧推拉' },
    { id: 'player', emoji: '😎', name: '情场高手' },
    { id: 'coax', emoji: '🧣', name: '哄一哄' },
    { id: 'mature', emoji: '🍵', name: '沉稳爹系' },
    { id: 'puppy', emoji: '🐶', name: '年下奶狗' },
    { id: 'king', emoji: '👑', name: '恋爱王者' },
    { id: 'roast', emoji: '😏', name: '怼一下' },
    { id: 'deep', emoji: '🧑‍💼', name: '深情男主' },
    { id: 'gentle', emoji: '🌟', name: '温柔暖男' },
    { id: 'funny', emoji: '😜', name: '逗比男孩' },
    { id: 'honest', emoji: '👦', name: '真诚直男' },
    { id: 'cat', emoji: '🐱', name: '胖橘四郎' },
    { id: 'empress', emoji: '🌺', name: '熹妃嬛嬛' },
    { id: 'naughty', emoji: '😋', name: '调皮小子' },
    { id: 'sarcastic', emoji: '⚡', name: '淋言淋语' },
    { id: 'ceo', emoji: '🏢', name: '霸道总裁' },
    { id: 'badboy', emoji: '👨‍🎤', name: '风流浪子' },
    { id: 'ironic', emoji: '🙃', name: '阴阳怪气' },
    { id: 'rap', emoji: '🎤', name: '嘻哈rap' },
    { id: 'polite', emoji: '🎩', name: '礼貌怼人' },
    { id: 'save', emoji: '🥺', name: '分手挽留' },
    { id: 'artistic', emoji: '📝', name: '文艺青年' },
    { id: 'apologize', emoji: '😔', name: '道歉求和' }
];

// 风格详细说明
const STYLE_INSTRUCTIONS = {
    'master': '展现恋爱专家的专业度，语言要有指导性和权威性，同时保持温暖共情，能精准分析情感需求并提供智慧解决方案。',
    'push-pull': '巧妙运用推拉技巧，时而靠近时而疏远，制造情感张力，让对方始终保持在期待和好奇的状态中。',
    'player': '展现情场高手的自信和游刃有余，语言风趣幽默但不过分轻浮，懂得何时进何时退，掌控对话节奏。',
    'coax': '语气温柔耐心，充满安抚力量，像哄小孩一样有耐心，让对方感受到被珍视和被呵护的安全感。',
    'mature': '展现成熟稳重的父辈关怀，言语间透露出责任感和可靠感，能为对方提供实际帮助和智慧建议。',
    'puppy': '展现年轻活力的弟弟感，语气可爱活泼，带点撒娇和依赖，让对方产生保护欲和照顾欲。',
    'king': '展现恋爱中的主导地位，自信霸气但不傲慢，言语间透露出掌控力和领导力，让对方感受到被引领的安全感。',
    'roast': '用幽默调侃的方式表达关心，表面怼人实则关心，把握好调侃的度不伤感情，增进亲密感。',
    'deep': '展现深情专一的一面，语言真挚感人，情感浓度高但不压迫，让对方感受到被深爱的安全感。',
    'gentle': '语气温暖细腻，体贴入微，像春日阳光般和煦，让对方感受到被温柔包裹的舒适感。',
    'funny': '展现幽默风趣的一面，用笑话和段子活跃气氛，让对话轻松愉快，拉近彼此距离。',
    'honest': '展现真诚直率的一面，不拐弯抹角，用最真实朴素的语言表达情感，让对方感受到真诚的可贵。'
};

const LOVE_SCENES = {
    'self-intro': '生成不同数量的自我介绍文案，用于社交软件或初次见面。要求：简洁有趣，突出个性，适合年轻人使用。每条控制在30字以内。',
    'ice-breaker': '生成不同数量的万能开场白，用于和刚匹配的人开始对话。要求：自然不做作，能引起对方回复兴趣。',
    'goodnight': '生成不同数量的晚安问候语，发给暧昧对象或恋人。要求：温馨甜蜜，带有一点想念或关心。',
    'funny-morning': '生成不同数量的搞笑早安问候，用于给喜欢的人发消息。要求：幽默风趣，能让人会心一笑。',
    'flirty': '生成不同数量的撩人短句，用于暧昧期升温。要求：不过分油腻，恰到好处地表达好感。',
    'daily-thoughts': '生成不同数量的适合发朋友圈或发给朋友的日常碎碎念，关于生活小感悟。',
    'deep-talk': '生成不同数量的深度破冰话题，适合初次见面但想快速了解对方。',
    'dating': '生成不同数量的适合相亲场景的开场或过渡话术，缓解尴尬，展现礼貌和情商。',
    'hobbies': '生成不同数量挖掘对方兴趣爱好的问句或话题引子，自然不突兀。',
    'daily-life': '生成不同数量分享日常生活的话题或句子，适合日常聊天维持热度。',
    'about-love': '生成不同数量关于爱情观的探讨话题或观点分享，适合了解对方感情观。',
    'ambiguous': '生成不同数量的暧昧期说的情话，若隐若现，欲拒还迎，推拉感十足。',
    'romantic': '生成不同数量的浪漫深情表白句子，适合正式表白或深情时刻。',
    'confession': '生成不同数量的简短有力的表白金句，一句话打动人心。',
    'classical': '生成不同数量的古风浪漫情话或诗词改编，适合喜欢传统文化的情侣。',
    'announce': '生成不同数量的适合公开恋情的"官宣"文案，甜蜜又有趣。',
    'corny': '生成不同数量的土味情话，cheesy但可爱。',
    'ask-wechat': '生成不同数量自然索要微信的话术，不显得唐突。',
    'ask-photo': '生成不同数量委婉想要对方照片的话术，幽默或温柔。',
    'dinner': '生成不同数量约饭的邀请话术，留有余地不被拒绝。',
    'movie': '生成不同数量约看电影的邀请，包含具体的话术和理由。',
    'meet': '生成不同数量线下见面邀约话术，安全舒适，给对方选择权。',
    'game': '生成不同数量约一起打游戏的开黑邀请，轻松随意。',
    'compliment': '生成不同数量彩虹屁夸奖，夸到点子上，真诚不油腻。',
    'comfort': '生成不同数量安慰鼓励的话，对方遇到挫折时发送，温暖有力量。',
    'apologize': '生成不同数量撒娇式认错文案，适合小矛盾后缓和气氛，可爱又诚恳。'
};

const LOVE_SCENES_NAMES = {
    'self-intro': '自我介绍',
    'ice-breaker': '万能开场',
    'goodnight': '晚安问候',
    'funny-morning': '搞笑早安',
    'flirty': '撩人短句',
    'daily-thoughts': '日常碎碎念',
    'deep-talk': '深度话题',
    'dating': '相亲话术',
    'hobbies': '兴趣爱好',
    'daily-life': '日常分享',
    'about-love': '爱情观探讨',
    'ambiguous': '暧昧情话',
    'romantic': '浪漫表白',
    'confession': '表白金句',
    'classical': '古风情话',
    'announce': '官宣文案',
    'corny': '土味情话',
    'ask-wechat': '要微信话术',
    'ask-photo': '要照片话术',
    'dinner': '约饭邀请',
    'movie': '看电影邀请',
    'meet': '见面邀约',
    'game': '游戏邀请',
    'compliment': '彩虹屁夸奖',
    'comfort': '安慰鼓励',
    'apologize': '撒娇认错'
};

// 关系阶段对应的表情库
const EMOJI_POOLS = {
    'emotional': ['😏', '🤔', '💭', '✨', '👀', '😉', '🤝', '💡'],
    'friend': ['😊', '😄', '👋', '👍', '🤝', '😎', '🎉', '😂'],
    'buddy': ['😎', '🤙', '🔥', '💪', '🎮', '⚽', '🍻', '👊'],
    'new': ['👋', '😊', '🙂', '🤔', '💬', '👀', '✨', '🙋'],
    'icebreak': ['😄', '😂', '🤣', '🤪', '😜', '🙃', '🤔', '😎'],
    'ambiguous': ['😉', '💋', '😘', '🥰', '😍', '💕', '✨', '🥺'],
    'fwb': ['😏', '🔥', '💋', '😈', '👅', '🍑', '💦', '😽'],
    'hot': ['💕', '😍', '🥰', '💋', '😘', '❤️', '🔥', '💗'],
    'conflict': ['🤔', '💭', '😐', '🙁', '😔', '💫', '🤝', '✨'],
    'recover': ['🥺', '😢', '💔', '🙏', '❤️', '🥰', '😔', '💕']
};

// ========== 应用状态 ==========
let currentMode = 'love';
let selectedStyle = null;
let isGenerating = false;
let history = JSON.parse(localStorage.getItem('chat_history') || '[]');
let currentPlatform = null;

// ========== DOM 初始化 ==========
document.addEventListener('DOMContentLoaded', () => {
    renderHistory();
    renderStyleGrid();
    renderProviders();
    loadGenderSettings();
    loadProcessSettings();
    renderTechniqueSwitches();
    initAllSliders();
    
    document.getElementById('userInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleGenerate();
    });
});

// ========== 模式切换 ==========
function switchMode(mode) {
    currentMode = mode;
    document.querySelectorAll('.mode-tab').forEach(tab => {
        tab.classList.remove('active');
        if (tab.dataset.mode === mode) tab.classList.add('active');
    });
    
    const input = document.getElementById('userInput');
    const styleGrid = document.getElementById('styleGrid');
    const styleHint = document.getElementById('styleHint');
    const categoryContainer = document.getElementById('categoryContainer');
    
    if (mode === 'express') {
        input.placeholder = '告诉我你想和TA说的话...';
        styleGrid.classList.add('active');
        styleHint.textContent = '点击风格帮你表达润色';
        categoryContainer.style.display = 'none';
    } else if (mode === 'reply') {
        input.placeholder = '粘贴TA说的话...';
        styleGrid.classList.add('active');
        styleHint.textContent = '选择回复风格';
        categoryContainer.style.display = 'none';
    } else {
        input.placeholder = '选择上方场景，或输入具体情境...';
        styleGrid.classList.remove('active');
        categoryContainer.style.display = 'block';
    }
    
    selectedStyle = null;
    document.querySelectorAll('.style-btn').forEach(btn => btn.classList.remove('selected'));
}

function renderStyleGrid() {
    document.getElementById('styleGrid').innerHTML = STYLES.map(s => `
        <button class="style-btn" onclick="selectStyle('${s.id}')" data-style="${s.id}">
            <span class="emoji">${s.emoji}</span>
            <span>${s.name}</span>
        </button>
    `).join('');
}

function selectStyle(id) {
    selectedStyle = id;
    document.querySelectorAll('.style-btn').forEach(btn => {
        btn.classList.remove('selected');
        if (btn.dataset.style === id) btn.classList.add('selected');
    });
    
    if (!('ontouchstart' in window)) {
        document.getElementById('userInput').focus();
    }
}

// ========== 设置面板 ==========
function openSettings() {
    document.getElementById('settingsOverlay').classList.add('active');
    document.body.style.overflow = 'hidden';
    loadAllSettings();
}

function switchSettingsTab(tabName) {
    const tabIndex = { 'basic': 0, 'ai': 1, 'preference': 2 };
    const currentIndex = tabIndex[tabName] || 0;

    document.querySelectorAll('.settings-tab-card').forEach((card, i) => {
        card.classList.toggle('active', i === currentIndex);
    });
    document.querySelectorAll('.settings-dot').forEach((dot, i) => {
        dot.classList.toggle('active', i === currentIndex);
    });
    document.querySelectorAll('.settings-panel').forEach(panel => panel.classList.remove('active'));
    document.getElementById('panel-' + tabName).classList.add('active');
}

function closeSettings() {
    document.getElementById('settingsOverlay').classList.remove('active');
    document.body.style.overflow = '';
}

function toggleExpand(element) {
    const isExpanded = element.classList.contains('expanded');
    element.classList.toggle('expanded');
    element.setAttribute('data-expanded', !isExpanded);
}

function toggleTechnique(tag) {
    tag.classList.toggle('selected');
    event.stopPropagation();
}

function togglePlatform(tag) {
    tag.classList.toggle('selected');
    const platform = tag.dataset.platform;
    const configItem = document.querySelector(`.api-config-item[data-platform="${platform}"]`);
    const emptyState = document.getElementById('apiEmptyState');
    if (configItem) {
        configItem.style.display = tag.classList.contains('selected') ? 'block' : 'none';
    }
    const anySelected = document.querySelector('.platform-tag.selected');
    if (emptyState) {
        emptyState.style.display = anySelected ? 'none' : 'block';
    }

    const isSelected = tag.classList.contains('selected');
    config.set(`platform_${platform}_selected`, isSelected ? 'true' : 'false');

    if (isSelected) {
        const urlInput = document.getElementById(`${platform}Url`);
        const keyInput = document.getElementById(`${platform}Key`);
        let provider = CONFIG.providers.find(p => p.platform === platform);
        if (!provider) {
            const platformInfo = PLATFORMS[platform];
            const defaultModels = platformInfo?.models?.map((name, idx) => ({
                name: name,
                enabled: true,
                isDefault: idx === 0
            })) || [];

            provider = {
                id: 'provider_' + platform + '_' + Date.now(),
                platform: platform,
                name: platformInfo?.name || platform,
                url: urlInput?.value || platformInfo?.defaultUrl || '',
                key: keyInput?.value || '',
                models: defaultModels
            };
            CONFIG.providers.push(provider);
        }
        if (!CONFIG.activeProvider) {
            CONFIG.activeProvider = provider.id;
            localStorage.setItem('active_provider', CONFIG.activeProvider);
        }
    } else {
        CONFIG.providers = CONFIG.providers.filter(p => p.platform !== platform);
        if (CONFIG.activeProvider) {
            const activeProvider = CONFIG.providers.find(p => p.id === CONFIG.activeProvider);
            if (!activeProvider && CONFIG.providers.length > 0) {
                CONFIG.activeProvider = CONFIG.providers[0].id;
                localStorage.setItem('active_provider', CONFIG.activeProvider);
            }
        }
    }
    localStorage.setItem('ai_providers', JSON.stringify(CONFIG.providers));

    renderModelList();

    event.stopPropagation();
}

function stepperAdjust(type, delta) {
    if (type === 'batchSize') {
        const input = document.getElementById('batchSizeValue');
        let value = parseInt(input.textContent) || 6;
        value = Math.max(1, Math.min(20, value + delta));
        input.textContent = value;
    }
}

function toggleSwitch(id) {
    const toggle = document.getElementById(id + 'Toggle');
    const label = document.getElementById(id + 'Label');
    if (toggle && label) {
        label.textContent = toggle.checked ? '开' : '关';
    }
}

function loadAllSettings() {
    const myGender = config.get('my_gender', 'male');
    const targetGender = config.get('target_gender', 'female');
    const relationship = config.get('relationship_stage', 'emotional');
    const intimacy = config.get('intimacy', '5');
    const depth = config.get('depth', '5');
    const sweetness = config.get('sweetness', '50');
    const toneStrength = config.get('tone_strength', '5');
    const humorLevel = config.get('humor_level', '3');
    const contentLength = config.get('content_length', 'medium');
    const creativity = config.get('creativity', 'medium');
    const batchSize = config.get('batch_size', '6');
    const autoEmoji = config.get('auto_emoji', 'false') === 'true';

    document.getElementById('myGenderSelect').value = myGender;
    document.getElementById('targetGenderSelect').value = targetGender;
    document.getElementById('relationshipStageSelect').value = relationship;

    document.getElementById('intimacyValue').textContent = intimacy;
    document.getElementById('intimacyRange').value = intimacy;
    document.getElementById('depthValue').textContent = depth;
    document.getElementById('depthRange').value = depth;
    document.getElementById('sweetnessValue').textContent = sweetness + '%';
    document.getElementById('sweetnessRange').value = sweetness;
    document.getElementById('toneStrengthValue').textContent = toneStrength;
    document.getElementById('toneStrengthRange').value = toneStrength;
    document.getElementById('humorLevelValue').textContent = humorLevel;
    document.getElementById('humorLevelRange').value = humorLevel;

    document.getElementById('lengthSelect').value = contentLength;
    document.getElementById('creativitySelect').value = creativity;
    document.getElementById('batchSizeValue').textContent = batchSize;

    const emojiToggle = document.getElementById('autoEmojiToggle');
    const emojiLabel = document.getElementById('autoEmojiLabel');
    if (emojiToggle) emojiToggle.checked = autoEmoji;
    if (emojiLabel) emojiLabel.textContent = autoEmoji ? '开' : '关';

    document.querySelectorAll('.technique-tag').forEach(tag => {
        const tech = tag.dataset.technique;
        const key = `technique_${tech.replace(/-/g, '_')}`;
        tag.classList.toggle('selected', config.get(key) === 'true');
    });

    renderModelList();

    const savedProviders = localStorage.getItem('ai_providers');
    if (savedProviders) {
        CONFIG.providers = JSON.parse(savedProviders);
    }
    const savedActiveProvider = localStorage.getItem('active_provider');
    if (savedActiveProvider) {
        CONFIG.activeProvider = savedActiveProvider;
    }

    document.querySelectorAll('.platform-tag').forEach(tag => {
        const platform = tag.dataset.platform;
        const isSelected = config.get(`platform_${platform}_selected`) === 'true';
        tag.classList.toggle('selected', isSelected);
        const configItem = document.querySelector(`.api-config-item[data-platform="${platform}"]`);
        if (configItem) {
            configItem.style.display = isSelected ? 'block' : 'none';
        }
    });

    const emptyState = document.getElementById('apiEmptyState');
    if (emptyState) {
        const anySelected = document.querySelector('.platform-tag.selected');
        emptyState.style.display = anySelected ? 'none' : 'block';
    }

    CONFIG.providers.forEach(provider => {
        if (provider.platform === 'openai') {
            document.getElementById('openaiUrl').value = provider.url || '';
            document.getElementById('openaiKey').value = provider.key || '';
        } else if (provider.platform === 'claude') {
            document.getElementById('claudeUrl').value = provider.url || '';
            document.getElementById('claudeKey').value = provider.key || '';
        } else if (provider.platform === 'deepseek') {
            document.getElementById('deepseekUrl').value = provider.url || '';
            document.getElementById('deepseekKey').value = provider.key || '';
        } else if (provider.platform === 'kimi') {
            document.getElementById('kimiUrl').value = provider.url || '';
            document.getElementById('kimiKey').value = provider.key || '';
        } else if (provider.platform === 'doubao') {
            document.getElementById('doubaoUrl').value = provider.url || '';
            document.getElementById('doubaoKey').value = provider.key || '';
        } else if (provider.platform === 'qwen') {
            document.getElementById('qwenUrl').value = provider.url || '';
            document.getElementById('qwenKey').value = provider.key || '';
        }
    });
}

function saveAllSettings() {
    const myGender = document.getElementById('myGenderSelect').value;
    const targetGender = document.getElementById('targetGenderSelect').value;
    const relationship = document.getElementById('relationshipStageSelect').value;
    const intimacy = document.getElementById('intimacyRange').value;
    const depth = document.getElementById('depthRange').value;
    const sweetness = document.getElementById('sweetnessRange').value;
    const toneStrength = document.getElementById('toneStrengthRange').value;
    const humorLevel = document.getElementById('humorLevelRange').value;
    const contentLength = document.getElementById('lengthSelect').value;
    const creativity = document.getElementById('creativitySelect').value;
    const batchSize = document.getElementById('batchSizeValue').textContent;
    const autoEmoji = document.getElementById('autoEmojiToggle').checked;

    config.set('my_gender', myGender);
    config.set('target_gender', targetGender);
    config.set('relationship_stage', relationship);
    config.set('intimacy', intimacy);
    config.set('depth', depth);
    config.set('sweetness', sweetness);
    config.set('tone_strength', toneStrength);
    config.set('humor_level', humorLevel);
    config.set('content_length', contentLength);
    config.set('creativity', creativity);
    config.set('batch_size', batchSize);
    config.set('auto_emoji', autoEmoji ? 'true' : 'false');

    document.querySelectorAll('.technique-tag.selected').forEach(tag => {
        const tech = tag.dataset.technique;
        const key = `technique_${tech.replace(/-/g, '_')}`;
        config.set(key, 'true');
    });

    document.querySelectorAll('.technique-tag:not(.selected)').forEach(tag => {
        const tech = tag.dataset.technique;
        const key = `technique_${tech.replace(/-/g, '_')}`;
        config.set(key, 'false');
    });

    document.querySelectorAll('.platform-tag').forEach(tag => {
        const platform = tag.dataset.platform;
        const isSelected = tag.classList.contains('selected');
        config.set(`platform_${platform}_selected`, isSelected ? 'true' : 'false');

        if (isSelected) {
            const urlInput = document.getElementById(`${platform}Url`);
            const keyInput = document.getElementById(`${platform}Key`);
            let provider = CONFIG.providers.find(p => p.platform === platform);
            if (!provider) {
                const platformInfo = PLATFORMS[platform];
                const defaultModels = platformInfo?.models?.map((name, idx) => ({
                    name: name,
                    enabled: true,
                    isDefault: idx === 0
                })) || [];

                provider = {
                    id: 'provider_' + platform + '_' + Date.now(),
                    platform: platform,
                    name: platformInfo?.name || platform,
                    url: urlInput?.value || platformInfo?.defaultUrl || '',
                    key: keyInput?.value || '',
                    models: defaultModels
                };
                CONFIG.providers.push(provider);
            } else {
                provider.url = urlInput?.value || provider.url;
                provider.key = keyInput?.value || provider.key;
            }
        } else {
            CONFIG.providers = CONFIG.providers.filter(p => p.platform !== platform);
        }
    });

    localStorage.setItem('ai_providers', JSON.stringify(CONFIG.providers));

    promptBuilder.refresh();
    showToast('设置已保存');
}

function openAddProvider() {
    document.getElementById('addProviderOverlay').classList.add('active');
    document.getElementById('providerConfig').style.display = 'none';
    document.querySelectorAll('.platform-btn').forEach(btn => btn.classList.remove('selected'));
    document.getElementById('providerName').value = '';
    document.getElementById('providerUrl').value = '';
    document.getElementById('providerKey').value = '';
    currentModels = [];
    renderModelList();
}

function closeAddProvider() {
    document.getElementById('addProviderOverlay').classList.remove('active');
}

function selectPlatform(platform) {
    document.querySelectorAll('.platform-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-platform="${platform}"]`).classList.add('selected');
    
    const config = document.getElementById('providerConfig');
    config.style.display = 'block';
    
    const platformInfo = PLATFORMS[platform];
    document.getElementById('providerUrl').placeholder = platformInfo.defaultUrl;
    
    const modelsList = document.getElementById('providerModelsList');
    modelsList.innerHTML = '';
    platformInfo.models.forEach(model => {
        addModelInput(model);
    });
}

let modelInputCount = 0;
let currentModels = [];

function selectPlatform(platform) {
    document.querySelectorAll('.platform-btn').forEach(btn => btn.classList.remove('selected'));
    document.querySelector(`[data-platform="${platform}"]`).classList.add('selected');
    
    const config = document.getElementById('providerConfig');
    config.style.display = 'block';
    
    const platformInfo = PLATFORMS[platform];
    document.getElementById('providerUrl').placeholder = platformInfo.defaultUrl;
    
    currentModels = platformInfo.models.map((name, index) => ({
        id: 'model_' + (++modelInputCount),
        name: name,
        contextLength: getContextLength(name),
        enabled: true,
        isDefault: index === 0
    }));
    
    renderModelList();
}

function validateApiUrl(url) {
    if (!url) return null;
    
    // 移除末尾的斜杠
    let cleanedUrl = url.trim().replace(/\/$/, '');
    
    // 检查是否以 /v1 结尾
    if (!cleanedUrl.endsWith('/v1')) {
        // 检查是否包含 /v1
        if (cleanedUrl.includes('/v1')) {
            // 保留现有格式
        } else {
            // 根据平台类型添加适当的后缀
            if (cleanedUrl.includes('openai')) {
                cleanedUrl += '/v1/chat/completions';
            } else if (cleanedUrl.includes('anthropic')) {
                cleanedUrl += '/v1/messages';
            } else if (cleanedUrl.includes('deepseek')) {
                cleanedUrl += '/v1/chat/completions';
            } else if (cleanedUrl.includes('moonshot')) {
                cleanedUrl += '/v1/chat/completions';
            } else if (cleanedUrl.includes('volces')) {
                cleanedUrl += '/api/v3/chat/completions';
            } else if (cleanedUrl.includes('dashscope')) {
                cleanedUrl += '/compatible-mode/v1/chat/completions';
            } else {
                // 默认添加 /v1/chat/completions
                cleanedUrl += '/v1/chat/completions';
            }
        }
    }
    
    return cleanedUrl;
}

function getContextLength(modelName) {
    const ctxMap = {
        '8k': '8K', '32k': '32K', '128k': '128K', '64k': '64K',
        '4o': '128K', '4o-mini': '128K', '4-turbo': '128K',
        'sonnet': '200K', 'opus': '200K', 'haiku': '200K'
    };
    for (const [key, val] of Object.entries(ctxMap)) {
        if (modelName.includes(key)) return val;
    }
    return '128K';
}

function renderModelList() {
    const container = document.getElementById('modelListContainer');
    if (!container) return;

    const selectedPlatform = document.querySelector('.platform-tag.selected');
    let models = [];

    if (selectedPlatform) {
        const platform = selectedPlatform.dataset.platform;
        const provider = CONFIG.providers.find(p => p.platform === platform);
        if (provider) {
            models = provider.models || [];
        }
    }

    container.innerHTML = models.map((model, index) => `
        <div class="model-item" data-index="${index}">
            <div class="model-info">
                <span class="model-name">${model.name}</span>
                ${model.isDefault ? '<span class="model-default-tag">默认</span>' : ''}
            </div>
            <div class="model-actions">
                <span class="model-default-btn ${model.isDefault ? 'active' : ''}" onclick="setDefaultModel(${index})">
                    ${model.isDefault ? '★' : '☆'}
                </span>
                <span class="model-delete-btn" onclick="deleteModel(${index})">删除</span>
            </div>
        </div>
    `).join('');
}

function setDefaultModel(index) {
    const selectedPlatform = document.querySelector('.platform-tag.selected');
    if (!selectedPlatform) return;

    const platform = selectedPlatform.dataset.platform;
    const provider = CONFIG.providers.find(p => p.platform === platform);
    if (!provider) return;

    provider.models.forEach((m, i) => m.isDefault = (i === index));
    localStorage.setItem('ai_providers', JSON.stringify(CONFIG.providers));
    renderModelList();
}

function deleteModel(index) {
    const selectedPlatform = document.querySelector('.platform-tag.selected');
    if (!selectedPlatform) return;

    const platform = selectedPlatform.dataset.platform;
    const provider = CONFIG.providers.find(p => p.platform === platform);
    if (!provider) return;

    const wasDefault = provider.models[index].isDefault;
    provider.models.splice(index, 1);
    if (wasDefault && provider.models.length > 0) {
        provider.models[0].isDefault = true;
    }
    localStorage.setItem('ai_providers', JSON.stringify(CONFIG.providers));
    renderModelList();
}

function addModel() {
    const input = document.getElementById('newModelName');
    if (!input) return;
    const name = input.value.trim();
    if (!name) return;

    const selectedPlatform = document.querySelector('.platform-tag.selected');
    if (!selectedPlatform) {
        showToast('请先选择服务商平台');
        return;
    }

    const platform = selectedPlatform.dataset.platform;
    const provider = CONFIG.providers.find(p => p.platform === platform);
    if (!provider) return;

    const newModel = {
        name: name,
        enabled: true,
        isDefault: provider.models.length === 0
    };
    provider.models.push(newModel);
    localStorage.setItem('ai_providers', JSON.stringify(CONFIG.providers));
    input.value = '';
    renderModelList();
}

function saveProvider() {
    const selectedPlatform = document.querySelector('.platform-btn.selected');
    if (!selectedPlatform) {
        showToast('请先选择平台');
        return;
    }
    
    const platform = selectedPlatform.dataset.platform;
    const name = document.getElementById('providerName').value.trim();
    let url = document.getElementById('providerUrl').value.trim();
    const key = document.getElementById('providerKey').value.trim();
    
    // 验证并处理 API URL
    const validatedUrl = validateApiUrl(url);
    if (!validatedUrl) {
        showToast('请输入有效的API地址');
        return;
    }
    url = validatedUrl;
    
    if (!name) {
        showToast('请输入服务商名称');
        return;
    }
    if (!url) {
        showToast('请输入API地址');
        return;
    }
    if (!key) {
        showToast('请输入API密钥');
        return;
    }
    
    const validModels = currentModels.filter(m => m.name.trim());
    if (validModels.length === 0) {
        showToast('请至少添加一个模型');
        return;
    }
    
    const models = validModels.map((m, index) => ({
        name: m.name.trim(),
        enabled: m.enabled,
        isDefault: m.isDefault || index === 0
    }));
    
    const provider = {
        id: 'provider_' + Date.now(),
        name,
        platform,
        url,
        key,
        models,
        enabled: true
    };
    
    CONFIG.providers.push(provider);
    localStorage.setItem('ai_providers', JSON.stringify(CONFIG.providers));
    
    if (!CONFIG.activeProvider) {
        CONFIG.activeProvider = provider.id;
        localStorage.setItem('active_provider', provider.id);
    }
    
    renderProviders();
    closeAddProvider();
    showToast('服务商添加成功');
}

function openProviderDetail(id) {
    const provider = CONFIG.providers.find(p => p.id === id);
    if (!provider) return;
    
    const detailBody = document.getElementById('providerDetailBody');
    const isActive = CONFIG.activeProvider === id;
    const enabledModels = provider.models?.filter(m => m.enabled) || [];
    
    detailBody.innerHTML = `
        <div style="margin-bottom:16px;">
            <div style="font-size:16px;font-weight:bold;margin-bottom:8px;">${provider.name}</div>
            <div style="font-size:12px;opacity:0.7;">${PLATFORMS[provider.platform]?.name || provider.platform}</div>
        </div>
        
        <div>
            <label>API 地址</label>
            <div style="font-size:13px;word-break:break-all;">${provider.url}</div>
        </div>
        
        <div>
            <label>启用模型</label>
            <div style="font-size:13px;">${enabledModels.map(m => m.name).join(', ') || '无'}</div>
        </div>
        
        <div style="display:flex;gap:8px;margin-top:16px;">
            ${!isActive ? `<button class="btn btn-primary" onclick="setActiveProvider('${id}')" style="flex:1;">设为默认</button>` : ''}
            <button class="btn btn-secondary" onclick="deleteProvider('${id}')" style="flex:1;color:#e74c3c;">删除</button>
        </div>
    `;
    
    document.getElementById('providerDetailOverlay').classList.add('active');
}

function closeProviderDetail() {
    document.getElementById('providerDetailOverlay').classList.remove('active');
}

function setActiveProvider(id) {
    CONFIG.activeProvider = id;
    localStorage.setItem('active_provider', id);
    renderProviders();
    closeProviderDetail();
    showToast('已设为默认服务商');
}

function deleteProvider(id) {
    if (!confirm('确定要删除该服务商吗？')) return;
    
    CONFIG.providers = CONFIG.providers.filter(p => p.id !== id);
    localStorage.setItem('ai_providers', JSON.stringify(CONFIG.providers));
    
    if (CONFIG.activeProvider === id) {
        CONFIG.activeProvider = CONFIG.providers[0]?.id || null;
        localStorage.setItem('active_provider', CONFIG.activeProvider || '');
    }
    
    renderProviders();
    closeProviderDetail();
    showToast('已删除服务商');
}

function saveBasic() {
    const myGender = document.querySelector('input[name="myGender"]:checked')?.value;
    const targetGender = document.querySelector('input[name="targetGender"]:checked')?.value;
    config.set('my_gender', myGender || '');
    config.set('target_gender', targetGender || '');
    
    const selectedOption = document.querySelector('.relationship-option.selected');
    const relationship = selectedOption?.dataset.value || 'emotional';
    config.set('relationship_stage', relationship);
    
    const intimacy = document.getElementById('intimacyRange')?.value || '5';
    const depth = document.getElementById('depthRange')?.value || '5';
    const sweetness = document.getElementById('sweetnessRange')?.value || '50';
    const toneStrength = document.getElementById('toneStrengthRange')?.value || '5';
    const humorLevel = document.getElementById('humorLevelRange')?.value || '3';
    
    config.set('intimacy', intimacy);
    config.set('depth', depth);
    config.set('sweetness', sweetness);
    config.set('tone_strength', toneStrength);
    config.set('humor_level', humorLevel);
    
    // 保存技法开关状态
    saveTechniqueSwitches();
    
    showToast('基础设置已保存');
}

// 渲染技法开关区域 (需在基础信息面板中插入对应HTML)
function renderTechniqueSwitches() {
    const container = document.getElementById('techniqueSwitchesContainer');
    if (!container) {
        console.warn('技法开关容器未找到，请检查HTML中是否包含 id="techniqueSwitchesContainer" 的元素');
        return;
    }
    
    let html = `
        <div class="technique-header">
            <span class="technique-title">🎯 调情技法开关</span>
            <div class="technique-actions">
                <button type="button" class="technique-action-btn" onclick="selectAllTechniques(true)">全选</button>
                <button type="button" class="technique-action-btn" onclick="selectAllTechniques(false)">清空</button>
            </div>
        </div>
        <div class="technique-grid">
    `;
    
    TECHNIQUE_IDS.forEach(techId => {
        const tech = FLIRTATION_TECHNIQUES[techId];
        const key = `technique_${techId.replace(/-/g, '_')}`;
        const isChecked = config.get(key) === 'true' ? 'checked' : '';
        
        html += `
            <label class="technique-switch" title="${tech.description}">
                <input type="checkbox" data-technique="${techId}" ${isChecked} onchange="updateTechniqueState()">
                <span class="technique-name">${tech.name}</span>
            </label>
        `;
    });
    
    html += `</div>`;
    container.innerHTML = html;
}

function saveTechniqueSwitches() {
    const checkboxes = document.querySelectorAll('input[data-technique]');
    checkboxes.forEach(cb => {
        const techId = cb.dataset.technique;
        const key = `technique_${techId.replace(/-/g, '_')}`;
        config.set(key, cb.checked ? 'true' : 'false');
    });
    // 刷新prompt构建器
    promptBuilder.refresh();
}

function updateTechniqueState() {
    saveTechniqueSwitches();
}

function selectAllTechniques(select) {
    const checkboxes = document.querySelectorAll('input[data-technique]');
    checkboxes.forEach(cb => cb.checked = select);
    saveTechniqueSwitches();
}

// ========== 滑块辅助函数 ==========
/**
 * 更新滑块值显示和背景渐变
 * @param {string} rangeId - 滑块input的ID
 * @param {string} valueId - 显示值的元素ID
 * @param {string} suffix - 值的后缀（如 %）
 */
function updateSliderValue(rangeId, valueId, suffix = '') {
    const range = document.getElementById(rangeId);
    const valueDisplay = document.getElementById(valueId);
    
    if (range && valueDisplay) {
        const value = range.value;
        valueDisplay.textContent = value + suffix;
        updateSliderBackground(range);
    }
}

/**
 * 更新滑块的背景渐变
 * @param {HTMLInputElement} range - 滑块元素
 */
function updateSliderBackground(range) {
    const min = parseFloat(range.min) || 0;
    const max = parseFloat(range.max) || 100;
    const value = parseFloat(range.value) || 0;
    const percentage = ((value - min) / (max - min)) * 100;
    
    range.style.background = `linear-gradient(to right, var(--primary-color) ${percentage}%, var(--border-color) ${percentage}%)`;
}

/**
 * 初始化单个滑块
 * @param {string} rangeId - 滑块input的ID
 * @param {string} valueId - 显示值的元素ID
 * @param {string} suffix - 值的后缀
 */
function initSlider(rangeId, valueId, suffix = '') {
    const range = document.getElementById(rangeId);
    if (range) {
        updateSliderValue(rangeId, valueId, suffix);
        
        // 添加触摸事件处理，防止误触
        let isDragging = false;
        
        range.addEventListener('touchstart', (e) => {
            isDragging = true;
        }, { passive: true });
        
        range.addEventListener('touchmove', (e) => {
            if (isDragging) {
                e.stopPropagation();
            }
        }, { passive: true });
        
        range.addEventListener('touchend', () => {
            isDragging = false;
        }, { passive: true });
    }
}

/**
 * 初始化所有滑块
 */
function initAllSliders() {
    initSlider('intimacyRange', 'intimacyValue', '');
    initSlider('depthRange', 'depthValue', '');
    initSlider('sweetnessRange', 'sweetnessValue', '%');
    initSlider('toneStrengthRange', 'toneStrengthValue', '');
    initSlider('humorLevelRange', 'humorLevelValue', '');
}

function loadGenderSettings() {
    const myGender = config.get('my_gender');
    const targetGender = config.get('target_gender');
    
    if (myGender === 'male') document.getElementById('myGenderMale').checked = true;
    if (myGender === 'female') document.getElementById('myGenderFemale').checked = true;
    if (targetGender === 'male') document.getElementById('targetGenderMale').checked = true;
    if (targetGender === 'female') document.getElementById('targetGenderFemale').checked = true;
    
    const relationship = config.get('relationship_stage', 'emotional');
    const options = document.querySelectorAll('.relationship-option');
    
    options.forEach(opt => {
        opt.classList.remove('selected');
        if (opt.dataset.value === relationship) {
            opt.classList.add('selected');
            document.getElementById('relationshipHint').textContent = opt.textContent;
            opt.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        }
    });
    
    const intimacy = config.get('intimacy', '5');
    const depth = config.get('depth', '5');
    const sweetness = config.get('sweetness', '50');
    const toneStrength = config.get('tone_strength', '5');
    const humorLevel = config.get('humor_level', '3');
    
    const intimacyRange = document.getElementById('intimacyRange');
    const depthRange = document.getElementById('depthRange');
    const sweetnessRange = document.getElementById('sweetnessRange');
    const toneStrengthRange = document.getElementById('toneStrengthRange');
    const humorLevelRange = document.getElementById('humorLevelRange');
    
    if (intimacyRange) {
        intimacyRange.value = intimacy;
        document.getElementById('intimacyValue').textContent = intimacy;
    }
    if (depthRange) {
        depthRange.value = depth;
        document.getElementById('depthValue').textContent = depth;
    }
    if (sweetnessRange) {
        sweetnessRange.value = sweetness;
        document.getElementById('sweetnessValue').textContent = sweetness + '%';
    }
    if (toneStrengthRange) {
        toneStrengthRange.value = toneStrength;
        document.getElementById('toneStrengthValue').textContent = toneStrength;
    }
    if (humorLevelRange) {
        humorLevelRange.value = humorLevel;
        document.getElementById('humorLevelValue').textContent = humorLevel;
    }
    
    const contentLength = config.get('content_length', 'medium');
    const lengthSelect = document.getElementById('lengthSelect');
    if (lengthSelect) {
        lengthSelect.value = contentLength;
    }
    
    const creativity = config.get('creativity', 'medium');
    const creativitySelect = document.getElementById('creativitySelect');
    if (creativitySelect) {
        creativitySelect.value = creativity;
    }
    
    initRelationshipSelector();
}

function initRelationshipSelector() {
    const options = document.querySelectorAll('.relationship-option');
    const hint = document.getElementById('relationshipHint');
    
    options.forEach(opt => {
        opt.addEventListener('click', () => {
            options.forEach(o => o.classList.remove('selected'));
            opt.classList.add('selected');
            hint.textContent = opt.textContent;
            
            const stageKey = opt.dataset.value;
            config.set('relationship_stage', stageKey);
            
            const stage = RELATIONSHIP_STAGES[stageKey];
            if (stage) {
                const intimacyRange = document.getElementById('intimacyRange');
                const intimacyValue = document.getElementById('intimacyValue');
                if (intimacyRange && intimacyValue) {
                    intimacyRange.value = stage.defaultIntimacy;
                    intimacyValue.textContent = stage.defaultIntimacy;
                    config.set('intimacy', stage.defaultIntimacy.toString());
                }
                
                const depthRange = document.getElementById('depthRange');
                const depthValue = document.getElementById('depthValue');
                if (depthRange && depthValue) {
                    depthRange.value = stage.defaultTopicDepth;
                    depthValue.textContent = stage.defaultTopicDepth;
                    config.set('depth', stage.defaultTopicDepth.toString());
                }
                
                const sweetnessRange = document.getElementById('sweetnessRange');
                const sweetnessValue = document.getElementById('sweetnessValue');
                if (sweetnessRange && sweetnessValue) {
                    sweetnessRange.value = stage.defaultSweetness;
                    sweetnessValue.textContent = stage.defaultSweetness + '%';
                    config.set('sweetness', stage.defaultSweetness.toString());
                }
                
                const toneStrengthRange = document.getElementById('toneStrengthRange');
                const toneStrengthValue = document.getElementById('toneStrengthValue');
                if (toneStrengthRange && toneStrengthValue) {
                    toneStrengthRange.value = stage.defaultToneStrength;
                    toneStrengthValue.textContent = stage.defaultToneStrength;
                    config.set('tone_strength', stage.defaultToneStrength.toString());
                }
                
                const humorLevelRange = document.getElementById('humorLevelRange');
                const humorLevelValue = document.getElementById('humorLevelValue');
                if (humorLevelRange && humorLevelValue) {
                    humorLevelRange.value = stage.defaultHumorLevel;
                    humorLevelValue.textContent = stage.defaultHumorLevel;
                    config.set('humor_level', stage.defaultHumorLevel.toString());
                }
            }
        });
    });
}

function saveGenerate() {
    const batchSize = document.getElementById('batchSizeRange').value;
    const lengthSelect = document.getElementById('lengthSelect').value;
    const creativitySelect = document.getElementById('creativitySelect').value;
    
    config.set('batch_size', batchSize);
    config.set('content_length', lengthSelect);
    config.set('creativity', creativitySelect);
    
    showToast('已保存：每次生成 ' + batchSize + ' 条'); 
}

function saveProcess() { 
    const autoEmoji = document.getElementById('autoEmoji').checked;
    config.set('auto_emoji', autoEmoji ? 'true' : 'false');
    showToast('内容处理设置已保存'); 
}

function loadProcessSettings() {
    const autoEmoji = config.get('auto_emoji') === 'true';
    document.getElementById('autoEmoji').checked = autoEmoji;
}

function renderProviders() {
    const list = document.getElementById('providerList');
    if (CONFIG.providers.length === 0) {
        list.innerHTML = '<div style="text-align:center;color:var(--text-secondary);padding:30px;font-size:14px;">暂无配置的服务商<br><span style="font-size:12px;opacity:0.7;">点击下方添加第一个AI服务商</span></div>';
        return;
    }
    
    list.innerHTML = CONFIG.providers.map(p => {
        const enabledModels = p.models?.filter(m => m.enabled) || [];
        const defaultModel = p.models?.find(m => m.isDefault && m.enabled) || enabledModels[0];
        const isActive = CONFIG.activeProvider === p.id;
        const isDisabled = p.enabled === false;
        
        return `
            <div class="provider-card ${isActive ? 'selected' : ''} ${isDisabled ? 'disabled' : ''}" onclick="openProviderDetail('${p.id}')">
                <div class="provider-header">
                    <div class="provider-name">
                        ${p.name}
                        ${isActive ? '<span class="provider-badge">使用中</span>' : ''}
                        ${isDisabled ? '<span style="font-size:10px;color:#999;">(已禁用)</span>' : ''}
                    </div>
                    <div class="provider-status"></div>
                </div>
                <div class="provider-info">${PLATFORMS[p.platform]?.name || p.platform} · ${defaultModel?.name || '未设置'} · ${enabledModels.length}个模型</div>
            </div>
        `;
    }).join('');
}

// ========== 内容生成 ==========
async function handleGenerate() {
    const input = document.getElementById('userInput').value.trim();
    if (currentMode === 'love') {
        if (!input) { showToast('请选择场景或输入内容'); return; }
        generateLoveContent('general', input);
    } else {
        if (!input) { showToast('请输入内容'); return; }
        if (!selectedStyle) { showToast('请先选择风格'); return; }
        generateStyledContent(input, selectedStyle, currentMode);
    }
}

async function generateLoveContent(sceneType, customContext = '') {
    if (isGenerating) return;
    if (!checkApiConfig()) return;
    
    isGenerating = true;
    showLoading();
    
    try {
        promptBuilder.refresh();
        
        const systemPrompt = promptBuilder.buildSystemPrompt({
            sceneType: sceneType,
            customContext: customContext
        });
        
        const userPrompt = customContext || promptBuilder.getLoveScenePrompt(sceneType);
        const sentences = await callAPI(userPrompt, systemPrompt);
        
        addToHistory({ 
            type: 'love', 
            scene: sceneType, 
            context: customContext, 
            sentences, 
            mode: 'love' 
        });
        
        hideLoading();
        showToast('生成成功！点击复制');
    } catch (error) {
        hideLoading();
        showToast('生成失败：' + error.message);
    } finally {
        isGenerating = false;
    }
}

async function generateStyledContent(userInput, styleId, mode) {
    if (isGenerating) return;
    if (!checkApiConfig()) return;
    
    isGenerating = true;
    showLoading();

    try {
        promptBuilder.refresh();

        const systemPrompt = promptBuilder.buildSystemPrompt({
            styleId: styleId,
            mode: mode
        });
        
        const userPrompt = promptBuilder.buildUserPrompt(mode, userInput, styleId);
        const sentences = await callAPI(userPrompt, systemPrompt);
        
        addToHistory({ 
            type: 'styled', 
            mode, 
            style: STYLES.find(s => s.id === styleId), 
            originalText: userInput, 
            sentences 
        });
        
        hideLoading();
        showToast('风格生成成功！');
    } catch (error) {
        hideLoading();
        showToast('生成失败：' + error.message);
    } finally {
        isGenerating = false;
    }
}

async function callAPI(userContent, systemContent = null) {
    const provider = CONFIG.providers.find(p => p.id === CONFIG.activeProvider);
    if (!provider) throw new Error('请先配置AI服务商');
    
    const enabledModels = provider.models?.filter(m => m.enabled) || [];
    const activeModel = provider.models?.find(m => m.isDefault && m.enabled) || enabledModels[0];
    if (!activeModel) throw new Error('该服务商没有可用的模型，请先添加模型');
    
    const finalSystemContent = systemContent || `你是专业的恋爱话术助手。请严格生成${promptBuilder.config.batchSize}条文案，每条前面加上数字序号（1. 2. 3. 等），不要多也不要少。`;
    
    const endpoint = provider.url;
    const headers = { 
        'Content-Type': 'application/json', 
        'Authorization': `Bearer ${provider.key}` 
    };
    const temperature = promptBuilder.getTemperature();

    let body;
    if (provider.platform === 'claude') {
        body = JSON.stringify({
            model: activeModel.name,
            system: finalSystemContent,
            messages: [{ role: 'user', content: userContent }],
            temperature: temperature,
            max_tokens: 800
        });
    } else {
        body = JSON.stringify({
            model: activeModel.name,
            messages: [
                { role: 'system', content: finalSystemContent },
                { role: 'user', content: userContent }
            ],
            temperature: temperature,
            max_tokens: 800
        });
    }
    
    const response = await fetch(endpoint, { 
        method: 'POST', 
        headers, 
        body
    });

    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    let content;
    try {
        const data = await response.json();
        
        if (provider.platform === 'claude') {
            if (!data.content || !data.content[0] || !data.content[0].text) {
                throw new Error('API返回数据格式错误（Claude）');
            }
            content = data.content[0].text;
        } else {
            if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
                throw new Error('API返回数据格式错误');
            }
            content = data.choices[0].message.content;
        }
        
        if (typeof content !== 'string' || content.trim().length === 0) {
            throw new Error('API返回空内容');
        }
    } catch (e) {
        throw new Error(`解析API响应失败: ${e.message}`);
    }
    
    return parseSentences(content, promptBuilder.config.batchSize);
}

function parseSentences(content, batchSize = 6) {
    // 控制台警告：显示 AI 原始输出
    console.warn('=== AI 原始输出 ===');
    console.warn('请求条数:', batchSize);
    console.warn('原始内容长度:', content.length, '字符');
    console.warn('原始内容:', content);
    
    if (!content || typeof content !== 'string') {
        throw new Error('解析失败：content无效');
    }

    content = content.trim();
    if (content.length === 0) {
        throw new Error('API返回内容为空');
    }
    
    let parts = content.split(SEQUENCE_SPLIT_REGEX);
    let sentences = [];
    
    for (let i = 1; i < parts.length; i += 2) {
        if (parts[i + 1]) {
            sentences.push(parts[i + 1].trim());
        }
    }
    
    if (sentences.length < batchSize) {
        sentences = content.split('\n');
    }
    
    const bufferSize = Math.min(batchSize * 2, 20);
    sentences = sentences
        .slice(0, bufferSize)
        .map(p => p.trim())
        .filter(p => p.length > 3)
        .filter(p => !PURE_SEQUENCE_REGEX.test(p))
        .map(p => p.replace(SEQUENCE_REGEX, ''))
        .map(p => p.replace(QUOTES_REGEX, ''))
        .map(p => p.replace(EMOJI_REGEX, ''))
        .map(p => p.replace(TEXT_EMOJI_REGEX, ''))
        .map(p => p.replace(ACTION_REGEX, ''))
        .map(p => p.replace(WHITESPACE_REGEX, ''))
        .map(p => p.trim())
        .filter(p => p.length > 0);
    
    const result = sentences.slice(0, batchSize);
    
    // 控制台警告：显示解析结果
    console.warn('=== 解析结果 ===');
    console.warn('实际解析条数:', result.length);
    console.warn('解析后的文本:', result);
    console.warn('==================');
    
    return addEmojiToSentences(result);
}

function addEmojiToSentences(sentences) {
    const autoEmoji = config.get('auto_emoji') === 'true';
    if (!autoEmoji) return sentences;
    
    const relationshipKey = config.get('relationship_stage', 'emotional');
    const emojiPool = EMOJI_POOLS[relationshipKey] || EMOJI_POOLS['emotional'];
    
    return sentences.map((sentence, index) => {
        const emojiIndex = index % emojiPool.length;
        const emoji = emojiPool[emojiIndex];
        if (!sentence.includes(emoji)) {
            return sentence + emoji;
        }
        return sentence;
    });
}

// ========== 历史管理 ==========
function addToHistory(item) {
    history.push({ 
        id: Date.now(), 
        ...item, 
        timestamp: new Date().toISOString(), 
        liked: null 
    });
    
    if (history.length > 50) history = history.slice(-50);
    localStorage.setItem('chat_history', JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const historyContainer = document.getElementById('historyMessages');
    const chatContainer = document.getElementById('chatContainer');
    
    if (history.length === 0) {
        historyContainer.innerHTML = `
            <div class="empty-state" id="emptyState">
                <div style="font-size:48px;margin-bottom:16px;opacity:0.3;">💬</div>
                <div>选择模式，开始生成专属文案</div>
                <div style="margin-top:8px;font-size:12px;opacity:0.7;">支持多平台大模型接入</div>
            </div>`;
    } else {
        historyContainer.innerHTML = history.map((item, index) => {
            let title = '', subtitle = '';
            
            if (item.mode === 'love') { 
                title = '💕 恋爱语录'; 
                subtitle = item.context ? `情境：${escapeHtml(item.context).substring(0, 20)}...` : ''; 
            }
            else if (item.mode === 'express') { 
                title = `💖 帮我表达 · ${item.style.emoji} ${item.style.name}`; 
                subtitle = `原文：${escapeHtml(item.originalText).substring(0, 25)}...`; 
            }
            else { 
                title = `💬 帮我回复 · ${item.style.emoji} ${item.style.name}`; 
                subtitle = `对方：${escapeHtml(item.originalText).substring(0, 25)}...`; 
            }
            
            return `
                <div class="message-group">
                    <div style="font-size:12px;color:var(--text-secondary);margin-left:8px;margin-bottom:4px;">
                        ${title} ${subtitle ? `<span style="opacity:0.7;">| ${subtitle}</span>` : ''}
                    </div>
                    <div class="message-bubble">
                        <div class="results-grid">
                            ${item.sentences.map((s, idx) => `
                                <div class="result-card" data-text="${escapeHtml(s)}" data-index="${idx + 1}" onclick="handleCardClick(this)">
                                    <span class="result-number">${idx + 1}</span>
                                    <div style="margin-top:4px;">${escapeHtml(s)}</div>
                                </div>
                            `).join('')}
                        </div>
                        <div class="message-actions">
                            <div class="action-group">
                                <button class="action-btn" onclick="rateMessage(${index}, true)">👍</button>
                                <button class="action-btn" onclick="rateMessage(${index}, false)">👎</button>
                                <button class="action-btn danger" onclick="deleteMessage(${index})">🗑️</button>
                            </div>
                            <div class="action-group">
                                <button class="action-btn" onclick="copyAll(${index})"><span class="action-text">复制全部</span></button>
                                <button class="action-btn" onclick="regenerate(${index})"><span class="action-text">换一批</span></button>
                            </div>
                        </div>
                    </div>
                </div>`;
        }).join('');
    }
    
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function handleCardClick(element) {
    const text = element.getAttribute('data-text');
    if (text) {
        copyText(text, element);
    }
}

function checkApiConfig() {
    if (!CONFIG.activeProvider || CONFIG.providers.length === 0) {
        showToast('请先配置AI服务商');
        openSettings();
        return false;
    }
    return true;
}

function copyText(text, element) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('已复制');
        document.querySelectorAll('.result-card').forEach(c => c.classList.remove('selected'));
        element.classList.add('selected');
    });
}

function copyAll(index) { 
    copyText(history[index].sentences.join('\n\n'), { classList: { add: () => {} } }); 
}

function rateMessage(index, isLike) { 
    history[index].liked = history[index].liked === isLike ? null : isLike; 
    localStorage.setItem('chat_history', JSON.stringify(history)); 
    renderHistory(); 
}

function deleteMessage(index) { 
    if (confirm('确定删除？')) { 
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
    if (confirm('确定清空所有历史？')) { 
        history = []; 
        localStorage.setItem('chat_history', '[]'); 
        renderHistory(); 
        showToast('历史已清空'); 
    } 
}

function clearOutput() {
    history = [];
    localStorage.setItem('chat_history', '[]');
    renderHistory();
}

function showLoading() {
    const historyContainer = document.getElementById('historyMessages');
    const loading = document.getElementById('loadingIndicator');
    
    if (loading) loading.remove();
    
    const newLoading = document.createElement('div');
    newLoading.id = 'loadingIndicator';
    newLoading.className = 'message-bubble';
    newLoading.innerHTML = `
        <div style="text-align:center;color:var(--text-secondary);font-size:14px;margin-bottom:8px;">
            AI正在思考...
        </div>
        <div class="loading-dots">
            <div class="dot"></div>
            <div class="dot"></div>
            <div class="dot"></div>
        </div>`;
    
    historyContainer.insertAdjacentElement('afterend', newLoading);
    const chatContainer = document.getElementById('chatContainer');
    chatContainer.scrollTop = chatContainer.scrollHeight;
}

function hideLoading() { 
    const loading = document.getElementById('loadingIndicator'); 
    if (loading) loading.remove(); 
}

function handleVoiceInput() { 
    showToast('语音输入功能开发中'); 
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#39;'
    };
    return text.replace(/[&<>"']/g, char => map[char]);
}

function showToast(message) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2000);
}

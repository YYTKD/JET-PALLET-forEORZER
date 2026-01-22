/**
 * Buff Area Component
 * アクティブなバフを表示・管理するコンポーネント
 */

export class BuffArea {
    constructor(containerSelector, stateManager, options = {}) {
        this.container = document.querySelector(containerSelector);
        this.stateManager = stateManager;
        this.buffLibrary = options.buffLibrary || [];

        this.init();
    }

    init() {
        // 状態変更の監視
        this.stateManager.subscribe(() => {
            this.render();
        });

        // 初回レンダリング
        this.render();
    }

    render() {
        const state = this.stateManager.getState();
        const activeBuffs = state.activeBuffs || [];

        // UIをクリア
        this.container.innerHTML = '';

        if (activeBuffs.length === 0) {
            const emptyMessage = document.createElement('p');
            emptyMessage.className = 'buff-area__empty';
            emptyMessage.textContent = 'アクティブなバフなし';
            this.container.appendChild(emptyMessage);
            return;
        }

        // 各バフを描画
        activeBuffs.forEach(buff => {
            const buffElement = this.createBuffElement(buff);
            this.container.appendChild(buffElement);
        });
    }

    /**
     * バフ要素を生成
     * @param {Object} buff - バフデータ
     * @returns {HTMLElement} バフ要素
     */
    createBuffElement(buff) {
        const container = document.createElement('div');
        container.className = `buff buff--${buff.type || 'buff'}`;
        container.dataset.buffId = buff.id;

        // 継続時間表示
        const limitSpan = document.createElement('span');
        limitSpan.className = 'buff__limit';
        limitSpan.textContent = buff.duration || '';
        container.appendChild(limitSpan);

        // アイコン
        const icon = document.createElement('img');
        icon.className = 'buff__icon';
        icon.src = buff.icon || 'assets/icons/default.png';
        icon.alt = buff.name;
        container.appendChild(icon);

        // ツールチップ
        const tooltip = this.createBuffTooltip(buff);
        container.appendChild(tooltip);

        // 削除ボタン
        const removeBtn = document.createElement('button');
        removeBtn.className = 'buff__remove';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.stateManager.removeBuff(buff.id);
        });
        container.appendChild(removeBtn);

        return container;
    }

    /**
     * バフのツールチップを生成
     * @param {Object} buff - バフデータ
     * @returns {HTMLElement} ツールチップ要素
     */
    createBuffTooltip(buff) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip card card--tooltip card--buff';

        // ヘッダー
        const header = document.createElement('div');
        header.className = 'card__header';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'card__icon';
        const iconImg = document.createElement('img');
        iconImg.className = 'card__icon--image';
        iconImg.src = buff.icon || 'assets/icons/default.png';
        iconImg.alt = buff.name;
        iconDiv.appendChild(iconImg);
        header.appendChild(iconDiv);

        const titleDiv = document.createElement('div');
        titleDiv.className = 'card__title';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'card__name';
        nameSpan.textContent = buff.name;

        const typeSpan = document.createElement('span');
        typeSpan.className = 'card__tags';
        typeSpan.textContent = buff.type === 'debuff' ? 'デバフ' : 'バフ';
        nameSpan.appendChild(typeSpan);

        titleDiv.appendChild(nameSpan);
        header.appendChild(titleDiv);
        tooltip.appendChild(header);

        // ボディ
        const body = document.createElement('div');
        body.className = 'card__body card__body--buff';

        // 効果説明
        if (buff.effect) {
            const effectDiv = document.createElement('div');
            effectDiv.className = 'card__stat';
            const effectLabel = document.createElement('span');
            effectLabel.className = 'card__label';
            effectLabel.textContent = '詳細：';
            const effectValue = document.createElement('span');
            effectValue.className = 'card__value';
            effectValue.textContent = buff.effect;
            effectDiv.appendChild(effectLabel);
            effectDiv.appendChild(effectValue);
            body.appendChild(effectDiv);
        }

        // 継続時間
        if (buff.duration) {
            const durationDiv = document.createElement('div');
            durationDiv.className = 'card__stat';
            const durationLabel = document.createElement('span');
            durationLabel.className = 'card__label';
            durationLabel.textContent = '継続時間：';
            const durationValue = document.createElement('span');
            durationValue.className = 'card__value';
            durationValue.textContent = this.getDurationDisplay(buff.duration);
            durationDiv.appendChild(durationLabel);
            durationDiv.appendChild(durationValue);
            body.appendChild(durationDiv);
        }

        tooltip.appendChild(body);
        return tooltip;
    }

    /**
     * 継続時間を表示名に変換
     * @param {string} duration - 継続時間コード
     * @returns {string} 表示名
     */
    getDurationDisplay(duration) {
        const displays = {
            '0t': 'ターン終了まで',
            '1t': '次のターン開始まで',
            'permanent': '永続',
        };
        return displays[duration] || duration;
    }

    /**
     * バフライブラリから選択して追加
     * @param {string} buffId - バフライブラリ内のID
     */
    addBuffFromLibrary(buffId) {
        const buffTemplate = this.buffLibrary.find(b => b.id === buffId);
        if (buffTemplate) {
            this.stateManager.addBuff(buffTemplate);
        }
    }
}

export default BuffArea;

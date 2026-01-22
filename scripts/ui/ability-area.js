/**
 * Ability Area Component
 * アビリティを種別ごとにセクション分けして表示するコンポーネント
 */

import { AbilityCard } from './ability-card.js';

export class AbilityArea {
    constructor(containerSelector, stateManager, commandGenerator, options = {}) {
        this.container = document.querySelector(containerSelector);
        this.stateManager = stateManager;
        this.commandGenerator = commandGenerator;
        this.onAbilityClick = options.onAbilityClick || null;
        
        this.sections = {
            MAIN: { title: 'メイン', abilities: [] },
            SUB: { title: 'サブ', abilities: [] },
            INSTANT: { title: 'インスタント', abilities: [] },
            SPECIAL: { title: '特殊', abilities: [] },
        };

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
        const abilities = this.stateManager.getState().abilities || [];
        
        // セクションをリセット
        for (const key in this.sections) {
            this.sections[key].abilities = [];
        }

        // アビリティをセクションに分類
        abilities.forEach(ability => {
            const category = ability.category || 'SPECIAL';
            if (this.sections[category]) {
                this.sections[category].abilities.push(ability);
            }
        });

        // UIをクリア
        this.container.innerHTML = '';

        // 各セクションを描画
        for (const category in this.sections) {
            const section = this.sections[category];
            if (section.abilities.length > 0 || category !== 'SPECIAL') {
                const sectionElement = this.createSection(category, section);
                this.container.appendChild(sectionElement);
            }
        }
    }

    /**
     * セクション要素を生成
     * @param {string} category - カテゴリーコード
     * @param {Object} section - セクション情報
     * @returns {HTMLElement} セクション要素
     */
    createSection(category, section) {
        const sectionContainer = document.createElement('section');
        sectionContainer.className = 'ability-section';
        sectionContainer.dataset.category = category;

        // セクションヘッダー
        const header = document.createElement('header');
        header.className = 'ability-section__header';

        const title = document.createElement('h2');
        title.className = 'ability-section__title';
        title.textContent = section.title;
        header.appendChild(title);

        // セクション設定ボタン（将来実装）
        const settingsBtn = document.createElement('button');
        settingsBtn.className = 'ability-section__settings';
        settingsBtn.textContent = '⚙';
        settingsBtn.disabled = true; // Phase 2以降で実装
        header.appendChild(settingsBtn);

        sectionContainer.appendChild(header);

        // アビリティエリア（グリッド）
        const abilitiesGrid = document.createElement('div');
        abilitiesGrid.className = 'abilities-grid';

        section.abilities.forEach(ability => {
            const cardElement = AbilityCard.createAbilityCardElement(ability, {
                onAbilityClick: (ability) => this.handleAbilityClick(ability),
                showStackCount: true,
            });
            abilitiesGrid.appendChild(cardElement);
        });

        sectionContainer.appendChild(abilitiesGrid);

        return sectionContainer;
    }

    /**
     * アビリティクリック時の処理
     * @param {Object} ability - クリックされたアビリティ
     */
    handleAbilityClick(ability) {
        // コマンド生成
        const command = this.commandGenerator.generateCommand(ability);
        
        // カスタムハンドラーがあれば実行
        if (this.onAbilityClick) {
            this.onAbilityClick(ability, command);
        }

        // デフォルト処理：コマンドをコピー
        this.copyCommandToClipboard(command);
    }

    /**
     * コマンドをクリップボードにコピー
     * @param {string} command - コマンド文字列
     */
    copyCommandToClipboard(command) {
        navigator.clipboard.writeText(command).then(() => {
            // トースト通知など、フィードバックを表示できる
            console.log('Command copied:', command);
        }).catch(err => {
            console.error('Failed to copy command:', err);
        });
    }

    /**
     * 特定のアビリティを更新
     * @param {string} abilityId - アビリティID
     * @param {Object} updates - 更新内容
     */
    updateAbility(abilityId, updates) {
        const state = this.stateManager.getState();
        const abilities = state.abilities || [];
        const ability = abilities.find(a => a.id === abilityId);
        
        if (ability) {
            Object.assign(ability, updates);
            this.stateManager.setState(state);
        }
    }
}

export default AbilityArea;

/**
 * Ability Card Component
 * アビリティをカード形式で表示し、ツールチップで詳細情報を表示するコンポーネント
 */

export class AbilityCard {
    /**
     * アビリティカードのDOM要素を生成
     * @param {Object} ability - アビリティデータ
     * @param {Object} options - オプション設定
     * @returns {HTMLElement} アビリティカードのDOM要素
     */
    static createAbilityCardElement(ability, options = {}) {
        const {
            onAbilityClick = null,
            showStackCount = true,
        } = options;

        const container = document.createElement('div');
        container.className = 'ability-card';
        container.dataset.abilityId = ability.id;
        
        // アビリティカード本体
        const card = document.createElement('button');
        card.className = `ability-card__button ability-card__button--${ability.category?.toLowerCase() || 'main'}`;
        card.setAttribute('type', 'button');

        // アイコン
        const icon = document.createElement('img');
        icon.className = 'ability-card__icon';
        icon.src = ability.icon || 'assets/icons/default.png';
        icon.alt = ability.name;
        card.appendChild(icon);

        // スタック数の表示（該当する場合）
        if (showStackCount && ability.cooldown > 0) {
            const stackBadge = document.createElement('span');
            stackBadge.className = 'ability-card__stack';
            stackBadge.textContent = ability.cooldown;
            card.appendChild(stackBadge);
        }

        // ツールチップ（カード表示）
        const tooltip = AbilityCard.createAbilityTooltip(ability);
        card.appendChild(tooltip);

        // クリックイベント
        if (onAbilityClick) {
            card.addEventListener('click', () => {
                onAbilityClick(ability);
            });
        }

        container.appendChild(card);
        return container;
    }

    /**
     * ツールチップ（詳細カード）を生成
     * @param {Object} ability - アビリティデータ
     * @returns {HTMLElement} ツールチップのDOM要素
     */
    static createAbilityTooltip(ability) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip card card--tooltip card--ability';

        // ヘッダー
        const header = document.createElement('div');
        header.className = 'card__header';

        const iconDiv = document.createElement('div');
        iconDiv.className = 'card__icon';
        const iconImg = document.createElement('img');
        iconImg.className = 'card__icon--image';
        iconImg.src = ability.icon || 'assets/icons/default.png';
        iconImg.alt = ability.name;
        iconDiv.appendChild(iconImg);
        header.appendChild(iconDiv);

        const titleDiv = document.createElement('div');
        titleDiv.className = 'card__title';
        const nameSpan = document.createElement('span');
        nameSpan.className = 'card__name';
        nameSpan.textContent = ability.name;

        // タグ表示
        if (ability.tags && ability.tags.length > 0) {
            const tagsSpan = document.createElement('span');
            tagsSpan.className = 'card__tags';
            tagsSpan.textContent = ability.tags.join('・');
            nameSpan.appendChild(tagsSpan);
        }
        titleDiv.appendChild(nameSpan);
        header.appendChild(titleDiv);
        tooltip.appendChild(header);

        // ボディ
        const body = document.createElement('div');
        body.className = 'card__body card__body--ability';

        // 基本情報
        if (ability.category) {
            const categoryDiv = document.createElement('div');
            categoryDiv.className = 'card__stat';
            const categoryLabel = document.createElement('span');
            categoryLabel.className = 'card__label';
            categoryLabel.textContent = '種別：';
            const categoryValue = document.createElement('span');
            categoryValue.className = 'card__value';
            categoryValue.textContent = AbilityCard.getCategoryDisplay(ability.category);
            categoryDiv.appendChild(categoryLabel);
            categoryDiv.appendChild(categoryValue);
            body.appendChild(categoryDiv);
        }

        // 判定
        if (ability.check) {
            const checkDiv = document.createElement('div');
            checkDiv.className = 'card__stat';
            const checkLabel = document.createElement('span');
            checkLabel.className = 'card__label';
            checkLabel.textContent = '判定：';
            const checkValue = document.createElement('span');
            checkValue.className = 'card__value card__value--mono';
            checkValue.textContent = ability.check;
            checkDiv.appendChild(checkLabel);
            checkDiv.appendChild(checkValue);
            body.appendChild(checkDiv);
        }

        // 基本ダメージ
        if (ability.baseDamage) {
            const dmgDiv = document.createElement('div');
            dmgDiv.className = 'card__stat';
            const dmgLabel = document.createElement('span');
            dmgLabel.className = 'card__label';
            dmgLabel.textContent = '基本ダメージ：';
            const dmgValue = document.createElement('span');
            dmgValue.className = 'card__value card__value--mono';
            dmgValue.textContent = ability.baseDamage;
            dmgDiv.appendChild(dmgLabel);
            dmgDiv.appendChild(dmgValue);
            body.appendChild(dmgDiv);
        }

        // ダイレクトヒット
        if (ability.directHit) {
            const dhDiv = document.createElement('div');
            dhDiv.className = 'card__stat';
            const dhLabel = document.createElement('span');
            dhLabel.className = 'card__label';
            dhLabel.textContent = 'DH：';
            const dhValue = document.createElement('span');
            dhValue.className = 'card__value card__value--mono';
            dhValue.textContent = ability.directHit;
            dhDiv.appendChild(dhLabel);
            dhDiv.appendChild(dhValue);
            body.appendChild(dhDiv);
        }

        // 基本効果
        if (ability.effect) {
            const effectDiv = document.createElement('div');
            effectDiv.className = 'card__stat';
            const effectLabel = document.createElement('span');
            effectLabel.className = 'card__label';
            effectLabel.textContent = '効果：';
            const effectValue = document.createElement('span');
            effectValue.className = 'card__value';
            effectValue.textContent = ability.effect;
            effectDiv.appendChild(effectLabel);
            effectDiv.appendChild(effectValue);
            body.appendChild(effectDiv);
        }

        tooltip.appendChild(body);
        return tooltip;
    }

    /**
     * カテゴリーの表示名を取得
     * @param {string} category - カテゴリーコード
     * @returns {string} 表示名
     */
    static getCategoryDisplay(category) {
        const displays = {
            'MAIN': 'メイン',
            'SUB': 'サブ',
            'INSTANT': 'インスタント',
            'SPECIAL': '特殊',
        };
        return displays[category] || category;
    }
}

export default AbilityCard;

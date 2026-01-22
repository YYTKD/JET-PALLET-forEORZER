/**
 * Command Generator
 * BCdiceコマンド生成ロジックを実装
 */

export class CommandGenerator {
    constructor(stateManager) {
        this.stateManager = stateManager;
    }

    /**
     * アビリティのコマンドを生成
     * @param {Object} ability - アビリティデータ
     * @param {Object} options - オプション
     * @returns {string} 生成されたコマンド
     */
    generateCommand(ability, options = {}) {
        const {
            withDirectHit = false,
            withCritical = false,
        } = options;

        const state = this.stateManager.getState();
        const buffs = state.activeBuffs || [];

        // 基本コマンドを生成
        let command = '';

        // 1. 判定コマンド
        if (ability.check) {
            command = this.buildCheckCommand(ability.check, buffs);
        }

        // 2. ダメージコマンドを生成
        if (ability.baseDamage) {
            const damageCommand = this.buildDamageCommand(
                ability.baseDamage,
                ability.directHit,
                buffs,
                { withDirectHit, withCritical }
            );
            
            if (command) {
                command += ' / ' + damageCommand;
            } else {
                command = damageCommand;
            }
        }

        // 3. アビリティ名をプレフィックス
        if (command) {
            command = `[${ability.name}] ${command}`;
        }

        return command;
    }

    /**
     * ロール情報を生成
     * @param {Object} ability - アビリティデータ
     * @returns {Object|null} ロール情報
     */
    generateRoleInfo(ability) {
        if (!ability || !ability.role) {
            return null;
        }

        const roleType = ability.role.type || ability.role.roleType || ability.roleType;
        const roleLabel = ability.role.label || ability.role.name || roleType;
        const roleCommand = ability.role.command || this.buildRoleCommand(roleType, roleLabel);

        if (!roleType && !roleLabel && !roleCommand) {
            return null;
        }

        return {
            type: roleType || 'ROLE',
            label: roleLabel || 'ロール',
            command: roleCommand || '',
        };
    }

    /**
     * ロールコマンドを構築
     * @param {string} roleType - ロール種別
     * @param {string} roleLabel - ロール表示名
     * @returns {string} ロールコマンド
     */
    buildRoleCommand(roleType, roleLabel) {
        const normalized = roleType || roleLabel;
        return normalized ? `ROLE:${normalized}` : '';
    }

    /**
     * 判定コマンドを構築
     * @param {string} baseCheck - 基本判定（例: "d20+{STR}"）
     * @param {Array} buffs - アクティブなバフリスト
     * @returns {string} 判定コマンド
     */
    buildCheckCommand(baseCheck, buffs) {
        let command = baseCheck;

        // バフから判定修正を集める
        const checkBonuses = buffs
            .filter(buff => buff.target === 'check' && buff.command)
            .map(buff => buff.command);

        // コマンド文字列を統合
        checkBonuses.forEach(bonus => {
            command += bonus;
        });

        return command;
    }

    /**
     * ダメージコマンドを構築
     * @param {string|number} baseDamage - 基本ダメージ
     * @param {string} directHit - ダイレクトヒット時の追加ダメージ
     * @param {Array} buffs - アクティブなバフリスト
     * @param {Object} options - オプション
     * @returns {string} ダメージコマンド
     */
    buildDamageCommand(baseDamage, directHit, buffs, options = {}) {
        const { withDirectHit = false, withCritical = false } = options;

        let command = '';

        // 基本ダメージ
        if (typeof baseDamage === 'number') {
            command = baseDamage.toString();
        } else {
            command = baseDamage;
        }

        // クリティカル処理
        if (withCritical && command.includes('d')) {
            command = this.applyCritical(command);
        }

        // ダイレクトヒット追加
        if (withDirectHit && directHit) {
            command += directHit;
        }

        // バフからダメージ修正を集める
        const damageBonuses = buffs
            .filter(buff => buff.target === 'damage' && buff.command)
            .map(buff => buff.command);

        // コマンド文字列を統合
        damageBonuses.forEach(bonus => {
            command += bonus;
        });

        return command;
    }

    /**
     * クリティカルを適用（ダイス数を2倍に）
     * @param {string} command - 元のコマンド
     * @returns {string} クリティカル適用後のコマンド
     */
    applyCritical(command) {
        // 例: "2d6+1d6+2+1" -> "4d6+2d6+2+1"
        return command.replace(/(\d+)d/g, (match, num) => {
            return (parseInt(num) * 2) + 'd';
        });
    }

    /**
     * スタック数を減らす（アビリティ使用時）
     * @param {string} abilityId - アビリティID
     */
    decrementAbilityStack(abilityId) {
        const state = this.stateManager.getState();
        const abilities = state.abilities || [];
        const ability = abilities.find(a => a.id === abilityId);

        if (ability && ability.cooldown > 0) {
            ability.cooldown -= 1;
            this.stateManager.setState(state);
        }
    }

    /**
     * 複雑なコマンドを構築（マクロ適用時）
     * @param {Object} ability - アビリティ
     * @param {Object} macro - マクロ設定
     * @returns {string} 生成されたコマンド
     */
    buildComplexCommand(ability, macro) {
        // Phase 3で実装予定
        throw new Error('Complex command building not implemented yet');
    }
}

export default CommandGenerator;

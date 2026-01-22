export class StateManager {
    #state;
    #listeners;
    #storageKey = 'jetpallet_state';

    constructor(initialState = {}) {
        this.#state = this.#loadFromStorage() || structuredClone(initialState);
        this.#listeners = new Set();
    }

    getState() {
        return structuredClone(this.#state);
    }

    setState(updater) {
        const nextState = typeof updater === 'function'
            ? updater(structuredClone(this.#state))
            : updater;

        this.#state = structuredClone(nextState);
        this.#saveToStorage();
        this.#notify();
    }

    subscribe(listener) {
        this.#listeners.add(listener);
        return () => this.#listeners.delete(listener);
    }

    /**
     * ゲーム操作: ターン開始（1t のバフを削除）
     */
    startTurn() {
        this.setState(state => {
            state.activeBuffs = (state.activeBuffs || []).filter(buff => buff.duration !== '1t');
            return state;
        });
    }

    /**
     * ゲーム操作: ターン終了（0t のバフを削除）
     */
    endTurn() {
        this.setState(state => {
            state.activeBuffs = (state.activeBuffs || []).filter(buff => buff.duration !== '0t');
            return state;
        });
    }

    /**
     * ゲーム操作: ラウンド終了（MP を 2 上昇させる）
     */
    endRound() {
        this.setState(state => {
            const resources = state.resources || [];
            const mpResource = resources.find(r => r.name === 'MP');
            if (mpResource) {
                mpResource.current = Math.min(mpResource.current + 2, mpResource.max);
            }
            return state;
        });
    }

    /**
     * ゲーム操作: フェイズ更新（すべてのバフを削除）
     */
    updatePhase() {
        this.setState(state => {
            state.activeBuffs = [];
            return state;
        });
    }

    /**
     * バフを追加
     * @param {Object} buff - バフデータ
     */
    addBuff(buff) {
        this.setState(state => {
            state.activeBuffs = state.activeBuffs || [];
            state.activeBuffs.push({
                id: this.#generateId(),
                ...buff,
            });
            return state;
        });
    }

    /**
     * バフを削除
     * @param {string} buffId - バフID
     */
    removeBuff(buffId) {
        this.setState(state => {
            state.activeBuffs = (state.activeBuffs || []).filter(b => b.id !== buffId);
            return state;
        });
    }

    /**
     * リソースを更新
     * @param {string} resourceName - リソース名
     * @param {number} newValue - 新しい値
     */
    updateResource(resourceName, newValue) {
        this.setState(state => {
            const resources = state.resources || [];
            const resource = resources.find(r => r.name === resourceName);
            if (resource) {
                resource.current = Math.max(0, Math.min(newValue, resource.max));
            }
            return state;
        });
    }

    /**
     * localStorageにセーブ
     */
    #saveToStorage() {
        try {
            localStorage.setItem(this.#storageKey, JSON.stringify(this.#state));
        } catch (e) {
            console.error('Failed to save state to localStorage:', e);
        }
    }

    /**
     * localStorageから読み込み
     */
    #loadFromStorage() {
        try {
            const stored = localStorage.getItem(this.#storageKey);
            return stored ? JSON.parse(stored) : null;
        } catch (e) {
            console.error('Failed to load state from localStorage:', e);
            return null;
        }
    }

    /**
     * IDを生成
     */
    #generateId() {
        return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * 全体を初期化
     */
    reset(initialState) {
        this.#state = structuredClone(initialState);
        this.#saveToStorage();
        this.#notify();
    }
}

export const createStateManager = (initialState) => new StateManager(initialState);

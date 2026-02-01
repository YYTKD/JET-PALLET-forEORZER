(() => {
    const storageUtils = window.storageUtils;
    const CHARACTER_MACRO_STORAGE_KEY =
        storageUtils?.storageKeys?.characterMacros ?? "jet-pallet-character-macros";

    const CHARACTER_MACRO_SCHEMA_VERSION = 1;
    const CHARACTER_MACRO_SECTION_VERSION = 1;

    const CHARACTER_MACRO_SECTIONS = Object.freeze([
        "turnStart",
        "turnEnd",
        "roundEnd",
    ]);

    const isPlainObject = (value) =>
        Boolean(value) && typeof value === "object" && !Array.isArray(value);

    const createEmptyConditions = () => ({
        groups: [],
        groupConnectors: [],
    });

    const createEmptySection = () => ({
        version: CHARACTER_MACRO_SECTION_VERSION,
        conditions: createEmptyConditions(),
        blocks: [],
    });

    const createDefaultCharacterMacros = () => {
        const base = {
            version: CHARACTER_MACRO_SCHEMA_VERSION,
        };
        CHARACTER_MACRO_SECTIONS.forEach((sectionKey) => {
            base[sectionKey] = createEmptySection();
        });
        return base;
    };

    const normalizeConditions = (rawConditions) => {
        if (!isPlainObject(rawConditions)) {
            return createEmptyConditions();
        }
        return {
            groups: Array.isArray(rawConditions.groups)
                ? rawConditions.groups
                : [],
            groupConnectors: Array.isArray(rawConditions.groupConnectors)
                ? rawConditions.groupConnectors
                : [],
        };
    };

    const normalizeSection = (rawSection) => {
        if (!isPlainObject(rawSection)) {
            return createEmptySection();
        }
        const blocks = Array.isArray(rawSection.blocks)
            ? rawSection.blocks
            : Array.isArray(rawSection.actions)
              ? rawSection.actions
              : [];
        return {
            version: Number.isFinite(rawSection.version)
                ? rawSection.version
                : CHARACTER_MACRO_SECTION_VERSION,
            conditions: normalizeConditions(rawSection.conditions),
            blocks,
        };
    };

    const normalizeCharacterMacros = (rawMacros) => {
        const defaults = createDefaultCharacterMacros();
        if (!isPlainObject(rawMacros)) {
            return defaults;
        }
        const normalized = {
            version: Number.isFinite(rawMacros.version)
                ? rawMacros.version
                : defaults.version,
        };
        CHARACTER_MACRO_SECTIONS.forEach((sectionKey) => {
            normalized[sectionKey] = normalizeSection(rawMacros[sectionKey]);
        });
        return normalized;
    };

    const loadCharacterMacros = () => {
        if (!storageUtils?.readJson) {
            return createDefaultCharacterMacros();
        }
        const stored = storageUtils.readJson(CHARACTER_MACRO_STORAGE_KEY, null, {
            parseErrorMessage: "Failed to parse character macro storage.",
        });
        return normalizeCharacterMacros(stored);
    };

    const saveCharacterMacros = (macros) => {
        if (!storageUtils?.writeJson) {
            return false;
        }
        const normalized = normalizeCharacterMacros(macros);
        return storageUtils.writeJson(CHARACTER_MACRO_STORAGE_KEY, normalized, {
            saveErrorMessage: "Failed to save character macro storage.",
        });
    };

    // Share the store globally so editors can evolve without duplicating schema rules.
    window.characterMacroStore = Object.freeze({
        storageKey: CHARACTER_MACRO_STORAGE_KEY,
        createDefaultCharacterMacros,
        loadCharacterMacros,
        saveCharacterMacros,
    });
})();

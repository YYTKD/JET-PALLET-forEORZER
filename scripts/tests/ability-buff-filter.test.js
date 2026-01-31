const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const loadScript = (relativePath, context) => {
    const filePath = path.resolve(__dirname, "..", relativePath);
    const source = fs.readFileSync(filePath, "utf8");
    vm.runInContext(source, context, { filename: relativePath });
};

const createAbilityContext = () => {
    const context = vm.createContext({ console });
    context.window = context;
    context.document = {
        addEventListener: () => {},
    };
    loadScript("ability.js", context);
    vm.runInContext(
        "this.__abilityBuffTest = { normalizeTargetDetailValue, shouldApplyBuffToAbilityArea, resolveAbilityAreaKey, parseBuffStorage };",
        context,
    );
    return context;
};

const tests = [];
const test = (name, fn) => {
    tests.push({ name, fn });
};

const run = () => {
    let failures = 0;
    tests.forEach(({ name, fn }) => {
        try {
            fn();
            console.log(`✓ ${name}`);
        } catch (error) {
            failures += 1;
            console.error(`✗ ${name}`);
            console.error(error);
        }
    });
    if (failures > 0) {
        process.exitCode = 1;
    }
};

test("target detail filtering applies to matching ability area only", () => {
    const context = createAbilityContext();
    const { shouldApplyBuffToAbilityArea } = context.__abilityBuffTest;

    assert.equal(shouldApplyBuffToAbilityArea("", "main"), true);
    assert.equal(shouldApplyBuffToAbilityArea("---", "main"), true);
    assert.equal(shouldApplyBuffToAbilityArea("main", "main"), true);
    assert.equal(shouldApplyBuffToAbilityArea("main", "sub"), false);
    assert.equal(shouldApplyBuffToAbilityArea("sub", "main"), false);
    assert.equal(shouldApplyBuffToAbilityArea("other", "main"), false);
});

test("resolveAbilityAreaKey falls back to the default area", () => {
    const context = createAbilityContext();
    const { resolveAbilityAreaKey } = context.__abilityBuffTest;

    const abilityWithRecall = {
        closest: () => ({ dataset: { abilityArea: "sub" } }),
    };
    assert.equal(resolveAbilityAreaKey(abilityWithRecall), "sub");
    assert.equal(resolveAbilityAreaKey(null), "main");
});

test("parseBuffStorage returns empty target detail for legacy storage", () => {
    const context = createAbilityContext();
    const { parseBuffStorage } = context.__abilityBuffTest;

    const buffElement = {
        dataset: {
            buffStorage: JSON.stringify({ targetValue: "judge" }),
        },
    };
    assert.deepStrictEqual(parseBuffStorage(buffElement), {
        targetValue: "judge",
        targetDetailValue: "",
    });
});

run();

const SELECTORS = {
    abilityModal: "#addAbilityModal",
    previewIcon: "[data-ability-preview-icon]",
    previewName: "[data-ability-preview-name]",
    previewTags: "[data-ability-preview-tags]",
    previewPrerequisite: "[data-ability-preview-prerequisite]",
    previewTiming: "[data-ability-preview-timing]",
    previewCost: "[data-ability-preview-cost]",
    previewLimit: "[data-ability-preview-limit]",
    previewTarget: "[data-ability-preview-target]",
    previewRange: "[data-ability-preview-range]",
    previewJudge: "[data-ability-preview-judge]",
    previewEffect: "[data-ability-preview-effect]",
    previewDirectHit: "[data-ability-preview-direct-hit]",
    iconSelect: "[data-ability-icon-select]",
    iconInput: "[data-ability-icon-input]",
    typeSelect: "[data-ability-type]",
    nameInput: "[data-ability-name]",
    prerequisiteInput: "[data-ability-prerequisite]",
    timingInput: "[data-ability-timing]",
    costInput: "[data-ability-cost]",
    limitInput: "[data-ability-limit]",
    targetInput: "[data-ability-target]",
    rangeInput: "[data-ability-range]",
    judgeInput: "[data-ability-judge]",
    judgeAttributeSelect: "[data-ability-judge-attribute]",
    effectInput: "[data-ability-description]",
    directHitInput: "[data-ability-direct-hit]",
    tagInput: "[data-ability-tag-input]",
    tagAddButton: "[data-ability-tag-add]",
    formGroup: ".form__group",
    formRow: ".form__row",
    tagElement: ".tag",
};

const DATASET_KEYS = {
    tagRemove: "tagRemove",
};

const TEXT = {
    placeholder: "未入力",
    tagSeparator: "・",
    judgeNone: "なし",
};

const TYPE_LABELS = {
    main: "メイン",
    sub: "サブ",
    instant: "インスタント",
    other: "特殊",
};

document.addEventListener("DOMContentLoaded", () => {
    const collectElements = () => {
        const abilityModal = document.querySelector(SELECTORS.abilityModal);
        const previewElements = {
            icon: abilityModal?.querySelector(SELECTORS.previewIcon) ?? null,
            name: abilityModal?.querySelector(SELECTORS.previewName) ?? null,
            tags: abilityModal?.querySelector(SELECTORS.previewTags) ?? null,
            prerequisite: abilityModal?.querySelector(SELECTORS.previewPrerequisite) ?? null,
            timing: abilityModal?.querySelector(SELECTORS.previewTiming) ?? null,
            cost: abilityModal?.querySelector(SELECTORS.previewCost) ?? null,
            limit: abilityModal?.querySelector(SELECTORS.previewLimit) ?? null,
            target: abilityModal?.querySelector(SELECTORS.previewTarget) ?? null,
            range: abilityModal?.querySelector(SELECTORS.previewRange) ?? null,
            judge: abilityModal?.querySelector(SELECTORS.previewJudge) ?? null,
            effect: abilityModal?.querySelector(SELECTORS.previewEffect) ?? null,
            directHit: abilityModal?.querySelector(SELECTORS.previewDirectHit) ?? null,
        };
        const inputElements = {
            iconSelect: abilityModal?.querySelector(SELECTORS.iconSelect) ?? null,
            iconInput: abilityModal?.querySelector(SELECTORS.iconInput) ?? null,
            type: abilityModal?.querySelector(SELECTORS.typeSelect) ?? null,
            name: abilityModal?.querySelector(SELECTORS.nameInput) ?? null,
            prerequisite: abilityModal?.querySelector(SELECTORS.prerequisiteInput) ?? null,
            timing: abilityModal?.querySelector(SELECTORS.timingInput) ?? null,
            cost: abilityModal?.querySelector(SELECTORS.costInput) ?? null,
            limit: abilityModal?.querySelector(SELECTORS.limitInput) ?? null,
            target: abilityModal?.querySelector(SELECTORS.targetInput) ?? null,
            range: abilityModal?.querySelector(SELECTORS.rangeInput) ?? null,
            judge: abilityModal?.querySelector(SELECTORS.judgeInput) ?? null,
            judgeAttribute: abilityModal?.querySelector(SELECTORS.judgeAttributeSelect) ?? null,
            effect: abilityModal?.querySelector(SELECTORS.effectInput) ?? null,
            directHit: abilityModal?.querySelector(SELECTORS.directHitInput) ?? null,
            tagInput: abilityModal?.querySelector(SELECTORS.tagInput) ?? null,
            tagAddButton: abilityModal?.querySelector(SELECTORS.tagAddButton) ?? null,
        };
        const tagContainer =
            inputElements.tagInput?.closest(SELECTORS.formGroup)?.querySelector(SELECTORS.formRow) ??
            null;
        return { abilityModal, previewElements, inputElements, tagContainer };
    };

    const hasRequiredElements = (elements) => Boolean(elements.abilityModal);

    const elements = collectElements();
    if (!hasRequiredElements(elements)) {
        return;
    }

    const { previewElements, inputElements, tagContainer } = elements;

    const defaultIconSrc = previewElements.icon?.getAttribute("src") ?? "";
    const normalizeValue = (value, placeholder = TEXT.placeholder) => {
        const trimmed = value?.trim();
        return trimmed ? trimmed : placeholder;
    };

    const normalizeOptionalValue = (value) => {
        const trimmed = value?.trim();
        return trimmed ? trimmed : null;
    };

    const formatJudgeAttribute = (value) => {
        if (!value || value === TEXT.judgeNone) {
            return "";
        }
        if (value.startsWith("【") && value.endsWith("】")) {
            return value;
        }
        const match = value.match(/\{([^}]+)\}/);
        if (match) {
            return `【${match[1]}】`;
        }
        return value;
    };

    const formatJudgeValue = (value) => {
        if (!value) {
            return "";
        }
        return /^[+-]/.test(value) ? value : `+${value}`;
    };

    const buildJudgeText = ({ judgeValue, attributeValue }) => {
        const attributeText = formatJudgeAttribute(attributeValue);

        if (!judgeValue || !attributeText) {
            return "";
        }

        return `${attributeText}${formatJudgeValue(judgeValue)}`;
    };

    const buildTagText = ({ tagList, typeValue }) => {
        const tagTexts = [...tagList];
        const typeLabel = typeValue ? TYPE_LABELS[typeValue] : null;
        if (typeLabel && !tagTexts.includes(typeLabel)) {
            tagTexts.push(typeLabel);
        }
        return tagTexts.join(TEXT.tagSeparator);
    };

    const createTagState = () => ({
        list: [],
    });

    const tagState = createTagState();

    const getTagLabel = (tagElement) => {
        const rawText = tagElement.childNodes[0]?.textContent ?? tagElement.textContent ?? "";
        return rawText.replace(/x$/i, "").trim();
    };

    const deriveTagListFromContainer = (container) =>
        Array.from(container?.querySelectorAll(SELECTORS.tagElement) ?? [])
            .map((tag) => getTagLabel(tag))
            .filter(Boolean);

    const syncTagState = (state, container) => {
        state.list = deriveTagListFromContainer(container);
    };

    const setTextContent = (element, value) => {
        if (!element) {
            return;
        }
        element.textContent = normalizeValue(value);
    };

    const setNameText = (element, value) => {
        if (!element) {
            return;
        }
        const normalized = normalizeValue(value);
        const tagElement = element.querySelector(SELECTORS.previewTags);
        const textNode = Array.from(element.childNodes).find(
            (node) => node.nodeType === Node.TEXT_NODE,
        );

        if (textNode) {
            textNode.textContent = normalized;
        } else {
            element.insertBefore(document.createTextNode(normalized), tagElement ?? null);
        }
    };

    const resolveIconSource = () => {
        const selectValue = inputElements.iconSelect?.value;
        if (selectValue) {
            return selectValue;
        }

        const file = inputElements.iconInput?.files?.[0];
        if (file) {
            return previewElements.icon?.src ?? defaultIconSrc;
        }

        return defaultIconSrc;
    };

    const updateStatValue = (element, value) => {
        if (!element) {
            return;
        }
        const normalized = normalizeOptionalValue(value);
        element.textContent = normalized ?? "";
        const wrapper =
            element.closest(".card__trigger") ??
            element.closest(".card__stat--judge") ??
            element.closest(".card__stat");
        if (wrapper) {
            wrapper.style.display = normalized ? "" : "none";
        }
    };

    const updateMetaVisibility = () => {
        const meta = previewElements.cost?.closest(".card__meta");
        if (!meta) {
            return;
        }
        const hasVisibleStat = Array.from(meta.querySelectorAll(".card__stat")).some(
            (stat) => stat.style.display !== "none",
        );
        meta.style.display = hasVisibleStat ? "" : "none";
    };

    const updatePreview = () => {
        if (previewElements.icon) {
            previewElements.icon.src = resolveIconSource();
        }
        setNameText(previewElements.name, inputElements.name?.value);
        updateStatValue(previewElements.prerequisite, inputElements.prerequisite?.value);
        updateStatValue(previewElements.timing, inputElements.timing?.value);
        updateStatValue(previewElements.cost, inputElements.cost?.value);
        updateStatValue(previewElements.limit, inputElements.limit?.value);
        updateStatValue(previewElements.target, inputElements.target?.value);
        updateStatValue(previewElements.range, inputElements.range?.value);
        updateStatValue(previewElements.effect, inputElements.effect?.value);
        updateStatValue(previewElements.directHit, inputElements.directHit?.value);
        updateStatValue(
            previewElements.judge,
            buildJudgeText({
                judgeValue: inputElements.judge?.value?.trim(),
                attributeValue: inputElements.judgeAttribute?.value?.trim(),
            }),
        );
        setTextContent(
            previewElements.tags,
            buildTagText({
                tagList: tagState.list,
                typeValue: inputElements.type?.value,
            }),
        );
        updateMetaVisibility();
    };

    const scheduleTagSync = () => {
        requestAnimationFrame(() => {
            syncTagState(tagState, tagContainer);
            updatePreview();
        });
    };

    const handleTagInteraction = (event) => {
        if (event.type === "click") {
            const isAddButton = event.target === inputElements.tagAddButton;
            const isRemoveButton =
                event.target instanceof HTMLElement &&
                event.target.dataset[DATASET_KEYS.tagRemove] === "true";
            if (!isAddButton && !isRemoveButton) {
                return;
            }
        }

        scheduleTagSync();
    };

    const monitoredInputs = [
        inputElements.type,
        inputElements.name,
        inputElements.prerequisite,
        inputElements.timing,
        inputElements.cost,
        inputElements.limit,
        inputElements.target,
        inputElements.range,
        inputElements.judge,
        inputElements.judgeAttribute,
        inputElements.effect,
        inputElements.directHit,
    ];

    monitoredInputs.forEach((element) => {
        if (!element) {
            return;
        }
        element.addEventListener("input", updatePreview);
        element.addEventListener("change", updatePreview);
    });

    inputElements.iconSelect?.addEventListener("change", updatePreview);
    inputElements.iconInput?.addEventListener("change", updatePreview);
    inputElements.tagInput?.addEventListener("input", updatePreview);
    inputElements.tagAddButton?.addEventListener("click", handleTagInteraction);
    inputElements.tagInput?.addEventListener("keydown", (event) => {
        if (event.key !== "Enter") {
            return;
        }
        scheduleTagSync();
    });
    abilityModal.addEventListener("click", handleTagInteraction);

    if (tagContainer) {
        const tagObserver = new MutationObserver(() => {
            scheduleTagSync();
        });
        tagObserver.observe(tagContainer, { childList: true });
    }

    syncTagState(tagState, tagContainer);
    updatePreview();
});

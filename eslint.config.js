// @ts-check
const eslint = require("@eslint/js");
const { defineConfig } = require("eslint/config");
const tseslint = require("typescript-eslint");
const angular = require("angular-eslint");

// FSD layer order (highest → lowest).
// Each layer may only import from layers below it.
// Type-only imports (import type { … }) are allowed in any direction — no runtime coupling.
const FSD_LAYERS = ["app", "pages", "widgets", "features", "entities", "shared"];

/**
 * For a given layer, returns the alias patterns for all layers that sit ABOVE it
 * (i.e. the forbidden import targets for value imports).
 */
function forbiddenUpperLayers(layerIndex) {
  return FSD_LAYERS.slice(0, layerIndex).map((l) => `@${l}/*`);
}

function fsdLayerRule(layerIndex) {
  const forbidden = forbiddenUpperLayers(layerIndex);
  if (!forbidden.length) return null;
  const layer = FSD_LAYERS[layerIndex];
  return {
    files: [`src/${layer}/**/*.ts`],
    rules: {
      "@typescript-eslint/no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: forbidden,
              message: `FSD violation: '${layer}' cannot import from [${forbidden.join(", ")}]. Imports must flow downward: app → pages → widgets → features → entities → shared.`,
              allowTypeImports: true,
            },
          ],
        },
      ],
    },
  };
}

const FSD_LAYER_RULES = FSD_LAYERS.map((_, i) => fsdLayerRule(i)).filter(Boolean);

module.exports = defineConfig([
  {
    files: ["**/*.ts"],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      "@angular-eslint/directive-selector": [
        "error",
        { type: "attribute", prefix: "app", style: "camelCase" },
      ],
      "@angular-eslint/component-selector": [
        "error",
        { type: "element", prefix: "app", style: "kebab-case" },
      ],
    },
  },

  // FSD cross-layer import enforcement (one block per layer)
  ...FSD_LAYER_RULES,

  {
    files: ["**/*.html"],
    extends: [
      angular.configs.templateRecommended,
      angular.configs.templateAccessibility,
    ],
    rules: {},
  },
]);

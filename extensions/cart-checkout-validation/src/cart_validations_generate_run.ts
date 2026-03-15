import type {
  CartValidationsGenerateRunInput,
  CartValidationsGenerateRunResult,
  ValidationError,
} from "../generated/api";


export function cartValidationsGenerateRun(input:CartValidationsGenerateRunInput):CartValidationsGenerateRunResult {
  const errors:ValidationError[]  = [];

  // configuration is variantId -> max quantity (as string)
  const config = input.validation.metafield?.jsonValue ?? {};

  for (const line of input.cart.lines) {
    if (line.merchandise.__typename !== 'ProductVariant') continue;

    const variantId = line.merchandise.id;
    const limitStr = config[variantId];

    // If no config for this variant, skip it
    if (!limitStr) continue;

    const limit = parseInt(limitStr, 10);
    if (!Number.isNaN(limit) && line.quantity > limit) {
      errors.push({
        message: `You can only purchase up to ${limit} units of ${line.merchandise.product.title}.`,
        target: '$.cart', // or a more specific target if you prefer
      });
    }
  }

  return {
    operations: [
      {
        validationAdd: { errors },
      },
    ],
  };
}

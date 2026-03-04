function enabledFromEnv(value: string | undefined, defaultValue: boolean): boolean {
  if (!value) {
    return defaultValue;
  }

  return value !== "false";
}

export const FEATURE_FLAGS = {
  apiSearch: enabledFromEnv(process.env.NEXT_PUBLIC_ENABLE_API_SEARCH, true),
  mobileFilters: enabledFromEnv(process.env.NEXT_PUBLIC_ENABLE_MOBILE_FILTERS, true),
  directApply: enabledFromEnv(process.env.NEXT_PUBLIC_ENABLE_DIRECT_APPLY, true),
} as const;

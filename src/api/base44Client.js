// Legacy compatibility file archived after Supabase-native migration.
// Intentionally kept as inert exports for safe rollback snapshots.

export const legacyApiClient = {
  archived: true,
};

export const createLegacyEntityApi = () => {
  throw new Error('Legacy API client was archived. Use src/api/supabaseAPI.js instead.');
};

export default legacyApiClient;

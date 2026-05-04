export function getCustomizerPrefill(product = {}) {
  const id = String(product.id || '').toLowerCase();
  const slug = String(product.slug || '').toLowerCase();
  const name = String(product.name || product.name_en || '').toLowerCase();
  const category = String(product.category || '').toLowerCase();
  const text = `${id} ${slug} ${name} ${category}`;

  if (text.includes('keychain')) {
    return { type: 'keychain' };
  }

  if (text.includes('stand')) {
    return { type: 'stand' };
  }

  if (text.includes('sticker')) {
    return { type: 'sticker' };
  }

  if (text.includes('wood')) {
    return { type: 'card', material: 'wood', color: 'light' };
  }

  if (text.includes('pvc') || text.includes('plastic') || text.includes('magnetic')) {
    return { type: 'card', material: 'pvc' };
  }

  if (text.includes('silver')) {
    return { type: 'card', material: 'metal', color: 'silver' };
  }

  if (text.includes('black')) {
    return { type: 'card', material: 'metal', color: 'black' };
  }

  // default card prefill
  return { type: 'card', material: 'metal', color: 'gold' };
}

export function resolveIsCustomizable(product = {}) {
  if (typeof product?.is_customizable === 'boolean') return product.is_customizable;

  const id = String(product.id || '').toLowerCase();
  const slug = String(product.slug || '').toLowerCase();
  const name = String(product.name || product.name_en || '').toLowerCase();
  const text = `${id} ${slug} ${name}`;

  // Requested default exclusions
  if (text.includes('google-review-card') || text.includes('social-business-card')) {
    return false;
  }

  return (
    text.includes('metal') ||
    text.includes('silver') ||
    text.includes('black') ||
    text.includes('wood') ||
    text.includes('plastic') ||
    text.includes('pvc') ||
    text.includes('keychain') ||
    text.includes('stand')
  );
}

export function buildCustomizerUrl(product = {}) {
  const prefill = getCustomizerPrefill(product);
  const params = new URLSearchParams();

  if (product.id) params.set('product', product.id);
  else if (product.slug) params.set('product', product.slug);

  if (prefill.type) params.set('type', prefill.type);
  if (prefill.material) params.set('material', prefill.material);
  if (prefill.color) params.set('color', prefill.color);

  const query = params.toString();
  return query ? `/customize?${query}` : '/customize';
}

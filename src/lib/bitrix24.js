const BITRIX24_WEBHOOK = 'https://rawajtech.bitrix24.com/rest/1/urlcb2w2j7rf1mjt/crm.lead.add.json';

async function sendLeadToBitrix(fields) {
  try {
    await fetch(BITRIX24_WEBHOOK, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields }),
    });
  } catch (err) {
    console.error('[Bitrix24] Lead sync failed:', err);
  }
}

export async function sendNewCustomerToBitrix(email) {
  const parts = email.split('@')[0].replace(/[._-]/g, ' ').split(' ').filter(Boolean);
  await sendLeadToBitrix({
    TITLE: `New Customer: ${email}`,
    NAME: parts[0] || '',
    LAST_NAME: parts.slice(1).join(' ') || '',
    EMAIL: [{ VALUE: email, VALUE_TYPE: 'WORK' }],
    SOURCE_ID: 'WEB',
    COMMENTS: `New customer registered on RawajCard\nEmail: ${email}`,
  });
}

export async function sendNewOrderToBitrix({ orderNumber, shippingInfo, normalizedCartItems, total, currency = 'SAR', paymentMethod }) {
  const nameParts = (shippingInfo.name || '').trim().split(' ').filter(Boolean);
  const itemLines = (normalizedCartItems || [])
    .map(item => `- ${item.product_name} x${item.quantity} @ ${item.product_price} ${currency}`)
    .join('\n');

  await sendLeadToBitrix({
    TITLE: `#rawaj_card Order: ${orderNumber}`,
    NAME: nameParts[0] || '',
    LAST_NAME: nameParts.slice(1).join(' ') || '',
    EMAIL: [{ VALUE: shippingInfo.email, VALUE_TYPE: 'WORK' }],
    PHONE: [{ VALUE: shippingInfo.phone, VALUE_TYPE: 'WORK' }],
    OPPORTUNITY: total,
    CURRENCY_ID: currency,
    SOURCE_ID: 'WEB',
    COMMENTS: [
      `Order #${orderNumber}`,
      `Payment: ${paymentMethod}`,
      '',
      'Items:',
      itemLines,
      '',
      `Total: ${total} ${currency}`,
      '',
      'Shipping:',
      `Name: ${shippingInfo.name}`,
      `Email: ${shippingInfo.email}`,
      `Phone: ${shippingInfo.phone}`,
      `Address: ${shippingInfo.address}, ${shippingInfo.city}${shippingInfo.country ? ', ' + shippingInfo.country : ''}`,
    ].join('\n'),
  });
}

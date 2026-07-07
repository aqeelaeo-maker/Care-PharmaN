import { doc, getDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';

export const printInvoiceHtml = async (invoice: any, userEmail: string, type: 'standard' | 'thermal' = 'standard') => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  let storeConfig: any = {};
  try {
    const configDoc = await getDoc(doc(db, 'stores', userEmail, 'settings', 'store_config'));
    if (configDoc.exists()) {
      storeConfig = configDoc.data();
    }
  } catch (err) {
    console.error('Error fetching store config', err);
  }

  const thermalItemsHtml = invoice.items?.map((item: any) => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align: center;">${item.qty}</td>
      <td style="text-align: right;">${Number(item.price).toFixed(2)}</td>
      <td style="text-align: right;">${(item.qty * item.price).toFixed(2)}</td>
    </tr>
  `).join('') || '';

  const standardItemsHtml = invoice.items?.map((item: any) => `
    <tr>
      <td>
        <div style="font-weight: 500;">${item.name}</div>
      </td>
      <td>${item.batch || '-'}</td>
      <td style="text-align: right;">${Number(item.tradePrice || item.price).toFixed(2)}</td>
      <td style="text-align: right;">${item.discountPercent || 0}%</td>
      <td style="text-align: right;">${Number(item.price).toFixed(2)}</td>
      <td style="text-align: center;">${item.qty}</td>
      <td style="text-align: right;">${(item.qty * item.price).toFixed(2)}</td>
    </tr>
  `).join('') || '';

  const dateStr = invoice.timestamp?.toDate 
    ? invoice.timestamp.toDate().toLocaleString() 
    : new Date(invoice.timestamp || Date.now()).toLocaleString();

  const companyHeaderHtml = `
    <div style="text-align: center; margin-bottom: 20px;">
      ${storeConfig.logoUrl ? `<img src="${storeConfig.logoUrl}" style="max-width: 100px; max-height: 100px; margin-bottom: 10px;" />` : ''}
      <h2 style="margin: 0; font-size: 1.5em; color: #333;">${storeConfig.name || 'Pharmacy Store'}</h2>
      ${storeConfig.address ? `<div style="font-size: 0.9em; color: #666; margin-top: 5px;">${storeConfig.address.replace(/\n/g, '<br/>')}</div>` : ''}
      <div style="font-size: 0.9em; color: #666; margin-top: 5px;">
        ${[storeConfig.contactNumber1, storeConfig.contactNumber2].filter(Boolean).join(' | ')}
      </div>
      ${storeConfig.email ? `<div style="font-size: 0.9em; color: #666;">${storeConfig.email}</div>` : ''}
      ${storeConfig.website ? `<div style="font-size: 0.9em; color: #666;">${storeConfig.website}</div>` : ''}
    </div>
  `;

  let htmlContent = '';

  if (type === 'thermal') {
    htmlContent = `
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber || (invoice.id ? `INV-${invoice.id.slice(0,8).toUpperCase()}` : 'Preview')}</title>
          <style>
            body { font-family: 'Courier New', Courier, monospace; padding: 10px; color: #000; width: 80mm; margin: 0 auto; font-size: 12px; }
            .header { text-align: center; border-bottom: 1px dashed #000; padding-bottom: 10px; margin-bottom: 10px; }
            .details { margin-bottom: 10px; line-height: 1.4; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 10px; }
            th { border-bottom: 1px dashed #000; padding: 4px 0; text-align: left; font-weight: bold; font-size: 12px; }
            td { padding: 4px 0; vertical-align: top; }
            .total-section { text-align: right; margin-top: 10px; font-size: 1.1em; border-top: 1px dashed #000; padding-top: 10px; font-weight: bold; }
            .total-amount { font-size: 1.2em; }
            .footer { text-align: center; margin-top: 20px; font-size: 10px; }
            @media print {
              body { padding: 0; width: 100%; margin: 0; }
              @page { margin: 0; }
            }
          </style>
        </head>
        <body>
          ${companyHeaderHtml}
          <div class="header">
            <h1 style="margin: 0 0 5px 0; font-size: 1.2em;">RECEIPT</h1>
            ${invoice.invoiceNumber ? `<div>${invoice.invoiceNumber}</div>` : (invoice.id ? `<div>INV-${invoice.id.slice(0,8).toUpperCase()}</div>` : '')}
            <div>${dateStr}</div>
          </div>
          <div class="details">
            <div>Customer: ${invoice.customerName || 'Walk-in Customer'}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Price</th>
                <th style="text-align: right;">Amt</th>
              </tr>
            </thead>
            <tbody>
              ${thermalItemsHtml}
            </tbody>
          </table>
          <div class="total-section">
            <div>TOTAL: <span class="total-amount">${Number(invoice.total).toFixed(2)}</span></div>
          </div>
          <div class="footer">
            Thank you for your business!
          </div>
        </body>
      </html>
    `;
  } else {
    htmlContent = `
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber || (invoice.id ? `INV-${invoice.id.slice(0,8).toUpperCase()}` : 'Preview')}</title>
          <style>
            body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
            .invoice-meta { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; text-align: left; }
            .details { margin-bottom: 30px; line-height: 1.6; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { background: #f8fafc; border-bottom: 2px solid #eee; padding: 12px 8px; text-align: left; font-weight: 600; color: #64748b; text-transform: uppercase; font-size: 12px; }
            td { padding: 12px 8px; border-bottom: 1px solid #eee; }
            .total-section { text-align: right; margin-top: 30px; font-size: 1.2em; border-top: 2px solid #eee; padding-top: 20px; }
            .total-amount { font-size: 1.5em; font-weight: bold; color: #10b981; }
            @media print {
              body { padding: 0; }
            }
          </style>
        </head>
        <body>
          ${companyHeaderHtml}
          <div class="invoice-meta">
            ${invoice.invoiceNumber ? `<div><strong>Invoice #:</strong> ${invoice.invoiceNumber}</div>` : (invoice.id ? `<div><strong>Invoice #:</strong> INV-${invoice.id.slice(0,8).toUpperCase()}</div>` : '')}
            <div><strong>Date:</strong> ${dateStr}</div>
          </div>
          <div class="details">
            <div><strong>Bill To:</strong></div>
            <div>${invoice.customerName || 'Walk-in Customer'}</div>
          </div>
          <table>
            <thead>
              <tr>
                <th>Description</th>
                <th>Batch #</th>
                <th style="text-align: right;">Trade Price</th>
                <th style="text-align: right;">Discount</th>
                <th style="text-align: right;">Sale Price</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Amount</th>
              </tr>
            </thead>
            <tbody>
              ${standardItemsHtml}
            </tbody>
          </table>
          <div class="total-section">
            <div><strong>Total:</strong> <span class="total-amount">${Number(invoice.total).toFixed(2)}</span></div>
          </div>
          ${storeConfig.termsAndConditions ? `
            <div style="margin-top: 50px; padding-top: 20px; border-top: 1px solid #eee; font-size: 0.9em; color: #666;">
              <strong style="display: block; margin-bottom: 10px; color: #333;">Terms and Conditions</strong>
              <div style="white-space: pre-wrap;">${storeConfig.termsAndConditions}</div>
            </div>
          ` : ''}
        </body>
      </html>
    `;
  }

  printWindow.document.write(htmlContent);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

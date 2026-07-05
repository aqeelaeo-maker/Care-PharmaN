export const printInvoiceHtml = (invoice: any) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;
  
  const itemsHtml = invoice.items?.map((item: any) => `
    <tr>
      <td>${item.name}</td>
      <td style="text-align: center;">${item.qty}</td>
      <td style="text-align: right;">$${Number(item.price).toFixed(2)}</td>
      <td style="text-align: right;">$${(item.qty * item.price).toFixed(2)}</td>
    </tr>
  `).join('') || '';

  const dateStr = invoice.timestamp?.toDate 
    ? invoice.timestamp.toDate().toLocaleString() 
    : new Date(invoice.timestamp || Date.now()).toLocaleString();

  printWindow.document.write(`
    <html>
      <head>
        <title>Invoice ${invoice.id ? `INV-${invoice.id.slice(0,8).toUpperCase()}` : 'Preview'}</title>
        <style>
          body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; color: #333; max-width: 800px; margin: 0 auto; }
          .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
          .header h1 { margin: 0 0 10px 0; color: #10b981; }
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
        <div class="header">
          <h1>INVOICE</h1>
          ${invoice.id ? `<div><strong>Invoice #:</strong> INV-${invoice.id.slice(0,8).toUpperCase()}</div>` : ''}
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
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Price</th>
              <th style="text-align: right;">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${itemsHtml}
          </tbody>
        </table>
        <div class="total-section">
          <div><strong>Total:</strong> <span class="total-amount">$${Number(invoice.total).toFixed(2)}</span></div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  setTimeout(() => {
    printWindow.print();
  }, 250);
};

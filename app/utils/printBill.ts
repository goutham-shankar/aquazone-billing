import { BillItem, CustomerInfo, OrderSummary, OrderType, PaymentMethod } from '../types';

export interface PrintBillData {
  invoiceId?: string;
  customerInfo: CustomerInfo;
  billItems: BillItem[];
  summary: OrderSummary;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  dateTime: string;
}

export const printBill = async (billData: PrintBillData): Promise<void> => {
  try {
    // Create a new window for printing
    const printWindow = window.open('', '_blank', 'width=300,height=600');
    
    if (!printWindow) {
      throw new Error('Unable to open print window. Please allow popups for this site.');
    }

    const { invoiceId = 'INV-' + Date.now(), customerInfo, billItems, summary, orderType, paymentMethod, dateTime } = billData;

    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

    const businessInfo = {
      name: 'AquaZone Billing',
      address: '123 Business Street, City - 123456',
      phone: '+91 9876543210',
      email: 'info@aquazone.com',
      gst: 'GST123456789'
    };

    // Generate the HTML content for printing
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Invoice - ${invoiceId}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Courier New', monospace;
            font-size: 12px;
            line-height: 1.4;
            width: 80mm;
            margin: 0 auto;
            padding: 10px;
            background: white;
        }
        
        .header {
            text-align: center;
            border-bottom: 2px dashed #666;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        
        .header h1 {
            font-size: 16px;
            font-weight: bold;
            text-transform: uppercase;
            margin-bottom: 4px;
        }
        
        .header p {
            font-size: 10px;
            margin-bottom: 2px;
        }
        
        .section {
            border-bottom: 1px dashed #666;
            padding-bottom: 8px;
            margin-bottom: 12px;
        }
        
        .row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
        }
        
        .bold {
            font-weight: bold;
        }
        
        .items-header {
            display: flex;
            justify-content: space-between;
            font-weight: bold;
            border-bottom: 1px solid #333;
            padding-bottom: 2px;
            margin-bottom: 4px;
        }
        
        .item-row {
            display: flex;
            justify-content: space-between;
            margin-bottom: 2px;
            font-size: 10px;
        }
        
        .item-name {
            flex: 1;
            text-align: left;
        }
        
        .item-qty {
            width: 30px;
            text-align: center;
        }
        
        .item-rate {
            width: 40px;
            text-align: center;
        }
        
        .item-amount {
            width: 50px;
            text-align: right;
        }
        
        .note {
            font-size: 9px;
            color: #666;
            margin-left: 8px;
            font-style: italic;
        }
        
        .total-row {
            border-top: 1px solid #333;
            padding-top: 4px;
            font-weight: bold;
            font-size: 14px;
        }
        
        .footer {
            text-align: center;
            font-size: 10px;
            margin-top: 12px;
        }
        
        .footer .bold {
            font-size: 12px;
            margin-bottom: 4px;
        }
        
        .footer-divider {
            border-top: 1px dashed #666;
            padding-top: 8px;
            margin-top: 8px;
        }
        
        @media print {
            body {
                width: auto;
                margin: 0;
                padding: 5px;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${businessInfo.name}</h1>
        <p>${businessInfo.address}</p>
        <p>Phone: ${businessInfo.phone}</p>
        <p>Email: ${businessInfo.email}</p>
        <p>GST: ${businessInfo.gst}</p>
    </div>

    <div class="section">
        <div class="row">
            <span>Invoice #:</span>
            <span class="bold">${invoiceId}</span>
        </div>
        <div class="row">
            <span>Date:</span>
            <span>${new Date(dateTime).toLocaleDateString('en-IN')}</span>
        </div>
        <div class="row">
            <span>Time:</span>
            <span>${new Date(dateTime).toLocaleTimeString('en-IN')}</span>
        </div>
        <div class="row">
            <span>Type:</span>
            <span style="text-transform: capitalize;">${orderType}</span>
        </div>
    </div>

    <div class="section">
        <div class="bold" style="margin-bottom: 4px;">CUSTOMER DETAILS:</div>
        <p style="font-size: 10px;">Name: ${customerInfo.name || 'Walk-in Customer'}</p>
        ${customerInfo.mobile ? `<p style="font-size: 10px;">Mobile: ${customerInfo.mobile}</p>` : ''}
        ${customerInfo.email ? `<p style="font-size: 10px;">Email: ${customerInfo.email}</p>` : ''}
        ${customerInfo.address ? `<p style="font-size: 10px;">Address: ${customerInfo.address}</p>` : ''}
    </div>

    <div class="section">
        <div class="bold" style="margin-bottom: 8px;">ITEMS:</div>
        <div class="items-header">
            <span class="item-name">Item</span>
            <span class="item-qty">Qty</span>
            <span class="item-rate">Rate</span>
            <span class="item-amount">Amount</span>
        </div>
        ${billItems.map(item => `
            <div class="item-row">
                <span class="item-name">${item.name}</span>
                <span class="item-qty">${item.quantity}</span>
                <span class="item-rate">${formatCurrency(item.price)}</span>
                <span class="item-amount">${formatCurrency(item.amount)}</span>
            </div>
            ${item.specialNote ? `<div class="note">Note: ${item.specialNote}</div>` : ''}
        `).join('')}
    </div>

    <div class="section">
        <div class="row">
            <span>Items (${summary.totalQuantity}):</span>
            <span>${formatCurrency(summary.subTotal)}</span>
        </div>
        ${summary.discount > 0 ? `
        <div class="row">
            <span>Discount:</span>
            <span>- ${formatCurrency(summary.discount)}</span>
        </div>` : ''}
        ${summary.tax > 0 ? `
        <div class="row">
            <span>Tax:</span>
            <span>${formatCurrency(summary.tax)}</span>
        </div>` : ''}
        ${summary.deliveryCharge > 0 ? `
        <div class="row">
            <span>Delivery:</span>
            <span>${formatCurrency(summary.deliveryCharge)}</span>
        </div>` : ''}
        ${summary.containerCharge > 0 ? `
        <div class="row">
            <span>Container:</span>
            <span>${formatCurrency(summary.containerCharge)}</span>
        </div>` : ''}
        <div class="row total-row">
            <span>TOTAL:</span>
            <span>${formatCurrency(summary.grandTotal)}</span>
        </div>
    </div>

    <div class="section">
        <div class="row">
            <span>Payment Method:</span>
            <span style="text-transform: capitalize;">${paymentMethod}</span>
        </div>
        ${summary.customerPaid > 0 ? `
        <div class="row">
            <span>Paid:</span>
            <span>${formatCurrency(summary.customerPaid)}</span>
        </div>` : ''}
        ${summary.returnToCustomer > 0 ? `
        <div class="row bold">
            <span>Change:</span>
            <span>${formatCurrency(summary.returnToCustomer)}</span>
        </div>` : ''}
        ${summary.tip > 0 ? `
        <div class="row">
            <span>Tip:</span>
            <span>${formatCurrency(summary.tip)}</span>
        </div>` : ''}
    </div>

    <div class="footer">
        <div class="bold">Thank you for your business!</div>
        <p>Visit again soon</p>
        <div class="footer-divider">
            <p>Powered by AquaZone Billing System</p>
            <p>${new Date().toLocaleString('en-IN')}</p>
        </div>
    </div>
</body>
</html>`;

    // Write content to the new window
    printWindow.document.write(htmlContent);
    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
      }, 500);
    };

  } catch (error) {
    console.error('Error printing bill:', error);
    throw error;
  }
};

// Generate sample bill data for testing
export const generateSampleBill = (): PrintBillData => {
  return {
    invoiceId: 'INV-2024001',
    customerInfo: {
      name: 'John Doe',
      mobile: '+91 9876543210',
      email: 'john.doe@example.com',
      address: '123 Main Street, Sample City - 123456'
    },
    billItems: [
      {
        id: 1,
        name: 'Bottled Water 1L',
        price: 20,
        quantity: 5,
        amount: 100,
        specialNote: 'Chilled'
      },
      {
        id: 2,
        name: 'Water Can 20L',
        price: 45,
        quantity: 2,
        amount: 90,
        specialNote: ''
      },
      {
        id: 3,
        name: 'Soda Bottle 500ml',
        price: 25,
        quantity: 3,
        amount: 75,
        specialNote: 'Cold drink'
      }
    ],
    summary: {
      subTotal: 265,
      discount: 15,
      tax: 25,
      deliveryCharge: 30,
      containerCharge: 5,
      grandTotal: 310,
      totalQuantity: 10,
      customerPaid: 350,
      returnToCustomer: 40,
      tip: 0
    },
    orderType: 'delivery' as OrderType,
    paymentMethod: 'cash' as PaymentMethod,
    dateTime: new Date().toISOString()
  };
};

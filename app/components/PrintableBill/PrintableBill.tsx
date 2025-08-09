import React from 'react';
import { BillItem, CustomerInfo, OrderSummary, OrderType, PaymentMethod } from '../../types';

interface PrintableBillProps {
  invoiceId?: string;
  customerInfo: CustomerInfo;
  billItems: BillItem[];
  summary: OrderSummary;
  orderType: OrderType;
  paymentMethod: PaymentMethod;
  dateTime: string;
  businessInfo?: {
    name: string;
    address: string;
    phone: string;
    email?: string;
    gst?: string;
  };
}

const PrintableBill: React.FC<PrintableBillProps> = ({
  invoiceId = 'INV-' + Date.now(),
  customerInfo,
  billItems,
  summary,
  orderType,
  paymentMethod,
  dateTime,
  businessInfo = {
    name: 'AquaZone Billing',
    address: '123 Business Street, City - 123456',
    phone: '+91 9876543210',
    email: 'info@aquazone.com',
    gst: 'GST123456789'
  }
}) => {
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  return (
    <div className="max-w-[80mm] mx-auto bg-white p-4 font-mono text-sm" style={{ fontSize: '12px', lineHeight: '1.4' }}>
      {/* Business Header */}
      <div className="text-center border-b-2 border-dashed border-gray-400 pb-2 mb-3">
        <h1 className="text-lg font-bold uppercase">{businessInfo.name}</h1>
        <p className="text-xs">{businessInfo.address}</p>
        <p className="text-xs">Phone: {businessInfo.phone}</p>
        {businessInfo.email && <p className="text-xs">Email: {businessInfo.email}</p>}
        {businessInfo.gst && <p className="text-xs">GST: {businessInfo.gst}</p>}
      </div>

      {/* Invoice Details */}
      <div className="border-b border-dashed border-gray-400 pb-2 mb-3">
        <div className="flex justify-between">
          <span>Invoice #:</span>
          <span className="font-bold">{invoiceId}</span>
        </div>
        <div className="flex justify-between">
          <span>Date:</span>
          <span>{new Date(dateTime).toLocaleDateString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Time:</span>
          <span>{new Date(dateTime).toLocaleTimeString('en-IN')}</span>
        </div>
        <div className="flex justify-between">
          <span>Type:</span>
          <span className="capitalize">{orderType}</span>
        </div>
      </div>

      {/* Customer Information */}
      <div className="border-b border-dashed border-gray-400 pb-2 mb-3">
        <h3 className="font-bold mb-1">CUSTOMER DETAILS:</h3>
        <p className="text-xs">Name: {customerInfo.name || 'Walk-in Customer'}</p>
        {customerInfo.mobile && <p className="text-xs">Mobile: {customerInfo.mobile}</p>}
        {customerInfo.email && <p className="text-xs">Email: {customerInfo.email}</p>}
        {customerInfo.address && <p className="text-xs">Address: {customerInfo.address}</p>}
      </div>

      {/* Items Table */}
      <div className="border-b border-dashed border-gray-400 pb-2 mb-3">
        <h3 className="font-bold mb-2">ITEMS:</h3>
        <div className="space-y-1">
          {/* Header */}
          <div className="flex justify-between font-bold border-b border-gray-300">
            <span className="flex-1">Item</span>
            <span className="w-8 text-center">Qty</span>
            <span className="w-12 text-center">Rate</span>
            <span className="w-16 text-right">Amount</span>
          </div>
          
          {/* Items */}
          {billItems.map((item, index) => (
            <div key={index}>
              <div className="flex justify-between">
                <span className="flex-1 text-xs">{item.name}</span>
                <span className="w-8 text-center text-xs">{item.quantity}</span>
                <span className="w-12 text-center text-xs">{formatCurrency(item.price)}</span>
                <span className="w-16 text-right text-xs">{formatCurrency(item.amount)}</span>
              </div>
              {item.specialNote && (
                <div className="text-xs text-gray-600 ml-2">
                  Note: {item.specialNote}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Totals */}
      <div className="border-b border-dashed border-gray-400 pb-2 mb-3">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Items ({summary.totalQuantity}):</span>
            <span>{formatCurrency(summary.subTotal)}</span>
          </div>
          
          {summary.discount > 0 && (
            <div className="flex justify-between">
              <span>Discount:</span>
              <span>- {formatCurrency(summary.discount)}</span>
            </div>
          )}
          
          {summary.tax > 0 && (
            <div className="flex justify-between">
              <span>Tax:</span>
              <span>{formatCurrency(summary.tax)}</span>
            </div>
          )}
          
          {summary.deliveryCharge > 0 && (
            <div className="flex justify-between">
              <span>Delivery:</span>
              <span>{formatCurrency(summary.deliveryCharge)}</span>
            </div>
          )}
          
          {summary.containerCharge > 0 && (
            <div className="flex justify-between">
              <span>Container:</span>
              <span>{formatCurrency(summary.containerCharge)}</span>
            </div>
          )}
          
          <div className="flex justify-between font-bold text-lg border-t border-gray-300 pt-1">
            <span>TOTAL:</span>
            <span>{formatCurrency(summary.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Payment Details */}
      <div className="border-b border-dashed border-gray-400 pb-2 mb-3">
        <div className="space-y-1">
          <div className="flex justify-between">
            <span>Payment Method:</span>
            <span className="capitalize">{paymentMethod}</span>
          </div>
          
          {summary.customerPaid > 0 && (
            <>
              <div className="flex justify-between">
                <span>Paid:</span>
                <span>{formatCurrency(summary.customerPaid)}</span>
              </div>
              
              {summary.returnToCustomer > 0 && (
                <div className="flex justify-between font-bold">
                  <span>Change:</span>
                  <span>{formatCurrency(summary.returnToCustomer)}</span>
                </div>
              )}
            </>
          )}
          
          {summary.tip > 0 && (
            <div className="flex justify-between">
              <span>Tip:</span>
              <span>{formatCurrency(summary.tip)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs space-y-1">
        <p className="font-bold">Thank you for your business!</p>
        <p>Visit again soon</p>
        <div className="border-t border-dashed border-gray-400 pt-2 mt-2">
          <p>Powered by AquaZone Billing System</p>
          <p>{new Date().toLocaleString('en-IN')}</p>
        </div>
      </div>
    </div>
  );
};

export default PrintableBill;

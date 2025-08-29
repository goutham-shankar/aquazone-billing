"use client";
import { useState, useRef } from "react";
import { Printer, Download, CheckCircle, ArrowLeft, Plus } from "lucide-react";
import { toast } from "react-hot-toast";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

interface CartItem {
  id: string;
  name: string;
  price: number;
  qty: number;
  stock: number;
}

interface Customer {
  id: string;
  name?: string;
  email?: string;
  phone?: string;
  billingAddress?: {
    text?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
  shippingAddress?: {
    text?: string;
    city?: string;
    state?: string;
    zip?: string;
  };
}

interface InvoiceCompleteProps {
  className?: string;
  invoiceId: string;
  invoiceNumber: string;
  customer?: Customer;
  items: CartItem[];
  subTotal: number;
  discountAmount: number;
  taxPercent: number;
  taxAmount: number;
  total: number;
  onBack: () => void;
  onNewBill: () => void;
}

export default function InvoiceComplete({
  className,
  invoiceId,
  invoiceNumber,
  customer,
  items,
  subTotal,
  discountAmount,
  taxPercent,
  taxAmount,
  total,
  onBack,
  onNewBill
}: InvoiceCompleteProps) {
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);
  const invoiceRef = useRef<HTMLDivElement>(null);

  const currentDate = new Date().toLocaleDateString('en-IN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    if (!invoiceRef.current) return;

    setIsGeneratingPDF(true);
    try {
      const canvas = await html2canvas(invoiceRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      const imgWidth = 210;
      const pageHeight = 295;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;

      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`invoice-${invoiceNumber}.pdf`);
      toast.success('Invoice PDF downloaded successfully');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Failed to generate PDF');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  return (
    <div className={`min-h-screen bg-slate-50 dark:bg-gray-900 ${className}`}>
      {/* Header Actions */}
      <div className="bg-white dark:bg-gray-800 border-b border-slate-200 dark:border-gray-700 px-6 py-4 print:hidden">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="flex items-center gap-2 px-4 py-2 text-slate-600 dark:text-gray-300 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
            <div className="h-6 w-px bg-slate-300 dark:bg-gray-600" />
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Invoice Created Successfully</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 bg-slate-100 dark:bg-gray-700 text-slate-700 dark:text-gray-200 hover:bg-slate-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              <Printer className="w-4 h-4" />
              Print
            </button>
            <button
              onClick={handleDownloadPDF}
              disabled={isGeneratingPDF}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white hover:bg-blue-700 dark:hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
            >
              <Download className="w-4 h-4" />
              {isGeneratingPDF ? 'Generating...' : 'Download PDF'}
            </button>
            <button
              onClick={onNewBill}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600 rounded-lg transition-colors"
            >
              <Plus className="w-4 h-4" />
              New Bill
            </button>
          </div>
        </div>
      </div>

      {/* Invoice Content */}
      <div className="py-8 print:py-0">
        <div className="max-w-4xl mx-auto px-6 print:px-0">
          <div 
            ref={invoiceRef}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg print:shadow-none print:rounded-none"
          >
            {/* Invoice Header */}
            <div className="border-b border-slate-200 dark:border-gray-700 px-8 py-6">
              <div className="flex justify-between items-start">
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">INVOICE</h1>
                  <div className="mt-2 text-slate-600">
                    <p className="font-medium">#{invoiceNumber}</p>
                    <p className="text-sm">Date: {currentDate}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-800">AquaZone</div>
                  <div className="text-sm text-slate-600 mt-1">
                    <p>123 Business Street</p>
                    <p>City, State 12345</p>
                    <p>Phone: (555) 123-4567</p>
                    <p>Email: info@aquazone.com</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Details */}
            <div className="px-8 py-6 border-b border-slate-200">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-3">Bill To:</h3>
                  <div className="text-slate-600">
                    <p className="font-medium">{customer?.name || 'Walk-in Customer'}</p>
                    {customer?.email && <p>{customer.email}</p>}
                    {customer?.phone && <p>{customer.phone}</p>}
                    {customer?.billingAddress && (
                      <div className="mt-2">
                        {customer.billingAddress.text && <p>{customer.billingAddress.text}</p>}
                        <p>{customer.billingAddress.city}, {customer.billingAddress.state}</p>
                        <p>{customer.billingAddress.zip}</p>
                      </div>
                    )}
                  </div>
                </div>
                
                {customer?.shippingAddress && (
                  <div>
                    <h3 className="font-semibold text-slate-800 mb-3">Ship To:</h3>
                    <div className="text-slate-600">
                      {customer.shippingAddress.text && <p>{customer.shippingAddress.text}</p>}
                      <p>{customer.shippingAddress.city}, {customer.shippingAddress.state}</p>
                      <p>{customer.shippingAddress.zip}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Items Table */}
            <div className="px-8 py-6">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200">
                    <th className="text-left py-3 text-slate-700 font-semibold">Item</th>
                    <th className="text-right py-3 text-slate-700 font-semibold">Qty</th>
                    <th className="text-right py-3 text-slate-700 font-semibold">Price</th>
                    <th className="text-right py-3 text-slate-700 font-semibold">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id} className="border-b border-slate-100">
                      <td className="py-3 text-slate-800">{item.name}</td>
                      <td className="py-3 text-right text-slate-600">{item.qty}</td>
                      <td className="py-3 text-right text-slate-600">₹{item.price.toFixed(2)}</td>
                      <td className="py-3 text-right text-slate-800 font-medium">
                        ₹{(item.price * item.qty).toFixed(2)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Totals */}
            <div className="px-8 py-6 border-t border-slate-200">
              <div className="max-w-md ml-auto">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-600">Subtotal:</span>
                    <span className="text-slate-800">₹{subTotal.toFixed(2)}</span>
                  </div>
                  {discountAmount > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>Discount:</span>
                      <span>-₹{discountAmount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-slate-600">Tax ({taxPercent}%):</span>
                    <span className="text-slate-800">₹{taxAmount.toFixed(2)}</span>
                  </div>
                  <div className="border-t border-slate-200 pt-2">
                    <div className="flex justify-between text-lg font-bold">
                      <span className="text-slate-800">Total:</span>
                      <span className="text-slate-800">₹{total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 bg-slate-50 dark:bg-gray-750 rounded-b-lg print:bg-transparent">
              <div className="text-center text-sm text-slate-600 dark:text-gray-400">
                <p>Thank you for your business!</p>
                <p className="mt-1">For any queries, please contact us at info@aquazone.com</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

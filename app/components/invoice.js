// src/components/InvoicePDF.js
import React from 'react';
import PropTypes from 'prop-types';
import { Page, Text, View, Document, StyleSheet } from '@react-pdf/renderer';

// --- Helper Functions (moved outside for performance) ---
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
  }).format(amount || 0);
};

const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = { year: 'numeric', month: 'short', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-IN', options);
};


// --- Styles ---
const styles = StyleSheet.create({
  // Page and Font
  page: {
    fontFamily: 'Helvetica',
    fontSize: 11,
    padding: 30,
    lineHeight: 1.5,
    color: '#333', // Default text color
  },
  
  // Header section
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 25,
    borderBottomWidth: 2,
    borderBottomColor: '#1a73e8',
    paddingBottom: 10,
  },
  headerLeft: {
    flex: 2,
  },
  headerRight: {
    flex: 1,
    textAlign: 'right',
  },
  companyName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1a73e8',
  },
  companyDetails: {
      fontSize: 9,
      color: '#666',
  },
  invoiceTitle: {
    fontSize: 16,
    color: '#555',
    marginTop: 8,
  },
  invoiceInfo: {
      fontSize: 10,
  },
  
  // Bill To section
  billTo: {
    marginBottom: 30,
  },
  billToTitle: {
    fontWeight: 'bold',
    fontSize: 12,
    marginBottom: 5,
    color: '#1a73e8',
  },
  
  // Table
  table: {
    width: '100%',
    marginBottom: 20,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    alignItems: 'center',
    minHeight: 28,
  },
  tableRowAlt: {
    backgroundColor: '#f9f9f9',
  },
  tableHeader: {
    backgroundColor: '#f0f0f0',
    borderBottomWidth: 2,
    borderBottomColor: '#1a73e8',
  },
  tableHeaderText: {
      fontWeight: 'bold',
      fontSize: 10,
      color: '#333',
      textTransform: 'uppercase',
  },
  colDescription: { width: '45%', padding: 6 },
  colQty: { width: '15%', padding: 6, textAlign: 'center' },
  colPrice: { width: '20%', padding: 6, textAlign: 'right' },
  colTotal: { width: '20%', padding: 6, textAlign: 'right' },
  
  // Summary section
  summary: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 20,
  },
  summaryContainer: {
    width: '50%',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  summaryLabel: {
      color: '#555',
  },
  summaryTotal: {
    borderTopWidth: 2,
    borderTopColor: '#1a73e8',
    marginTop: 8,
    paddingTop: 8,
    fontWeight: 'bold',
    fontSize: 14,
  },
  summaryTotalAmount: {
      color: '#1a73e8',
      fontSize: 16,
  },

  // Footer section
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    textAlign: 'center',
    color: '#888',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingTop: 10,
  },
});

// --- Main Component ---
const InvoicePDF = ({ invoice, company }) => {
  // Memoize calculations for clarity and potential performance
  const totals = React.useMemo(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
    const discount = subtotal * (invoice.discount / 100);
    const taxableAmount = subtotal - discount;
    // Assuming a flat 18% GST on taxable items
    const tax = invoice.items.reduce((sum, item) => {
        const itemTotal = item.quantity * item.price;
        return item.taxable ? sum + (itemTotal * 0.18) : sum;
    }, 0);
    const total = taxableAmount + tax + invoice.delivery;
    return { subtotal, discount, tax, total };
  }, [invoice]);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <Text style={styles.companyName}>{company.name}</Text>
            <Text style={styles.companyDetails}>{company.address}</Text>
            <Text style={styles.companyDetails}>{company.phone} | {company.email}</Text>
            <Text style={styles.invoiceTitle}>{company.invoiceTitle}</Text>
          </View>
          <View style={styles.headerRight}>
            <Text style={styles.invoiceInfo}>Invoice #: {invoice.invoiceNumber}</Text>
            <Text style={styles.invoiceInfo}>Date: {formatDate(invoice.date)}</Text>
            <Text style={styles.invoiceInfo}>Due Date: {formatDate(invoice.dueDate)}</Text>
          </View>
        </View>

        {invoice.customer && (
          <View style={styles.billTo}>
            <Text style={styles.billToTitle}>Bill To:</Text>
            <Text>{invoice.customer.name}</Text>
            {invoice.customer.address && <Text>{invoice.customer.address}, {invoice.customer.city}</Text>}
            {invoice.customer.state && <Text>{invoice.customer.state} - {invoice.customer.zipCode}</Text>}
            {invoice.customer.phone && <Text>{invoice.customer.phone}</Text>}
            {invoice.customer.taxId && <Text>GSTIN: {invoice.customer.taxId}</Text>}
          </View>
        )}

        <View style={styles.table}>
          <View style={[styles.tableRow, styles.tableHeader]}>
            <Text style={[styles.colDescription, styles.tableHeaderText]}>Item Description</Text>
            <Text style={[styles.colQty, styles.tableHeaderText]}>Qty</Text>
            <Text style={[styles.colPrice, styles.tableHeaderText]}>Price</Text>
            <Text style={[styles.colTotal, styles.tableHeaderText]}>Total</Text>
          </View>
          {invoice.items.map((item, index) => (
            <View style={[styles.tableRow, index % 2 === 1 && styles.tableRowAlt]} key={item.id}>
              <Text style={styles.colDescription}>{item.name}</Text>
              <Text style={styles.colQty}>{item.quantity}</Text>
              <Text style={styles.colPrice}>{formatCurrency(item.price)}</Text>
              <Text style={styles.colTotal}>{formatCurrency(item.quantity * item.price)}</Text>
            </View>
          ))}
        </View>

        <View style={styles.summary}>
          <View style={styles.summaryContainer}>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Subtotal</Text><Text>{formatCurrency(totals.subtotal)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Discount ({invoice.discount}%)</Text><Text>- {formatCurrency(totals.discount)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>Delivery</Text><Text>{formatCurrency(invoice.delivery)}</Text></View>
            <View style={styles.summaryRow}><Text style={styles.summaryLabel}>GST (18%)</Text><Text>{formatCurrency(totals.tax)}</Text></View>
            <View style={[styles.summaryRow, styles.summaryTotal]}><Text>TOTAL</Text><Text style={styles.summaryTotalAmount}>{formatCurrency(totals.total)}</Text></View>
          </View>
        </View>

        <Text style={styles.footer}>{company.footerText}</Text>
      </Page>
    </Document>
  );
};

// --- Prop Type Definitions ---
InvoicePDF.propTypes = {
  invoice: PropTypes.shape({
    invoiceNumber: PropTypes.string,
    date: PropTypes.string,
    dueDate: PropTypes.string,
    discount: PropTypes.number,
    delivery: PropTypes.number,
    customer: PropTypes.shape({
      name: PropTypes.string,
      address: PropTypes.string,
      city: PropTypes.string,
      state: PropTypes.string,
      zipCode: PropTypes.string,
      phone: PropTypes.string,
      taxId: PropTypes.string,
    }),
    items: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
        name: PropTypes.string,
        quantity: PropTypes.number,
        price: PropTypes.number,
        taxable: PropTypes.bool,
      })
    ),
  }).isRequired,
  company: PropTypes.shape({
    name: PropTypes.string,
    invoiceTitle: PropTypes.string,
    footerText: PropTypes.string,
    address: PropTypes.string,
    phone: PropTypes.string,
    email: PropTypes.string,
  }),
};

// --- Default Props ---
InvoicePDF.defaultProps = {
  invoice: {
    items: [],
    discount: 0,
    delivery: 0,
    customer: {},
  },
  company: {
    name: 'New Golden Aquazone',
    invoiceTitle: 'TAX INVOICE',
    footerText: 'Thank you for your business!',
    address: '123 Aqua Street, Marine City, Ocean State 400001',
    phone: '+91 98765 43210',
    email: 'contact@newgoldenaqua.com',
  },
};

export default InvoicePDF;
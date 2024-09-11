import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, where } from '../../firebase';
import { Link } from 'react-router-dom';
import './admin.css';

const AdminDashboard = () => {
  const [totalSales, setTotalSales] = useState({ today: 0, week: 0, month: 0 });
  const [cashPayments, setCashPayments] = useState({ today: 0, week: 0, month: 0 });
  const [upiPayments, setUpiPayments] = useState({ today: 0, week: 0, month: 0 });
  const [totalCustomers, setTotalCustomers] = useState({ today: 0, week: 0, month: 0 });
  const [totalDueAmount, setTotalDueAmount] = useState(0);
  const [totalInvoices, setTotalInvoices] = useState({ today: 0, week: 0, month: 0 });

  useEffect(() => {
    const fetchMetricsData = async () => {
      try {
        const today = new Date();
        const startOfWeek = new Date(today);
        startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
        const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);

        // Fetch invoices data
        const invoicesQuery = query(collection(db, 'invoices'), where('createdAt', '>=', startOfMonth));
        const invoicesSnap = await getDocs(invoicesQuery);
        const invoices = invoicesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        }));

        // Initialize variables for calculations
        let todaySales = 0;
        let weekSales = 0;
        let monthSales = 0;
        let todayCash = 0;
        let weekCash = 0;
        let monthCash = 0;
        let todayUpi = 0;
        let weekUpi = 0;
        let monthUpi = 0;
        let todayInvoices = 0;
        let weekInvoices = 0;
        let monthInvoices = 0;
        let todayCustomers = new Set();
        let weekCustomers = new Set();
        let monthCustomers = new Set();
        let totalDue = 0;

        invoices.forEach(invoice => {
          const invoiceDate = invoice.createdAt;
          const invoiceAmount = invoice.totalAmount + (invoice.gstAmount || 0); // Add GST amount

          // Sales calculations
          if (invoiceDate.toDateString() === today.toDateString()) {
            todaySales += invoiceAmount;
            todayInvoices++;
          }
          if (invoiceDate >= startOfWeek) {
            weekSales += invoiceAmount;
            weekInvoices++;
          }
          if (invoiceDate >= startOfMonth) {
            monthSales += invoiceAmount;
            monthInvoices++;
          }

          // Payment calculations
          if (invoice.paymentStatus === 'paid') {
            if (invoice.paymentMethod === 'cash') {
              if (invoiceDate.toDateString() === today.toDateString()) {
                todayCash += invoiceAmount;
              }
              if (invoiceDate >= startOfWeek) {
                weekCash += invoiceAmount;
              }
              if (invoiceDate >= startOfMonth) {
                monthCash += invoiceAmount;
              }
            } else if (invoice.paymentMethod === 'upi_card') {
              if (invoiceDate.toDateString() === today.toDateString()) {
                todayUpi += invoiceAmount;
              }
              if (invoiceDate >= startOfWeek) {
                weekUpi += invoiceAmount;
              }
              if (invoiceDate >= startOfMonth) {
                monthUpi += invoiceAmount;
              }
            }
          }

          // Customers
          todayCustomers.add(invoice.customerId);
          weekCustomers.add(invoice.customerId);
          monthCustomers.add(invoice.customerId);
        });

        setTotalSales({ today: todaySales, week: weekSales, month: monthSales });
        setCashPayments({ today: todayCash, week: weekCash, month: monthCash });
        setUpiPayments({ today: todayUpi, week: weekUpi, month: monthUpi });
        setTotalCustomers({ today: todayCustomers.size, week: weekCustomers.size, month: monthCustomers.size });
        setTotalInvoices({ today: todayInvoices, week: weekInvoices, month: monthInvoices });
        setTotalDueAmount(totalDue);
      } catch (error) {
        console.error('Error fetching admin metrics:', error);
      }
    };

    const fetchDueAmount = async () => {
      try {
        const invoicesQuery = query(collection(db, 'invoices'), where('dueAmount', '>', 0));
        const invoicesSnap = await getDocs(invoicesQuery);
        const invoices = invoicesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));

        let totalDue = 0;
        invoices.forEach(invoice => {
          totalDue += invoice.dueAmount || 0;
        });

        setTotalDueAmount(totalDue);
      } catch (error) {
        console.error('Error fetching due amount:', error);
      }
    };

    fetchMetricsData();
    fetchDueAmount();
  }, []);

  return (
    <div className='admin'>
      <div className='header'>
        <Link to='/admin'>Dashboard</Link>
        <Link to='/admin/stock'>Stock</Link>
        <Link to='/admin/customers'>Customers</Link>
        <Link to='/admin/invoices'>Invoices</Link>
      </div>

      <div className='adminbody'>
        <h2>Admin Dashboard</h2>

        <div>
          <hr />

          <div className="totalsales">
            <h1>Total sales</h1>
            <p>Total Sales Today: ₹{totalSales.today.toFixed(2)}</p>
            <p>Total Sales This Month: ₹{totalSales.month.toFixed(2)}</p>
          </div>
          <hr />
          <div className="totalpayment">
            <h1>Total Payment</h1>
            <h3>Cash</h3>
            <p>Cash Payments Today: ₹{cashPayments.today.toFixed(2)}</p>
            <p>Cash Payments This Month: ₹{cashPayments.month.toFixed(2)}</p>
            <h3>Upi/Card</h3>
            <p>UPI Payments Today: ₹{upiPayments.today.toFixed(2)}</p>
            <p>UPI Payments This Month: ₹{upiPayments.month.toFixed(2)}</p>
          </div>
          <hr />
          <h1>Total Payment Due</h1>
          <p>Total Due Amount: ₹{totalDueAmount.toFixed(2)}</p>
          <hr />
          <h1> Total customers</h1>
          <p>Total Customers: {totalCustomers.today}</p>
          <hr />
          <h1>Total Bills</h1>
          <p>Total Invoices Today: {totalInvoices.today}</p>
          <p>Total Invoices This Month: {totalInvoices.month}</p>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

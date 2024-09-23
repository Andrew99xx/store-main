import React, { useEffect, useState } from 'react';
import { db, collection, getDocs, query, where } from '../../firebase';
import { Link } from 'react-router-dom';

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

        const invoicesQuery = query(collection(db, 'invoices'), where('createdAt', '>=', startOfMonth));
        const invoicesSnap = await getDocs(invoicesQuery);
        const invoices = invoicesSnap.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt.toDate(),
        }));

        let todaySales = 0, weekSales = 0, monthSales = 0;
        let todayCash = 0, weekCash = 0, monthCash = 0;
        let todayUpi = 0, weekUpi = 0, monthUpi = 0;
        let todayInvoices = 0, weekInvoices = 0, monthInvoices = 0;
        let todayCustomers = new Set(), weekCustomers = new Set(), monthCustomers = new Set();
        let totalDue = 0;

        invoices.forEach(invoice => {
          const invoiceDate = invoice.createdAt;
          const invoiceAmount = invoice.totalAmount + (invoice.gstAmount || 0);

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

          if (invoice.paymentStatus === 'paid') {
            if (invoice.paymentMethod === 'cash') {
              if (invoiceDate.toDateString() === today.toDateString()) todayCash += invoiceAmount;
              if (invoiceDate >= startOfWeek) weekCash += invoiceAmount;
              if (invoiceDate >= startOfMonth) monthCash += invoiceAmount;
            } else if (invoice.paymentMethod === 'upi_card') {
              if (invoiceDate.toDateString() === today.toDateString()) todayUpi += invoiceAmount;
              if (invoiceDate >= startOfWeek) weekUpi += invoiceAmount;
              if (invoiceDate >= startOfMonth) monthUpi += invoiceAmount;
            }
          }

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
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="flex justify-center items-center space-x-4 bg-white p-4 shadow-md rounded-md">
        <Link to="/admin" className="text-blue-600 hover:text-blue-800">Dashboard</Link>
        <Link to="/admin/stock" className="text-blue-600 hover:text-blue-800">Stock</Link>
        <Link to="/admin/customers" className="text-blue-600 hover:text-blue-800">Customers</Link>
        <Link to="/admin/invoices" className="text-blue-600 hover:text-blue-800">Invoices</Link>
      </div>

      <div className="mt-6 bg-white p-6 rounded-md shadow-md">
        <h2 className="text-xl font-bold text-gray-800">Admin Dashboard</h2>

        <div className="mt-4 space-y-6">
          <div className="bg-gray-100 p-4 rounded-md">
            <h1 className="text-lg font-semibold text-gray-700">Total Sales</h1>
            <p>Total Sales Today: ₹{totalSales.today.toFixed(2)}</p>
            <p>Total Sales This Month: ₹{totalSales.month.toFixed(2)}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <h1 className="text-lg font-semibold text-gray-700">Total Payment</h1>
            <h3 className="font-medium">Cash</h3>
            <p>Cash Payments Today: ₹{cashPayments.today.toFixed(2)}</p>
            <p>Cash Payments This Month: ₹{cashPayments.month.toFixed(2)}</p>
            <h3 className="font-medium">UPI/Card</h3>
            <p>UPI Payments Today: ₹{upiPayments.today.toFixed(2)}</p>
            <p>UPI Payments This Month: ₹{upiPayments.month.toFixed(2)}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <h1 className="text-lg font-semibold text-gray-700">Total Payment Due</h1>
            <p>Total Due Amount: ₹{totalDueAmount.toFixed(2)}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <h1 className="text-lg font-semibold text-gray-700">Total Customers</h1>
            <p>Total Customers Today: {totalCustomers.today}</p>
          </div>

          <div className="bg-gray-100 p-4 rounded-md">
            <h1 className="text-lg font-semibold text-gray-700">Total Bills</h1>
            <p>Total Invoices Today: {totalInvoices.today}</p>
            <p>Total Invoices This Month: {totalInvoices.month}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

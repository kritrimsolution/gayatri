'use client';

import React, { useState, useEffect } from 'react';
import { 
  Users, 
  Package, 
  Send, 
  LayoutDashboard, 
  LogOut, 
  Lock, 
  Mail, 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Calendar, 
  CheckCircle, 
  AlertTriangle, 
  Loader2, 
  FileText,
  BadgeAlert,
  Percent,
  Check,
  X,
  RefreshCw,
  Eye,
  Settings,
  ShieldCheck,
  ShoppingCart,
  Receipt,
  CreditCard,
  ChevronRight,
  TrendingUp,
  Award,
  Cake,
  Bell,
  Menu,
  Activity,
  Sparkles,
  ChevronDown
} from 'lucide-react';
import { useCartStore } from './store/cart';

const API_BASE = 'http://localhost:5000/api';
const STATIC_BASE = 'http://localhost:5000';
const SHOW_PHASE_2 = false; // Set to true to unhide Phase 2 B2B Shop Portal & Order/Ledger Queue

// Custom component to handle image errors and show a clean SVG placeholder
function ImageWithFallback({ src, alt, className }) {
  const [error, setError] = useState(false);
  
  if (error || !src) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-400 p-2 select-none">
        <svg className="w-8 h-8 stroke-[1.2] text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
        </svg>
        <span className="text-[8px] font-bold uppercase tracking-wider text-slate-400 mt-1">No Image</span>
      </div>
    );
  }
  
  return (
    <img
      src={src}
      alt={alt}
      className={className}
      onError={() => setError(true)}
    />
  );
}

// Medicine SVG vector fallback for broadcast preview
const MedicinePlaceholderSVG = () => (
  <svg className="w-16 h-16 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
  </svg>
);

// Custom responsive SVG line & bar chart for analytics
const B2BWeeklyTrendsChart = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-4">
        <div>
          <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">B2B Sales & Registrations Growth</h4>
          <p className="text-slate-400 text-[10px]">Weekly distribution diagnostic trends</p>
        </div>
        <div className="flex items-center gap-3 text-[10px] font-semibold text-slate-500">
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-violet-600"></span> Orders</span>
          <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span> Shops Registered</span>
        </div>
      </div>
      <div className="w-full h-40">
        <svg className="w-full h-full" viewBox="0 0 500 150" preserveAspectRatio="none">
          {/* Grid lines */}
          <line x1="40" y1="20" x2="480" y2="20" stroke="#f8fafc" strokeWidth="1" />
          <line x1="40" y1="55" x2="480" y2="55" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="40" y1="90" x2="480" y2="90" stroke="#f1f5f9" strokeWidth="1" />
          <line x1="40" y1="125" x2="480" y2="125" stroke="#e2e8f0" strokeWidth="1" />

          {/* X Axis Labels */}
          <text x="50" y="142" fill="#94a3b8" fontSize="8" textAnchor="middle">Mon</text>
          <text x="120" y="142" fill="#94a3b8" fontSize="8" textAnchor="middle">Tue</text>
          <text x="190" y="142" fill="#94a3b8" fontSize="8" textAnchor="middle">Wed</text>
          <text x="260" y="142" fill="#94a3b8" fontSize="8" textAnchor="middle">Thu</text>
          <text x="330" y="142" fill="#94a3b8" fontSize="8" textAnchor="middle">Fri</text>
          <text x="400" y="142" fill="#94a3b8" fontSize="8" textAnchor="middle">Sat</text>
          <text x="470" y="142" fill="#94a3b8" fontSize="8" textAnchor="middle">Sun</text>

          {/* Shop registrations count bars (Emerald) */}
          <rect x="42" y="100" width="16" height="25" rx="2" fill="#10b981" fillOpacity="0.15" />
          <rect x="112" y="80" width="16" height="45" rx="2" fill="#10b981" fillOpacity="0.15" />
          <rect x="182" y="90" width="16" height="35" rx="2" fill="#10b981" fillOpacity="0.15" />
          <rect x="252" y="60" width="16" height="65" rx="2" fill="#10b981" fillOpacity="0.15" />
          <rect x="322" y="45" width="16" height="80" rx="2" fill="#10b981" fillOpacity="0.15" />
          <rect x="392" y="80" width="16" height="45" rx="2" fill="#10b981" fillOpacity="0.15" />
          <rect x="462" y="110" width="16" height="15" rx="2" fill="#10b981" fillOpacity="0.15" />

          {/* Orders volume line (Violet) */}
          <path d="M 50 110 Q 120 60 190 85 T 330 35 T 470 100" fill="none" stroke="#635bff" strokeWidth="2.5" strokeLinecap="round" />
          
          {/* Gradient definition */}
          <defs>
            <linearGradient id="violet-glow" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#635bff" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#635bff" stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d="M 50 110 Q 120 60 190 85 T 330 35 T 470 100 L 470 125 L 50 125 Z" fill="url(#violet-glow)" />

          {/* Points */}
          <circle cx="50" cy="110" r="3.5" fill="#635bff" stroke="#fff" strokeWidth="1.5" />
          <circle cx="120" cy="78" r="3.5" fill="#635bff" stroke="#fff" strokeWidth="1.5" />
          <circle cx="190" cy="85" r="3.5" fill="#635bff" stroke="#fff" strokeWidth="1.5" />
          <circle cx="260" cy="62" r="3.5" fill="#635bff" stroke="#fff" strokeWidth="1.5" />
          <circle cx="330" cy="35" r="3.5" fill="#635bff" stroke="#fff" strokeWidth="1.5" />
          <circle cx="400" cy="68" r="3.5" fill="#635bff" stroke="#fff" strokeWidth="1.5" />
          <circle cx="470" cy="100" r="3.5" fill="#635bff" stroke="#fff" strokeWidth="1.5" />
        </svg>
      </div>
    </div>
  );
};

export default function AdminConsole() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authRole, setAuthRole] = useState('admin'); // 'admin' or 'client'
  const [loginRoleTab, setLoginRoleTab] = useState(SHOW_PHASE_2 ? 'client' : 'admin'); // default to B2B login view if enabled
  const [token, setToken] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [clientUser, setClientUser] = useState(null);
  
  // Login input fields
  const [loginEmail, setLoginEmail] = useState(''); // can be email or WhatsApp number for client
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // General App State
  const [activeTab, setActiveTab] = useState('dashboard'); // for admin
  const [clientActiveTab, setClientActiveTab] = useState('catalog'); // for client portal
  const [apiOnline, setApiOnline] = useState(false);
  const [toast, setToast] = useState(null);

  // Data Lists
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);
  const [analytics, setAnalytics] = useState({ ledgerBalances: [], topCustomers: [], fastMovingItems: [] });
  const [dataLoading, setDataLoading] = useState(false);

  // Modals & Forms State
  const [customerModal, setCustomerModal] = useState({ open: false, mode: 'create', data: null });
  const [productModal, setProductModal] = useState({ open: false, mode: 'create', data: null });
  const [selectedOrderItems, setSelectedOrderItems] = useState(null); // for order details modal
  const [deleteConfirm, setDeleteConfirm] = useState({ open: false, type: null, id: null, title: '' });

  // Customer Form State
  const [customerForm, setCustomerForm] = useState({
    shop_name: '',
    whatsapp_number: '',
    email: '',
    password_hash: '',
    gst_number: '',
    drug_license_expiry: '',
    owner_birthday: ''
  });

  // Product Form State
  const [productForm, setProductForm] = useState({
    medicine_name: '',
    generic_name: '',
    mrp: '',
    b2b_discount_price: '',
    stock_status: 'IN_STOCK',
    current_stock: '0',
    scheme_id: ''
  });
  const [productImageFile, setProductImageFile] = useState(null);
  const [schemes, setSchemes] = useState([
    { id: 'buy-10-get-1', name: 'Buy 10 Get 1 Free (BUY_X_GET_Y)' },
    { id: 'festive-15', name: '15% Festive Discount (PERCENTAGE)' }
  ]); // Simulated schemes for dropdown selection

  // Broadcast Center State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [templateType, setTemplateType] = useState('PRODUCT_LAUNCH');
  const [customText, setCustomText] = useState('');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // Combobox searchable product dropdown state
  const [comboboxOpen, setComboboxOpen] = useState(false);
  const [comboboxSearch, setComboboxSearch] = useState('');

  // Admin Alert Destination Settings State
  const [adminMobile, setAdminMobile] = useState('919104332333');
  const [adminMobileInput, setAdminMobileInput] = useState('919104332333');
  const [isEditingAdminMobile, setIsEditingAdminMobile] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Search/Filters State
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('ALL');

  // Scheduler Interactive Logs & Simulation State
  const [schedulerRunning, setSchedulerRunning] = useState(false);
  const [schedulerLogs, setSchedulerLogs] = useState([
    `[00:01:00] Automated Background Scheduler initialized (Gayatri Engine v1.4)`,
    `[00:01:05] Database sweep completed. Checked active medical shop profiles.`,
    `[00:01:10] Log: Checking drug license warning alerts and birthday schedules...`,
  ]);

  // Zustand Cart Hook
  const cart = useCartStore();
  const cartDetails = cart.getCartDetails();

  // Auto-clear Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Check API health and retrieve local credentials
  useEffect(() => {
    checkApiHealth();
    const savedToken = localStorage.getItem('gayatri_token');
    const savedAdmin = localStorage.getItem('gayatri_admin');
    const savedClient = localStorage.getItem('gayatri_client');
    const savedRole = localStorage.getItem('gayatri_role');

    if (savedToken && savedRole) {
      setToken(savedToken);
      setAuthRole(savedRole);
      if (savedRole === 'admin') {
        setAdminUser(JSON.parse(savedAdmin));
        setActiveTab('dashboard');
      } else {
        setClientUser(JSON.parse(savedClient));
        setClientActiveTab('catalog');
      }
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data on authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchProducts();
      if (authRole === 'admin') {
        fetchCustomers();
        fetchOrders();
        fetchAnalytics();
        fetchAdminSettings();
      } else {
        fetchOrders(); // client orders
      }
    }
  }, [isAuthenticated, authRole]);

  // Auto-close mobile menu on tab switch
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [activeTab, clientActiveTab]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const checkApiHealth = async () => {
    try {
      const res = await fetch(`${STATIC_BASE}/`);
      if (res.ok) {
        setApiOnline(true);
      } else {
        setApiOnline(false);
      }
    } catch (err) {
      setApiOnline(false);
    }
  };

  // Auth Handlers
  const handleLogin = async (e) => {
    if (e) e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const endpoint = loginRoleTab === 'admin' 
        ? `${API_BASE}/auth/login` 
        : `${API_BASE}/auth/client-login`;

      const payload = loginRoleTab === 'admin'
        ? { email: loginEmail || 'admin@gayatri.com', password: loginPassword }
        : { username: loginEmail, password: loginPassword };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      localStorage.setItem('gayatri_token', data.token);
      localStorage.setItem('gayatri_role', loginRoleTab);
      setToken(data.token);
      setAuthRole(loginRoleTab);

      if (loginRoleTab === 'admin') {
        localStorage.setItem('gayatri_admin', JSON.stringify(data.admin));
        setAdminUser(data.admin);
        setActiveTab('dashboard');
        showToast(`Logged in as Distributor Admin!`);
      } else {
        localStorage.setItem('gayatri_client', JSON.stringify(data.customer));
        setClientUser(data.customer);
        setClientActiveTab('catalog');
        showToast(`Connected to B2B Partner Portal: ${data.customer.shop_name}!`);
      }
      setIsAuthenticated(true);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gayatri_token');
    localStorage.removeItem('gayatri_admin');
    localStorage.removeItem('gayatri_client');
    localStorage.removeItem('gayatri_role');
    setToken('');
    setAdminUser(null);
    setClientUser(null);
    setAuthRole('admin');
    setIsAuthenticated(false);
    cart.clearCart();
    setLoginEmail('');
    setLoginPassword('password123');
    showToast('Logged out successfully.');
  };

  // API Fetch wrappers
  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gayatri_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      showToast('Error loading customers.', 'error');
    }
  };

  const fetchAdminSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/customers/admin-settings`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gayatri_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAdminMobile(data.admin_mobile_number);
        setAdminMobileInput(data.admin_mobile_number);
      }
    } catch (err) {
      console.error('Error loading admin settings:', err);
    }
  };

  const saveAdminSettings = async () => {
    try {
      const res = await fetch(`${API_BASE}/customers/admin-settings`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('gayatri_token')}`
        },
        body: JSON.stringify({ admin_mobile_number: adminMobileInput })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update admin number.');
      setAdminMobile(data.admin_mobile_number);
      setIsEditingAdminMobile(false);
      showToast('Admin alert destination number updated successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gayatri_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      showToast('Error loading product catalog.', 'error');
    }
  };

  const fetchOrders = async () => {
    try {
      const res = await fetch(`${API_BASE}/orders`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gayatri_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      showToast('Error loading orders queue.', 'error');
    }
  };

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`${API_BASE}/analytics`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gayatri_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setAnalytics(data);
      }
    } catch (err) {
      showToast('Error fetching ledger analytics.', 'error');
    }
  };

  // CRUD Handlers - Customer Registration
  const saveCustomer = async (e) => {
    e.preventDefault();
    const url = customerModal.mode === 'create' 
      ? `${API_BASE}/customers` 
      : `${API_BASE}/customers/${customerModal.data.id}`;
    const method = customerModal.mode === 'create' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(customerForm)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save customer');

      showToast(customerModal.mode === 'create' ? 'Customer registered successfully!' : 'Customer updated successfully!');
      setCustomerModal({ open: false, mode: 'create', data: null });
      fetchCustomers();
      fetchAnalytics();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteCustomer = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete customer');
      showToast('Customer deleted.');
      fetchCustomers();
      fetchAnalytics();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // CRUD Handlers - Product Listings
  const saveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('medicine_name', productForm.medicine_name);
    formData.append('generic_name', productForm.generic_name);
    formData.append('mrp', productForm.mrp);
    formData.append('b2b_discount_price', productForm.b2b_discount_price);
    formData.append('stock_status', productForm.stock_status);
    formData.append('in_stock_qty', productForm.current_stock); // Map current_stock to in_stock_qty for backend
    
    if (productForm.scheme_id) {
      formData.append('scheme_id', productForm.scheme_id);
    }
    if (productImageFile) {
      formData.append('image', productImageFile);
    }

    const url = productModal.mode === 'create' 
      ? `${API_BASE}/products` 
      : `${API_BASE}/products/${productModal.data.id}`;
    const method = productModal.mode === 'create' ? 'POST' : 'PUT';
    setDataLoading(true);

    try {
      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to save product');

      showToast(productModal.mode === 'create' ? 'Product created successfully!' : 'Product updated successfully!');
      setProductModal({ open: false, mode: 'create', data: null });
      setProductImageFile(null);
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const deleteProduct = async (id) => {
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');
      showToast('Product deleted.');
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Order Operations
  const handleUpdateOrderStatus = async (orderId, status) => {
    try {
      const res = await fetch(`${API_BASE}/orders/${orderId}/status`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ status })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to update order status');

      showToast(`Order status updated to ${status}!`);
      fetchOrders();
      fetchProducts(); // sync inventory deductions
      fetchAnalytics(); // sync ledger
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Client Checkout Flow
  const handleCheckout = async () => {
    if (cart.items.length === 0) {
      showToast('Cart is empty.', 'error');
      return;
    }

    setDataLoading(true);
    try {
      const orderPayload = {
        items: cart.items.map(i => ({
          product_id: i.product.id,
          quantity: i.quantity
        }))
      };

      const res = await fetch(`${API_BASE}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(orderPayload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place order.');

      showToast(`B2B Order successfully submitted! Confirmation alert triggered via WhatsApp.`);
      cart.clearCart();
      setClientActiveTab('orders');
      fetchOrders();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDataLoading(false);
    }
  };

  // Broadcast Dispatcher
  const triggerBroadcast = async () => {
    if (!selectedProduct) {
      showToast('Please select a product to broadcast.', 'error');
      return;
    }

    setBroadcastLoading(true);
    setBroadcastResult(null);

    const bodyParams = [
      selectedProduct.medicine_name,
      selectedProduct.generic_name || '',
      selectedProduct.mrp || 0,
      selectedProduct.b2b_discount_price || 0
    ];
    const payload = {
      imageUrl: selectedProduct.image_url,
      templateName: templateType === 'CUSTOM' ? null : templateType,
      bodyParams: templateType === 'CUSTOM' ? null : bodyParams,
      messageText: templateType === 'CUSTOM' ? customText : `🔥 Special Deal: ${selectedProduct.medicine_name} now available at B2B discounted price of ₹${selectedProduct.b2b_discount_price}! MRP: ₹${selectedProduct.mrp}. Contact us to order.`
    };

    try {
      const res = await fetch(`${API_BASE}/broadcast`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Broadcast failed.');

      showToast('WhatsApp Broadcast Dispatched successfully!');
      setBroadcastResult(data);
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setBroadcastLoading(false);
    }
  };

  // Background Automated Scheduler Mock Simulation
  const triggerSchedulerMock = () => {
    if (schedulerRunning) return;
    setSchedulerRunning(true);
    showToast('Initializing automated database sweeping diagnostics...', 'success');
    
    const timeStamp = () => new Date().toLocaleTimeString();

    setTimeout(() => {
      setSchedulerLogs(prev => [...prev, `[${timeStamp()}] Manual scheduler diagnostic sweep started.`]);
    }, 400);
    
    setTimeout(() => {
      setSchedulerLogs(prev => [...prev, `[${timeStamp()}] Scanning customer drug licenses expiry thresholds...`]);
    }, 1200);

    setTimeout(() => {
      const alertTargets = customers.filter(c => getDaysUntilExpiry(c.drug_license_expiry) <= 30);
      setSchedulerLogs(prev => [...prev, `[${timeStamp()}] Found ${alertTargets.length} shop profile(s) near drug license expiry limit (<= 30 days).`]);
      alertTargets.forEach(c => {
        setSchedulerLogs(prev => [...prev, `[${timeStamp()}] [WHATSAPP DISPATCH] Send license renew alert → "${c.shop_name}" (+${c.whatsapp_number})`]);
      });
    }, 2400);

    setTimeout(() => {
      const today = new Date();
      const m = String(today.getMonth() + 1).padStart(2, '0');
      const d = String(today.getDate()).padStart(2, '0');
      setSchedulerLogs(prev => [...prev, `[${timeStamp()}] Scanning active shop owner birthdays for matching date (${m}-${d})...`]);
      const birthdayList = customers.filter(c => c.owner_birthday && c.owner_birthday.includes(`-${m}-${d}`));
      setSchedulerLogs(prev => [...prev, `[${timeStamp()}] Found ${birthdayList.length} owner birthday greeting matches today.`]);
      birthdayList.forEach(c => {
        setSchedulerLogs(prev => [...prev, `[${timeStamp()}] [WHATSAPP DISPATCH] Dispatched birthday congratulatory flyer → "${c.shop_name}"`]);
      });
    }, 3800);

    setTimeout(() => {
      setSchedulerLogs(prev => [...prev, `[${timeStamp()}] B2B background diagnostic scan completed. Systems running normally.`]);
      setSchedulerRunning(false);
      showToast('B2B Background Automation Sweep Completed successfully!', 'success');
    }, 5000);
  };

  // Helpers to format dates and calculate license alerts
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDaysUntilExpiry = (expiryDateStr) => {
    if (!expiryDateStr) return 999;
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = expiry - today;
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const sendBirthdayWish = async (customerId) => {
    try {
      const res = await fetch(`${API_BASE}/customers/${customerId}/send-birthday-wish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send birthday greeting.');
      showToast(data.message || 'Birthday wish dispatched successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const sendLicenseAlert = async (customerId) => {
    try {
      const res = await fetch(`${API_BASE}/customers/${customerId}/send-license-alert`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send license alert.');
      showToast(data.message || 'License expiry alert dispatched successfully!');
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const openCustomerModal = (mode, data = null) => {
    if (mode === 'edit' && data) {
      setCustomerForm({
        shop_name: data.shop_name,
        whatsapp_number: data.whatsapp_number,
        email: data.email || '',
        password_hash: '',
        gst_number: data.gst_number,
        drug_license_expiry: data.drug_license_expiry.split('T')[0],
        owner_birthday: data.owner_birthday.split('T')[0]
      });
    } else {
      setCustomerForm({
        shop_name: '',
        whatsapp_number: '',
        email: '',
        password_hash: '',
        gst_number: '',
        drug_license_expiry: '',
        owner_birthday: ''
      });
    }
    setCustomerModal({ open: true, mode, data });
  };

  const openProductModal = (mode, data = null) => {
    if (mode === 'edit' && data) {
      setProductForm({
        medicine_name: data.medicine_name,
        generic_name: data.generic_name,
        mrp: data.mrp.toString(),
        b2b_discount_price: data.b2b_discount_price.toString(),
        stock_status: data.stock_status,
        current_stock: (data.current_stock ?? 0).toString(),
        scheme_id: data.scheme_id || ''
      });
    } else {
      setProductForm({
        medicine_name: '',
        generic_name: '',
        mrp: '',
        b2b_discount_price: '',
        stock_status: 'IN_STOCK',
        current_stock: '0',
        scheme_id: ''
      });
    }
    setProductImageFile(null);
    setProductModal({ open: true, mode, data });
  };

  // Filter lists
  const filteredCustomers = customers.filter(c => 
    c.shop_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    c.whatsapp_number.includes(customerSearch) ||
    c.gst_number.toLowerCase().includes(customerSearch.toLowerCase())
  );

  const filteredProducts = products.filter(p =>
    p.medicine_name.toLowerCase().includes(productSearch.toLowerCase()) ||
    p.generic_name.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(o => {
    if (orderFilterStatus === 'ALL') return true;
    return o.status === orderFilterStatus;
  });

  // Client outstanding balance & last payment details
  const clientOutstanding = analytics.ledgerBalances?.find(l => l.customer_id === clientUser?.id);

  const renderAdminNav = () => (
    <>
      <button
        onClick={() => setActiveTab('dashboard')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'dashboard' 
            ? 'bg-gradient-to-r from-violet-600/15 to-indigo-600/5 text-violet-400 border-l-4 border-violet-500 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
        }`}
      >
        <LayoutDashboard className="w-4.5 h-4.5" />
        Dashboard
      </button>

      <button
        onClick={() => setActiveTab('customers')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'customers' 
            ? 'bg-gradient-to-r from-violet-600/15 to-indigo-600/5 text-violet-400 border-l-4 border-violet-500 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
        }`}
      >
        <Users className="w-4.5 h-4.5" />
        Customers (Shops)
      </button>

      <button
        onClick={() => setActiveTab('products')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'products' 
            ? 'bg-gradient-to-r from-violet-600/15 to-indigo-600/5 text-violet-400 border-l-4 border-violet-500 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
        }`}
      >
        <Package className="w-4.5 h-4.5" />
        Product Catalog
      </button>

      <button
        onClick={() => setActiveTab('low-stock')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'low-stock' 
            ? 'bg-gradient-to-r from-violet-600/15 to-indigo-600/5 text-violet-400 border-l-4 border-violet-500 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
        }`}
      >
        <AlertTriangle className="w-4.5 h-4.5" />
        Stock Warnings
        {products.filter(p => p.current_stock < 250).length > 0 && (
          <span className="ml-auto bg-rose-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-glow animate-pulse">
            {products.filter(p => p.current_stock < 250).length}
          </span>
        )}
      </button>

      {SHOW_PHASE_2 && (
        <>
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-gradient-to-r from-violet-600/15 to-indigo-600/5 text-violet-400 border-l-4 border-violet-500 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Receipt className="w-4.5 h-4.5" />
            Orders Queue
            {orders.filter(o => o.status === 'PENDING').length > 0 && (
              <span className="ml-auto bg-violet-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-glow">
                {orders.filter(o => o.status === 'PENDING').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('ledger')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
              activeTab === 'ledger' 
                ? 'bg-gradient-to-r from-violet-600/15 to-indigo-600/5 text-violet-400 border-l-4 border-violet-500 shadow-sm' 
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <CreditCard className="w-4.5 h-4.5" />
            Ledger Sheets
          </button>
        </>
      )}

      <button
        onClick={() => setActiveTab('broadcast')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          activeTab === 'broadcast' 
            ? 'bg-gradient-to-r from-violet-600/15 to-indigo-600/5 text-violet-400 border-l-4 border-violet-500 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
        }`}
      >
        <Send className="w-4.5 h-4.5" />
        Broadcast Center
      </button>
    </>
  );

  const renderClientNav = () => (
    <>
      <button
        onClick={() => setClientActiveTab('catalog')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          clientActiveTab === 'catalog' 
            ? 'bg-gradient-to-r from-violet-600/15 to-indigo-600/5 text-violet-400 border-l-4 border-violet-500 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
        }`}
      >
        <Package className="w-4.5 h-4.5" />
        Live Catalog
      </button>

      <button
        onClick={() => setClientActiveTab('cart')}
        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          clientActiveTab === 'cart' 
            ? 'bg-gradient-to-r from-violet-600/15 to-indigo-600/5 text-violet-400 border-l-4 border-violet-500 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
        }`}
      >
        <div className="flex items-center gap-3">
          <ShoppingCart className="w-4.5 h-4.5" />
          <span>My Cart</span>
        </div>
        {cartDetails.items.length > 0 && (
          <span className="bg-violet-600 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-pulse shadow-glow">
            {cartDetails.items.length}
          </span>
        )}
      </button>

      <button
        onClick={() => setClientActiveTab('orders')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          clientActiveTab === 'orders' 
            ? 'bg-gradient-to-r from-violet-600/15 to-indigo-600/5 text-violet-400 border-l-4 border-violet-500 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
        }`}
      >
        <Receipt className="w-4.5 h-4.5" />
        My Orders
      </button>

      <button
        onClick={() => setClientActiveTab('ledger')}
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold transition-all cursor-pointer ${
          clientActiveTab === 'ledger' 
            ? 'bg-gradient-to-r from-violet-600/15 to-indigo-600/5 text-violet-400 border-l-4 border-violet-500 shadow-sm' 
            : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
        }`}
      >
        <CreditCard className="w-4.5 h-4.5" />
        Credit Ledger
      </button>
    </>
  );



  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-950 relative overflow-hidden px-4 select-none font-sans text-slate-200">
        
        {/* Subtle glowing ambient spots */}
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] rounded-full bg-violet-600/10 blur-[120px] pointer-events-none z-0" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] rounded-full bg-[#00d4ff]/5 blur-[120px] pointer-events-none z-0" />

        {/* Diagonal accents */}
        <div className="absolute top-[62%] -left-12 w-[35vw] min-w-[280px] h-20 bg-gradient-to-r from-[#00d4ff]/10 to-[#635bff]/10 transform -rotate-[12deg] opacity-75 z-0 blur-md" />
        <div className="absolute top-[26%] -right-12 w-[35vw] min-w-[280px] h-20 bg-gradient-to-r from-[#635bff]/10 to-[#00d4ff]/10 transform -rotate-[12deg] opacity-75 z-0 blur-md" />

        <div className="w-full max-w-5xl grid grid-cols-1 md:grid-cols-12 gap-8 items-center relative z-10 my-8">
          
          {/* Left Panel: Presentation Branding Card */}
          <div className="md:col-span-6 space-y-6 text-left p-4 hidden md:block">
            <div className="flex items-center gap-1.5">
              <span className="text-[38px] font-black text-white tracking-tighter">gayatri</span>
              <span className="text-[38px] font-light text-violet-400 tracking-tighter">pharma</span>
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse ml-2 shadow-glow" />
            </div>
            
            <h1 className="text-3xl font-extrabold text-white leading-tight">
              B2B Distribution Console & Broadcast Center
            </h1>
            
            <p className="text-slate-400 text-sm leading-relaxed max-w-md">
              Secure administrative controller for wholesale drug inventory management, accounts ledger tracking, and automated WhatsApp Meta API promotional broadcasts.
            </p>

            <div className="space-y-3 pt-4 border-t border-slate-900 max-w-sm">
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-900/50 text-violet-400 font-bold">✓</span>
                <span>Product Flyer Compilations</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-900/50 text-violet-400 font-bold">✓</span>
                <span>Meta Cloud WhatsApp Marketing Scheduler</span>
              </div>
              <div className="flex items-center gap-3 text-xs text-slate-400">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-violet-900/50 text-violet-400 font-bold">✓</span>
                <span>Credit Ledger Invoices Management</span>
              </div>
            </div>
          </div>

          {/* Right Panel: Login Card */}
          <div className="md:col-span-6 w-full max-w-[460px] mx-auto">
            {/* Mobile Brand Title */}
            <div className="flex items-center justify-center gap-1 mb-6 md:hidden">
              <span className="text-[28px] font-black text-white tracking-tighter">gayatri</span>
              <span className="text-[28px] font-light text-violet-400 tracking-tighter">pharma</span>
            </div>

            <div className="bg-slate-900/85 backdrop-blur-md border border-slate-800 rounded-2xl shadow-premium p-10 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white tracking-tight">
                  Sign in to console
                </h2>
                <p className="text-slate-400 text-xs mt-1.5">
                  Enter authorized partner credentials to manage drug distribution.
                </p>
              </div>

              {/* iOS-Style Role tabs */}
              {SHOW_PHASE_2 && (
                <div className="flex bg-slate-950 p-1.5 rounded-xl border border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => { setLoginRoleTab('client'); setLoginEmail(''); setLoginError(''); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      loginRoleTab === 'client' 
                        ? 'bg-violet-600 text-white shadow shadow-violet-500/25 font-bold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Medical Shop
                  </button>
                  <button
                    type="button"
                    onClick={() => { setLoginRoleTab('admin'); setLoginEmail('admin@gayatri.com'); setLoginError(''); }}
                    className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      loginRoleTab === 'admin' 
                        ? 'bg-violet-600 text-white shadow shadow-violet-500/25 font-bold' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Distributor Admin
                  </button>
                </div>
              )}

              <form onSubmit={handleLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs text-slate-400 font-medium">
                    {loginRoleTab === 'admin' ? 'Username / Email' : 'Email or WhatsApp Contact'}
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 w-4.5 h-4.5 text-slate-500 stroke-[1.8]" />
                    <input
                      type="text"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full h-11 pl-10 pr-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all text-sm font-sans"
                      placeholder={loginRoleTab === 'admin' ? 'admin@gayatri.com' : 'e.g. shop1@gayatri.com'}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <label className="block text-xs text-slate-400 font-medium font-sans">
                      Password
                    </label>
                    <a 
                      href="#" 
                      onClick={(e) => {
                        e.preventDefault();
                        setLoginError('Password resets require direct B2B admin validation. Please call support desk.');
                      }} 
                      className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors"
                    >
                      Forgot?
                    </a>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 w-4.5 h-4.5 text-slate-500 stroke-[1.8]" />
                    <input
                      type="password"
                      required
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full h-11 pl-10 pr-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/10 transition-all text-sm"
                      placeholder="••••••••"
                    />
                  </div>
                </div>

                {loginError && (
                  <div className="text-xs text-rose-400 font-medium flex items-start gap-1.5 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl animate-fade-in">
                    <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5 stroke-[2]" />
                    <span>{loginError}</span>
                  </div>
                )}

                <div className="flex items-center gap-2 pt-1">
                  <input
                    type="checkbox"
                    id="remember"
                    defaultChecked
                    className="w-4 h-4 text-violet-600 border-slate-800 rounded focus:ring-violet-500 accent-violet-600 cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-xs text-slate-400 select-none cursor-pointer">
                    Keep me signed in for 7 days
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full h-11 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl shadow-glow transition-all text-sm flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed active:scale-[0.98]"
                >
                  {loginLoading ? (
                    <>
                      <Loader2 className="w-4.5 h-4.5 animate-spin" />
                      Authenticating...
                    </>
                  ) : (
                    'Access Dashboard'
                  )}
                </button>
              </form>

              {/* Clickable Quick Credentials Helper Widget */}
              <div className="pt-4 border-t border-slate-800 space-y-2.5">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">B2B Autocomplete Assistant</span>
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setLoginRoleTab('admin');
                      setLoginEmail('admin@gayatri.com');
                      setLoginPassword('password123');
                      showToast('Admin fields populated. Click Continue/Access Dashboard.', 'success');
                    }}
                    className="bg-violet-500/10 hover:bg-violet-500/25 text-violet-400 border border-violet-500/20 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-[10px]"
                  >
                    👑 Pre-fill Admin
                  </button>
                  {SHOW_PHASE_2 && (
                    <button
                      type="button"
                      onClick={() => {
                        setLoginRoleTab('client');
                        setLoginEmail('shop1@gayatri.com');
                        setLoginPassword('password123');
                        showToast('Partner fields populated. Click Continue.', 'success');
                      }}
                      className="bg-emerald-500/10 hover:bg-emerald-500/25 text-emerald-400 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg font-bold transition-all cursor-pointer text-[10px]"
                    >
                      🛒 Pre-fill Shop Partner
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Server Online Status Footer Indicator */}
            <div className="text-center mt-6 flex flex-col items-center gap-3">
              <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-900 border border-slate-800/80 px-3 py-1.5 rounded-full font-mono">
                <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse shadow-glow' : 'bg-rose-500 animate-pulse'}`} />
                <span>Distributor Endpoint: {apiOnline ? 'ONLINE' : 'OFFLINE'}</span>
              </div>
              <div className="text-[10px] text-slate-600 space-x-2">
                <span>© Gayatri Pharma</span>
                <span>•</span>
                <a href="#" className="hover:text-slate-400 transition-colors">Support Desk</a>
              </div>
            </div>

          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-800 font-sans selection:bg-violet-500/10">
      
      {/* Dynamic Floating Toast Notifications */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl border shadow-2xl flex items-center gap-3 animate-slide-in max-w-sm ${
          toast.type === 'error' 
            ? 'bg-rose-50 border-rose-200 text-rose-700 shadow-rose-100' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-700 shadow-emerald-100'
        }`}>
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-rose-500 flex-shrink-0 stroke-[2]" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==================== ROLE: ADMIN SIDEBAR ==================== */}
      {authRole === 'admin' ? (
        <aside className="hidden md:flex w-64 bg-slate-950 flex-col justify-between flex-shrink-0 z-10 border-r border-slate-900 shadow-2xl select-none">
          <div>
            <div className="p-6 border-b border-slate-900 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[22px] font-black text-white tracking-tighter">gayatri</span>
                <span className="text-[22px] font-light text-violet-400 tracking-tighter">pharma</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-glow animate-pulse" />
              </div>
              <span className="text-[9px] text-violet-500 font-black uppercase tracking-widest pl-0.5">
                Distributor Console
              </span>
            </div>

            <nav className="p-4 space-y-1.5">
              {renderAdminNav()}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-900 bg-slate-950">
            <div className="flex items-center gap-3 mb-4 bg-slate-900/50 p-3 rounded-xl border border-slate-900">
              <div className="w-9 h-9 rounded-lg bg-violet-600 flex items-center justify-center text-white font-extrabold text-sm shadow-glow select-none">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-white block truncate">{adminUser?.name || 'Admin Officer'}</span>
                <span className="text-[9px] text-slate-500 block truncate font-mono">{adminUser?.email || 'admin@gayatri.com'}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/5 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Log Out Session
            </button>
          </div>
        </aside>
      ) : (
        /* ==================== ROLE: CLIENT SIDEBAR ==================== */
        <aside className="hidden md:flex w-64 bg-slate-950 flex-col justify-between flex-shrink-0 z-10 border-r border-slate-900 shadow-2xl select-none">
          <div>
            <div className="p-6 border-b border-slate-900 flex flex-col gap-1.5">
              <div className="flex items-center gap-1.5">
                <span className="text-[22px] font-black text-white tracking-tighter">gayatri</span>
                <span className="text-[22px] font-light text-violet-400 tracking-tighter">pharma</span>
              </div>
              <span className="text-[9px] text-emerald-400 font-black uppercase tracking-widest pl-0.5">
                Retail Partner
              </span>
            </div>

            <nav className="p-4 space-y-1.5">
              {renderClientNav()}
            </nav>
          </div>

          <div className="p-4 border-t border-slate-900 bg-slate-950 space-y-3">
            <div className="p-3.5 bg-slate-900 border border-slate-800 rounded-xl">
              <span className="text-[9px] text-slate-400 uppercase font-bold tracking-wider block mb-1">Accounts Outstanding</span>
              <span className="text-base font-black text-rose-400 font-mono">
                ₹{clientOutstanding ? clientOutstanding.total_outstanding_balance.toFixed(2) : '0.00'}
              </span>
            </div>
            
            <div className="flex items-center gap-3 bg-slate-900/50 p-2.5 rounded-xl border border-slate-900">
              <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-extrabold text-xs select-none">
                {clientUser?.shop_name?.charAt(0) || 'M'}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-bold text-white block truncate">{clientUser?.shop_name || 'Medical Shop'}</span>
                <span className="text-[9px] text-slate-500 block truncate font-mono">+{clientUser?.whatsapp_number}</span>
              </div>
            </div>
            
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2.5 border border-slate-800 hover:border-rose-500/30 hover:bg-rose-500/5 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer active:scale-[0.98]"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Mobile Drawer Overlay and Navigation menu */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 md:hidden flex">
          <div 
            onClick={() => setMobileMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity duration-300"
          />
          <aside className="relative w-64 max-w-[80vw] bg-slate-950 flex flex-col justify-between shadow-2xl h-full z-50 animate-fade-in border-r border-slate-900">
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-200 border border-slate-800 bg-slate-900 shadow-sm cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            
            {authRole === 'admin' ? (
              <>
                <div>
                  <div className="p-6 border-b border-slate-900 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[20px] font-black text-white tracking-tighter">gayatri</span>
                      <span className="text-[20px] font-light text-violet-400 tracking-tighter">pharma</span>
                    </div>
                    <span className="text-[8px] text-violet-500 font-extrabold uppercase tracking-widest block">
                      Distributor Console
                    </span>
                  </div>

                  <nav className="p-4 space-y-1.5">
                    {renderAdminNav()}
                  </nav>
                </div>

                <div className="p-4 border-t border-slate-900 bg-slate-950">
                  <div className="flex items-center gap-3 mb-3 p-2 bg-slate-900 rounded-xl border border-slate-800">
                    <div className="w-8 h-8 rounded-lg bg-violet-600 flex items-center justify-center text-white font-bold text-xs">
                      {adminUser?.name?.charAt(0) || 'A'}
                    </div>
                    <div className="overflow-hidden">
                      <span className="text-xs font-bold text-white block truncate">{adminUser?.name || 'Administrator'}</span>
                    </div>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-slate-800 hover:bg-rose-500/5 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <>
                <div>
                  <div className="p-6 border-b border-slate-900 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[20px] font-black text-white tracking-tighter">gayatri</span>
                      <span className="text-[20px] font-light text-violet-400 tracking-tighter">pharma</span>
                    </div>
                    <span className="text-[8px] text-emerald-400 font-extrabold uppercase tracking-widest block">
                      Partner Portal
                    </span>
                  </div>

                  <nav className="p-4 space-y-1.5">
                    {renderClientNav()}
                  </nav>
                </div>

                <div className="p-4 border-t border-slate-900 bg-slate-950 space-y-3">
                  <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl">
                    <span className="text-[8px] text-slate-400 uppercase font-bold tracking-wider block">Credit Balance</span>
                    <span className="text-sm font-black text-rose-400 font-mono">
                      ₹{clientOutstanding ? clientOutstanding.total_outstanding_balance.toFixed(2) : '0.00'}
                    </span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center justify-center gap-2 py-2 border border-slate-800 hover:bg-rose-500/5 text-slate-400 hover:text-rose-400 rounded-xl text-xs font-bold transition-all cursor-pointer"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Sign Out
                  </button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto bg-slate-50 relative">
        
        {/* Soft background glow blobs */}
        <div className="absolute top-[10%] right-[10%] w-[35vw] h-[35vw] rounded-full bg-violet-600/5 blur-[90px] pointer-events-none z-0" />
        
        <header className="h-16 border-b border-slate-200/80 bg-white/70 backdrop-blur-md px-6 md:px-8 flex items-center justify-between sticky top-0 z-30 select-none">
          <div className="flex items-center gap-2 md:gap-4">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="p-2 -ml-2 text-slate-500 hover:text-slate-800 md:hidden rounded-lg hover:bg-slate-100 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-sm md:text-base font-bold text-slate-950 capitalize truncate max-w-[140px] sm:max-w-none tracking-tight">
              {authRole === 'admin' 
                ? (activeTab === 'dashboard' ? 'Automation Engine Control Room' : activeTab === 'ledger' ? 'Accounts Ledger Sheet' : activeTab)
                : (clientActiveTab === 'catalog' ? 'B2B Medicine Catalog' : clientActiveTab === 'cart' ? 'B2B Invoice Shopping Cart' : clientActiveTab)}
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 border border-slate-200 text-[10px] font-bold text-slate-600">
              <span className={`w-1.5 h-1.5 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500'}`} />
              API Server: {apiOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-[11px] text-slate-500 font-medium">
            {authRole === 'client' && (
              <div 
                onClick={() => setClientActiveTab('cart')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-50 border border-violet-100 hover:bg-violet-100 text-violet-600 text-[10px] font-bold uppercase tracking-wide cursor-pointer transition-all active:scale-95"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Cart (₹{cartDetails.grandTotal.toFixed(2)})</span>
              </div>
            )}
            <span className="hidden sm:inline font-mono">Server Clock: {new Date().toLocaleTimeString()}</span>
            <button 
              onClick={() => { checkApiHealth(); fetchProducts(); fetchOrders(); if (authRole === 'admin') { fetchCustomers(); fetchAnalytics(); fetchAdminSettings(); } }}
              className="p-1.5 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg text-slate-500 hover:text-slate-800 transition-all cursor-pointer shadow-2xs hover:border-slate-300"
              title="Sync Database Now"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* View switching content container */}
        <div className="p-6 md:p-8 max-w-7xl w-full mx-auto space-y-6 relative z-10">

          {/* ========================================================== */}
          {/* ======================= ROLE: ADMIN ======================= */}
          {/* ========================================================== */}

          {/* TAB: DASHBOARD */}
          {authRole === 'admin' && activeTab === 'dashboard' && (
            <div className="space-y-6 animate-fade-in">
              {/* Stat Cards Grid */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${SHOW_PHASE_2 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'}`}>
                
                <div className="bg-white border border-slate-200/80 rounded-xl p-6 relative overflow-hidden group hover:border-violet-500/40 shadow-sm hover:shadow-premium transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Total Registered Shops</span>
                    <div className="w-9 h-9 bg-emerald-50 text-emerald-600 rounded-lg flex items-center justify-center">
                      <Users className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{customers.length}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2.5 font-medium">
                    <span className="text-emerald-500 font-bold">● Active</span>
                    <span>Medical Retailing Clients</span>
                  </div>
                </div>

                <div className="bg-white border border-slate-200/80 rounded-xl p-6 relative overflow-hidden group hover:border-violet-500/40 shadow-sm hover:shadow-premium transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-bl-full pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Medicines Catalog</span>
                    <div className="w-9 h-9 bg-violet-50 text-violet-600 rounded-lg flex items-center justify-center">
                      <Package className="w-4.5 h-4.5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-900 tracking-tight">{products.length}</div>
                  <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-2.5 font-medium">
                    <span className="text-violet-500 font-bold">● Cataloged</span>
                    <span>Active wholesaling drugs</span>
                  </div>
                </div>

                {SHOW_PHASE_2 && (
                  <>
                    <div className="bg-white border border-slate-200/80 rounded-xl p-6 relative overflow-hidden group hover:border-violet-500/40 shadow-sm hover:shadow-premium transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pending Orders</span>
                        <div className="w-9 h-9 bg-amber-50 text-amber-600 rounded-lg flex items-center justify-center">
                          <Receipt className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div className="text-3xl font-extrabold text-amber-600 tracking-tight">
                        {orders.filter(o => o.status === 'PENDING').length}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2.5 font-medium">Awaiting distribution confirmation</p>
                    </div>

                    <div className="bg-white border border-slate-200/80 rounded-xl p-6 relative overflow-hidden group hover:border-violet-500/40 shadow-sm hover:shadow-premium transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Aggregate Outstanding</span>
                        <div className="w-9 h-9 bg-rose-50 text-rose-600 rounded-lg flex items-center justify-center">
                          <CreditCard className="w-4.5 h-4.5" />
                        </div>
                      </div>
                      <div className="text-xl font-black text-rose-600 tracking-tight font-mono">
                        ₹{analytics.ledgerBalances?.reduce((sum, item) => sum + item.total_outstanding_balance, 0).toFixed(2) || '0.00'}
                      </div>
                      <p className="text-[10px] text-slate-400 mt-2.5 font-medium">Collective ledger B2B balances</p>
                    </div>
                  </>
                )}
              </div>

              {/* Graphical & Automation Dashboard Container */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                
                {/* Custom SVG Graphical Chart Column */}
                <div className="lg:col-span-7 space-y-6">
                  <B2BWeeklyTrendsChart />
                </div>

                {/* Automation Rules Information Control Center */}
                <div className="lg:col-span-5 bg-white border border-slate-200/80 rounded-xl p-6 space-y-5 shadow-sm">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-glow" />
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800">
                        Automation Engine status
                      </h3>
                    </div>
                    <span className="text-[9px] uppercase bg-violet-50 text-violet-600 font-bold px-2 py-0.5 rounded-md border border-violet-100">
                      Operational
                    </span>
                  </div>

                  <p className="text-slate-500 text-xs leading-relaxed">
                    Automated WhatsApp scheduler runs background sweeps daily at <strong>00:01 AM</strong> to check rules.
                  </p>

                  <div className="space-y-3">
                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                        <Cake className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Rule A: Birthdays greeting cards</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                          Sends automated WhatsApp birthday cards to medical shop owners with greetings.
                        </p>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-50 border border-slate-200/60 rounded-xl flex items-start gap-3">
                      <div className="w-7 h-7 rounded-lg bg-amber-50 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-800">Rule B: Drug license expiry alert</h4>
                        <p className="text-[10px] text-slate-500 mt-0.5 leading-relaxed">
                          Queries licenses expiring in exactly 15 days, launching WhatsApp warning notifications.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Log Console & Action Buttons */}
                  <div className="pt-2 space-y-3">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Live system audit console</span>
                    
                    <div className="bg-slate-950 rounded-xl p-3 border border-slate-900 font-mono text-[9px] text-slate-400 space-y-1.5 max-h-[110px] overflow-y-auto leading-relaxed shadow-inner">
                      {schedulerLogs.map((log, index) => (
                        <div key={index} className="truncate">
                          <span className="text-violet-400">⚡</span> {log}
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={triggerSchedulerMock}
                      disabled={schedulerRunning}
                      className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-100 disabled:text-slate-400 text-white font-bold rounded-xl text-xs transition-all shadow-glow flex items-center justify-center gap-1.5 cursor-pointer active:scale-[0.98]"
                    >
                      {schedulerRunning ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Running background sweeping diagnostics...
                        </>
                      ) : (
                        <>
                          <Activity className="w-3.5 h-3.5" />
                          Trigger Scheduler Sweep Manually
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: CUSTOMERS */}
          {authRole === 'admin' && activeTab === 'customers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="relative w-full sm:max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search shop name, number or GST..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 transition-all shadow-2xs"
                  />
                </div>
                
                <button
                  onClick={() => openCustomerModal('create')}
                  className="w-full sm:w-auto px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-glow active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Register B2B Medical Shop
                </button>
              </div>

              {/* Customers Table */}
              <div className="hidden md:block bg-white border border-slate-200/80 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50/50">
                        <th className="p-4.5 tracking-wider">Shop Name</th>
                        <th className="p-4.5 tracking-wider">WhatsApp Contact</th>
                        <th className="p-4.5 tracking-wider">Email</th>
                        <th className="p-4.5 tracking-wider">GSTIN</th>
                        <th className="p-4.5 tracking-wider">Drug License Expiry</th>
                        <th className="p-4.5 tracking-wider">Owner Birthday</th>
                        <th className="p-4.5 text-right tracking-wider">Quick Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {/* Pinned Gayatri Admin Alert Settings Row */}
                      <tr className="bg-violet-50/20 hover:bg-violet-50/40 transition-colors border-b border-violet-100/50">
                        <td className="p-4.5 font-bold text-slate-900 flex items-center gap-2">
                          <span className="text-sm select-none">👑</span>
                          <div>
                            <span className="block font-extrabold text-slate-900">Gayatri Admin</span>
                            <span className="text-[8px] uppercase tracking-wider text-violet-600 font-black">System alerts recipient</span>
                          </div>
                        </td>
                        <td className="p-4.5 font-mono text-slate-800 font-bold">
                          {isEditingAdminMobile ? (
                            <div className="flex items-center gap-1">
                              <span className="text-xs text-slate-400 font-bold">+</span>
                              <input
                                type="text"
                                value={adminMobileInput}
                                onChange={(e) => setAdminMobileInput(e.target.value)}
                                className="w-32 px-2.5 py-1 bg-white border border-slate-200 rounded-lg text-slate-800 text-xs font-mono font-bold focus:outline-none focus:border-violet-500 focus:ring-2 focus:ring-violet-500/10"
                                placeholder="919104332333"
                              />
                            </div>
                          ) : (
                            <span className="text-violet-600">+{adminMobile}</span>
                          )}
                        </td>
                        <td className="p-4.5 text-slate-400 italic text-[10px] font-bold">SYSTEM</td>
                        <td className="p-4.5"><span className="font-mono text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold">SYSTEM</span></td>
                        <td className="p-4.5 text-slate-400">-</td>
                        <td className="p-4.5 text-slate-400">-</td>
                        <td className="p-4.5 text-right">
                          {isEditingAdminMobile ? (
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={saveAdminSettings}
                                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer shadow-sm active:scale-[0.98]"
                              >
                                Save
                              </button>
                              <button
                                onClick={() => { setAdminMobileInput(adminMobile); setIsEditingAdminMobile(false); }}
                                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-600 font-bold rounded-lg text-[10px] transition-all cursor-pointer"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() => setIsEditingAdminMobile(true)}
                              className="px-3 py-1 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer shadow-glow active:scale-[0.98]"
                            >
                              Edit Mobile
                            </button>
                          )}
                        </td>
                      </tr>

                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-12 text-center text-slate-400">
                            No medical shops registered yet. Click "Register Medical Shop" to begin.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((cust) => {
                          const daysLeft = getDaysUntilExpiry(cust.drug_license_expiry);
                          let expiryBadge = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          let warningLabel = 'Valid';
                          
                          if (daysLeft < 0) {
                            expiryBadge = 'bg-rose-50 text-rose-700 border-rose-100';
                            warningLabel = 'Expired';
                          } else if (daysLeft <= 30) {
                            expiryBadge = 'bg-amber-50 text-amber-700 border-amber-100';
                            warningLabel = `Expires in ${daysLeft} days`;
                          } else {
                            warningLabel = `Expires in ${daysLeft} days`;
                          }

                          return (
                            <tr key={cust.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-4.5 font-bold text-slate-900">{cust.shop_name}</td>
                              <td className="p-4.5 font-mono text-slate-800">+{cust.whatsapp_number}</td>
                              <td className="p-4.5 text-slate-500 font-normal">{cust.email || 'N/A'}</td>
                              <td className="p-4.5">
                                <span className="font-mono text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold uppercase">
                                  {cust.gst_number}
                                </span>
                              </td>
                              <td className="p-4.5">
                                <div className="space-y-1.5">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${expiryBadge}`}>
                                    {formatDate(cust.drug_license_expiry)} ({warningLabel})
                                  </span>
                                  <button
                                    onClick={() => sendLicenseAlert(cust.id)}
                                    className="flex items-center gap-1 text-[9px] text-violet-600 hover:text-violet-700 font-bold bg-violet-50 hover:bg-violet-100 border border-violet-100 px-2 py-0.5 rounded-lg cursor-pointer transition-all active:scale-[0.98] select-none"
                                  >
                                    <Bell className="w-2.5 h-2.5" /> Expiry Warning
                                  </button>
                                </div>
                              </td>
                              <td className="p-4.5">
                                <div className="space-y-1.5">
                                  <span className="text-slate-600 block">{formatDate(cust.owner_birthday)}</span>
                                  <button
                                    onClick={() => sendBirthdayWish(cust.id)}
                                    className="flex items-center gap-1 text-[9px] text-emerald-600 hover:text-emerald-700 font-bold bg-emerald-50 hover:bg-emerald-100 border border-emerald-100 px-2 py-0.5 rounded-lg cursor-pointer transition-all active:scale-[0.98] select-none"
                                  >
                                    <Cake className="w-2.5 h-2.5" /> Birthday Wish
                                  </button>
                                </div>
                              </td>
                              <td className="p-4.5 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  <button
                                    onClick={() => openCustomerModal('edit', cust)}
                                    className="p-2 hover:bg-violet-50 text-violet-600 border border-slate-200/60 rounded-lg transition-all cursor-pointer bg-white hover:border-violet-200"
                                    title="Edit"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => setDeleteConfirm({ open: true, type: 'customer', id: cust.id, title: cust.shop_name })}
                                    className="p-2 hover:bg-rose-50 text-rose-600 border border-slate-200/60 rounded-lg transition-all cursor-pointer bg-white hover:border-rose-200"
                                    title="Delete"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Mobile Customers Card list */}
              <div className="block md:hidden space-y-4">
                {/* Pinned admin card */}
                <div className="bg-violet-50/20 border border-violet-100 rounded-xl p-4 shadow-sm space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-base">👑</span>
                      <div>
                        <span className="block font-bold text-slate-900 text-xs">Gayatri Admin</span>
                        <span className="text-[7px] uppercase tracking-wider text-violet-600 font-black">System Alert Destination</span>
                      </div>
                    </div>
                    <div>
                      {isEditingAdminMobile ? (
                        <div className="flex items-center gap-1">
                          <button
                            onClick={saveAdminSettings}
                            className="px-2 py-0.5 bg-emerald-600 text-white font-bold rounded text-[9px] cursor-pointer"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => { setAdminMobileInput(adminMobile); setIsEditingAdminMobile(false); }}
                            className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold rounded text-[9px] cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setIsEditingAdminMobile(true)}
                          className="px-2.5 py-0.5 bg-violet-600 text-white font-bold rounded text-[9px] cursor-pointer"
                        >
                          Edit
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[10px]">
                    <div>
                      <span className="text-slate-400 block">WhatsApp Mobile</span>
                      {isEditingAdminMobile ? (
                        <input
                          type="text"
                          value={adminMobileInput}
                          onChange={(e) => setAdminMobileInput(e.target.value)}
                          className="w-full px-1.5 py-0.5 bg-white border border-slate-200 rounded text-slate-800 text-[10px] font-mono"
                        />
                      ) : (
                        <span className="font-bold text-slate-800">+{adminMobile}</span>
                      )}
                    </div>
                    <div>
                      <span className="text-slate-400 block">System Role</span>
                      <span className="font-bold text-violet-600 italic">ADMINISTRATOR</span>
                    </div>
                  </div>
                </div>

                {filteredCustomers.map((cust) => {
                  const daysLeft = getDaysUntilExpiry(cust.drug_license_expiry);
                  let statusCardBg = 'bg-white border-slate-200';
                  let warningText = 'text-slate-800';
                  
                  if (daysLeft < 0) {
                    statusCardBg = 'bg-rose-50/30 border-rose-100';
                    warningText = 'text-rose-600 font-bold';
                  } else if (daysLeft <= 30) {
                    statusCardBg = 'bg-amber-50/30 border-amber-100';
                    warningText = 'text-amber-600 font-bold';
                  }

                  return (
                    <div key={cust.id} className={`border rounded-xl p-4 shadow-sm space-y-3 ${statusCardBg}`}>
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-900 text-xs">{cust.shop_name}</span>
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => openCustomerModal('edit', cust)}
                            className="p-1.5 hover:bg-slate-50 rounded-lg border border-slate-200 bg-white text-violet-600"
                          >
                            <Edit2 className="w-3 h-3" />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm({ open: true, type: 'customer', id: cust.id, title: cust.shop_name })}
                            className="p-1.5 hover:bg-rose-50 rounded-lg border border-slate-200 bg-white text-rose-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 text-[10px]">
                        <div>
                          <span className="text-slate-400 block uppercase tracking-wider text-[8px] font-bold">WhatsApp Contact</span>
                          <span className="font-mono text-slate-800 block">+{cust.whatsapp_number}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase tracking-wider text-[8px] font-bold">GSTIN</span>
                          <span className="font-mono uppercase text-slate-800 block">{cust.gst_number}</span>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase tracking-wider text-[8px] font-bold">Expiry Date</span>
                          <span className={`${warningText} block`}>{formatDate(cust.drug_license_expiry)}</span>
                          <button
                            onClick={() => sendLicenseAlert(cust.id)}
                            className="flex items-center gap-0.5 text-[8px] text-violet-600 font-bold mt-1"
                          >
                            <Bell className="w-2.5 h-2.5" /> Expiry Alert
                          </button>
                        </div>
                        <div>
                          <span className="text-slate-400 block uppercase tracking-wider text-[8px] font-bold">Owner Birthday</span>
                          <span className="block text-slate-800">{formatDate(cust.owner_birthday)}</span>
                          <button
                            onClick={() => sendBirthdayWish(cust.id)}
                            className="flex items-center gap-0.5 text-[8px] text-emerald-600 font-bold mt-1"
                          >
                            <Cake className="w-2.5 h-2.5" /> Bday Greeting
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: PRODUCTS */}
          {authRole === 'admin' && activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="relative w-full sm:max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search medicine name or composition..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 transition-all shadow-2xs"
                  />
                </div>
                
                <button
                  onClick={() => openProductModal('create')}
                  className="w-full sm:w-auto px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-glow active:scale-[0.98]"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Add New B2B Medicine
                </button>
              </div>

              {/* Products Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dataLoading ? (
                  <div className="col-span-full py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-violet-600" />
                    <span className="text-sm font-semibold">Loading product catalog...</span>
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
                    No medicines found. Please add a product to get started.
                  </div>
                ) : (
                  filteredProducts.map((prod) => {
                    const discountPercent = Math.round(((prod.mrp - prod.b2b_discount_price) / prod.mrp) * 100);
                    return (
                      <div key={prod.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:border-violet-500/40 shadow-sm hover:shadow-premium transition-all duration-300">
                        {/* Image preview */}
                        <div className="aspect-square bg-slate-50 border-b border-slate-100 relative overflow-hidden group">
                          
                          <ImageWithFallback
                            src={prod.image_url ? `${STATIC_BASE}${prod.image_url}` : ''}
                            alt={prod.medicine_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />

                          {/* Discount badge overlay */}
                          {SHOW_PHASE_2 && (
                            <div className="absolute top-3 left-3 px-2 py-1 rounded-md bg-violet-600 text-white text-[9px] font-extrabold flex items-center gap-0.5 shadow">
                              <Percent className="w-2.5 h-2.5 stroke-[3.5]" /> {discountPercent}% OFF
                            </div>
                          )}

                          {/* Scheme overlay */}
                          {SHOW_PHASE_2 && prod.scheme_id && (
                            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between shadow-sm">
                              <span className="text-[8px] font-black uppercase text-emerald-600 tracking-wider">Active B2B Offer</span>
                              <span className="text-[9px] font-bold text-slate-800">
                                {prod.scheme_id === 'buy-10-get-1' ? 'Buy 10 Get 1' : '15% Discount'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Product details */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-extrabold text-slate-900 text-sm uppercase leading-tight tracking-tight">
                                {prod.medicine_name}
                              </h4>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                                  prod.stock_status === 'IN_STOCK' 
                                    ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                                    : 'bg-rose-50 border border-rose-100 text-rose-700'
                                }`}>
                                  {prod.stock_status === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
                                </span>
                                {prod.stock_status === 'IN_STOCK' && (
                                  <span className={`text-[8px] font-bold font-mono ${
                                    prod.current_stock < 10 
                                      ? 'text-amber-600 animate-pulse' 
                                      : 'text-slate-400'
                                  }`}>
                                    {prod.current_stock < 10 ? '⚠️ Low: ' : ''}{prod.current_stock} units
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 italic font-medium block mt-1">
                              {prod.generic_name}
                            </span>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Retail MRP</span>
                              <span className="text-xs font-semibold text-slate-400 line-through font-mono">₹{prod.mrp.toFixed(2)}</span>
                            </div>
                            
                            <div className="text-right space-y-0.5">
                              <span className="text-[8px] font-bold text-violet-500 uppercase tracking-wider block">B2B Deal Price</span>
                              <span className="text-base font-black text-violet-600 font-mono">₹{prod.b2b_discount_price.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="pt-1 flex gap-2">
                            <button
                              onClick={() => openProductModal('edit', prod)}
                              className="flex-1 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 cursor-pointer shadow-2xs hover:border-slate-300"
                            >
                              <Edit2 className="w-3 h-3" />
                              Modify Details
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ open: true, type: 'product', id: prod.id, title: prod.medicine_name })}
                              className="px-2.5 py-2 bg-white hover:bg-rose-50 text-slate-400 hover:text-rose-600 border border-slate-200 hover:border-rose-200 rounded-lg transition-all cursor-pointer shadow-2xs"
                              title="Delete Product"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: LOW STOCK WARNINGS */}
          {authRole === 'admin' && activeTab === 'low-stock' && (
            <div className="space-y-6 animate-fade-in">
              {/* Header metrics card */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Low Stock Products</span>
                    <span className="text-3xl font-black text-rose-500 tracking-tight mt-1 block">
                      {products.filter(p => p.current_stock < 250).length}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-rose-50 flex items-center justify-center border border-rose-100 text-rose-500">
                    <AlertTriangle className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Critical Stock (&lt; 50 units)</span>
                    <span className="text-3xl font-black text-amber-500 tracking-tight mt-1 block">
                      {products.filter(p => p.current_stock < 50).length}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center border border-amber-100 text-amber-500">
                    <TrendingUp className="w-6 h-6 animate-pulse" />
                  </div>
                </div>

                <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Total Catalog Items</span>
                    <span className="text-3xl font-black text-slate-900 tracking-tight mt-1 block">
                      {products.length}
                    </span>
                  </div>
                  <div className="w-12 h-12 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-500">
                    <Package className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Table listing the low stock items */}
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3">
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm">Low Stock Inventory Warnings</h3>
                    <p className="text-[10px] text-slate-400 font-medium">Wholesale medicine items currently below 250 units.</p>
                  </div>
                  <span className="text-[10px] bg-rose-50 text-rose-700 px-2 py-0.5 rounded-full font-bold border border-rose-100 uppercase tracking-wider">
                    Attention Required
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50/50">
                        <th className="p-4 w-12 text-center">Image</th>
                        <th className="p-4">Medicine Details</th>
                        <th className="p-4">Generic Composition</th>
                        <th className="p-4">Remaining Units</th>
                        <th className="p-4">B2B Trade Pricing</th>
                        <th className="p-4 text-center">Status Level</th>
                        <th className="p-4 text-right">Inventory Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {products.filter(p => p.current_stock < 250).length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400">
                            🎉 All product inventories are healthy and above 250 units!
                          </td>
                        </tr>
                      ) : (
                        products
                          .filter(p => p.current_stock < 250)
                          .map(prod => {
                            const ratio = Math.max(0, Math.min(100, (prod.current_stock / 250) * 100));
                            const isCritical = prod.current_stock < 50;
                            return (
                              <tr key={prod.id} className="hover:bg-slate-50/50 transition-colors">
                                <td className="p-4 text-center">
                                  <div className="w-10 h-10 rounded-lg bg-slate-50 border border-slate-200 overflow-hidden flex items-center justify-center mx-auto">
                                    <ImageWithFallback
                                      src={prod.image_url ? `${STATIC_BASE}${prod.image_url}` : ''}
                                      alt={prod.medicine_name}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="font-extrabold text-slate-900 block uppercase">{prod.medicine_name}</span>
                                  <span className="text-[10px] text-slate-400 font-medium font-mono">ID: {prod.id.slice(0, 8)}</span>
                                </td>
                                <td className="p-4 text-slate-400 italic">
                                  {prod.generic_name}
                                </td>
                                <td className="p-4">
                                  <div className="flex flex-col gap-1 max-w-[140px]">
                                    <div className="flex justify-between text-[10px] font-bold font-mono">
                                      <span className={isCritical ? 'text-rose-500' : 'text-amber-500'}>
                                        {prod.current_stock} units
                                      </span>
                                      <span className="text-slate-400">/ 250 limit</span>
                                    </div>
                                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                      <div 
                                        className={`h-full rounded-full transition-all duration-500 ${
                                          isCritical ? 'bg-rose-500' : 'bg-amber-500'
                                        }`} 
                                        style={{ width: `${ratio}%` }}
                                      />
                                    </div>
                                  </div>
                                </td>
                                <td className="p-4">
                                  <span className="text-slate-900 font-bold block">₹{prod.b2b_discount_price}</span>
                                  <span className="text-[10px] text-slate-400 line-through">MRP: ₹{prod.mrp}</span>
                                </td>
                                <td className="p-4 text-center">
                                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase ${
                                    isCritical 
                                      ? 'bg-rose-50 border border-rose-100 text-rose-700 animate-pulse' 
                                      : 'bg-amber-50 border border-amber-100 text-amber-700'
                                  }`}>
                                    {isCritical ? '🚨 Critical' : '⚠️ Low Stock'}
                                  </span>
                                </td>
                                <td className="p-4 text-right">
                                  <button
                                    onClick={() => openProductModal('edit', prod)}
                                    className="px-3.5 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg text-[10px] font-extrabold transition-all cursor-pointer shadow-glow inline-flex items-center gap-1 active:scale-[0.98]"
                                  >
                                    <Edit2 className="w-3 h-3" />
                                    Restock Item
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: ORDERS QUEUE (ADMIN ORDER MANAGEMENT) */}
          {authRole === 'admin' && activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex bg-white p-1 rounded-xl border border-slate-200 max-w-md shadow-2xs">
                {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'DELIVERED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilterStatus(st)}
                    className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
                      orderFilterStatus === st 
                        ? 'bg-violet-600 text-white font-bold shadow-sm shadow-violet-500/25' 
                        : 'text-slate-400 hover:text-slate-700'
                    }`}
                  >
                    {st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50/50">
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Medical Shop Partner</th>
                        <th className="p-4">Total Value</th>
                        <th className="p-4">Submitted Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Items</th>
                        <th className="p-4 text-right">Process Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400">
                            No orders found in queue.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => {
                          let statColor = 'bg-slate-100 text-slate-600';
                          if (ord.status === 'PENDING') statColor = 'bg-amber-50 text-amber-700 border-amber-100';
                          if (ord.status === 'ACCEPTED') statColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          if (ord.status === 'REJECTED') statColor = 'bg-rose-50 text-rose-700 border-rose-100';
                          if (ord.status === 'DELIVERED') statColor = 'bg-indigo-50 text-indigo-700 border-indigo-100';

                          return (
                            <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-4 font-mono font-bold text-violet-600 uppercase">
                                #{ord.id.substring(0, 8)}
                              </td>
                              <td className="p-4">
                                <span className="block font-bold text-slate-900">{ord.customer.shop_name}</span>
                                <span className="block text-[9px] text-slate-400 font-mono">+{ord.customer.whatsapp_number}</span>
                              </td>
                              <td className="p-4 font-bold text-slate-900 font-mono">
                                ₹{ord.total_amount.toFixed(2)}
                              </td>
                              <td className="p-4 text-slate-400">
                                {formatDate(ord.created_at)}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase border ${statColor}`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => setSelectedOrderItems(ord.items)}
                                  className="text-violet-600 hover:text-violet-700 font-bold underline flex items-center gap-1 cursor-pointer"
                                >
                                  View ({ord.items.length} items)
                                </button>
                              </td>
                              <td className="p-4 text-right space-x-1.5">
                                {ord.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateOrderStatus(ord.id, 'ACCEPTED')}
                                      className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer shadow-sm"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleUpdateOrderStatus(ord.id, 'REJECTED')}
                                      className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer shadow-sm"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {ord.status === 'ACCEPTED' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord.id, 'DELIVERED')}
                                    className="px-2.5 py-1 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-lg text-[10px] transition-all cursor-pointer shadow-glow"
                                  >
                                    Mark Delivered
                                  </button>
                                )}
                                {ord.status === 'DELIVERED' && (
                                  <span className="text-slate-400 text-[10px] italic">Archived</span>
                                )}
                                {ord.status === 'REJECTED' && (
                                  <span className="text-rose-500 text-[10px] font-bold">Cancelled</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: LEDGER & ANALYTICS (ADMIN ONLY) */}
          {authRole === 'admin' && activeTab === 'ledger' && (
            <div className="space-y-8 animate-fade-in">
              {/* Analytics Panels */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Top Spending Customers */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-500 flex items-center gap-2 mb-4">
                    <Award className="w-4.5 h-4.5 text-violet-500" />
                    Top B2B Medical Shops (Sales Volume)
                  </h3>
                  <div className="space-y-2.5">
                    {analytics.topCustomers?.length === 0 ? (
                      <span className="text-slate-400 text-xs italic block p-3">Awaiting completed sales transactions.</span>
                    ) : (
                      analytics.topCustomers?.map((tc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                          <span className="text-xs font-bold text-slate-900">{tc.shop_name}</span>
                          <span className="text-xs font-black text-emerald-600 font-mono">₹{tc.total_spent.toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Fast Moving Inventory */}
                <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-violet-500 flex items-center gap-2 mb-4">
                    <TrendingUp className="w-4.5 h-4.5 text-violet-500" />
                    Fast-Moving Catalog Medicines
                  </h3>
                  <div className="space-y-2.5">
                    {analytics.fastMovingItems?.length === 0 ? (
                      <span className="text-slate-400 text-xs italic block p-3">Awaiting inventory checkout transactions.</span>
                    ) : (
                      analytics.fastMovingItems?.map((fm, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-lg">
                          <div>
                            <span className="text-xs font-bold text-slate-800 block">{fm.medicine_name}</span>
                            <span className="text-[10px] text-slate-400 block truncate max-w-[180px]">{fm.generic_name}</span>
                          </div>
                          <span className="text-xs font-bold text-slate-600 font-mono">{fm.total_units_sold} units sold</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Accounts Ledger sheet */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Outstanding Credit Ledger Register
                </h3>
                
                <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50/50">
                          <th className="p-4">Shop Name</th>
                          <th className="p-4">WhatsApp Contact</th>
                          <th className="p-4">Outstanding balance</th>
                          <th className="p-4">Last Payment Activity</th>
                          <th className="p-4 text-right">Payment Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                        {analytics.ledgerBalances?.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-slate-400">
                              No ledger entries available.
                            </td>
                          </tr>
                        ) : (
                          analytics.ledgerBalances?.map((ledg) => {
                            const isClear = ledg.total_outstanding_balance <= 0;
                            return (
                              <tr key={ledg.id} className="hover:bg-slate-50/60 transition-colors">
                                <td className="p-4 font-bold text-slate-900">{ledg.customer.shop_name}</td>
                                <td className="p-4 font-mono text-slate-700">+{ledg.customer.whatsapp_number}</td>
                                <td className="p-4 font-extrabold font-mono text-slate-900">
                                  ₹{ledg.total_outstanding_balance.toFixed(2)}
                                </td>
                                <td className="p-4 text-slate-500 font-mono">{formatDate(ledg.last_payment_date)}</td>
                                <td className="p-4 text-right">
                                  <span className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase border ${
                                    isClear ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                  }`}>
                                    {isClear ? 'Clear Ledger' : 'Outstanding Credit'}
                                  </span>
                                </td>
                              </tr>
                            );
                          })
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: BROADCAST CENTER (Phase 1) */}
          {authRole === 'admin' && activeTab === 'broadcast' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              
              {/* Broadcast setup block */}
              <div className="lg:col-span-7 space-y-6">
                
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                    Step 1: Select Broadcast Material
                  </h3>

                  <div className="space-y-4">
                    
                    {/* Custom searchable combobox dropdown */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2">
                        Select Target Product
                      </label>
                      
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() => setComboboxOpen(!comboboxOpen)}
                          className="w-full flex items-center justify-between px-4 py-3 bg-white border border-slate-200 hover:border-slate-300 rounded-xl text-slate-700 text-xs shadow-2xs transition-all focus:outline-none focus:ring-4 focus:ring-violet-500/5"
                        >
                          {selectedProduct ? (
                            <div className="flex items-center gap-2.5">
                              <div className="w-6 h-6 rounded border border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0">
                                <ImageWithFallback
                                  src={selectedProduct.image_url ? `${STATIC_BASE}${selectedProduct.image_url}` : ''}
                                  alt={selectedProduct.medicine_name}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                              <span className="font-bold text-slate-900">{selectedProduct.medicine_name}</span>
                              <span className="text-[10px] text-slate-400 italic">({selectedProduct.generic_name})</span>
                            </div>
                          ) : (
                            <span className="text-slate-400">Search and select a catalog medicine...</span>
                          )}
                          <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${comboboxOpen ? 'rotate-180' : ''}`} />
                        </button>

                        {comboboxOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-xl z-30 max-h-60 overflow-y-auto p-2 animate-scale-up space-y-1">
                            <div className="relative mb-2">
                              <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
                              <input
                                type="text"
                                placeholder="Type medicine name or formula composition..."
                                value={comboboxSearch}
                                onChange={(e) => setComboboxSearch(e.target.value)}
                                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:bg-white focus:border-violet-500"
                                onClick={(e) => e.stopPropagation()} // Prevent closing dropdown on input click
                              />
                            </div>
                            
                            {products.filter(p => 
                              p.medicine_name.toLowerCase().includes(comboboxSearch.toLowerCase()) ||
                              p.generic_name.toLowerCase().includes(comboboxSearch.toLowerCase())
                            ).length === 0 ? (
                              <div className="py-4 text-center text-xs text-slate-400 font-medium">No matching medicines found</div>
                            ) : (
                              products.filter(p => 
                                p.medicine_name.toLowerCase().includes(comboboxSearch.toLowerCase()) ||
                                p.generic_name.toLowerCase().includes(comboboxSearch.toLowerCase())
                              ).map(p => (
                                <button
                                  type="button"
                                  key={p.id}
                                  onClick={() => {
                                    setSelectedProduct(p);
                                    setComboboxOpen(false);
                                    setComboboxSearch('');
                                  }}
                                  className={`w-full flex items-center justify-between p-2 rounded-lg text-left transition-colors ${
                                    selectedProduct?.id === p.id 
                                      ? 'bg-violet-50 text-violet-600' 
                                      : 'hover:bg-slate-50 text-slate-700 font-medium'
                                  }`}
                                >
                                  <div className="flex items-center gap-2">
                                    <div className="w-8 h-8 rounded border border-slate-100 overflow-hidden bg-slate-50 flex-shrink-0">
                                      <ImageWithFallback
                                        src={p.image_url ? `${STATIC_BASE}${p.image_url}` : ''}
                                        alt={p.medicine_name}
                                        className="w-full h-full object-cover"
                                      />
                                    </div>
                                    <div>
                                      <span className="text-xs font-bold block">{p.medicine_name}</span>
                                      <span className="text-[9px] text-slate-400 block truncate max-w-[220px]">{p.generic_name}</span>
                                    </div>
                                  </div>
                                  <div className="text-right flex flex-col items-end">
                                    <span className="text-xs font-black block text-slate-800 font-mono">₹{p.b2b_discount_price}</span>
                                    <span className="text-[9px] text-slate-400 line-through font-mono">MRP: ₹{p.mrp}</span>
                                  </div>
                                </button>
                              ))
                            )}
                          </div>
                        )}
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-2">
                        WhatsApp template format
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTemplateType('PRODUCT_LAUNCH')}
                          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                            templateType === 'PRODUCT_LAUNCH'
                              ? 'bg-violet-50/40 border-violet-500 text-violet-600 font-semibold shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-900 block">Product Launch Flyer</span>
                          <span className="text-[10px] text-slate-400 leading-normal">
                            Dispatched medicine attachment and formatted text catalog details.
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTemplateType('CUSTOM')}
                          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                            templateType === 'CUSTOM'
                              ? 'bg-violet-50/40 border-violet-500 text-violet-600 font-semibold shadow-2xs'
                              : 'bg-white border-slate-200 hover:border-slate-300 text-slate-500'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-900 block">Custom Promotional text</span>
                          <span className="text-[10px] text-slate-400 leading-normal">
                            Sends medicine attachment accompanied by custom text typed below.
                          </span>
                        </button>
                      </div>
                    </div>

                    {templateType === 'CUSTOM' && (
                      <div className="animate-fade-in space-y-1.5">
                        <label className="block text-xs font-semibold text-slate-500">
                          Custom Message Text (Caption)
                        </label>
                        <textarea
                          rows="4"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 text-xs shadow-2xs font-medium"
                          placeholder="Compose custom B2B deals details, coupon code or custom payments requirements..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                    Step 2: Target Audience Summary
                  </h3>
                  
                  <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Target Recipients</span>
                      <span className="text-xl font-black text-violet-600 mt-1 block">{customers.length} B2B medical shop(s)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[9px] font-bold text-slate-400 uppercase block tracking-wider">Meta Rate limit</span>
                      <span className="text-xs font-bold text-slate-800">Tier 1: 1K / day</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <button
                      onClick={triggerBroadcast}
                      disabled={broadcastLoading || !selectedProduct}
                      className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-100 text-white font-bold rounded-xl transition-all shadow-glow flex items-center justify-center gap-2 cursor-pointer border border-violet-500/10 active:scale-[0.98]"
                    >
                      {broadcastLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Broadcasting Bulk Meta Messages...
                        </>
                      ) : (
                        <>
                          <Send className="w-4.5 h-4.5 stroke-[2.5]" />
                          Launch WhatsApp Broadcast Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Simulated High-Fidelity WhatsApp Device Column */}
              <div className="lg:col-span-5 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Live Broadcast Simulator
                  </h3>
                  
                  {selectedProduct ? (
                    <div className="space-y-4">
                      {/* Simulated WhatsApp Phone Device */}
                      <div className="border border-slate-200 rounded-3xl overflow-hidden shadow-xl max-w-[320px] mx-auto bg-[#efeae2] relative">
                        {/* Phone Status Bar Notch / Speaker */}
                        <div className="bg-slate-900 text-slate-400 text-[10px] px-4 py-1.5 flex justify-between items-center select-none">
                          <span className="font-semibold text-white">10:43 AM</span>
                          <div className="w-16 h-3 bg-slate-800 rounded-full mx-auto" />
                          <div className="flex items-center gap-1.5">
                            <span className="text-[8px]">5G</span>
                            <div className="w-5 h-2.5 border border-slate-400 rounded-sm p-0.5 flex">
                              <div className="h-full w-full bg-slate-400 rounded-2xs" />
                            </div>
                          </div>
                        </div>
                        
                        {/* WhatsApp App Bar */}
                        <div className="bg-[#075e54] text-white p-3 flex items-center justify-between shadow-md">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold select-none text-white/80">←</span>
                            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white border border-white/20 select-none font-bold">
                              G
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white block leading-tight">Gayatri B2B Broadcast</h4>
                              <span className="text-[8px] text-emerald-300 block">online</span>
                            </div>
                          </div>
                          <div className="flex gap-2.5 text-white/90 text-xs select-none">
                            <span>📹</span>
                            <span>📞</span>
                            <span>⋮</span>
                          </div>
                        </div>
                        
                        {/* WhatsApp Chat Wall Container */}
                        <div className="p-3 min-h-[350px] flex flex-col justify-end space-y-3">
                          {/* Info Notification Bubble */}
                          <div className="bg-amber-100 text-amber-800 text-[9px] px-3 py-1.5 rounded-lg max-w-[85%] mx-auto text-center shadow-2xs border border-amber-200/50 leading-snug">
                            🔒 Messages and calls are end-to-end encrypted. No one outside of this chat can read them.
                          </div>
                          
                          {/* WhatsApp Message Media Card Bubble */}
                          <div className="bg-white rounded-lg shadow-sm overflow-hidden max-w-[90%] border border-slate-200/50 relative">
                            {/* Product Image preview */}
                            <div className="aspect-square bg-slate-100 relative overflow-hidden flex items-center justify-center">
                              {selectedProduct.image_url ? (
                                <img
                                  src={`${STATIC_BASE}${selectedProduct.image_url}`}
                                  alt="Product preview"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex flex-col items-center justify-center text-slate-400 p-6">
                                  <MedicinePlaceholderSVG />
                                  <span className="text-[9px] font-bold uppercase tracking-widest mt-2">No Image Present</span>
                                </div>
                              )}
                            </div>
                            
                            {/* WhatsApp Bubble text caption */}
                            <div className="p-2.5 bg-white relative">
                              <p className="text-[11px] text-slate-800 leading-normal whitespace-pre-line font-medium pr-6">
                                {templateType === 'CUSTOM' 
                                  ? (customText || 'Type custom text on the left to preview...') 
                                  : `🔥 *Special B2B Deal*:\n\n*${selectedProduct.medicine_name.toUpperCase()}*\n_${selectedProduct.generic_name}_\n\n💰 B2B price: *₹${selectedProduct.b2b_discount_price.toFixed(2)}*\n❌ Retail MRP: ₹${selectedProduct.mrp.toFixed(2)}\n📈 Discount: *${Math.round(((selectedProduct.mrp - selectedProduct.b2b_discount_price) / selectedProduct.mrp) * 100)}% OFF*\n\nContact us to book your order!`}
                              </p>
                              
                              {/* Bubble timestamp & ticks */}
                              <div className="absolute bottom-1 right-2 flex items-center gap-0.5 text-[8px] text-slate-400 select-none">
                                <span>{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                <span className="text-emerald-500 font-bold">✓✓</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      <div className="text-center text-[10px] text-slate-400 italic">
                        * WhatsApp message will simulate a dynamic photo attachment with formatted deal caption.
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square bg-slate-50 border border-slate-200 rounded-xl flex flex-col items-center justify-center text-slate-400 text-center p-6 border-dashed">
                      <Eye className="w-10 h-10 stroke-[1.2] mb-2 text-slate-300 animate-pulse" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Awaiting Selection</span>
                      <p className="text-[10px] text-slate-400 mt-1.5 max-w-[180px] leading-relaxed">
                        Select a medicine product using the combobox dropdown search to preview the simulated B2B flyer flyer.
                      </p>
                    </div>
                  )}
                </div>

                {/* Broadcast reports */}
                {broadcastResult && (
                  <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-3.5 animate-scale-up shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-violet-600 flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" /> Dispatch completion report
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Successful Alerts</span>
                        <span className="text-emerald-600 text-lg font-mono font-black mt-1 block">{broadcastResult.summary.successCount}</span>
                      </div>
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <span className="text-slate-400 block text-[9px] uppercase tracking-wider">Failed Alerts</span>
                        <span className="text-rose-600 text-lg font-mono font-black mt-1 block">{broadcastResult.summary.failureCount}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
            </div>
          )}


          {/* ========================================================== */}
          {/* ======================= ROLE: CLIENT ====================== */}
          {/* ========================================================== */}

          {/* TAB: B2B CLIENT LIVE CATALOG */}
          {authRole === 'client' && clientActiveTab === 'catalog' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs">
                <div className="relative w-full sm:max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
                    <Search className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search medicine catalog composition..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-800 text-xs focus:outline-none focus:bg-white focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 transition-all shadow-2xs"
                  />
                </div>
              </div>

              {/* Products Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                  <div className="col-span-full py-16 text-center text-slate-500 bg-white border border-slate-200 rounded-xl">
                    No products listed in catalog yet.
                  </div>
                ) : (
                  filteredProducts.map((prod) => {
                    const discountPercent = Math.round(((prod.mrp - prod.b2b_discount_price) / prod.mrp) * 100);
                    const isOutOfStock = prod.stock_status === 'OUT_OF_STOCK' || prod.current_stock <= 0;
                    
                    return (
                      <div key={prod.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col hover:border-violet-500/40 shadow-sm hover:shadow-premium transition-all duration-300">
                        {/* Image preview */}
                        <div className="aspect-square bg-slate-50 border-b border-slate-100 relative overflow-hidden group">
                          
                          <ImageWithFallback
                            src={prod.image_url ? `${STATIC_BASE}${prod.image_url}` : ''}
                            alt={prod.medicine_name}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          
                          {/* Discount tag overlay */}
                          <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md bg-violet-600 text-white text-[9px] font-extrabold flex items-center gap-0.5 shadow">
                            <Percent className="w-2.5 h-2.5 stroke-[3.5]" /> {discountPercent}% OFF
                          </div>

                          {/* Scheme Banner */}
                          {prod.scheme_id && (
                            <div className="absolute bottom-3 left-3 right-3 bg-white/95 backdrop-blur px-2.5 py-1.5 rounded-lg border border-slate-200 flex items-center justify-between shadow-sm">
                              <span className="text-[8px] font-black uppercase text-emerald-600 tracking-wider">Active B2B Offer</span>
                              <span className="text-[9px] font-bold text-slate-800">
                                {prod.scheme_id === 'buy-10-get-1' ? 'Buy 10 Get 1 Free' : '15% Extra Discount'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Product details */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-extrabold text-slate-900 text-sm uppercase leading-tight tracking-tight">
                                {prod.medicine_name}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold uppercase ${
                                !isOutOfStock
                                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                                  : 'bg-rose-50 border border-rose-100 text-rose-700'
                              }`}>
                                {!isOutOfStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <span className="text-xs text-slate-400 italic font-medium block mt-1">
                              {prod.generic_name}
                            </span>
                          </div>

                          <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[8px] font-bold text-slate-400 uppercase tracking-wider block">Retail MRP</span>
                              <span className="text-xs font-semibold text-slate-400 line-through font-mono">₹{prod.mrp.toFixed(2)}</span>
                            </div>
                            
                            <div className="text-right space-y-0.5">
                              <span className="text-[8px] font-bold text-violet-500 uppercase tracking-wider block">B2B Deal Price</span>
                              <span className="text-base font-black text-violet-600 font-mono">₹{prod.b2b_discount_price.toFixed(2)}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => { cart.addItem(prod); showToast(`${prod.medicine_name} added to cart!`); }}
                            disabled={isOutOfStock}
                            className="w-full py-2.5 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-100 text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-glow border border-violet-500/10 active:scale-[0.98]"
                          >
                            <ShoppingCart className="w-3.5 h-3.5" />
                            {isOutOfStock ? 'Out of Stock' : 'Add to Order Cart'}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {/* TAB: B2B CLIENT SHOPPING CART */}
          {authRole === 'client' && clientActiveTab === 'cart' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fade-in">
              <div className="lg:col-span-8 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                    B2B Ordered Items List
                  </h3>

                  {cart.items.length === 0 ? (
                    <div className="py-16 text-center text-slate-400 text-xs italic font-medium">
                      Your B2B cart is empty. Browse the live catalog to add products.
                    </div>
                  ) : (
                    <div className="divide-y divide-slate-100">
                      {cartDetails.items.map((item) => (
                        <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-50 rounded-lg overflow-hidden border border-slate-200/80 flex-shrink-0">
                              <ImageWithFallback
                                src={item.product.image_url ? `${STATIC_BASE}${item.product.image_url}` : ''}
                                alt={item.product.medicine_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-slate-900 block uppercase">{item.product.medicine_name}</span>
                              <span className="text-[10px] text-slate-400 block">{item.product.generic_name}</span>
                              {item.schemeAppliedText && (
                                <span className="text-[8px] font-black text-emerald-600 block mt-1 uppercase">
                                  🏷️ {item.schemeAppliedText}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-slate-50 rounded-lg border border-slate-200 p-0.5 shadow-2xs">
                              <button
                                onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                                className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors"
                              >
                                -
                              </button>
                              <span className="px-3 text-xs font-mono font-bold text-slate-950">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                                className="px-2 py-1 text-slate-500 hover:text-slate-800 text-xs font-bold transition-colors"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-extrabold text-slate-900 block font-mono">
                                ₹{item.itemTotal.toFixed(2)}
                              </span>
                              <span className="text-[9px] text-slate-400 block font-mono">
                                ₹{item.pricePerUnit.toFixed(2)} each
                              </span>
                            </div>

                            <button
                              onClick={() => cart.removeItem(item.product.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 transition-colors border border-slate-200 hover:border-rose-100 rounded-lg cursor-pointer bg-white"
                              title="Remove item"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout details sidebar */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4 shadow-sm">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 border-b border-slate-100 pb-2">
                    B2B Invoice estimation
                  </h3>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Regular B2B Subtotal</span>
                      <span className="font-semibold text-slate-800 font-mono">₹{cartDetails.originalSubtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-500">Scheme Discount / Savings</span>
                      <span className="font-bold text-emerald-600 font-mono">-₹{cartDetails.savings.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-slate-100 pt-3 flex justify-between text-sm">
                      <span className="font-bold text-slate-900">Grand Total</span>
                      <span className="font-black text-violet-600 font-mono">₹{cartDetails.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100">
                    <button
                      onClick={handleCheckout}
                      disabled={cart.items.length === 0 || dataLoading}
                      className="w-full py-3 bg-violet-600 hover:bg-violet-500 disabled:bg-slate-100 disabled:text-slate-400 disabled:border-slate-100 text-white font-bold rounded-xl transition-all shadow-glow flex items-center justify-center gap-1.5 cursor-pointer text-xs uppercase tracking-wider border border-violet-500/10 active:scale-[0.98]"
                    >
                      {dataLoading ? (
                        <>
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                          Submitting invoice...
                        </>
                      ) : (
                        <>
                          <Check className="w-4.5 h-4.5 stroke-[2.5]" />
                          Submit B2B Order
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-amber-50 border border-amber-100 rounded-xl text-[10px] text-amber-800 leading-relaxed shadow-2xs font-medium">
                  ⚠️ <strong>Notice:</strong> Submitted B2B invoices undergo check validations by the distribution dispatcher. Following validation, the accounts ledger balance updates and a WhatsApp PDF bill is transmitted automatically.
                </div>
              </div>
            </div>
          )}

          {/* TAB: B2B CLIENT MY ORDERS */}
          {authRole === 'client' && clientActiveTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase bg-slate-50/50">
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4">Placement Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Line Items</th>
                        <th className="p-4 text-right">Invoice Document</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No orders placed yet.
                          </td>
                        </tr>
                      ) : (
                        orders.map((ord) => {
                          let statColor = 'bg-slate-100 text-slate-600';
                          if (ord.status === 'PENDING') statColor = 'bg-amber-50 text-amber-700 border-amber-100';
                          if (ord.status === 'ACCEPTED') statColor = 'bg-emerald-50 text-emerald-700 border-emerald-100';
                          if (ord.status === 'REJECTED') statColor = 'bg-rose-50 text-rose-700 border-rose-100';
                          if (ord.status === 'DELIVERED') statColor = 'bg-indigo-50 text-indigo-700 border-indigo-100';

                          return (
                            <tr key={ord.id} className="hover:bg-slate-50/60 transition-colors">
                              <td className="p-4 font-mono font-bold text-violet-600 uppercase">
                                #{ord.id.substring(0, 8)}
                              </td>
                              <td className="p-4 font-extrabold text-slate-900 font-mono">
                                ₹{ord.total_amount.toFixed(2)}
                              </td>
                              <td className="p-4 text-slate-400 font-mono">
                                {formatDate(ord.created_at)}
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[8px] font-bold uppercase border ${statColor}`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => setSelectedOrderItems(ord.items)}
                                  className="text-violet-600 hover:text-violet-700 font-bold underline flex items-center gap-1 cursor-pointer"
                                >
                                  View Details ({ord.items.length} items)
                                </button>
                              </td>
                              <td className="p-4 text-right">
                                {ord.status === 'ACCEPTED' || ord.status === 'DELIVERED' ? (
                                  <a
                                    href={`${STATIC_BASE}/processed/invoice_${ord.id}.pdf`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-700 font-bold rounded-lg text-[10px] inline-flex items-center gap-1 cursor-pointer transition-all border border-slate-200 shadow-2xs"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-violet-600" />
                                    Download Bill (PDF)
                                  </a>
                                ) : (
                                  <span className="text-slate-400 text-[10px] italic">Awaiting Acceptance</span>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB: B2B CLIENT CREDIT LEDGER */}
          {authRole === 'client' && clientActiveTab === 'ledger' && (
            <div className="space-y-6 animate-fade-in max-w-2xl mx-auto">
              <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-violet-600" />
                    Accounts Credit Ledger Register
                  </h3>
                  <p className="text-slate-400 text-xs mt-1">
                    Your outstanding credit invoice balance and ledger limits for B2B billing.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Outstanding credit Balance</span>
                    <span className="text-2xl font-black text-rose-600 font-mono mt-1 block">
                      ₹{clientOutstanding ? clientOutstanding.total_outstanding_balance.toFixed(2) : '0.00'}
                    </span>
                  </div>

                  <div className="p-5 bg-slate-50 border border-slate-200 rounded-xl">
                    <span className="text-slate-400 block text-[9px] uppercase tracking-wider font-bold">Last Payment Activity</span>
                    <span className="text-sm font-bold text-slate-900 font-mono mt-2.5 block">
                      {clientOutstanding ? formatDate(clientOutstanding.last_payment_date) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="p-5 bg-white border border-slate-200 rounded-xl space-y-3 text-xs shadow-2xs font-medium">
                  <span className="font-extrabold text-slate-800 block border-b border-slate-100 pb-1.5">Bank Settlement Details:</span>
                  <p className="text-slate-500 leading-relaxed font-mono text-[11px] space-y-1">
                    Bank Name: INDUSIND BANK LTD<br />
                    Account Holder: GAYATRI PHARMA PVT LTD<br />
                    A/C Number: 1009876543210 (Current Account)<br />
                    IFSC Code: INDB0000123
                  </p>
                  <p className="text-[10px] text-violet-500 italic pt-1 border-t border-slate-100">
                    * After processing NEFT/RTGS bank transfer, dispatch details to our billing desk via WhatsApp to settle the ledger.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* ========================================================================= */}
      {/* ============================= MODAL DIALOGS ============================= */}
      {/* ========================================================================= */}

      {/* MODAL: CUSTOMER CREATE / EDIT */}
      {customerModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-2xl overflow-hidden relative animate-scale-up">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {customerModal.mode === 'create' ? 'Register B2B Medical Shop Partner' : 'Update B2B Partner Details'}
              </h3>
              <button 
                onClick={() => setCustomerModal({ open: false, mode: 'create', data: null })}
                className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveCustomer} className="p-6 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-500 mb-1.5 font-bold">Shop Name</label>
                <input
                  type="text"
                  required
                  value={customerForm.shop_name}
                  onChange={(e) => setCustomerForm({ ...customerForm, shop_name: e.target.value })}
                  placeholder="e.g. Dhanvantari Medicos"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 font-bold">WhatsApp Contact (with Country Code Prefix)</label>
                <input
                  type="text"
                  required
                  value={customerForm.whatsapp_number}
                  onChange={(e) => setCustomerForm({ ...customerForm, whatsapp_number: e.target.value })}
                  placeholder="e.g. 919876543210"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-mono shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 font-bold">Partner Login Email</label>
                <input
                  type="email"
                  required
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  placeholder="e.g. shop1@gayatri.com"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-mono shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 font-bold">GST Number</label>
                <input
                  type="text"
                  required
                  value={customerForm.gst_number}
                  onChange={(e) => setCustomerForm({ ...customerForm, gst_number: e.target.value })}
                  placeholder="e.g. 24AAAAA1111A1Z1"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-mono uppercase shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">Drug License Expiry</label>
                  <input
                    type="date"
                    required
                    value={customerForm.drug_license_expiry}
                    onChange={(e) => setCustomerForm({ ...customerForm, drug_license_expiry: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-mono shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">Owner Birthday</label>
                  <input
                    type="date"
                    required
                    value={customerForm.owner_birthday}
                    onChange={(e) => setCustomerForm({ ...customerForm, owner_birthday: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-mono shadow-2xs"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCustomerModal({ open: false, mode: 'create', data: null })}
                  className="px-4 py-2 border border-slate-200 bg-white text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all shadow-glow cursor-pointer border border-violet-500/10 active:scale-[0.98]"
                >
                  {customerModal.mode === 'create' ? 'Register Partner' : 'Save Updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRODUCT CREATE / EDIT */}
      {productModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl max-w-md w-full shadow-2xl overflow-hidden relative animate-scale-up">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                {productModal.mode === 'create' ? 'Add New B2B Medicine' : 'Update Wholesaling Medicine'}
              </h3>
              <button 
                onClick={() => setProductModal({ open: false, mode: 'create', data: null })}
                className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveProduct} className="p-6 space-y-4 text-xs font-medium">
              <div>
                <label className="block text-slate-500 mb-1.5 font-bold">Medicine Brand Name</label>
                <input
                  type="text"
                  required
                  value={productForm.medicine_name}
                  onChange={(e) => setProductForm({ ...productForm, medicine_name: e.target.value })}
                  placeholder="e.g. Paracetamol 650mg"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 uppercase shadow-2xs"
                />
              </div>

              <div>
                <label className="block text-slate-500 mb-1.5 font-bold">Generic composition Formula</label>
                <input
                  type="text"
                  required
                  value={productForm.generic_name}
                  onChange={(e) => setProductForm({ ...productForm, generic_name: e.target.value })}
                  placeholder="e.g. Paracetamol IP"
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 shadow-2xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">Retail MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                    placeholder="30.50"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-mono shadow-2xs"
                  />
                </div>

                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">B2B Deal Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.b2b_discount_price}
                    onChange={(e) => setProductForm({ ...productForm, b2b_discount_price: e.target.value })}
                    placeholder="18.00"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-mono shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">Current Stock status</label>
                  <select
                    value={productForm.stock_status}
                    onChange={(e) => setProductForm({ ...productForm, stock_status: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 shadow-2xs"
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">In-Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.current_stock}
                    onChange={(e) => setProductForm({ ...productForm, current_stock: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 font-mono shadow-2xs"
                  />
                </div>
              </div>

              {SHOW_PHASE_2 && (
                <div>
                  <label className="block text-slate-500 mb-1.5 font-bold">Link B2B Scheme (Optional)</label>
                  <select
                    value={productForm.scheme_id}
                    onChange={(e) => setProductForm({ ...productForm, scheme_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:border-violet-500 focus:ring-4 focus:ring-violet-500/5 shadow-2xs"
                  >
                    <option value="">No Active Scheme</option>
                    <option value="buy-10-get-1">Buy 10 Get 1 Free (BUY_X_GET_Y)</option>
                    <option value="festive-15">15% Extra Discount (PERCENTAGE)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-slate-500 mb-1.5 font-bold">
                  {productModal.mode === 'create' ? 'Upload Product Image' : 'Change Image (Optional)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required={productModal.mode === 'create'}
                  onChange={(e) => setProductImageFile(e.target.files[0])}
                  className="w-full text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-bold file:bg-violet-50 file:text-violet-600 hover:file:bg-violet-100 cursor-pointer shadow-2xs"
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModal({ open: false, mode: 'create', data: null })}
                  className="px-4 py-2 border border-slate-200 bg-white text-slate-600 hover:text-slate-900 rounded-xl transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold rounded-xl transition-all shadow-glow cursor-pointer border border-violet-500/10 active:scale-[0.98]"
                >
                  {productModal.mode === 'create' ? 'Process & Create Flyer' : 'Save updates'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW ORDER ITEMS DETAILS */}
      {selectedOrderItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden relative animate-scale-up">
            <div className="p-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-slate-900">
                Ordered Medicine Items details
              </h3>
              <button 
                onClick={() => setSelectedOrderItems(null)}
                className="p-1.5 hover:bg-slate-200/60 rounded-lg text-slate-500 hover:text-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-3.5 max-h-[380px] overflow-y-auto">
              {selectedOrderItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 border border-slate-200/80 rounded-xl gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-lg overflow-hidden border border-slate-200 flex-shrink-0">
                      <ImageWithFallback
                        src={item.product.image_url ? `${STATIC_BASE}${item.product.image_url}` : ''}
                        alt={item.product.medicine_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-slate-950 block uppercase">{item.product.medicine_name}</span>
                      <span className="text-[10px] text-slate-400 block">{item.product.generic_name}</span>
                      {item.applied_scheme && (
                        <span className="text-[8.5px] font-black text-violet-600 uppercase tracking-wide mt-1 block">
                          🏷️ {item.applied_scheme}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 block font-mono">
                      ₹{(item.price_at_purchase * item.quantity).toFixed(2)}
                    </span>
                    <span className="text-[9px] text-slate-400 block font-mono">
                      {item.quantity} unit(s) @ ₹{item.price_at_purchase.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-slate-200 flex justify-end bg-slate-50">
              <button
                onClick={() => setSelectedOrderItems(null)}
                className="px-4 py-2 bg-white hover:bg-slate-100 border border-slate-200 text-slate-700 font-semibold rounded-xl text-xs transition-all cursor-pointer shadow-2xs hover:border-slate-300 active:scale-[0.98]"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOM DELETE CONFIRMATION */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white border border-slate-200 rounded-xl max-w-sm w-full shadow-2xl overflow-hidden relative p-6 space-y-6 animate-scale-up">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 mb-4 shadow-2xs">
                <AlertTriangle className="h-6 w-6 stroke-[1.8]" />
              </div>
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-900">
                Confirm Database Deletion?
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed mt-2.5">
                Permanently delete <strong className="text-slate-800">"{deleteConfirm.title}"</strong> from active databases? Associated billing listings, catalog images, and data accounts will be disconnected.
              </p>
            </div>

            <div className="flex gap-3 text-xs">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ open: false, type: null, id: null, title: '' })}
                className="flex-1 py-2.5 border border-slate-200 hover:bg-slate-50 bg-white text-slate-500 hover:text-slate-800 rounded-xl transition-all cursor-pointer font-bold shadow-2xs"
              >
                Abort Action
              </button>
              <button
                type="button"
                onClick={async () => {
                  const targetId = deleteConfirm.id;
                  const targetType = deleteConfirm.type;
                  setDeleteConfirm({ open: false, type: null, id: null, title: '' });
                  if (targetType === 'product') {
                    await deleteProduct(targetId);
                  } else {
                    await deleteCustomer(targetId);
                  }
                }}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition-all cursor-pointer shadow-sm shadow-rose-500/10 active:scale-[0.98]"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

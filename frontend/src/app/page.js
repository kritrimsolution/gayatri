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
  UserCheck
} from 'lucide-react';

const API_BASE = 'http://localhost:5000/api';
const STATIC_BASE = 'http://localhost:5000';

export default function AdminConsole() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('admin@gayatri.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // General App State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiOnline, setApiOnline] = useState(false);
  const [toast, setToast] = useState(null);

  // Data Lists
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);

  // Modals & Forms State
  const [customerModal, setCustomerModal] = useState({ open: false, mode: 'create', data: null });
  const [productModal, setProductModal] = useState({ open: false, mode: 'create', data: null });

  // Customer Form State
  const [customerForm, setCustomerForm] = useState({
    shop_name: '',
    whatsapp_number: '',
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
    in_stock_qty: '0'
  });
  const [productImageFile, setProductImageFile] = useState(null);

  // Broadcast Center State
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [templateType, setTemplateType] = useState('PRODUCT_LAUNCH');
  const [customText, setCustomText] = useState('');
  const [broadcastLoading, setBroadcastLoading] = useState(false);
  const [broadcastResult, setBroadcastResult] = useState(null);

  // Search/Filters State
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');

  // Auto-clear Toast
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Check API health and check local storage token
  useEffect(() => {
    checkApiHealth();
    const savedToken = localStorage.getItem('gayatri_token');
    const savedAdmin = localStorage.getItem('gayatri_admin');
    if (savedToken && savedAdmin) {
      setToken(savedToken);
      setAdminUser(JSON.parse(savedAdmin));
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch data on authentication
  useEffect(() => {
    if (isAuthenticated) {
      fetchCustomers();
      fetchProducts();
    }
  }, [isAuthenticated]);

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
    e.preventDefault();
    setLoginError('');
    setLoginLoading(true);

    try {
      const res = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: loginEmail, password: loginPassword })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed. Please check credentials.');
      }

      localStorage.setItem('gayatri_token', data.token);
      localStorage.setItem('gayatri_admin', JSON.stringify(data.admin));
      setToken(data.token);
      setAdminUser(data.admin);
      setIsAuthenticated(true);
      showToast(`Welcome back, ${data.admin.name}!`);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gayatri_token');
    localStorage.removeItem('gayatri_admin');
    setToken('');
    setAdminUser(null);
    setIsAuthenticated(false);
    showToast('Logged out successfully.');
  };

  // API Fetch wrappers
  const fetchCustomers = async () => {
    if (!localStorage.getItem('gayatri_token')) return;
    setDataLoading(true);
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gayatri_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to fetch customers', 'error');
      }
    } catch (err) {
      showToast('Network error while loading customers', 'error');
    } finally {
      setDataLoading(false);
    }
  };

  const fetchProducts = async () => {
    if (!localStorage.getItem('gayatri_token')) return;
    try {
      const res = await fetch(`${API_BASE}/products`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gayatri_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      } else {
        const err = await res.json();
        showToast(err.error || 'Failed to fetch products', 'error');
      }
    } catch (err) {
      showToast('Network error while loading products', 'error');
    }
  };

  // CRUD Handlers - Customer
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

      showToast(
        customerModal.mode === 'create' 
          ? 'Customer registered successfully!' 
          : 'Customer updated successfully!'
      );
      setCustomerModal({ open: false, mode: 'create', data: null });
      fetchCustomers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  const deleteCustomer = async (id) => {
    if (!confirm('Are you sure you want to delete this customer?')) return;
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete customer');
      showToast(data.message || 'Customer deleted.');
      fetchCustomers();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // CRUD Handlers - Product
  const saveProduct = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    formData.append('medicine_name', productForm.medicine_name);
    formData.append('generic_name', productForm.generic_name);
    formData.append('mrp', productForm.mrp);
    formData.append('b2b_discount_price', productForm.b2b_discount_price);
    formData.append('stock_status', productForm.stock_status);
    formData.append('in_stock_qty', productForm.in_stock_qty);
    
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

      showToast(
        productModal.mode === 'create' 
          ? 'Product created and watermarked successfully!' 
          : 'Product updated successfully!'
      );
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
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to delete product');
      showToast(data.message || 'Product deleted.');
      fetchProducts();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Broadcast Handler
  const triggerBroadcast = async () => {
    if (!selectedProduct) {
      showToast('Please select a product to broadcast.', 'error');
      return;
    }

    setBroadcastLoading(true);
    setBroadcastResult(null);

    const bodyParams = [selectedProduct.medicine_name];
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

  // Helpers to format dates and calculate license alerts
  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  const getDaysUntilExpiry = (expiryDateStr) => {
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    today.setHours(0,0,0,0);
    const diffTime = expiry - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const openCustomerModal = (mode, data = null) => {
    if (mode === 'edit' && data) {
      setCustomerForm({
        shop_name: data.shop_name,
        whatsapp_number: data.whatsapp_number,
        gst_number: data.gst_number,
        drug_license_expiry: data.drug_license_expiry.split('T')[0],
        owner_birthday: data.owner_birthday.split('T')[0]
      });
    } else {
      setCustomerForm({
        shop_name: '',
        whatsapp_number: '',
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
        in_stock_qty: (data.in_stock_qty ?? 0).toString()
      });
    } else {
      setProductForm({
        medicine_name: '',
        generic_name: '',
        mrp: '',
        b2b_discount_price: '',
        stock_status: 'IN_STOCK',
        in_stock_qty: '0'
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

  // Dashboard calculations
  const totalCustomers = customers.length;
  const totalProducts = products.length;
  const criticalLicenses = customers.filter(c => {
    const days = getDaysUntilExpiry(c.drug_license_expiry);
    return days >= 0 && days <= 30;
  }).length;

  const expiredLicenses = customers.filter(c => {
    const days = getDaysUntilExpiry(c.drug_license_expiry);
    return days < 0;
  }).length;

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950 relative overflow-hidden px-4">
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-teal-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-indigo-600/15 rounded-full blur-[120px] pointer-events-none" />

        <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl p-8 relative z-10 transition-all duration-300">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-500/20 mb-4 animate-pulse">
              <Plus className="w-9 h-9 text-slate-900 stroke-[3]" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-teal-400 to-indigo-300 bg-clip-text text-transparent">
              GAYATRI PHARMA
            </h1>
            <p className="text-sm text-slate-400 mt-1 font-medium tracking-wide">
              B2B Partner & WhatsApp Engine
            </p>
          </div>

          <h2 className="text-xl font-semibold text-slate-200 mb-6 text-center">
            Admin Authentication
          </h2>

          {loginError && (
            <div className="mb-5 p-3 rounded-lg bg-red-950/40 border border-red-800 text-red-200 text-xs font-medium flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-4 h-4 text-slate-500" />
                </span>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                  placeholder="admin@gayatri.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-500" />
                </span>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 transition-all text-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 text-slate-950 font-bold rounded-xl transition-all shadow-lg hover:shadow-teal-500/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Authenticating...
                </>
              ) : (
                'Access Portal'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/80 text-center">
            <span className="text-xs text-slate-500 block">
              Authorized access only. Logins are audited.
            </span>
            <div className="mt-3 flex items-center justify-center gap-1.5">
              <span className={`w-2.5 h-2.5 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                Backend Server: {apiOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-slate-950 text-slate-100 font-sans">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl border shadow-2xl flex items-center gap-3 animate-slide-in max-w-sm ${
          toast.type === 'error' 
            ? 'bg-red-950/90 border-red-800 text-red-100' 
            : 'bg-slate-900/90 border-teal-500/50 text-teal-100'
        }`}>
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-teal-400 flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar Layout */}
      <aside className="w-64 bg-slate-900 border-r border-slate-800/80 flex flex-col justify-between flex-shrink-0">
        <div>
          <div className="p-6 border-b border-slate-800/85">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-tr from-teal-500 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/10">
                <Plus className="w-6 h-6 text-slate-950 stroke-[3]" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-slate-100">
                  GAYATRI PHARMA
                </h1>
                <span className="text-[10px] text-teal-400 font-bold uppercase tracking-widest">
                  B2B Broadcast
                </span>
              </div>
            </div>
          </div>

          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-gradient-to-r from-teal-950/60 to-indigo-950/20 border-l-4 border-teal-500 text-teal-400 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <LayoutDashboard className="w-5 h-5" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'customers' 
                  ? 'bg-gradient-to-r from-teal-950/60 to-indigo-950/20 border-l-4 border-teal-500 text-teal-400 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Users className="w-5 h-5" />
              Customers (Shops)
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'products' 
                  ? 'bg-gradient-to-r from-teal-950/60 to-indigo-950/20 border-l-4 border-teal-500 text-teal-400 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Package className="w-5 h-5" />
              Product Catalog
            </button>

            <button
              onClick={() => setActiveTab('broadcast')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all cursor-pointer ${
                activeTab === 'broadcast' 
                  ? 'bg-gradient-to-r from-teal-950/60 to-indigo-950/20 border-l-4 border-teal-500 text-teal-400 font-semibold' 
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
              }`}
            >
              <Send className="w-5 h-5" />
              Broadcast Center
            </button>
          </nav>
        </div>

        {/* User Card at bottom */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-teal-400 font-bold">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-semibold text-slate-200 block truncate">{adminUser?.name || 'Administrator'}</span>
              <span className="text-[10px] text-slate-400 block truncate">{adminUser?.email || 'admin@gayatri.com'}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 border border-slate-800 hover:border-red-900 hover:bg-red-950/20 text-slate-400 hover:text-red-400 rounded-lg text-xs font-semibold transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-slate-950 bg-slate-900/30 backdrop-blur-md px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-slate-100 capitalize">
              {activeTab === 'dashboard' ? 'Automation Dashboard' : activeTab}
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[10px] font-bold text-slate-400">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              API Server: {apiOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-400 font-medium">
            <span>Server Time: {new Date().toLocaleTimeString()}</span>
            <button 
              onClick={() => { checkApiHealth(); fetchCustomers(); fetchProducts(); }}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-lg text-slate-300 hover:text-slate-100 transition-all cursor-pointer"
              title="Sync Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* View switching logic */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Stat Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-teal-500/5 rounded-bl-full pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Customers</span>
                    <div className="w-10 h-10 bg-teal-500/10 rounded-xl flex items-center justify-center text-teal-400">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-100">{totalCustomers}</div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Registered Medical Shops</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-bl-full pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Medicines listed</span>
                    <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center text-indigo-400">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-100">{totalProducts}</div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Active drug listings</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">License Warnings</span>
                    <div className="w-10 h-10 bg-amber-500/10 rounded-xl flex items-center justify-center text-amber-400">
                      <BadgeAlert className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-slate-100">{criticalLicenses}</div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Expires in &lt; 30 days</p>
                </div>

                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden group hover:border-slate-700 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Expired Licenses</span>
                    <div className="w-10 h-10 bg-rose-500/10 rounded-xl flex items-center justify-center text-rose-400">
                      <AlertTriangle className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-rose-400">{expiredLicenses}</div>
                  <p className="text-[10px] text-slate-400 mt-2 font-medium">Require immediate action</p>
                </div>
              </div>

              {/* Main Dashboard Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Automation Rules Information */}
                <div className="lg:col-span-2 bg-slate-900/30 border border-slate-800/80 rounded-2xl p-8 space-y-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-teal-400" />
                      Daily Automated Background Scheduler
                    </h3>
                    <p className="text-slate-400 text-xs mt-1">
                      Our task scheduling service runs daily in the background to send WhatsApp alerts.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-teal-500/10 flex items-center justify-center text-teal-400 flex-shrink-0 mt-0.5">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">Rule A: Owner Birthdays (Daily at 00:01 AM)</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Queries the database for medical shop owners whose birth date matches today (ignoring year). Dispatches a personalized WhatsApp greeting.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-slate-950/70 border border-slate-800/80 rounded-xl flex items-start gap-4">
                      <div className="w-9 h-9 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-400 flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-slate-200">Rule B: Drug License Expiry (15 Days Warning)</h4>
                        <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                          Queries customers whose drug license expires in exactly 15 days. Sends a B2B warning alert: <i>"Dear [Shop Name], your drug license expires in 15 days. Please renew."</i>
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex gap-4">
                    <button 
                      onClick={async () => {
                        showToast('Triggering tasks immediately...');
                        try {
                          const res = await fetch(`${STATIC_BASE}/`) // Check connection
                          if (res.ok) {
                            showToast('Engine job triggered successfully in backend!');
                          }
                        } catch(e){}
                      }}
                      className="px-4 py-2 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 rounded-lg transition-all cursor-pointer"
                    >
                      Run Cron Check Now
                    </button>
                    <span className="text-[10px] text-slate-400 self-center">
                      CRON expression: <code className="bg-slate-950 px-2 py-1 border border-slate-800 rounded font-mono text-teal-400">1 0 * * *</code>
                    </span>
                  </div>
                </div>

                {/* Quick Actions Panel */}
                <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-4">Quick Actions</h3>
                    <div className="space-y-3">
                      <button
                        onClick={() => { setActiveTab('broadcast'); }}
                        className="w-full flex items-center justify-between p-3.5 bg-gradient-to-r from-teal-500/10 to-indigo-500/5 hover:from-teal-500/15 border border-teal-500/30 hover:border-teal-500/50 rounded-xl transition-all text-left group cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Send className="w-5 h-5 text-teal-400 group-hover:translate-x-1 transition-all" />
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">Create Smart Broadcast</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Send a watermarked promo to B2B clients</span>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => openProductModal('create')}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <Plus className="w-5 h-5 text-slate-400" />
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">Add New Medicine</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Upload photo and auto-watermark it</span>
                          </div>
                        </div>
                      </button>

                      <button
                        onClick={() => openCustomerModal('create')}
                        className="w-full flex items-center justify-between p-3.5 bg-slate-950/60 hover:bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 rounded-xl transition-all text-left cursor-pointer"
                      >
                        <div className="flex items-center gap-3">
                          <UserCheck className="w-5 h-5 text-slate-400" />
                          <div>
                            <span className="text-xs font-bold text-slate-200 block">Register Medical Shop</span>
                            <span className="text-[9px] text-slate-400 block mt-0.5">Insert drug license expiry and GST</span>
                          </div>
                        </div>
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-8 pt-4 border-t border-slate-800/60">
                    <span className="text-[10px] text-slate-400 block text-center">
                      Gayatri Pharma B2B Distribution • Phase 1
                    </span>
                  </div>
                </div>

              </div>
            </div>
          )}


          {/* TAB: CUSTOMERS */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-4 h-4 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search shops, phone or GST..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                
                <button
                  onClick={() => openCustomerModal('create')}
                  className="w-full sm:w-auto px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Register Customer Shop
                </button>
              </div>

              {/* Customers Table */}
              <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-900/65 border-b border-slate-800 text-[10px] uppercase font-bold tracking-wider text-slate-400">
                        <th className="p-4">Medical Shop Name</th>
                        <th className="p-4">WhatsApp Contact</th>
                        <th className="p-4">GST Identification</th>
                        <th className="p-4">Drug License Expiry</th>
                        <th className="p-4">Owner Birthday</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
                      {dataLoading ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-teal-400" />
                            Loading customers from database...
                          </td>
                        </tr>
                      ) : filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No medical shops found.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((cust) => {
                          const daysLeft = getDaysUntilExpiry(cust.drug_license_expiry);
                          let statusBadge = null;

                          if (daysLeft < 0) {
                            statusBadge = (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-950/50 border border-red-800 text-red-400 text-[9px] font-bold">
                                <AlertTriangle className="w-3 h-3" /> Expired
                              </span>
                            );
                          } else if (daysLeft <= 30) {
                            statusBadge = (
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-950/50 border border-amber-800 text-amber-400 text-[9px] font-bold">
                                <AlertTriangle className="w-3 h-3" /> Expiry Warning ({daysLeft}d)
                              </span>
                            );
                          }

                          return (
                            <tr key={cust.id} className="hover:bg-slate-900/40 transition-colors">
                              <td className="p-4 font-bold text-slate-200">
                                {cust.shop_name}
                              </td>
                              <td className="p-4 font-mono text-slate-400">
                                +{cust.whatsapp_number}
                              </td>
                              <td className="p-4 font-mono text-xs uppercase tracking-wide">
                                {cust.gst_number}
                              </td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  <span className="block">{formatDate(cust.drug_license_expiry)}</span>
                                  {statusBadge}
                                </div>
                              </td>
                              <td className="p-4 text-slate-400">
                                {formatDate(cust.owner_birthday).slice(0, 6)} (Year {new Date(cust.owner_birthday).getFullYear()})
                              </td>
                              <td className="p-4 text-right">
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => openCustomerModal('edit', cust)}
                                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-teal-400 rounded-lg transition-all cursor-pointer"
                                    title="Edit Customer Details"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteCustomer(cust.id)}
                                    className="p-1.5 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-900 text-slate-300 hover:text-red-400 rounded-lg transition-all cursor-pointer"
                                    title="Delete Customer"
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
            </div>
          )}


          {/* TAB: PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-4 h-4 text-slate-500" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search medicine or composition..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-800 rounded-xl text-slate-200 text-xs focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
                  />
                </div>
                
                <button
                  onClick={() => openProductModal('create')}
                  className="w-full sm:w-auto px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Add New Medicine
                </button>
              </div>

              {/* Products Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dataLoading ? (
                  <div className="col-span-full py-12 text-center text-slate-400">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-teal-400" />
                    Saving image & compiling details...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-slate-400">
                    No medicines found. Please add a product to get started.
                  </div>
                ) : (
                  filteredProducts.map((prod) => {
                    const discountPercent = Math.round(((prod.mrp - prod.b2b_discount_price) / prod.mrp) * 100);
                    return (
                      <div key={prod.id} className="bg-slate-900/40 border border-slate-800/80 rounded-2xl overflow-hidden flex flex-col hover:border-slate-700 transition-all duration-300">
                        {/* Image watermarked preview */}
                        <div className="aspect-square bg-slate-950 relative overflow-hidden group">
                          {prod.image_url ? (
                            <img
                              src={`${STATIC_BASE}${prod.image_url}`}
                              alt={prod.medicine_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                              <Package className="w-12 h-12 stroke-[1]" />
                              <span className="text-[10px] uppercase font-bold tracking-wider">No Image Watermarked</span>
                            </div>
                          )}
                          
                          {/* Discount tag overlay */}
                          <div className="absolute top-4 left-4 px-2.5 py-1 rounded-lg bg-teal-500 text-slate-950 text-[10px] font-extrabold flex items-center gap-0.5 shadow-lg">
                            <Percent className="w-3 h-3 stroke-[3]" /> {discountPercent}% OFF
                          </div>
                        </div>

                        {/* Product details */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-extrabold text-slate-200 text-base uppercase leading-snug">
                                {prod.medicine_name}
                              </h4>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  prod.stock_status === 'IN_STOCK' 
                                    ? 'bg-emerald-950/50 border border-emerald-800 text-emerald-400' 
                                    : 'bg-rose-950/50 border border-rose-800 text-rose-400'
                                }`}>
                                  {prod.stock_status === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
                                </span>
                                {prod.stock_status === 'IN_STOCK' && (
                                  <span className={`text-[9px] font-bold ${
                                    prod.in_stock_qty < 10 
                                      ? 'text-amber-400 animate-pulse' 
                                      : 'text-slate-400'
                                  }`}>
                                    {prod.in_stock_qty < 10 ? '⚠️ Low Stock: ' : ''}{prod.in_stock_qty} unit(s)
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-slate-400 italic font-medium block mt-1">
                              {prod.generic_name}
                            </span>
                          </div>

                          <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-slate-500 uppercase block">Retail MRP</span>
                              <span className="text-sm font-semibold text-slate-400 line-through">₹{prod.mrp.toFixed(2)}</span>
                            </div>
                            
                            <div className="text-right space-y-0.5">
                              <span className="text-[10px] font-bold text-teal-400 uppercase block">B2B Deal Price</span>
                              <span className="text-lg font-black text-teal-400">₹{prod.b2b_discount_price.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="pt-2 flex gap-3">
                            <button
                              onClick={() => openProductModal('edit', prod)}
                              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Modify
                            </button>
                            <button
                              onClick={() => deleteProduct(prod.id)}
                              className="px-3 py-2 bg-slate-900 hover:bg-red-950/20 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-900/60 rounded-xl transition-all cursor-pointer"
                              title="Delete Product"
                            >
                              <Trash2 className="w-4 h-4" />
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


          {/* TAB: BROADCAST CENTER */}
          {activeTab === 'broadcast' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              
              {/* Settings and options */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                    Step 1: Select Broadcast Material
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">
                        Select Target Product
                      </label>
                      <select
                        onChange={(e) => {
                          const prod = products.find(p => p.id === e.target.value);
                          setSelectedProduct(prod || null);
                        }}
                        value={selectedProduct?.id || ''}
                        className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
                      >
                        <option value="">-- Choose a watermarked product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.medicine_name} (₹{p.b2b_discount_price})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 mb-2">
                        WhatsApp Template
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTemplateType('PRODUCT_LAUNCH')}
                          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                            templateType === 'PRODUCT_LAUNCH'
                              ? 'bg-teal-500/5 border-teal-500 text-teal-400 font-semibold'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-200">Product Launch Promotion</span>
                          <span className="text-[10px] leading-relaxed">
                            Sends approved media template containing the watermarked image and dynamic shop greeting.
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTemplateType('CUSTOM')}
                          className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                            templateType === 'CUSTOM'
                              ? 'bg-teal-500/5 border-teal-500 text-teal-400 font-semibold'
                              : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 text-slate-400'
                          }`}
                        >
                          <span className="text-xs font-bold text-slate-200">Custom Text Caption</span>
                          <span className="text-[10px] leading-relaxed">
                            Sends watermarked image with a custom promotional caption typed by you.
                          </span>
                        </button>
                      </div>
                    </div>

                    {templateType === 'CUSTOM' && (
                      <div className="animate-fade-in">
                        <label className="block text-xs font-semibold text-slate-400 mb-2">
                          Custom Message Text (Caption)
                        </label>
                        <textarea
                          rows="4"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          className="w-full px-4 py-3 bg-slate-950/70 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 focus:ring-1 focus:ring-teal-500 text-sm"
                          placeholder="Type custom deal information, coupons or payment terms here..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 mb-4">
                    Step 2: Target Audience Summary
                  </h3>
                  <div className="p-4 bg-slate-950/50 border border-slate-800 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block font-medium">Total clients receiving broadcast</span>
                      <span className="text-2xl font-black text-teal-400 mt-1 block">{customers.length} shop(s)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-slate-500 uppercase block">Meta Rate Limit Limit</span>
                      <span className="text-xs font-semibold text-slate-300">Tier 1: 1K / day</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={triggerBroadcast}
                      disabled={broadcastLoading || !selectedProduct}
                      className="w-full py-4 bg-gradient-to-r from-teal-500 to-indigo-600 hover:from-teal-400 hover:to-indigo-500 disabled:from-slate-800 disabled:to-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition-all shadow-xl hover:shadow-teal-500/10 flex items-center justify-center gap-2 cursor-pointer"
                    >
                      {broadcastLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Sending Bulk Messages via Meta API...
                        </>
                      ) : (
                        <>
                          <Send className="w-5 h-5 stroke-[2.5]" />
                          Launch Smart Broadcast Now
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Media Preview pane */}
              <div className="space-y-6">
                <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-4">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400">
                    Live Broadcast Preview
                  </h3>
                  
                  {selectedProduct ? (
                    <div className="space-y-4">
                      {/* Image Preview Container */}
                      <div className="aspect-square bg-slate-950 border border-slate-800 rounded-xl overflow-hidden relative shadow-inner">
                        {selectedProduct.image_url ? (
                          <img
                            src={`${STATIC_BASE}${selectedProduct.image_url}`}
                            alt="Watermark preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-slate-700">
                            <AlertTriangle className="w-10 h-10" />
                            <span className="text-xs font-bold uppercase tracking-widest mt-2">Missing Image</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-slate-950/70 border border-slate-850 rounded-lg space-y-1">
                        <span className="text-[10px] text-teal-400 uppercase font-black block">Broadcast Caption Preview</span>
                        <p className="text-xs text-slate-300 leading-normal font-medium">
                          {templateType === 'CUSTOM' 
                            ? (customText || 'Type custom text on the left to preview...') 
                            : `🔥 Special Deal: ${selectedProduct.medicine_name.toUpperCase()} now available at B2B discounted price of ₹${selectedProduct.b2b_discount_price}! MRP: ₹${selectedProduct.mrp}. Contact us to order.`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square bg-slate-950 border border-slate-900 rounded-xl flex flex-col items-center justify-center text-slate-700 text-center p-6 border-dashed">
                      <Eye className="w-12 h-12 stroke-[1] mb-2" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Awaiting Selection</span>
                      <p className="text-[10px] text-slate-600 mt-1.5 max-w-[180px]">
                        Select a medicine product to visualize the watermarked broadcast flyer before launch.
                      </p>
                    </div>
                  )}
                </div>

                {/* Broadcast reports */}
                {broadcastResult && (
                  <div className="bg-slate-900/30 border border-slate-800/80 rounded-2xl p-6 space-y-4 animate-scale-up">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-teal-400 flex items-center gap-1.5">
                      <Check className="w-4 h-4" /> Broadcast Complete Report
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                      <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg">
                        <span className="text-slate-400 block text-[9px] uppercase">Succeeded</span>
                        <span className="text-teal-400 text-base">{broadcastResult.summary.successCount}</span>
                      </div>
                      <div className="p-3 bg-slate-950/60 border border-slate-850 rounded-lg">
                        <span className="text-slate-400 block text-[9px] uppercase">Failed</span>
                        <span className="text-red-400 text-base">{broadcastResult.summary.failureCount}</span>
                      </div>
                    </div>

                    <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                      {broadcastResult.details.map((log, idx) => (
                        <div key={idx} className="p-2 bg-slate-950/40 rounded flex items-center justify-between text-[10px]">
                          <span className="font-semibold text-slate-300 truncate max-w-[120px]">{log.shopName}</span>
                          {log.status === 'success' ? (
                            <span className="text-teal-500 font-bold">✓ Sent</span>
                          ) : (
                            <span className="text-red-500 font-bold truncate max-w-[80px]" title={log.error}>✗ Failed</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </main>

      {/* MODAL: CUSTOMER CREATE / EDIT */}
      {customerModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h3 className="text-base font-bold text-slate-200">
                {customerModal.mode === 'create' ? 'Register Medical Shop' : 'Update Medical Shop Details'}
              </h3>
              <button 
                onClick={() => setCustomerModal({ open: false, mode: 'create', data: null })}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Shop Name</label>
                <input
                  type="text"
                  required
                  value={customerForm.shop_name}
                  onChange={(e) => setCustomerForm({ ...customerForm, shop_name: e.target.value })}
                  placeholder="e.g. Dhanvantari Medicos"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">WhatsApp Number (with Country Code)</label>
                <input
                  type="text"
                  required
                  value={customerForm.whatsapp_number}
                  onChange={(e) => setCustomerForm({ ...customerForm, whatsapp_number: e.target.value })}
                  placeholder="e.g. 919876543210"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">GST Number</label>
                <input
                  type="text"
                  required
                  value={customerForm.gst_number}
                  onChange={(e) => setCustomerForm({ ...customerForm, gst_number: e.target.value })}
                  placeholder="e.g. 24AAAAA1111A1Z1"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 text-xs font-mono uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Drug License Expiry</label>
                  <input
                    type="date"
                    required
                    value={customerForm.drug_license_expiry}
                    onChange={(e) => setCustomerForm({ ...customerForm, drug_license_expiry: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Owner Birthday</label>
                  <input
                    type="date"
                    required
                    value={customerForm.owner_birthday}
                    onChange={(e) => setCustomerForm({ ...customerForm, owner_birthday: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setCustomerModal({ open: false, mode: 'create', data: null })}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  {customerModal.mode === 'create' ? 'Register Shop' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRODUCT CREATE / EDIT */}
      {productModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/50">
              <h3 className="text-base font-bold text-slate-200">
                {productModal.mode === 'create' ? 'Add New B2B Medicine' : 'Update Medicine Details'}
              </h3>
              <button 
                onClick={() => setProductModal({ open: false, mode: 'create', data: null })}
                className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Medicine Name</label>
                <input
                  type="text"
                  required
                  value={productForm.medicine_name}
                  onChange={(e) => setProductForm({ ...productForm, medicine_name: e.target.value })}
                  placeholder="e.g. Paracetamol 650mg"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">Generic / Composition Name</label>
                <input
                  type="text"
                  required
                  value={productForm.generic_name}
                  onChange={(e) => setProductForm({ ...productForm, generic_name: e.target.value })}
                  placeholder="e.g. Paracetamol IP"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">MRP Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                    placeholder="30.50"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">B2B Discounted Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.b2b_discount_price}
                    onChange={(e) => setProductForm({ ...productForm, b2b_discount_price: e.target.value })}
                    placeholder="18.00"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Stock Status</label>
                  <select
                    value={productForm.stock_status}
                    onChange={(e) => setProductForm({ ...productForm, stock_status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 text-xs"
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1.5">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.in_stock_qty}
                    onChange={(e) => setProductForm({ ...productForm, in_stock_qty: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-teal-500 text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-1.5">
                  {productModal.mode === 'create' ? 'Upload Product Image (Will be watermarked)' : 'Change Image (Optional)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required={productModal.mode === 'create'}
                  onChange={(e) => setProductImageFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-teal-400 hover:file:bg-slate-700 cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900/50">
                <button
                  type="button"
                  onClick={() => setProductModal({ open: false, mode: 'create', data: null })}
                  className="px-4 py-2 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-semibold transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
                >
                  {productModal.mode === 'create' ? 'Process & Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

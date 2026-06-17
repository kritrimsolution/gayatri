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
  Award
} from 'lucide-react';
import { useCartStore } from './store/cart';

const API_BASE = 'http://localhost:5000/api';
const STATIC_BASE = 'http://localhost:5000';
const SHOW_PHASE_2 = false; // Set to true to unhide Phase 2 B2B Shop Portal & Order/Ledger Queue

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

  // Search/Filters State
  const [customerSearch, setCustomerSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [orderFilterStatus, setOrderFilterStatus] = useState('ALL');

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
      } else {
        fetchOrders(); // client orders
      }
    }
  }, [isAuthenticated, authRole]);

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
      const endpoint = loginRoleTab === 'admin' 
        ? `${API_BASE}/auth/login` 
        : `${API_BASE}/auth/client-login`;

      const payload = loginRoleTab === 'admin'
        ? { email: loginEmail, password: loginPassword }
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

      showToast(productModal.mode === 'create' ? 'Product created & watermarked successfully!' : 'Product updated successfully!');
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
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f8f9fc] relative overflow-hidden px-4 font-sans text-[#3c4257] select-none">
        
        {/* Subtle background grid lines */}
        <div className="absolute inset-0 grid grid-cols-5 pointer-events-none z-0">
          <div className="border-r border-slate-200/40 h-full w-full" />
          <div className="border-r border-slate-200/40 h-full w-full" />
          <div className="border-r border-slate-200/40 h-full w-full" />
          <div className="border-r border-slate-200/40 h-full w-full" />
          <div className="h-full w-full" />
        </div>

        {/* Left colorful diagonal accents (pulled back to left margin) */}
        <div className="absolute top-[58%] -left-12 w-[30vw] min-w-[280px] h-28 bg-[#00d4ff] transform -rotate-[12deg] rounded-none opacity-80 z-0 shadow-sm" />
        <div className="absolute top-[60%] -left-8 w-[28vw] min-w-[260px] h-28 bg-[#635bff] transform -rotate-[12deg] rounded-none opacity-95 z-0 shadow-md" />

        {/* Right colorful diagonal accents (pulled back to right margin - matching left side layout) */}
        <div className="absolute top-[26%] -right-12 w-[30vw] min-w-[280px] h-28 bg-[#00d4ff] transform -rotate-[12deg] rounded-none opacity-80 z-0 shadow-sm" />
        <div className="absolute top-[28%] -right-16 w-[28vw] min-w-[260px] h-28 bg-[#635bff] transform -rotate-[12deg] rounded-none opacity-95 z-0 shadow-md" />

        {/* Gayatri Wordmark Logo */}
        <div className="w-full max-w-[440px] mb-6 mt-16 relative z-10 flex items-center justify-start pl-1">
          <span className="text-[34px] font-black text-[#0a2540] tracking-tighter">gayatri</span>
          <span className="text-[34px] font-light text-[#635bff] tracking-tighter">pharma</span>
        </div>

        {/* Login Card */}
        <div className="w-full max-w-[440px] bg-white border border-[#e3e8ee] rounded-[4px] shadow-[0_50px_100px_rgba(50,50,93,0.05),0_15px_35px_rgba(50,50,93,0.1),0_5px_15px_rgba(0,0,0,0.05)] p-12 relative z-10">
          <h2 className="text-[24px] font-bold text-[#0a2540] tracking-tight mb-8">
            Sign in to your account
          </h2>

          {/* Role selector tabs */}
          {SHOW_PHASE_2 && (
            <div className="flex bg-[#f8f9fc] p-1 rounded-md mb-8 border border-[#e3e8ee]">
              <button
                type="button"
                onClick={() => { setLoginRoleTab('client'); setLoginEmail(''); setLoginError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-[4px] transition-all cursor-pointer ${
                  loginRoleTab === 'client' 
                    ? 'bg-white text-[#635bff] shadow-sm font-bold border border-slate-100' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Medical Shop Partner
              </button>
              <button
                type="button"
                onClick={() => { setLoginRoleTab('admin'); setLoginEmail('admin@gayatri.com'); setLoginError(''); }}
                className={`flex-1 py-2 text-xs font-semibold rounded-[4px] transition-all cursor-pointer ${
                  loginRoleTab === 'admin' 
                    ? 'bg-white text-[#635bff] shadow-sm font-bold border border-slate-100' 
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                Distributor Admin
              </button>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <label className="block text-[14px] text-[#4f566b] font-normal">
                {loginRoleTab === 'admin' ? 'Email' : 'Email or WhatsApp Number'}
              </label>
              <input
                type="text"
                required
                value={loginEmail}
                onChange={(e) => setLoginEmail(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-[#e3e8ee] rounded-[4px] text-[#3c4257] placeholder-[#a5aab5] focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/10 transition-all text-[15px]"
                placeholder={loginRoleTab === 'admin' ? 'admin@gayatri.com' : 'e.g. shop1@gayatri.com or 919876543210'}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="block text-[14px] text-[#4f566b] font-normal">
                  Password
                </label>
                <a 
                  href="#" 
                  onClick={(e) => {
                    e.preventDefault();
                    setLoginError('Please contact administration at support@gayatri.com to reset password.');
                  }} 
                  className="text-[14px] font-medium text-[#635bff] hover:text-[#0a2540] transition-colors"
                >
                  Forgot your password?
                </a>
              </div>
              <input
                type="password"
                required
                value={loginPassword}
                onChange={(e) => setLoginPassword(e.target.value)}
                className="w-full h-11 px-3 bg-white border border-[#e3e8ee] rounded-[4px] text-[#3c4257] placeholder-[#a5aab5] focus:outline-none focus:border-[#635bff] focus:ring-2 focus:ring-[#635bff]/10 transition-all text-[15px]"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <div className="text-[14px] text-[#df1b41] font-normal flex items-start gap-1.5 animate-fade-in">
                <AlertTriangle className="w-4 h-4 text-[#df1b41] flex-shrink-0 mt-0.5 stroke-[2.5]" />
                <span>{loginError}</span>
              </div>
            )}

            <div className="flex items-center gap-2 pt-1">
              <input
                type="checkbox"
                id="remember"
                defaultChecked
                className="w-4 h-4 text-[#635bff] border-slate-300 rounded-[3px] focus:ring-[#635bff] accent-[#635bff]"
              />
              <label htmlFor="remember" className="text-[14px] text-[#4f566b] font-normal select-none cursor-pointer">
                Stay signed in for a week
              </label>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full h-11 bg-[#635bff] hover:bg-[#0a2540] text-white font-semibold rounded-[4px] shadow-sm transition-all text-[15px] flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                'Continue'
              )}
            </button>
          </form>
        </div>

        {/* Footer & Registration Hints */}
        <div className="w-full max-w-[440px] text-center mt-6 z-10 space-y-1">
          <p className="text-[14px] text-[#4f566b]">
            Don't have an account?{' '}
            <a 
              href="#" 
              onClick={(e) => {
                e.preventDefault();
                setLoginError('Registration is closed. Please contact sales team to register your medical shop.');
              }}
              className="text-[#635bff] hover:text-[#0a2540] font-medium transition-colors"
            >
              Contact Sales
            </a>
          </p>
        </div>

        {/* Seed hint and Server status */}
        <div className="w-full max-w-[440px] text-center mt-auto pb-6 z-10 flex flex-col items-center gap-4">
          <div className="flex items-center gap-2 text-xs text-[#5469d4] bg-[#5469d4]/5 px-3 py-1.5 rounded-full border border-[#5469d4]/10 font-mono">
            <span className={`w-2.5 h-2.5 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
            <span>Distributor Status: {apiOnline ? 'Online' : 'Offline'}</span>
          </div>
          
          <div className="text-[11px] text-[#5469d4]/60 space-x-3">
            <span>© Gayatri Pharma</span>
            <span>•</span>
            <a href="#" className="hover:text-[#0a2540] transition-colors">Contact Support</a>
            <span>•</span>
            <a href="#" className="hover:text-[#0a2540] transition-colors">Privacy & Terms</a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex bg-[#f8f9fc] text-[#3c4257] font-sans selection:bg-[#635bff]/10">
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-md border shadow-lg flex items-center gap-3 animate-slide-in max-w-sm ${
          toast.type === 'error' 
            ? 'bg-[#fff0f2] border-[#ffccd3] text-[#df1b41]' 
            : 'bg-[#f0fcf4] border-[#cbf2d6] text-[#00875a]'
        }`}>
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-[#df1b41] flex-shrink-0 stroke-[2.5]" />
          ) : (
            <CheckCircle className="w-5 h-5 text-[#00875a] flex-shrink-0" />
          )}
          <span className="text-sm font-medium">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-slate-400 hover:text-slate-600 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* ==================== ROLE: ADMIN SIDEBAR ==================== */}
      {authRole === 'admin' ? (
        <aside className="w-64 bg-white border-r border-[#e3e8ee] flex flex-col justify-between flex-shrink-0 shadow-sm z-10">
          <div>
            <div className="p-6 border-b border-[#e3e8ee]">
              <div className="flex items-center gap-2">
                <span className="text-[20px] font-black text-[#0a2540] tracking-tighter">gayatri</span>
                <span className="text-[20px] font-light text-[#635bff] tracking-tighter">pharma</span>
              </div>
              <span className="text-[9px] text-[#635bff] font-extrabold uppercase tracking-wider block mt-0.5 pl-0.5">
                Distributor Console
              </span>
            </div>

            <nav className="p-4 space-y-1">
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'dashboard' 
                    ? 'bg-[#f8f9fc] border-l-4 border-[#635bff] text-[#635bff] font-semibold' 
                    : 'text-[#4f566b] hover:text-[#0a2540] hover:bg-[#f8f9fc]'
                }`}
              >
                <LayoutDashboard className="w-5 h-5" />
                Dashboard
              </button>

              <button
                onClick={() => setActiveTab('customers')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'customers' 
                    ? 'bg-[#f8f9fc] border-l-4 border-[#635bff] text-[#635bff] font-semibold' 
                    : 'text-[#4f566b] hover:text-[#0a2540] hover:bg-[#f8f9fc]'
                }`}
              >
                <Users className="w-5 h-5" />
                Customers (Shops)
              </button>

              <button
                onClick={() => setActiveTab('products')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'products' 
                    ? 'bg-[#f8f9fc] border-l-4 border-[#635bff] text-[#635bff] font-semibold' 
                    : 'text-[#4f566b] hover:text-[#0a2540] hover:bg-[#f8f9fc]'
                }`}
              >
                <Package className="w-5 h-5" />
                Product Catalog
              </button>

              {SHOW_PHASE_2 && (
                <>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      activeTab === 'orders' 
                        ? 'bg-[#f8f9fc] border-l-4 border-[#635bff] text-[#635bff] font-semibold' 
                        : 'text-[#4f566b] hover:text-[#0a2540] hover:bg-[#f8f9fc]'
                    }`}
                  >
                    <Receipt className="w-5 h-5" />
                    Orders Queue
                    {orders.filter(o => o.status === 'PENDING').length > 0 && (
                      <span className="ml-auto bg-[#635bff] text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {orders.filter(o => o.status === 'PENDING').length}
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => setActiveTab('ledger')}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                      activeTab === 'ledger' 
                        ? 'bg-[#f8f9fc] border-l-4 border-[#635bff] text-[#635bff] font-semibold' 
                        : 'text-[#4f566b] hover:text-[#0a2540] hover:bg-[#f8f9fc]'
                    }`}
                  >
                    <CreditCard className="w-5 h-5" />
                    Ledger Sheets
                  </button>
                </>
              )}

              <button
                onClick={() => setActiveTab('broadcast')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  activeTab === 'broadcast' 
                    ? 'bg-[#f8f9fc] border-l-4 border-[#635bff] text-[#635bff] font-semibold' 
                    : 'text-[#4f566b] hover:text-[#0a2540] hover:bg-[#f8f9fc]'
                }`}
              >
                <Send className="w-5 h-5" />
                Broadcast Center
              </button>
            </nav>
          </div>

          <div className="p-4 border-t border-[#e3e8ee] bg-[#f8f9fc]/50">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-9 h-9 rounded-full bg-[#635bff]/10 border border-[#635bff]/25 flex items-center justify-center text-[#635bff] font-bold">
                {adminUser?.name?.charAt(0) || 'A'}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-semibold text-[#0a2540] block truncate">{adminUser?.name || 'Administrator'}</span>
                <span className="text-[10px] text-[#4f566b] block truncate">{adminUser?.email || 'admin@gayatri.com'}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 border border-[#e3e8ee] hover:border-[#df1b41]/40 hover:bg-[#df1b41]/5 text-[#4f566b] hover:text-[#df1b41] rounded-md text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </aside>
      ) : (
        /* ==================== ROLE: CLIENT SIDEBAR ==================== */
        <aside className="w-64 bg-white border-r border-[#e3e8ee] flex flex-col justify-between flex-shrink-0 shadow-sm z-10">
          <div>
            <div className="p-6 border-b border-[#e3e8ee]">
              <div className="flex items-center gap-2">
                <span className="text-[20px] font-black text-[#0a2540] tracking-tighter">gayatri</span>
                <span className="text-[20px] font-light text-[#635bff] tracking-tighter">pharma</span>
              </div>
              <span className="text-[9px] text-[#635bff] font-extrabold uppercase tracking-wider block mt-0.5 pl-0.5">
                Partner Portal
              </span>
            </div>

            <nav className="p-4 space-y-1">
              <button
                onClick={() => setClientActiveTab('catalog')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  clientActiveTab === 'catalog' 
                    ? 'bg-[#f8f9fc] border-l-4 border-[#635bff] text-[#635bff] font-semibold' 
                    : 'text-[#4f566b] hover:text-[#0a2540] hover:bg-[#f8f9fc]'
                }`}
              >
                <Package className="w-5 h-5" />
                Live Catalog
              </button>

              <button
                onClick={() => setClientActiveTab('cart')}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  clientActiveTab === 'cart' 
                    ? 'bg-[#f8f9fc] border-l-4 border-[#635bff] text-[#635bff] font-semibold' 
                    : 'text-[#4f566b] hover:text-[#0a2540] hover:bg-[#f8f9fc]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingCart className="w-5 h-5" />
                  <span>My Cart</span>
                </div>
                {cartDetails.items.length > 0 && (
                  <span className="bg-[#635bff] text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full animate-bounce">
                    {cartDetails.items.length}
                  </span>
                )}
              </button>

              <button
                onClick={() => setClientActiveTab('orders')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  clientActiveTab === 'orders' 
                    ? 'bg-[#f8f9fc] border-l-4 border-[#635bff] text-[#635bff] font-semibold' 
                    : 'text-[#4f566b] hover:text-[#0a2540] hover:bg-[#f8f9fc]'
                }`}
              >
                <Receipt className="w-5 h-5" />
                My Orders
              </button>

              <button
                onClick={() => setClientActiveTab('ledger')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition-all cursor-pointer ${
                  clientActiveTab === 'ledger' 
                    ? 'bg-[#f8f9fc] border-l-4 border-[#635bff] text-[#635bff] font-semibold' 
                    : 'text-[#4f566b] hover:text-[#0a2540] hover:bg-[#f8f9fc]'
                }`}
              >
                <CreditCard className="w-5 h-5" />
                Credit Ledger
              </button>
            </nav>
          </div>

          <div className="p-4 border-t border-[#e3e8ee] bg-[#f8f9fc]/50">
            <div className="p-3 bg-white border border-[#e3e8ee] rounded-md mb-3 shadow-sm">
              <span className="text-[10px] text-[#635bff] uppercase font-black tracking-wider block">Credit Balance</span>
              <span className="text-sm font-black text-[#0a2540]">
                ₹{clientOutstanding ? clientOutstanding.total_outstanding_balance.toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-8 h-8 rounded-full bg-[#635bff]/10 border border-[#635bff]/25 flex items-center justify-center text-[#635bff] font-black">
                {clientUser?.shop_name?.charAt(0) || 'M'}
              </div>
              <div className="overflow-hidden">
                <span className="text-xs font-semibold text-[#0a2540] block truncate">{clientUser?.shop_name || 'Medical Shop'}</span>
                <span className="text-[9px] text-[#4f566b] block truncate font-mono">+{clientUser?.whatsapp_number}</span>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center gap-2 py-2 border border-[#e3e8ee] hover:border-[#df1b41]/40 hover:bg-[#df1b41]/5 text-[#4f566b] hover:text-[#df1b41] rounded-md text-xs font-semibold transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              Sign Out
            </button>
          </div>
        </aside>
      )}

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="h-16 border-b border-[#e3e8ee] bg-white px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-bold text-[#0a2540] capitalize">
              {authRole === 'admin' 
                ? (activeTab === 'dashboard' ? 'Automation Dashboard' : activeTab === 'ledger' ? 'Ledger sheets' : activeTab)
                : (clientActiveTab === 'catalog' ? 'Order Catalog' : clientActiveTab === 'cart' ? 'My shopping cart' : clientActiveTab)}
            </h2>
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#f8f9fc] border border-[#e3e8ee] text-[10px] font-bold text-[#4f566b]">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              API Server: {apiOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-[#4f566b] font-medium">
            {authRole === 'client' && (
              <div 
                onClick={() => setClientActiveTab('cart')}
                className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#635bff]/10 border border-[#635bff]/20 hover:bg-[#635bff]/20 text-[#635bff] text-[10px] font-extrabold uppercase tracking-wide cursor-pointer transition-all"
              >
                <ShoppingCart className="w-3.5 h-3.5" />
                <span>Cart (₹{cartDetails.grandTotal.toFixed(2)})</span>
              </div>
            )}
            <span>Server Time: {new Date().toLocaleTimeString()}</span>
            <button 
              onClick={() => { checkApiHealth(); fetchProducts(); fetchOrders(); if (authRole === 'admin') { fetchCustomers(); fetchAnalytics(); } }}
              className="p-1.5 bg-white hover:bg-[#f8f9fc] border border-[#e3e8ee] hover:border-[#d3d8de] rounded-md text-slate-600 hover:text-slate-800 transition-all cursor-pointer"
              title="Sync Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </header>

        {/* View switching logic */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* ========================================================== */}
          {/* ======================= ROLE: ADMIN ======================= */}
          {/* ========================================================== */}

          {/* TAB: DASHBOARD */}
          {authRole === 'admin' && activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              {/* Stat Cards Grid */}
              <div className={`grid grid-cols-1 md:grid-cols-2 gap-6 ${SHOW_PHASE_2 ? 'lg:grid-cols-4' : 'lg:grid-cols-2'}`}>
                <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-6 relative overflow-hidden group hover:border-[#635bff]/40 shadow-sm transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-bl-full pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-[#4f566b] uppercase tracking-wider">Total Customers</span>
                    <div className="w-10 h-10 bg-emerald-500/10 rounded-md flex items-center justify-center text-emerald-600">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[#0a2540]">{customers.length}</div>
                  <p className="text-[10px] text-[#4f566b] mt-2 font-medium">Registered Medical Shops</p>
                </div>

                <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-6 relative overflow-hidden group hover:border-[#635bff]/40 shadow-sm transition-all duration-300">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#635bff]/5 rounded-bl-full pointer-events-none" />
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-semibold text-[#4f566b] uppercase tracking-wider">Medicines catalog</span>
                    <div className="w-10 h-10 bg-[#635bff]/10 rounded-md flex items-center justify-center text-[#635bff]">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-[#0a2540]">{products.length}</div>
                  <p className="text-[10px] text-[#4f566b] mt-2 font-medium">Active drug listings</p>
                </div>

                {SHOW_PHASE_2 && (
                  <>
                    <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-6 relative overflow-hidden group hover:border-[#635bff]/40 shadow-sm transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-bl-full pointer-events-none" />
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-[#4f566b] uppercase tracking-wider">Pending Orders</span>
                        <div className="w-10 h-10 bg-amber-500/10 rounded-md flex items-center justify-center text-amber-600">
                          <Receipt className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-3xl font-extrabold text-amber-600">
                        {orders.filter(o => o.status === 'PENDING').length}
                      </div>
                      <p className="text-[10px] text-[#4f566b] mt-2 font-medium">Awaiting B2B processing</p>
                    </div>

                    <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-6 relative overflow-hidden group hover:border-[#635bff]/40 shadow-sm transition-all duration-300">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-bl-full pointer-events-none" />
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-[#4f566b] uppercase tracking-wider">Credit Outstanding</span>
                        <div className="w-10 h-10 bg-rose-500/10 rounded-md flex items-center justify-center text-rose-600">
                          <CreditCard className="w-5 h-5" />
                        </div>
                      </div>
                      <div className="text-xl font-black text-rose-600">
                        ₹{analytics.ledgerBalances?.reduce((sum, item) => sum + item.total_outstanding_balance, 0).toFixed(2) || '0.00'}
                      </div>
                      <p className="text-[10px] text-[#4f566b] mt-2 font-medium">Aggregated distributor credit</p>
                    </div>
                  </>
                )}
              </div>

              {/* Main Dashboard Panel */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Automation Rules Information */}
                <div className={`${SHOW_PHASE_2 ? 'lg:col-span-2' : 'lg:col-span-3'} bg-white border border-[#e3e8ee] rounded-[4px] p-8 space-y-6 shadow-sm`}>
                  <div>
                    <h3 className="text-lg font-bold text-[#0a2540] flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 text-[#635bff]" />
                      Daily Automated Background Scheduler
                    </h3>
                    <p className="text-[#4f566b] text-xs mt-1">
                      Task scheduling service running daily in the background to send WhatsApp alerts.
                    </p>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-[#f8f9fc] border border-[#e3e8ee] rounded-[4px] flex items-start gap-4">
                      <div className="w-9 h-9 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 flex-shrink-0 mt-0.5">
                        <Calendar className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#0a2540]">Rule A: Owner Birthdays (Daily at 00:01 AM)</h4>
                        <p className="text-xs text-[#4f566b] mt-1 leading-relaxed">
                          Queries database for owners whose birthday matches today. Dispatches a personalized WhatsApp greeting banner.
                        </p>
                      </div>
                    </div>

                    <div className="p-4 bg-[#f8f9fc] border border-[#e3e8ee] rounded-[4px] flex items-start gap-4">
                      <div className="w-9 h-9 rounded-md bg-amber-500/10 flex items-center justify-center text-amber-600 flex-shrink-0 mt-0.5">
                        <AlertTriangle className="w-5 h-5" />
                      </div>
                      <div>
                        <h4 className="text-sm font-semibold text-[#0a2540]">Rule B: Drug License Expiry (15 Days Warning)</h4>
                        <p className="text-xs text-[#4f566b] mt-1 leading-relaxed">
                          Queries customers whose drug license expires in exactly 15 days. Sends a B2B warning alert to renew before supply block.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* API Logs / Quick Status */}
                {SHOW_PHASE_2 && (
                  <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-6 flex flex-col justify-between shadow-sm">
                    <div className="space-y-4">
                      <h3 className="text-sm font-bold uppercase tracking-wider text-[#4f566b]">
                        B2B Portal Quick Actions
                      </h3>
                      
                      <div className="p-4 bg-[#f8f9fc] border border-[#e3e8ee] rounded-[4px] space-y-3">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#4f566b]">Live Orders Pending</span>
                          <span className="font-bold text-amber-600">{orders.filter(o => o.status === 'PENDING').length}</span>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#4f566b]">Total B2B Schemes</span>
                          <span className="font-bold text-emerald-600">2 active</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => setActiveTab('orders')}
                      className="w-full mt-6 py-3 bg-[#635bff] hover:bg-[#5951e5] text-white font-semibold rounded-[4px] text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                    >
                      Manage B2B Orders Queue <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: CUSTOMERS */}
          {authRole === 'admin' && activeTab === 'customers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-[#4f566b]" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search shop name, number or GST..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] text-xs focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] shadow-sm"
                  />
                </div>
                
                <button
                  onClick={() => openCustomerModal('create')}
                  className="w-full sm:w-auto px-4 py-2 bg-[#635bff] hover:bg-[#5951e5] text-white font-bold rounded-md transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Register Medical Shop
                </button>
              </div>

              {/* Customers Table */}
              <div className="bg-white border border-[#e3e8ee] rounded-[4px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#e3e8ee] text-[#4f566b] font-bold uppercase bg-[#f8f9fc]">
                        <th className="p-4">Shop Name</th>
                        <th className="p-4">WhatsApp Contact</th>
                        <th className="p-4">Email</th>
                        <th className="p-4 font-mono">GSTIN</th>
                        <th className="p-4">Drug License Expiry</th>
                        <th className="p-4">Owner Birthday</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3e8ee] font-medium text-[#3c4257]">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400">
                            No medical shops registered yet. Click "Register Medical Shop" to begin.
                          </td>
                        </tr>
                      ) : (
                        filteredCustomers.map((cust) => {
                          const daysLeft = getDaysUntilExpiry(cust.drug_license_expiry);
                          let statusColor = 'text-[#3c4257]';
                          let warningBg = '';
                          
                          if (daysLeft < 0) {
                            statusColor = 'text-[#df1b41] font-bold';
                            warningBg = 'bg-[#fff0f2]';
                          } else if (daysLeft <= 30) {
                            statusColor = 'text-[#b26b00] font-bold';
                            warningBg = 'bg-[#fff9e6]';
                          }

                          return (
                            <tr key={cust.id} className={`hover:bg-[#f8f9fc] transition-colors ${warningBg}`}>
                              <td className="p-4 font-bold text-[#0a2540]">{cust.shop_name}</td>
                              <td className="p-4 font-mono text-[#3c4257]">+{cust.whatsapp_number}</td>
                              <td className="p-4 text-[#4f566b]">{cust.email || 'N/A'}</td>
                              <td className="p-4 font-mono uppercase text-[#4f566b]">{cust.gst_number}</td>
                              <td className={`p-4 ${statusColor}`}>
                                {formatDate(cust.drug_license_expiry)}
                                {daysLeft < 0 && <span className="block text-[9px] uppercase font-bold text-[#df1b41] mt-0.5">Expired</span>}
                                {daysLeft >= 0 && daysLeft <= 30 && <span className="block text-[9px] uppercase font-bold text-[#b26b00] mt-0.5">Expires in {daysLeft} days</span>}
                              </td>
                              <td className="p-4 text-[#4f566b]">{formatDate(cust.owner_birthday)}</td>
                              <td className="p-4 text-right space-x-2">
                                <button
                                  onClick={() => openCustomerModal('edit', cust)}
                                  className="p-1.5 hover:bg-[#f8f9fc] rounded-md text-[#635bff] transition-all cursor-pointer inline-block border border-[#e3e8ee] bg-white shadow-sm"
                                  title="Edit"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => setDeleteConfirm({ open: true, type: 'customer', id: cust.id, title: cust.shop_name })}
                                  className="p-1.5 hover:bg-red-50 rounded-md text-red-600 transition-all cursor-pointer inline-block border border-red-100 bg-white shadow-sm"
                                  title="Delete"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
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

          {/* TAB: PRODUCTS */}
          {authRole === 'admin' && activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-[#4f566b]" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search medicine or composition..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] text-xs focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] shadow-sm"
                  />
                </div>
                
                <button
                  onClick={() => openProductModal('create')}
                  className="w-full sm:w-auto px-4 py-2 bg-[#635bff] hover:bg-[#5951e5] text-white font-bold rounded-md transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  Add New Medicine
                </button>
              </div>

              {/* Products Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {dataLoading ? (
                  <div className="col-span-full py-12 text-center text-[#4f566b]">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-3 text-[#635bff]" />
                    Saving image & compiling details...
                  </div>
                ) : filteredProducts.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-[#4f566b]">
                    No medicines found. Please add a product to get started.
                  </div>
                ) : (
                  filteredProducts.map((prod) => {
                    const discountPercent = Math.round(((prod.mrp - prod.b2b_discount_price) / prod.mrp) * 100);
                    return (
                      <div key={prod.id} className="bg-white border border-[#e3e8ee] rounded-md overflow-hidden flex flex-col hover:border-[#635bff]/40 shadow-sm transition-all duration-300">
                        {/* Image watermarked preview */}
                        <div className="aspect-square bg-[#f8f9fc] border-b border-[#e3e8ee] relative overflow-hidden group">
                          {prod.image_url ? (
                            <img
                              src={`${STATIC_BASE}${prod.image_url}`}
                              alt={prod.medicine_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#4f566b] gap-2">
                              <Package className="w-12 h-12 stroke-[1]" />
                              <span className="text-[10px] uppercase font-bold tracking-wider">No Image Watermarked</span>
                            </div>
                          )}
                          
                          {/* Discount tag overlay */}
                          {SHOW_PHASE_2 && (
                            <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-[#635bff] text-white text-[10px] font-extrabold flex items-center gap-0.5 shadow-sm">
                              <Percent className="w-3 h-3 stroke-[3]" /> {discountPercent}% OFF
                            </div>
                          )}

                          {/* Scheme Banner */}
                          {SHOW_PHASE_2 && prod.scheme_id && (
                            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-md border border-[#e3e8ee] flex items-center justify-between shadow-md">
                              <span className="text-[10px] font-black uppercase text-[#00875a] tracking-wider">Active B2B Scheme</span>
                              <span className="text-[10px] font-bold text-[#0a2540]">
                                {prod.scheme_id === 'buy-10-get-1' ? 'Buy 10 Get 1' : '15% Discount'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Product details */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-extrabold text-[#0a2540] text-base uppercase leading-snug">
                                {prod.medicine_name}
                              </h4>
                              <div className="flex flex-col items-end gap-1">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  prod.stock_status === 'IN_STOCK' 
                                    ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                                    : 'bg-rose-50 border border-rose-100 text-rose-700'
                                }`}>
                                  {prod.stock_status === 'IN_STOCK' ? 'In Stock' : 'Out of Stock'}
                                </span>
                                {prod.stock_status === 'IN_STOCK' && (
                                  <span className={`text-[9px] font-bold ${
                                    prod.current_stock < 10 
                                      ? 'text-amber-600 animate-pulse' 
                                      : 'text-[#4f566b]'
                                  }`}>
                                    {prod.current_stock < 10 ? '⚠️ Low Stock: ' : ''}{prod.current_stock} unit(s)
                                  </span>
                                )}
                              </div>
                            </div>
                            <span className="text-xs text-[#4f566b] italic font-medium block mt-1">
                              {prod.generic_name}
                            </span>
                          </div>

                          <div className="pt-3 border-t border-[#e3e8ee] flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-[#4f566b] uppercase block">Retail MRP</span>
                              <span className="text-sm font-semibold text-[#4f566b] line-through font-mono">₹{prod.mrp.toFixed(2)}</span>
                            </div>
                            
                            <div className="text-right space-y-0.5">
                              <span className="text-[10px] font-bold text-[#635bff] uppercase block">B2B Deal Price</span>
                              <span className="text-lg font-black text-[#635bff] font-mono">₹{prod.b2b_discount_price.toFixed(2)}</span>
                            </div>
                          </div>

                          <div className="pt-2 flex gap-3">
                            <button
                              onClick={() => openProductModal('edit', prod)}
                              className="flex-1 py-2 bg-white hover:bg-[#f8f9fc] text-[#3c4257] border-[#e3e8ee] hover:border-[#d3d8de] rounded-md text-xs font-semibold border transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                              Modify
                            </button>
                            <button
                              onClick={() => setDeleteConfirm({ open: true, type: 'product', id: prod.id, title: prod.medicine_name })}
                              className="px-3 py-2 bg-white hover:bg-red-50 text-[#4f566b] hover:text-red-600 border border-[#e3e8ee] hover:border-red-200 rounded-md transition-all cursor-pointer shadow-sm"
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

          {/* TAB: ORDERS QUEUE (ADMIN ORDER MANAGEMENT) */}
          {authRole === 'admin' && activeTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex bg-white p-1.5 rounded-md border border-[#e3e8ee] max-w-lg shadow-sm">
                {['ALL', 'PENDING', 'ACCEPTED', 'REJECTED', 'DELIVERED'].map((st) => (
                  <button
                    key={st}
                    onClick={() => setOrderFilterStatus(st)}
                    className={`flex-1 py-2 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                      orderFilterStatus === st 
                        ? 'bg-[#635bff] text-white font-bold shadow-sm' 
                        : 'text-[#4f566b] hover:text-[#0a2540]'
                    }`}
                  >
                    {st.charAt(0) + st.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              <div className="bg-white border border-[#e3e8ee] rounded-[4px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#e3e8ee] text-[#4f566b] font-bold uppercase bg-[#f8f9fc]">
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Medical Shop</th>
                        <th className="p-4">Total Value</th>
                        <th className="p-4">Submitted Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Items</th>
                        <th className="p-4 text-right">Process Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3e8ee] font-medium text-[#3c4257]">
                      {filteredOrders.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400">
                            No orders found in queue.
                          </td>
                        </tr>
                      ) : (
                        filteredOrders.map((ord) => {
                          let statColor = 'bg-slate-100 text-slate-600';
                          if (ord.status === 'PENDING') statColor = 'bg-amber-50 text-amber-700 border border-amber-100';
                          if (ord.status === 'ACCEPTED') statColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                          if (ord.status === 'REJECTED') statColor = 'bg-rose-50 text-rose-700 border border-rose-100';
                          if (ord.status === 'DELIVERED') statColor = 'bg-indigo-50 text-indigo-700 border border-indigo-100';

                          return (
                            <tr key={ord.id} className="hover:bg-[#f8f9fc] transition-colors">
                              <td className="p-4 font-mono font-bold text-[#635bff] uppercase">
                                #{ord.id.substring(0, 8)}
                              </td>
                              <td className="p-4 text-[#3c4257]">
                                <span className="block font-bold text-[#0a2540]">{ord.customer.shop_name}</span>
                                <span className="block text-[10px] text-[#4f566b] font-mono">+{ord.customer.whatsapp_number}</span>
                              </td>
                              <td className="p-4 font-bold text-[#0a2540] font-mono text-sm">
                                ₹{ord.total_amount.toFixed(2)}
                              </td>
                              <td className="p-4 text-[#4f566b]">
                                {formatDate(ord.created_at)}
                              </td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statColor}`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => setSelectedOrderItems(ord.items)}
                                  className="text-[#635bff] hover:text-[#5951e5] font-semibold underline flex items-center gap-1 cursor-pointer"
                                >
                                  View ({ord.items.length} items)
                                </button>
                              </td>
                              <td className="p-4 text-right space-x-2">
                                {ord.status === 'PENDING' && (
                                  <>
                                    <button
                                      onClick={() => handleUpdateOrderStatus(ord.id, 'ACCEPTED')}
                                      className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md text-[10px] transition-all cursor-pointer shadow-sm"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      onClick={() => handleUpdateOrderStatus(ord.id, 'REJECTED')}
                                      className="px-3 py-1 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-md text-[10px] transition-all cursor-pointer shadow-sm"
                                    >
                                      Reject
                                    </button>
                                  </>
                                )}
                                {ord.status === 'ACCEPTED' && (
                                  <button
                                    onClick={() => handleUpdateOrderStatus(ord.id, 'DELIVERED')}
                                    className="px-3 py-1 bg-[#635bff] hover:bg-[#5951e5] text-white font-bold rounded-md text-[10px] transition-all cursor-pointer shadow-sm"
                                  >
                                    Mark Delivered
                                  </button>
                                )}
                                {ord.status === 'DELIVERED' && (
                                  <span className="text-[#4f566b] text-[10px]">Archived</span>
                                )}
                                {ord.status === 'REJECTED' && (
                                  <span className="text-rose-600 text-[10px]">Cancelled</span>
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                
                {/* Top Spending Customers */}
                <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-6 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#635bff] flex items-center gap-2 mb-4">
                    <Award className="w-5 h-5 text-[#635bff]" />
                    Top B2B Clients (Sales Vol.)
                  </h3>
                  <div className="space-y-3">
                    {analytics.topCustomers?.length === 0 ? (
                      <span className="text-[#4f566b] text-xs">Awaiting sales completions.</span>
                    ) : (
                      analytics.topCustomers?.map((tc, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-[#f8f9fc] border border-[#e3e8ee] rounded-md">
                          <span className="text-xs font-bold text-[#0a2540]">{tc.shop_name}</span>
                          <span className="text-xs font-black text-[#00875a] font-mono">₹{tc.total_spent.toFixed(2)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Fast Moving Inventory */}
                <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-6 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#635bff] flex items-center gap-2 mb-4">
                    <TrendingUp className="w-5 h-5 text-[#635bff]" />
                    Fast-Moving Medicines
                  </h3>
                  <div className="space-y-3">
                    {analytics.fastMovingItems?.length === 0 ? (
                      <span className="text-[#4f566b] text-xs">Awaiting catalog transactions.</span>
                    ) : (
                      analytics.fastMovingItems?.map((fm, idx) => (
                        <div key={idx} className="flex items-center justify-between p-3 bg-[#f8f9fc] border border-[#e3e8ee] rounded-md">
                          <div>
                            <span className="text-xs font-bold text-[#0a2540] block">{fm.medicine_name}</span>
                            <span className="text-[9px] text-[#4f566b] block">{fm.generic_name}</span>
                          </div>
                          <span className="text-xs font-bold text-[#3c4257] font-mono">{fm.total_units_sold} unit(s)</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Accounts Ledger sheet */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-[#4f566b]">
                  Outstanding Credit Ledger Sheets
                </h3>
                
                <div className="bg-white border border-[#e3e8ee] rounded-[4px] shadow-sm overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs border-collapse">
                      <thead>
                        <tr className="border-b border-[#e3e8ee] text-[#4f566b] font-bold uppercase bg-[#f8f9fc]">
                          <th className="p-4">Customer Shop</th>
                          <th className="p-4">WhatsApp Contact</th>
                          <th className="p-4">Outstanding balance</th>
                          <th className="p-4">Last Activity / Payment</th>
                          <th className="p-4 text-right">Payment Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#e3e8ee] font-medium text-[#3c4257]">
                        {analytics.ledgerBalances?.length === 0 ? (
                          <tr>
                            <td colSpan="5" className="p-8 text-center text-slate-400">
                              No accounts ledger entries available.
                            </td>
                          </tr>
                        ) : (
                          analytics.ledgerBalances?.map((ledg) => {
                            const isClear = ledg.total_outstanding_balance <= 0;
                            return (
                              <tr key={ledg.id} className="hover:bg-[#f8f9fc] transition-colors">
                                <td className="p-4 font-bold text-[#0a2540]">{ledg.customer.shop_name}</td>
                                <td className="p-4 font-mono text-[#3c4257]">+{ledg.customer.whatsapp_number}</td>
                                <td className="p-4 font-black font-mono text-sm text-[#0a2540]">
                                  ₹{ledg.total_outstanding_balance.toFixed(2)}
                                </td>
                                <td className="p-4 text-[#4f566b]">{formatDate(ledg.last_payment_date)}</td>
                                <td className="p-4 text-right">
                                  <span className={`px-2.5 py-1 rounded-full text-[9px] font-bold uppercase border ${
                                    isClear ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-rose-50 text-rose-700 border-rose-100'
                                  }`}>
                                    {isClear ? 'Cleared / Good Credit' : 'Outstanding Credit'}
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-6 space-y-6 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a2540]">
                    Step 1: Select Broadcast Material
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-[#4f566b] mb-2">
                        Select Target Product
                      </label>
                      <select
                        onChange={(e) => {
                          const prod = products.find(p => p.id === e.target.value);
                          setSelectedProduct(prod || null);
                        }}
                        value={selectedProduct?.id || ''}
                        className="w-full px-4 py-3 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-sm shadow-sm"
                      >
                        <option value="">-- Choose a watermarked product --</option>
                        {products.map(p => (
                          <option key={p.id} value={p.id}>{p.medicine_name} (₹{p.b2b_discount_price})</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-[#4f566b] mb-2">
                        WhatsApp Template
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setTemplateType('PRODUCT_LAUNCH')}
                          className={`p-4 rounded-md border text-left transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                            templateType === 'PRODUCT_LAUNCH'
                              ? 'bg-[#635bff]/5 border-[#635bff] text-[#635bff] font-semibold shadow-sm'
                              : 'bg-white border-[#e3e8ee] hover:border-[#635bff]/40 text-[#4f566b]'
                          }`}
                        >
                          <span className="text-xs font-bold text-[#0a2540]">Product Launch Promotion</span>
                          <span className="text-[10px] leading-relaxed">
                            Sends approved media template containing the watermarked image and dynamic shop greeting.
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setTemplateType('CUSTOM')}
                          className={`p-4 rounded-md border text-left transition-all flex flex-col justify-between gap-4 cursor-pointer ${
                            templateType === 'CUSTOM'
                              ? 'bg-[#635bff]/5 border-[#635bff] text-[#635bff] font-semibold shadow-sm'
                              : 'bg-white border-[#e3e8ee] hover:border-[#635bff]/40 text-[#4f566b]'
                          }`}
                        >
                          <span className="text-xs font-bold text-[#0a2540]">Custom Text Caption</span>
                          <span className="text-[10px] leading-relaxed">
                            Sends watermarked image with a custom promotional caption typed by you.
                          </span>
                        </button>
                      </div>
                    </div>

                    {templateType === 'CUSTOM' && (
                      <div className="animate-fade-in">
                        <label className="block text-xs font-semibold text-[#4f566b] mb-2">
                          Custom Message Text (Caption)
                        </label>
                        <textarea
                          rows="4"
                          value={customText}
                          onChange={(e) => setCustomText(e.target.value)}
                          className="w-full px-4 py-3 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-sm shadow-sm"
                          placeholder="Type custom deal information, coupons or payment terms here..."
                        />
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-6 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a2540] mb-4">
                    Step 2: Target Audience Summary
                  </h3>
                  <div className="p-4 bg-[#f8f9fc] border border-[#e3e8ee] rounded-md flex items-center justify-between">
                    <div>
                      <span className="text-xs text-[#4f566b] block font-medium">Total clients receiving broadcast</span>
                      <span className="text-2xl font-black text-[#635bff] mt-1 block">{customers.length} shop(s)</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold text-[#4f566b] uppercase block">Meta Rate Limit</span>
                      <span className="text-xs font-semibold text-[#0a2540]">Tier 1: 1K / day</span>
                    </div>
                  </div>

                  <div className="mt-6">
                    <button
                      onClick={triggerBroadcast}
                      disabled={broadcastLoading || !selectedProduct}
                      className="w-full py-4 bg-[#635bff] hover:bg-[#5951e5] disabled:bg-[#f8f9fc] disabled:text-[#a3acb9] disabled:border-[#e3e8ee] text-white font-bold rounded-md transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer border border-[#635bff]/10"
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
                <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-6 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#4f566b]">
                    Live Broadcast Preview
                  </h3>
                  
                  {selectedProduct ? (
                    <div className="space-y-4">
                      <div className="aspect-square bg-[#f8f9fc] border border-[#e3e8ee] rounded-md overflow-hidden relative shadow-inner">
                        {selectedProduct.image_url ? (
                          <img
                            src={`${STATIC_BASE}${selectedProduct.image_url}`}
                            alt="Watermark preview"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center text-[#4f566b]">
                            <AlertTriangle className="w-10 h-10 text-amber-500" />
                            <span className="text-xs font-bold uppercase tracking-widest mt-2">Missing Image</span>
                          </div>
                        )}
                      </div>

                      <div className="p-3 bg-[#dcf8c6] border border-[#c7eab3] rounded-md shadow-sm space-y-1 relative max-w-[90%] ml-auto">
                        <span className="text-[10px] text-[#00a884] uppercase font-black block">Broadcast Caption Preview</span>
                        <p className="text-xs text-[#303030] leading-normal font-medium">
                          {templateType === 'CUSTOM' 
                            ? (customText || 'Type custom text on the left to preview...') 
                            : `🔥 Special Deal: ${selectedProduct.medicine_name.toUpperCase()} now available at B2B discounted price of ₹${selectedProduct.b2b_discount_price}! MRP: ₹${selectedProduct.mrp}. Contact us to order.`}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="aspect-square bg-[#f8f9fc] border border-[#e3e8ee] rounded-md flex flex-col items-center justify-center text-[#4f566b] text-center p-6 border-dashed">
                      <Eye className="w-12 h-12 stroke-[1] mb-2 text-[#4f566b]" />
                      <span className="text-xs font-bold text-[#4f566b] uppercase tracking-widest">Awaiting Selection</span>
                      <p className="text-[10px] text-[#4f566b] mt-1.5 max-w-[180px]">
                        Select a medicine product to visualize the watermarked broadcast flyer before launch.
                      </p>
                    </div>
                  )}
                </div>

                {/* Broadcast reports */}
                {broadcastResult && (
                  <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-6 space-y-4 animate-scale-up shadow-sm">
                    <h4 className="text-xs font-bold uppercase tracking-wider text-[#635bff] flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-600" /> Broadcast Complete Report
                    </h4>
                    
                    <div className="grid grid-cols-2 gap-4 text-xs font-bold">
                      <div className="p-3 bg-[#f8f9fc] border border-[#e3e8ee] rounded-md">
                        <span className="text-[#4f566b] block text-[9px] uppercase">Succeeded</span>
                        <span className="text-emerald-600 text-base">{broadcastResult.summary.successCount}</span>
                      </div>
                      <div className="p-3 bg-[#f8f9fc] border border-[#e3e8ee] rounded-md">
                        <span className="text-[#4f566b] block text-[9px] uppercase">Failed</span>
                        <span className="text-[#df1b41] text-base">{broadcastResult.summary.failureCount}</span>
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
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="relative w-full sm:max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Search className="w-4 h-4 text-[#4f566b]" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search medicine catalog..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] text-xs focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] shadow-sm"
                  />
                </div>
              </div>

              {/* Products Card Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.length === 0 ? (
                  <div className="col-span-full py-12 text-center text-[#4f566b]">
                    No products listed. Check back later!
                  </div>
                ) : (
                  filteredProducts.map((prod) => {
                    const discountPercent = Math.round(((prod.mrp - prod.b2b_discount_price) / prod.mrp) * 100);
                    const isOutOfStock = prod.stock_status === 'OUT_OF_STOCK' || prod.current_stock <= 0;
                    
                    return (
                      <div key={prod.id} className="bg-white border border-[#e3e8ee] rounded-md overflow-hidden flex flex-col hover:border-[#635bff]/40 shadow-sm transition-all duration-300">
                        {/* Image watermarked preview */}
                        <div className="aspect-square bg-[#f8f9fc] border-b border-[#e3e8ee] relative overflow-hidden group">
                          {prod.image_url ? (
                            <img
                              src={`${STATIC_BASE}${prod.image_url}`}
                              alt={prod.medicine_name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                          ) : (
                            <div className="w-full h-full flex flex-col items-center justify-center text-[#4f566b] gap-2">
                              <Package className="w-12 h-12 stroke-[1]" />
                              <span className="text-[10px] uppercase font-bold tracking-wider">No Product Image</span>
                            </div>
                          )}
                          
                          {/* Discount tag overlay */}
                          <div className="absolute top-4 left-4 px-2.5 py-1 rounded-md bg-[#635bff] text-white text-[10px] font-extrabold flex items-center gap-0.5 shadow-sm">
                            <Percent className="w-3 h-3 stroke-[3]" /> {discountPercent}% OFF
                          </div>

                          {/* Scheme Banner */}
                          {prod.scheme_id && (
                            <div className="absolute bottom-4 left-4 right-4 bg-white/95 backdrop-blur-md px-3 py-2 rounded-md border border-[#e3e8ee] flex items-center justify-between shadow-md">
                              <span className="text-[10px] font-black uppercase text-[#00875a] tracking-wider">Special Scheme</span>
                              <span className="text-[10px] font-bold text-[#0a2540]">
                                {prod.scheme_id === 'buy-10-get-1' ? 'Buy 10 Get 1 Free' : '15% Extra Discount'}
                              </span>
                            </div>
                          )}
                        </div>

                        {/* Product details */}
                        <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <h4 className="font-extrabold text-[#0a2540] text-base uppercase leading-snug">
                                {prod.medicine_name}
                              </h4>
                              <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                !isOutOfStock
                                  ? 'bg-emerald-50 border border-emerald-100 text-emerald-700' 
                                  : 'bg-rose-50 border border-rose-100 text-rose-700'
                              }`}>
                                {!isOutOfStock ? 'In Stock' : 'Out of Stock'}
                              </span>
                            </div>
                            <span className="text-xs text-[#4f566b] italic font-medium block mt-1">
                              {prod.generic_name}
                            </span>
                          </div>

                          <div className="pt-3 border-t border-[#e3e8ee] flex items-center justify-between">
                            <div className="space-y-0.5">
                              <span className="text-[10px] font-bold text-[#4f566b] uppercase block">Retail MRP</span>
                              <span className="text-sm font-semibold text-[#4f566b] line-through font-mono">₹{prod.mrp.toFixed(2)}</span>
                            </div>
                            
                            <div className="text-right space-y-0.5">
                              <span className="text-[10px] font-bold text-[#635bff] uppercase block">B2B Deal Price</span>
                              <span className="text-lg font-black text-[#635bff] font-mono">₹{prod.b2b_discount_price.toFixed(2)}</span>
                            </div>
                          </div>

                          <button
                            onClick={() => { cart.addItem(prod); showToast(`${prod.medicine_name} added to cart!`); }}
                            disabled={isOutOfStock}
                            className="w-full py-2.5 bg-[#635bff] hover:bg-[#5951e5] disabled:bg-[#f8f9fc] disabled:text-[#a3acb9] disabled:border-[#e3e8ee] text-white font-bold rounded-md text-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm border border-[#635bff]/10"
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
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-6 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a2540]">
                    B2B Ordered Items List
                  </h3>

                  {cart.items.length === 0 ? (
                    <div className="py-12 text-center text-[#4f566b] text-xs">
                      Your cart is empty. Browse the live catalog to add products.
                    </div>
                  ) : (
                    <div className="divide-y divide-[#e3e8ee]">
                      {cartDetails.items.map((item) => (
                        <div key={item.product.id} className="py-4 first:pt-0 last:pb-0 flex items-center justify-between gap-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-[#f8f9fc] rounded-md overflow-hidden border border-[#e3e8ee] flex-shrink-0">
                              <img
                                src={`${STATIC_BASE}${item.product.image_url}`}
                                alt={item.product.medicine_name}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <span className="text-xs font-bold text-[#0a2540] block uppercase">{item.product.medicine_name}</span>
                              <span className="text-[10px] text-[#4f566b] block">{item.product.generic_name}</span>
                              {item.schemeAppliedText && (
                                <span className="text-[9px] font-black text-emerald-600 block mt-1 uppercase">
                                  % {item.schemeAppliedText}
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-6">
                            {/* Quantity Controls */}
                            <div className="flex items-center bg-[#f8f9fc] rounded-md border border-[#e3e8ee] p-0.5 shadow-sm">
                              <button
                                onClick={() => cart.updateQuantity(item.product.id, item.quantity - 1)}
                                className="px-2 py-1 text-[#4f566b] hover:text-[#0a2540] text-xs font-bold"
                              >
                                -
                              </button>
                              <span className="px-3 text-xs font-mono font-bold text-[#0a2540]">
                                {item.quantity}
                              </span>
                              <button
                                onClick={() => cart.updateQuantity(item.product.id, item.quantity + 1)}
                                className="px-2 py-1 text-[#4f566b] hover:text-[#0a2540] text-xs font-bold"
                              >
                                +
                              </button>
                            </div>

                            <div className="text-right">
                              <span className="text-xs font-bold text-[#0a2540] block font-mono">
                                ₹{item.itemTotal.toFixed(2)}
                              </span>
                              <span className="text-[10px] text-[#4f566b] block">
                                ₹{item.pricePerUnit.toFixed(2)} each
                              </span>
                            </div>

                            <button
                              onClick={() => cart.removeItem(item.product.id)}
                              className="p-1 text-[#4f566b] hover:text-red-600 transition-all cursor-pointer"
                              title="Remove item"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Checkout details sidebar */}
              <div className="space-y-6">
                <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-6 space-y-4 shadow-sm">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-[#0a2540]">
                    B2B Invoice calculation
                  </h3>

                  <div className="space-y-3 pt-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-[#4f566b]">Regular B2B Subtotal</span>
                      <span className="font-semibold text-[#0a2540] font-mono">₹{cartDetails.originalSubtotal.toFixed(2)}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-[#4f566b]">Scheme Discount / Savings</span>
                      <span className="font-bold text-[#00875a] font-mono">-₹{cartDetails.savings.toFixed(2)}</span>
                    </div>

                    <div className="border-t border-[#e3e8ee] pt-3 flex justify-between text-sm">
                      <span className="font-bold text-[#0a2540]">Grand Total</span>
                      <span className="font-black text-[#635bff] font-mono">₹{cartDetails.grandTotal.toFixed(2)}</span>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-[#e3e8ee]">
                    <button
                      onClick={handleCheckout}
                      disabled={cart.items.length === 0 || dataLoading}
                      className="w-full py-4 bg-[#635bff] hover:bg-[#5951e5] disabled:bg-[#f8f9fc] disabled:text-[#a3acb9] disabled:border-[#e3e8ee] text-white font-bold rounded-md transition-all shadow-sm flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider border border-[#635bff]/10"
                    >
                      {dataLoading ? (
                        <>
                          <Loader2 className="w-5 h-5 animate-spin" />
                          Placing order...
                        </>
                      ) : (
                        <>
                          <Check className="w-5 h-5 stroke-[2.5]" />
                          Submit B2B Order
                        </>
                      )}
                    </button>
                  </div>
                </div>

                <div className="p-4 bg-[#fff9e6] border border-[#ffebad] rounded-md text-[10px] text-[#b26b00] leading-normal shadow-sm">
                  ⚠️ <strong>Important:</strong> Placed orders undergo verification by the distribution desk. Upon approval, a WhatsApp notification with the generated PDF bill is sent out and the balance is updated in the accounts ledger.
                </div>
              </div>
            </div>
          )}

          {/* TAB: B2B CLIENT MY ORDERS */}
          {authRole === 'client' && clientActiveTab === 'orders' && (
            <div className="space-y-6 animate-fade-in">
              <div className="bg-white border border-[#e3e8ee] rounded-[4px] shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-[#e3e8ee] text-[#4f566b] font-bold uppercase bg-[#f8f9fc]">
                        <th className="p-4">Order ID</th>
                        <th className="p-4">Total Amount</th>
                        <th className="p-4">Placement Date</th>
                        <th className="p-4">Status</th>
                        <th className="p-4">Line Items</th>
                        <th className="p-4 text-right">Invoice / Document</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#e3e8ee] font-medium text-[#3c4257]">
                      {orders.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">
                            No orders placed yet.
                          </td>
                        </tr>
                      ) : (
                        orders.map((ord) => {
                          let statColor = 'bg-slate-100 text-slate-600';
                          if (ord.status === 'PENDING') statColor = 'bg-amber-50 text-amber-700 border border-amber-100';
                          if (ord.status === 'ACCEPTED') statColor = 'bg-emerald-50 text-emerald-700 border border-emerald-100';
                          if (ord.status === 'REJECTED') statColor = 'bg-rose-50 text-rose-700 border border-rose-100';
                          if (ord.status === 'DELIVERED') statColor = 'bg-indigo-50 text-indigo-700 border border-indigo-100';

                          return (
                            <tr key={ord.id} className="hover:bg-[#f8f9fc] transition-colors">
                              <td className="p-4 font-mono font-bold text-[#635bff] uppercase">
                                #{ord.id.substring(0, 8)}
                              </td>
                              <td className="p-4 font-bold text-[#0a2540] font-mono text-sm">
                                ₹{ord.total_amount.toFixed(2)}
                              </td>
                              <td className="p-4 text-[#4f566b] font-mono">
                                {formatDate(ord.created_at)}
                              </td>
                              <td className="p-4">
                                <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-bold uppercase border ${statColor}`}>
                                  {ord.status}
                                </span>
                              </td>
                              <td className="p-4">
                                <button
                                  onClick={() => setSelectedOrderItems(ord.items)}
                                  className="text-[#635bff] hover:text-[#5951e5] font-semibold underline flex items-center gap-1 cursor-pointer"
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
                                    className="px-3 py-1.5 bg-white hover:bg-[#f8f9fc] text-[#3c4257] font-semibold rounded-md text-[10px] inline-flex items-center gap-1 cursor-pointer transition-all border border-[#e3e8ee] shadow-sm"
                                  >
                                    <FileText className="w-3.5 h-3.5 text-[#635bff]" />
                                    Download Bill (PDF)
                                  </a>
                                ) : (
                                  <span className="text-[#4f566b] text-[10px]">Awaiting acceptance</span>
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
              <div className="bg-white border border-[#e3e8ee] rounded-[4px] p-8 space-y-6 shadow-sm">
                <div>
                  <h3 className="text-lg font-bold text-[#0a2540] flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-[#635bff]" />
                    Accounts Credit Ledger Status
                  </h3>
                  <p className="text-[#4f566b] text-xs mt-1">
                    Your outstanding credit invoice balance and ledger limits for B2B billing.
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="p-5 bg-[#f8f9fc] border border-[#e3e8ee] rounded-md shadow-sm">
                    <span className="text-[#4f566b] block text-[9px] uppercase tracking-wider font-bold">Total Outstanding Credit</span>
                    <span className="text-2xl font-black text-rose-600 font-mono mt-1 block">
                      ₹{clientOutstanding ? clientOutstanding.total_outstanding_balance.toFixed(2) : '0.00'}
                    </span>
                  </div>

                  <div className="p-5 bg-[#f8f9fc] border border-[#e3e8ee] rounded-md shadow-sm">
                    <span className="text-[#4f566b] block text-[9px] uppercase tracking-wider font-bold">Last Payment Activity</span>
                    <span className="text-sm font-semibold text-[#0a2540] font-mono mt-2.5 block">
                      {clientOutstanding ? formatDate(clientOutstanding.last_payment_date) : 'N/A'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-white border border-[#e3e8ee] rounded-md space-y-2 text-xs shadow-sm">
                  <span className="font-bold text-[#0a2540] block">Bank Settlement details for outstanding clearing:</span>
                  <p className="text-[#4f566b] leading-relaxed font-mono text-[11px]">
                    Bank Name: INDUSIND BANK LTD<br />
                    Account Holder: GAYATRI PHARMA PVT LTD<br />
                    A/C Number: 1009876543210 (Current)<br />
                    IFSC Code: INDB0000123
                  </p>
                  <p className="text-[10px] text-[#635bff] italic pt-1">
                    * After processing NEFT/RTGS, send transaction details to our billing desk via WhatsApp to update the ledger.
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#e3e8ee] rounded-md max-w-md w-full shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-[#e3e8ee] flex items-center justify-between bg-[#f8f9fc]">
              <h3 className="text-base font-bold text-[#0a2540]">
                {customerModal.mode === 'create' ? 'Register B2B Medical Shop' : 'Update B2B Partner Details'}
              </h3>
              <button 
                onClick={() => setCustomerModal({ open: false, mode: 'create', data: null })}
                className="p-1.5 hover:bg-[#e3e8ee]/45 rounded-md text-[#4f566b] hover:text-[#0a2540] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">Shop Name</label>
                <input
                  type="text"
                  required
                  value={customerForm.shop_name}
                  onChange={(e) => setCustomerForm({ ...customerForm, shop_name: e.target.value })}
                  placeholder="e.g. Dhanvantari Medicos"
                  className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-xs shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">WhatsApp Number (with Country Code)</label>
                <input
                  type="text"
                  required
                  value={customerForm.whatsapp_number}
                  onChange={(e) => setCustomerForm({ ...customerForm, whatsapp_number: e.target.value })}
                  placeholder="e.g. 919876543210"
                  className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-xs font-mono shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">Portal Login Email</label>
                <input
                  type="email"
                  required
                  value={customerForm.email}
                  onChange={(e) => setCustomerForm({ ...customerForm, email: e.target.value })}
                  placeholder="e.g. shop1@gayatri.com"
                  className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-xs font-mono shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">GST Number</label>
                <input
                  type="text"
                  required
                  value={customerForm.gst_number}
                  onChange={(e) => setCustomerForm({ ...customerForm, gst_number: e.target.value })}
                  placeholder="e.g. 24AAAAA1111A1Z1"
                  className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-xs font-mono uppercase shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">Drug License Expiry</label>
                  <input
                    type="date"
                    required
                    value={customerForm.drug_license_expiry}
                    onChange={(e) => setCustomerForm({ ...customerForm, drug_license_expiry: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-xs font-mono shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">Owner Birthday</label>
                  <input
                    type="date"
                    required
                    value={customerForm.owner_birthday}
                    onChange={(e) => setCustomerForm({ ...customerForm, owner_birthday: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-xs font-mono shadow-sm"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-[#e3e8ee] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCustomerModal({ open: false, mode: 'create', data: null })}
                  className="px-4 py-2 border border-[#e3e8ee] hover:border-[#d3d8de] bg-white text-[#4f566b] hover:text-[#0a2540] rounded-md text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#635bff] hover:bg-[#5951e5] text-white font-bold rounded-md text-xs transition-all shadow-sm cursor-pointer border border-[#635bff]/10"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#e3e8ee] rounded-md max-w-md w-full shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-[#e3e8ee] flex items-center justify-between bg-[#f8f9fc]">
              <h3 className="text-base font-bold text-[#0a2540]">
                {productModal.mode === 'create' ? 'Add New B2B Medicine' : 'Update Medicine Details'}
              </h3>
              <button 
                onClick={() => setProductModal({ open: false, mode: 'create', data: null })}
                className="p-1.5 hover:bg-[#e3e8ee]/45 rounded-md text-[#4f566b] hover:text-[#0a2540] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">Medicine Name</label>
                <input
                  type="text"
                  required
                  value={productForm.medicine_name}
                  onChange={(e) => setProductForm({ ...productForm, medicine_name: e.target.value })}
                  placeholder="e.g. Paracetamol 650mg"
                  className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-xs uppercase shadow-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">Generic / Composition Name</label>
                <input
                  type="text"
                  required
                  value={productForm.generic_name}
                  onChange={(e) => setProductForm({ ...productForm, generic_name: e.target.value })}
                  placeholder="e.g. Paracetamol IP"
                  className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-xs shadow-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">MRP Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                    placeholder="30.50"
                    className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-xs font-mono shadow-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">B2B Discounted Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.b2b_discount_price}
                    onChange={(e) => setProductForm({ ...productForm, b2b_discount_price: e.target.value })}
                    placeholder="18.00"
                    className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-xs font-mono shadow-sm"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">Stock Status</label>
                  <select
                    value={productForm.stock_status}
                    onChange={(e) => setProductForm({ ...productForm, stock_status: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-xs shadow-sm"
                  >
                    <option value="IN_STOCK">In Stock</option>
                    <option value="OUT_OF_STOCK">Out of Stock</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">In-Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.current_stock}
                    onChange={(e) => setProductForm({ ...productForm, current_stock: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-xs font-mono shadow-sm"
                  />
                </div>
              </div>

              {SHOW_PHASE_2 && (
                <div>
                  <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">Link B2B Scheme (Optional)</label>
                  <select
                    value={productForm.scheme_id}
                    onChange={(e) => setProductForm({ ...productForm, scheme_id: e.target.value })}
                    className="w-full px-3 py-2 bg-white border border-[#e3e8ee] rounded-md text-[#3c4257] focus:outline-none focus:border-[#635bff] focus:ring-1 focus:ring-[#635bff] text-xs shadow-sm"
                  >
                    <option value="">No Active Scheme</option>
                    <option value="buy-10-get-1">Buy 10 Get 1 Free (BUY_X_GET_Y)</option>
                    <option value="festive-15">15% Extra Discount (PERCENTAGE)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-[#4f566b] mb-1.5">
                  {productModal.mode === 'create' ? 'Upload Product Image (Will be watermarked)' : 'Change Image (Optional)'}
                </label>
                <input
                  type="file"
                  accept="image/*"
                  required={productModal.mode === 'create'}
                  onChange={(e) => setProductImageFile(e.target.files[0])}
                  className="w-full text-xs text-[#4f566b] file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-[#635bff]/10 file:text-[#635bff] hover:file:bg-[#635bff]/20 cursor-pointer shadow-sm"
                />
              </div>

              <div className="pt-4 border-t border-[#e3e8ee] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModal({ open: false, mode: 'create', data: null })}
                  className="px-4 py-2 border border-[#e3e8ee] hover:border-[#d3d8de] bg-white text-[#4f566b] hover:text-[#0a2540] rounded-md text-xs font-semibold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#635bff] hover:bg-[#5951e5] text-white font-bold rounded-md text-xs transition-all cursor-pointer shadow-sm border border-[#635bff]/10"
                >
                  {productModal.mode === 'create' ? 'Process & Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: VIEW ORDER ITEMS DETAILS */}
      {selectedOrderItems && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#e3e8ee] rounded-md max-w-lg w-full shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-[#e3e8ee] flex items-center justify-between bg-[#f8f9fc]">
              <h3 className="text-base font-bold text-[#0a2540]">
                Ordered Medicine Items Details
              </h3>
              <button 
                onClick={() => setSelectedOrderItems(null)}
                className="p-1.5 hover:bg-[#e3e8ee]/45 rounded-md text-[#4f566b] hover:text-[#0a2540] transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 max-h-[400px] overflow-y-auto">
              {selectedOrderItems.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-3 bg-[#f8f9fc] border border-[#e3e8ee] rounded-md gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white rounded-md overflow-hidden border border-[#e3e8ee] flex-shrink-0">
                      <img
                        src={`${STATIC_BASE}${item.product.image_url}`}
                        alt={item.product.medicine_name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-[#0a2540] block uppercase">{item.product.medicine_name}</span>
                      <span className="text-[10px] text-[#4f566b] block">{item.product.generic_name}</span>
                      {item.applied_scheme && (
                        <span className="text-[9px] font-black text-[#635bff] uppercase tracking-wide mt-1 block">
                          🏷️ {item.applied_scheme}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-[#0a2540] block font-mono">
                      ₹{(item.price_at_purchase * item.quantity).toFixed(2)}
                    </span>
                    <span className="text-[9px] text-[#4f566b] block font-mono">
                      {item.quantity} unit(s) @ ₹{item.price_at_purchase.toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-[#e3e8ee] flex justify-end bg-[#f8f9fc]">
              <button
                onClick={() => setSelectedOrderItems(null)}
                className="px-4 py-2 bg-white hover:bg-[#f8f9fc] border border-[#e3e8ee] hover:border-[#d3d8de] text-[#3c4257] font-semibold rounded-md text-xs transition-all cursor-pointer shadow-sm"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CUSTOM DELETE CONFIRMATION */}
      {deleteConfirm.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white border border-[#e3e8ee] rounded-md max-w-sm w-full shadow-2xl overflow-hidden relative p-6 space-y-6">
            <div className="flex flex-col items-center text-center">
              <div className="flex items-center justify-center h-12 w-12 rounded-full bg-rose-50 border border-rose-100 text-rose-600 mb-4 shadow-sm">
                <AlertTriangle className="h-6 w-6 stroke-[2]" />
              </div>
              <h3 className="text-base font-bold text-[#0a2540] uppercase tracking-wide">
                Delete {deleteConfirm.type === 'product' ? 'B2B Medicine Product' : 'B2B Medical Shop'}?
              </h3>
              <p className="text-xs text-[#4f566b] leading-relaxed mt-2">
                Are you sure you want to permanently delete <strong className="text-[#0a2540]">"{deleteConfirm.title}"</strong>? This will remove all associated database entries. This action is irreversible.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setDeleteConfirm({ open: false, type: null, id: null, title: '' })}
                className="flex-1 py-2 border border-[#e3e8ee] hover:border-[#d3d8de] bg-white text-[#4f566b] hover:text-[#0a2540] rounded-md text-xs font-semibold transition-all cursor-pointer text-center shadow-sm"
              >
                Cancel
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
                className="flex-1 py-2 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-md text-xs transition-all cursor-pointer text-center shadow-sm"
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

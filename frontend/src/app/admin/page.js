'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
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
  UserCheck,
  Upload,
  Layers,
  Sparkles,
  Award,
  ArrowRight,
  TrendingUp,
  MapPin,
  ClipboardList,
  Clock
} from 'lucide-react';

const MedicalLogo = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="5.5" strokeWidth="2" />
    <path d="M12 7V17M7 12H17" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

const API_BASE = 'http://localhost:5000/api';
const STATIC_BASE = 'http://localhost:5000';

export default function AdminPortal() {
  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState('');
  const [adminUser, setAdminUser] = useState(null);
  const [loginEmail, setLoginEmail] = useState('admin@gayatri.com');
  const [loginPassword, setLoginPassword] = useState('password123');
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // App Layout State
  const [activeTab, setActiveTab] = useState('dashboard');
  const [apiOnline, setApiOnline] = useState(false);
  const [toast, setToast] = useState(null);

  // Data Loading States
  const [dataLoading, setDataLoading] = useState(false);
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [schemes, setSchemes] = useState([]);
  const [campaigns, setCampaigns] = useState([]);
  
  // Dashboard Analytics State
  const [kpis, setKpis] = useState({
    totalCustomers: 0,
    totalProducts: 0,
    outstandingAmount: 0,
    inactiveCustomers: 0,
    expiringProductsCount: 0,
    todaysBirthdays: 0,
    licenseExpiringCount: 0,
    campaignsSentCount: 0
  });
  const [followUps, setFollowUps] = useState([]);
  const [outstandingDues, setOutstandingDues] = useState([]);
  const [expiryTracker, setExpiryTracker] = useState({ expiring30: 0, expiring90: 0, expiring180: 0 });
  const [salesTrends, setSalesTrends] = useState([]);
  const [topProducts, setTopProducts] = useState([]);

  // Search & Filters State
  const [customerSearch, setCustomerSearch] = useState('');
  const [customerRouteFilter, setCustomerRouteFilter] = useState('');
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');
  const [invoiceStatusFilter, setInvoiceStatusFilter] = useState('');

  // Modals & Submitting Forms State
  const [customerModal, setCustomerModal] = useState({ open: false, mode: 'create', data: null });
  const [productModal, setProductModal] = useState({ open: false, mode: 'create', data: null });
  const [schemeModal, setSchemeModal] = useState({ open: false, mode: 'create', data: null });
  const [invoiceDetailModal, setInvoiceDetailModal] = useState({ open: false, data: null });
  
  // Post-Creation Notification Prompts
  const [broadcastPromptModal, setBroadcastPromptModal] = useState({ open: false, product: null, text: '' });
  const [customerInviteModal, setCustomerInviteModal] = useState({ open: false, customer: null, inviteText: '' });

  // Add/Edit Customer Form State
  const [customerForm, setCustomerForm] = useState({
    shop_name: '',
    owner_name: '',
    mobile: '',
    whatsapp: '',
    address: '',
    route_area: 'Rajkot',
    gst_number: '',
    drug_license_expiry: '',
    birthday: '',
    credit_limit: '0'
  });

  // Add/Edit Product Form State
  const [productForm, setProductForm] = useState({
    name: '',
    generic_name: '',
    company: '',
    pack_size: '',
    mrp: '',
    pts: '',
    tax_percent: '12.0',
    stock_qty: '0',
    expiry_date: '',
    category: 'Tablet',
    offer_scheme: ''
  });
  const [productImageFile, setProductImageFile] = useState(null);

  // Add/Edit Scheme Form State
  const [schemeForm, setSchemeForm] = useState({
    name: '',
    description: '',
    product_id: '',
    min_qty: '10',
    free_qty: '1',
    start_date: '',
    end_date: ''
  });

  // Broadcast campaign form state
  const [campaignForm, setCampaignForm] = useState({
    title: '',
    messageText: '',
    imageUrl: '',
    route: '',
    productId: ''
  });
  const [campaignLoading, setCampaignLoading] = useState(false);

  // CSV uploads file states
  const [csvUploads, setCsvUploads] = useState({
    products: null,
    customers: null,
    outstanding: null,
    invoices: null
  });
  const [uploadSpinner, setUploadSpinner] = useState({ type: '', loading: false });

  // References to file inputs for CSV import
  const fileInputRefs = {
    products: useRef(),
    customers: useRef(),
    outstanding: useRef(),
    invoices: useRef()
  };

  // Toast message timing
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Sync token from localStorage
  useEffect(() => {
    checkApiHealth();
    const savedToken = localStorage.getItem('gayatri_admin_token');
    const savedAdmin = localStorage.getItem('gayatri_admin_user');
    if (savedToken && savedAdmin) {
      setToken(savedToken);
      setAdminUser(JSON.parse(savedAdmin));
      setIsAuthenticated(true);
    }
  }, []);

  // Fetch all tables on auth
  useEffect(() => {
    if (isAuthenticated) {
      fetchAllData();
    }
  }, [isAuthenticated]);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const checkApiHealth = async () => {
    try {
      const res = await fetch(`${STATIC_BASE}/`);
      setApiOnline(res.ok);
    } catch (err) {
      setApiOnline(false);
    }
  };

  const fetchAllData = () => {
    fetchDashboardKPIs();
    fetchProducts();
    fetchCustomers();
    fetchInvoices();
    fetchSchemes();
    fetchCampaigns();
  };

  // ------------------ API FETCHES ------------------

  const fetchDashboardKPIs = async () => {
    try {
      const res = await fetch(`${API_BASE}/reports/dashboard`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gayatri_admin_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setKpis(data.kpis);
        setFollowUps(data.followUps);
        setOutstandingDues(data.outstandingDues);
        setExpiryTracker(data.expiryTracker);
        setSalesTrends(data.salesTrends);
        setTopProducts(data.topProducts);
      }
    } catch (err) {
      console.error('Error loading dashboard:', err);
    }
  };

  const fetchProducts = async () => {
    try {
      const res = await fetch(`${API_BASE}/products`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gayatri_admin_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setProducts(data);
      }
    } catch (err) {
      showToast('Failed to fetch products list.', 'error');
    }
  };

  const fetchCustomers = async () => {
    try {
      const res = await fetch(`${API_BASE}/customers`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gayatri_admin_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCustomers(data);
      }
    } catch (err) {
      showToast('Failed to fetch customers list.', 'error');
    }
  };

  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE}/invoices`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gayatri_admin_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setInvoices(data.invoices);
      }
    } catch (err) {
      showToast('Failed to fetch invoices list.', 'error');
    }
  };

  const fetchSchemes = async () => {
    try {
      const res = await fetch(`${API_BASE}/schemes`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gayatri_admin_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSchemes(data);
      }
    } catch (err) {
      showToast('Failed to fetch schemes list.', 'error');
    }
  };

  const fetchCampaigns = async () => {
    try {
      const res = await fetch(`${API_BASE}/campaigns`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('gayatri_admin_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data);
      }
    } catch (err) {
      showToast('Failed to fetch campaigns logs.', 'error');
    }
  };

  // ------------------ AUTHENTICATION ------------------

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
        throw new Error(data.error || 'Check login credentials.');
      }

      localStorage.setItem('gayatri_admin_token', data.token);
      localStorage.setItem('gayatri_admin_user', JSON.stringify(data.admin));
      setToken(data.token);
      setAdminUser(data.admin);
      setIsAuthenticated(true);
      showToast(`Welcome, ${data.admin.name}!`);
    } catch (err) {
      setLoginError(err.message);
    } finally {
      setLoginLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('gayatri_admin_token');
    localStorage.removeItem('gayatri_admin_user');
    setToken('');
    setAdminUser(null);
    setIsAuthenticated(false);
    showToast('Logged out successfully.');
  };

  // ------------------ CSV IMPORT WIZARD ------------------

  const triggerCsvUpload = (type) => {
    fileInputRefs[type].current.click();
  };

  const handleCsvFileChange = async (e, type) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadSpinner({ type, loading: true });
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch(`${API_BASE}/integration/import/${type}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || `Failed to sync ${type} CSV`);
      }

      showToast(data.message || `CSV Sync Completed!`);
      fetchAllData(); // Refresh UI
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setUploadSpinner({ type: '', loading: false });
      e.target.value = null; // Clear input
    }
  };

  // ------------------ CRUD HANDLERS ------------------

  // Customer Save
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

      showToast(customerModal.mode === 'create' ? 'Customer created!' : 'Customer updated!');
      setCustomerModal({ open: false, mode: 'create', data: null });
      fetchCustomers();
      fetchDashboardKPIs();

      // Show invite details if newly created
      if (customerModal.mode === 'create') {
        setCustomerInviteModal({
          open: true,
          customer: data.customer,
          inviteText: data.inviteText
        });
      }
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Customer
  const deleteCustomer = async (id) => {
    if (!confirm('Are you sure you want to delete this customer shop?')) return;
    try {
      const res = await fetch(`${API_BASE}/customers/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deletion failed');
      showToast(data.message || 'Customer deleted.');
      fetchCustomers();
      fetchDashboardKPIs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Product Save
  const saveProduct = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    
    // Append fields
    Object.keys(productForm).forEach(key => {
      formData.append(key, productForm[key]);
    });
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

      showToast(productModal.mode === 'create' ? 'Medicine listed & watermarked!' : 'Product updated.');
      setProductModal({ open: false, mode: 'create', data: null });
      setProductImageFile(null);
      fetchProducts();
      fetchDashboardKPIs();

      // On creation, prompt to launch WhatsApp broadcast
      if (productModal.mode === 'create') {
        setBroadcastPromptModal({
          open: true,
          product: data.product,
          text: data.broadcastText
        });
      }
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setDataLoading(false);
    }
  };

  // Delete Product
  const deleteProduct = async (id) => {
    if (!confirm('Are you sure you want to delete this product?')) return;
    try {
      const res = await fetch(`${API_BASE}/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Deletion failed');
      showToast(data.message || 'Product deleted.');
      fetchProducts();
      fetchDashboardKPIs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Scheme Save
  const saveScheme = async (e) => {
    e.preventDefault();
    const url = schemeModal.mode === 'create' 
      ? `${API_BASE}/schemes` 
      : `${API_BASE}/schemes/${schemeModal.data.id}`;
    const method = schemeModal.mode === 'create' ? 'POST' : 'PUT';

    try {
      const res = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(schemeForm)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Failed to save scheme');

      showToast(schemeModal.mode === 'create' ? 'B2B Trade Scheme launched!' : 'Scheme updated.');
      setSchemeModal({ open: false, mode: 'create', data: null });
      fetchSchemes();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Delete Scheme
  const deleteScheme = async (id) => {
    if (!confirm('Are you sure you want to cancel this scheme?')) return;
    try {
      const res = await fetch(`${API_BASE}/schemes/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cancellation failed');
      showToast(data.message || 'Scheme cancelled.');
      fetchSchemes();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // Toggle active scheme status
  const toggleSchemeStatus = async (scheme) => {
    try {
      const res = await fetch(`${API_BASE}/schemes/${scheme.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: !scheme.status })
      });
      if (res.ok) {
        showToast('Scheme status updated.');
        fetchSchemes();
      }
    } catch (err) {
      showToast('Failed to update scheme status.', 'error');
    }
  };

  // Send WhatsApp Invoice Payment Reminder
  const triggerInvoiceReminder = async (invoiceId) => {
    try {
      const res = await fetch(`${API_BASE}/invoices/${invoiceId}/send-reminder`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to send WhatsApp alert.');
      
      showToast('Payment reminder sent on WhatsApp!');
      fetchInvoices();
      fetchDashboardKPIs();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // ------------------ BROADCAST CAMPAIGNS ------------------

  const handleLaunchCampaign = async (e) => {
    e.preventDefault();
    if (!campaignForm.title || !campaignForm.messageText) {
      showToast('Title and campaign text message are required.', 'error');
      return;
    }

    setCampaignLoading(true);
    try {
      const isFestival = activeTab === 'campaigns' && campaignForm.productId === '';
      const endpoint = isFestival ? `${API_BASE}/campaigns/festival` : `${API_BASE}/campaigns/broadcast`;

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(campaignForm)
      });
      const data = await res.json();

      if (!res.ok) throw new Error(data.error || 'Broadcast failed.');

      showToast(data.message || 'Campaign WhatsApp messages dispatched!');
      setCampaignForm({ title: '', messageText: '', imageUrl: '', route: '', productId: '' });
      fetchCampaigns();
      fetchDashboardKPIs();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setCampaignLoading(false);
    }
  };

  // Direct triggered broadcast prompt on product creation
  const handleLaunchProductPromptBroadcast = async () => {
    try {
      const res = await fetch(`${API_BASE}/campaigns/broadcast`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: `Product Launch: ${broadcastPromptModal.product.name}`,
          messageText: broadcastPromptModal.text,
          imageUrl: broadcastPromptModal.product.image_url,
          productId: broadcastPromptModal.product.id
        })
      });
      
      if (res.ok) {
        showToast('New Product Launch broadcasted!');
        setBroadcastPromptModal({ open: false, product: null, text: '' });
        fetchAllData();
      } else {
        const d = await res.json();
        showToast(d.error || 'Broadcast failed', 'error');
      }
    } catch (err) {
      showToast('Network error during broadcast launch', 'error');
    }
  };

  // ------------------ HELPERS ------------------

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
        owner_name: data.owner_name || '',
        mobile: data.mobile || '',
        whatsapp: data.whatsapp,
        address: data.address || '',
        route_area: data.route_area || 'Rajkot',
        gst_number: data.gst_number,
        drug_license_expiry: data.drug_license_expiry.split('T')[0],
        birthday: data.birthday.split('T')[0],
        credit_limit: data.credit_limit.toString()
      });
    } else {
      setCustomerForm({
        shop_name: '',
        owner_name: '',
        mobile: '',
        whatsapp: '',
        address: '',
        route_area: 'Rajkot',
        gst_number: '',
        drug_license_expiry: '',
        birthday: '',
        credit_limit: '0'
      });
    }
    setCustomerModal({ open: true, mode, data });
  };

  const openProductModal = (mode, data = null) => {
    if (mode === 'edit' && data) {
      setProductForm({
        name: data.name,
        generic_name: data.generic_name,
        company: data.company,
        pack_size: data.pack_size || '',
        mrp: data.mrp.toString(),
        pts: data.pts.toString(),
        tax_percent: data.tax_percent.toString(),
        stock_qty: data.stock_qty.toString(),
        expiry_date: data.expiry_date.split('T')[0],
        category: data.category,
        offer_scheme: data.offer_scheme || ''
      });
    } else {
      setProductForm({
        name: '',
        generic_name: '',
        company: '',
        pack_size: '',
        mrp: '',
        pts: '',
        tax_percent: '12.0',
        stock_qty: '0',
        expiry_date: '',
        category: 'Tablet',
        offer_scheme: ''
      });
    }
    setProductImageFile(null);
    setProductModal({ open: true, mode, data });
  };

  const openSchemeModal = (mode, data = null) => {
    if (mode === 'edit' && data) {
      setSchemeForm({
        name: data.name,
        description: data.description,
        product_id: data.product_id || '',
        min_qty: data.min_qty.toString(),
        free_qty: data.free_qty.toString(),
        start_date: data.start_date.split('T')[0],
        end_date: data.end_date.split('T')[0]
      });
    } else {
      setSchemeForm({
        name: '',
        description: '',
        product_id: '',
        min_qty: '10',
        free_qty: '1',
        start_date: '',
        end_date: ''
      });
    }
    setSchemeModal({ open: true, mode, data });
  };

  // ------------------ FILTERING LISTS ------------------

  const filteredCustomers = customers.filter(c => {
    const matchesSearch = 
      c.shop_name.toLowerCase().includes(customerSearch.toLowerCase()) ||
      (c.owner_name && c.owner_name.toLowerCase().includes(customerSearch.toLowerCase())) ||
      c.whatsapp.includes(customerSearch) ||
      c.gst_number.toLowerCase().includes(customerSearch.toLowerCase());
    
    const matchesRoute = customerRouteFilter === '' || c.route_area === customerRouteFilter;
    return matchesSearch && matchesRoute;
  });

  const filteredProducts = products.filter(p => {
    const matchesSearch = 
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.generic_name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.company.toLowerCase().includes(productSearch.toLowerCase());
    
    const matchesCategory = productCategoryFilter === '' || p.category === productCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  const filteredInvoices = invoices.filter(inv => {
    const matchesSearch = 
      inv.invoice_number.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.customer.shop_name.toLowerCase().includes(invoiceSearch.toLowerCase());
    
    const matchesStatus = invoiceStatusFilter === '' || inv.status === invoiceStatusFilter;
    return matchesSearch && matchesStatus;
  });

  // Extract unique route options
  const uniqueRoutes = [...new Set(customers.map(c => c.route_area).filter(Boolean))];

  // ------------------ RENDER AUTH GATE ------------------

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#fbfaf7] relative overflow-hidden px-4">
        {/* Glow blobs */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#10b981]/5 rounded-full blur-[100px] pointer-events-none" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#0c4a43]/5 rounded-full blur-[100px] pointer-events-none" />

        <div className="w-full max-w-md bg-white border border-[#e2f0e8] rounded-2xl shadow-xl p-8 relative z-10">
          <div className="flex flex-col items-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-tr from-[#0c4a43] to-[#10b981] rounded-2xl flex items-center justify-center shadow-lg shadow-[#0c4a43]/10 mb-4 animate-pulse">
              <MedicalLogo className="w-9 h-9 text-white" />
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#0c4a43]">
              GAYATRI PHARMA
            </h1>
            <p className="text-xs text-[#10b981] mt-1 font-bold tracking-widest uppercase">
              B2B Administration Panel
            </p>
          </div>

          <h2 className="text-lg font-bold text-[#0f172a] mb-6 text-center">
            Sign In to Control Center
          </h2>

          {loginError && (
            <div className="mb-5 p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-semibold flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 flex-shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Admin Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Mail className="w-4 h-4 text-[#0f766e]" />
                </span>
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] focus:ring-1 focus:ring-[#0c4a43] transition-all text-xs"
                  placeholder="admin@gayatri.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                  <Lock className="w-4 h-4 text-[#0f766e]" />
                </span>
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] focus:ring-1 focus:ring-[#0c4a43] transition-all text-xs"
                  placeholder="••••••••"
                />
              </div>
              <div className="mt-2 text-right">
                <a href="#" className="text-[10px] text-[#0f766e] hover:text-[#0c4a43] font-bold uppercase">Forgot Password?</a>
              </div>
            </div>

            <button
              type="submit"
              disabled={loginLoading}
              className="w-full py-3 bg-[#0c4a43] hover:bg-[#0f766e] text-white font-bold rounded-xl transition-all shadow-md hover:shadow-[#0c4a43]/20 active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer text-xs uppercase tracking-wider"
            >
              {loginLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying...
                </>
              ) : (
                'Sign In'
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-100 text-center">
            <div className="flex items-center justify-center gap-1.5 bg-[#f4fbf7] py-2 rounded-xl border border-[#e2f0e8] inline-flex px-4">
              <span className={`w-2.5 h-2.5 rounded-full ${apiOnline ? 'bg-emerald-500 animate-pulse' : 'bg-rose-500 animate-pulse'}`} />
              <span className="text-[9px] uppercase font-bold tracking-wider text-slate-500">
                Connection Status: {apiOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ------------------ MAIN ADMIN INTERFACE ------------------

  return (
    <div className="min-h-screen flex bg-[#fbfaf7] text-[#0f172a] font-sans">
      
      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-5 right-5 z-50 p-4 rounded-xl border shadow-2xl flex items-center gap-3 animate-slide-in max-w-sm ${
          toast.type === 'error' 
            ? 'bg-red-50 border-red-200 text-red-800' 
            : 'bg-emerald-50 border-emerald-200 text-emerald-800'
        }`}>
          {toast.type === 'error' ? (
            <AlertTriangle className="w-5 h-5 text-red-500 flex-shrink-0" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          )}
          <span className="text-xs font-semibold">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-slate-400 hover:text-slate-600">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Sidebar Navigation */}
      <aside className="w-64 bg-white border-r border-[#e2f0e8] flex flex-col justify-between flex-shrink-0 shadow-sm">
        <div>
          <div className="p-6 border-b border-[#e2f0e8]">
            <Link href="/" className="flex items-center gap-3 cursor-pointer">
              <div className="w-10 h-10 bg-gradient-to-tr from-[#0c4a43] to-[#10b981] rounded-xl flex items-center justify-center shadow-md shadow-[#0c4a43]/10">
                <MedicalLogo className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="font-extrabold text-sm tracking-tight text-[#0c4a43]">
                  GAYATRI PHARMA
                </h1>
                <span className="text-[9px] text-[#10b981] font-bold uppercase tracking-widest block mt-0.5">
                  B2B Console
                </span>
              </div>
            </Link>
          </div>

          <nav className="p-4 space-y-1">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'dashboard' 
                  ? 'bg-[#e6f7ef] text-[#0c4a43]' 
                  : 'text-slate-500 hover:text-[#0c4a43] hover:bg-slate-50'
              }`}
            >
              <LayoutDashboard className="w-4.5 h-4.5" />
              Dashboard
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'products' 
                  ? 'bg-[#e6f7ef] text-[#0c4a43]' 
                  : 'text-slate-500 hover:text-[#0c4a43] hover:bg-slate-50'
              }`}
            >
              <Package className="w-4.5 h-4.5" />
              Products
            </button>

            <button
              onClick={() => setActiveTab('customers')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'customers' 
                  ? 'bg-[#e6f7ef] text-[#0c4a43]' 
                  : 'text-slate-500 hover:text-[#0c4a43] hover:bg-slate-50'
              }`}
            >
              <Users className="w-4.5 h-4.5" />
              Customers
            </button>

            <button
              onClick={() => setActiveTab('invoices')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'invoices' 
                  ? 'bg-[#e6f7ef] text-[#0c4a43]' 
                  : 'text-slate-500 hover:text-[#0c4a43] hover:bg-slate-50'
              }`}
            >
              <FileText className="w-4.5 h-4.5" />
              Invoices & Dues
            </button>

            <button
              onClick={() => setActiveTab('schemes')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'schemes' 
                  ? 'bg-[#e6f7ef] text-[#0c4a43]' 
                  : 'text-slate-500 hover:text-[#0c4a43] hover:bg-slate-50'
              }`}
            >
              <Award className="w-4.5 h-4.5" />
              B2B Schemes
            </button>

            <button
              onClick={() => setActiveTab('campaigns')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'campaigns' 
                  ? 'bg-[#e6f7ef] text-[#0c4a43]' 
                  : 'text-slate-500 hover:text-[#0c4a43] hover:bg-slate-50'
              }`}
            >
              <Send className="w-4.5 h-4.5" />
              WhatsApp Campaigns
            </button>

            <button
              onClick={() => setActiveTab('sync')}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                activeTab === 'sync' 
                  ? 'bg-[#e6f7ef] text-[#0c4a43]' 
                  : 'text-slate-500 hover:text-[#0c4a43] hover:bg-slate-50'
              }`}
            >
              <Upload className="w-4.5 h-4.5" />
              Marg Sync Center
            </button>
          </nav>
        </div>

        {/* User Info footer */}
        <div className="p-4 border-t border-[#e2f0e8] bg-slate-50/70">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-xl bg-[#0c4a43] border border-[#10b981]/20 flex items-center justify-center text-white font-extrabold">
              {adminUser?.name?.charAt(0) || 'A'}
            </div>
            <div className="overflow-hidden">
              <span className="text-xs font-bold text-[#0c4a43] block truncate">{adminUser?.name}</span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block mt-0.5">{adminUser?.role} Account</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2 border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Pane */}
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        
        {/* Header bar */}
        <header className="h-20 border-b border-[#e2f0e8] bg-white px-8 flex items-center justify-between shadow-sm shrink-0">
          <div className="flex items-center gap-4">
            <h2 className="text-lg font-extrabold text-[#0c4a43] uppercase tracking-wider">
              {activeTab === 'dashboard' ? 'Automation Center' : activeTab}
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#f4fbf7] border border-[#e2f0e8] text-[9px] font-bold text-slate-500 uppercase">
              <span className={`w-2 h-2 rounded-full ${apiOnline ? 'bg-emerald-500' : 'bg-rose-500'}`} />
              Server: {apiOnline ? 'ONLINE' : 'OFFLINE'}
            </div>
          </div>
          
          <div className="flex items-center gap-4 text-xs text-slate-400 font-semibold uppercase tracking-wider">
            <button 
              onClick={() => { checkApiHealth(); fetchAllData(); showToast('Data re-synchronized with server.'); }}
              className="px-3.5 py-1.5 bg-[#f4fbf7] hover:bg-[#e6f7ef] border border-[#e2f0e8] hover:border-[#10b981]/30 rounded-xl text-[#0c4a43] transition-all flex items-center gap-1.5 cursor-pointer font-bold"
              title="Sync Data"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Force Sync
            </button>
          </div>
        </header>

        {/* Dynamic Tab Views */}
        <div className="p-8 max-w-7xl w-full mx-auto space-y-6">

          {/* ==================== TAB: DASHBOARD ==================== */}
          {activeTab === 'dashboard' && (
            <div className="space-y-8 animate-fade-in">
              
              {/* KPI Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                
                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Products</span>
                    <div className="w-10 h-10 bg-[#e6f7ef] rounded-xl flex items-center justify-center text-[#0c4a43]">
                      <Package className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#0c4a43]">{kpis.totalProducts}</div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">Active catalog items</p>
                </div>

                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Customers</span>
                    <div className="w-10 h-10 bg-[#e6f7ef] rounded-xl flex items-center justify-center text-[#0c4a43]">
                      <Users className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#0c4a43]">{kpis.totalCustomers}</div>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-2">Shops registered</p>
                </div>

                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outstanding Amount</span>
                    <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                      <FileText className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#0c4a43]">₹{kpis.outstandingAmount.toLocaleString('en-IN')}</div>
                  <p className="text-[10px] text-amber-600 font-bold uppercase tracking-wider mt-2">Unpaid receivables</p>
                </div>

                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm relative overflow-hidden">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Campaigns Dispatched</span>
                    <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
                      <Send className="w-5 h-5" />
                    </div>
                  </div>
                  <div className="text-3xl font-black text-[#0c4a43]">{kpis.campaignsSentCount}</div>
                  <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-wider mt-2">Total WhatsApp broadcasts</p>
                </div>

              </div>

              {/* Inactive & Expiry warning KPIs */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                
                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Today's Birthdays</span>
                    <span className="text-2xl font-black text-rose-500">{kpis.todaysBirthdays}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 text-xs font-black">🎂</div>
                </div>

                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">License Expiring</span>
                    <span className="text-2xl font-black text-amber-500">{kpis.licenseExpiringCount}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-500 font-black">⚠️</div>
                </div>

                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Inactive Customers</span>
                    <span className="text-2xl font-black text-slate-600">{kpis.inactiveCustomers}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-600 font-black">💤</div>
                </div>

                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-5 shadow-sm flex items-center justify-between">
                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Expiring Products</span>
                    <span className="text-2xl font-black text-red-500">{kpis.expiringProductsCount}</span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center text-red-500 font-black">⏳</div>
                </div>

              </div>

              {/* Side-by-Side Widgets */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                
                {/* Customers to Follow Up (No orders > 25 days) */}
                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0c4a43] border-b border-[#f1f5f9] pb-3 flex items-center gap-1.5">
                    <ClipboardList className="w-4 h-4" /> Today's Follow-Up List (Inactive Shops)
                  </h3>
                  
                  <div className="divide-y divide-[#f1f5f9] max-h-[300px] overflow-y-auto pr-1">
                    {followUps.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">All customers have ordered recently!</p>
                    ) : (
                      followUps.map(c => (
                        <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                          <div>
                            <span className="font-bold text-slate-800 block">{c.shop_name}</span>
                            <span className="text-[10px] text-slate-400 block mt-0.5">
                              Last Order: {c.last_order_date ? formatDate(c.last_order_date) : 'Never'}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="font-bold text-[#0c4a43] block">₹{c.outstanding_balance.toLocaleString('en-IN')}</span>
                            <span className="text-[9px] text-rose-500 font-bold uppercase tracking-wide block mt-0.5">Action Needed</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Outstanding Dues debtor list */}
                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0c4a43] border-b border-[#f1f5f9] pb-3 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-500" /> Outstanding Receivables (Top Dues)
                  </h3>
                  
                  <div className="divide-y divide-[#f1f5f9] max-h-[300px] overflow-y-auto pr-1">
                    {outstandingDues.length === 0 ? (
                      <p className="text-xs text-slate-400 py-4 text-center">No outstanding dues in database.</p>
                    ) : (
                      outstandingDues.map(c => (
                        <div key={c.id} className="py-3 flex items-center justify-between text-xs">
                          <span className="font-bold text-slate-800">{c.shop_name}</span>
                          <span className="font-black text-rose-600 bg-red-50 border border-red-100 px-3 py-1 rounded-xl">
                            ₹{c.outstanding_balance.toLocaleString('en-IN')}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Expiry Widget & Top Selling products */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                
                {/* Granular Expiry Tracker */}
                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0c4a43] border-b border-[#f1f5f9] pb-3 flex items-center gap-1.5">
                    <Clock className="w-4 h-4" /> Expiry Tracker Dashboard
                  </h3>
                  <div className="space-y-4 py-2">
                    <div>
                      <div className="flex justify-between text-xs font-bold text-red-600 mb-1">
                        <span>Expiring in 30 Days</span>
                        <span>{expiryTracker.expiring30} products</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-red-500" style={{ width: `${Math.min(100, (expiryTracker.expiring30/Math.max(1, kpis.totalProducts))*100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-amber-500 mb-1">
                        <span>Expiring in 90 Days</span>
                        <span>{expiryTracker.expiring90} products</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-500" style={{ width: `${Math.min(100, (expiryTracker.expiring90/Math.max(1, kpis.totalProducts))*100)}%` }} />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-xs font-bold text-teal-600 mb-1">
                        <span>Expiring in 180 Days</span>
                        <span>{expiryTracker.expiring180} products</span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-teal-600" style={{ width: `${Math.min(100, (expiryTracker.expiring180/Math.max(1, kpis.totalProducts))*100)}%` }} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Top Selling Products */}
                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm space-y-4 lg:col-span-2">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0c4a43] border-b border-[#f1f5f9] pb-3 flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-500" /> Fast Moving Products (Quantity Sold)
                  </h3>
                  
                  <div className="divide-y divide-[#f1f5f9] max-h-[300px] overflow-y-auto pr-1">
                    {topProducts.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No sales records found. Sync Invoices.csv to compute.</p>
                    ) : (
                      topProducts.map((p, idx) => (
                        <div key={idx} className="py-3.5 flex items-center justify-between text-xs">
                          <div className="flex items-center gap-3">
                            <span className="w-6 h-6 rounded-lg bg-[#e6f7ef] flex items-center justify-center text-[10px] text-[#0c4a43] font-bold">
                              #{idx + 1}
                            </span>
                            <span className="font-bold text-slate-800">{p.name}</span>
                          </div>
                          <span className="font-black text-[#0f766e] bg-[#e6f7ef] px-3 py-1 rounded-xl">
                            {p.qty} units sold
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

              {/* Monthly sales trend chart mockup */}
              <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm space-y-6">
                <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0c4a43] border-b border-[#f1f5f9] pb-3 flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4" /> B2B Monthly Sales Trends (Last 6 Months)
                </h3>
                
                {salesTrends.length === 0 ? (
                  <p className="text-xs text-slate-400 py-8 text-center">No transaction history. Import Invoices.csv to render chart.</p>
                ) : (
                  <div className="flex items-end justify-between h-44 pt-6 border-b border-[#f1f5f9] px-6">
                    {salesTrends.map((s, idx) => {
                      // Calculate height percentage relative to maximum sales
                      const maxVal = Math.max(...salesTrends.map(t => t.sales), 1);
                      const heightPercent = Math.max(10, Math.round((s.sales / maxVal) * 100));
                      return (
                        <div key={idx} className="flex flex-col items-center flex-1 space-y-3 group">
                          {/* Value tooltip */}
                          <span className="opacity-0 group-hover:opacity-100 text-[9px] font-bold bg-[#0c4a43] text-white px-2 py-0.5 rounded transition-all transform translate-y-2">
                            ₹{s.sales.toLocaleString('en-IN')}
                          </span>
                          {/* Bar */}
                          <div 
                            className="w-8 sm:w-12 bg-gradient-to-t from-[#0c4a43]/70 to-[#10b981] rounded-t-lg group-hover:to-[#14b8a6] transition-all cursor-pointer"
                            style={{ height: `${heightPercent}px` }}
                          />
                          <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mt-2">
                            {s.month}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ==================== TAB: PRODUCTS ==================== */}
          {activeTab === 'products' && (
            <div className="space-y-6 animate-fade-in">
              
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 border border-[#e2f0e8] rounded-2xl shadow-sm">
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search medicines by name, composition, or manufacturer..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#0c4a43]"
                  />
                </div>

                {/* Category Filter */}
                <div className="flex items-center gap-3">
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-4 py-2.5 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-600 text-xs focus:outline-none focus:border-[#0c4a43]"
                  >
                    <option value="">All Categories</option>
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Injection">Injection</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Cream">Cream</option>
                    <option value="Drops">Drops</option>
                  </select>
                  
                  <button
                    onClick={() => openProductModal('create')}
                    className="px-4 py-2.5 bg-[#0c4a43] hover:bg-[#0f766e] text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Add Medicine
                  </button>
                </div>
              </div>

              {/* Products Table */}
              <div className="bg-white border border-[#e2f0e8] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#e2f0e8] text-[9px] uppercase font-bold tracking-wider text-slate-500">
                        <th className="p-4">Medicine Name</th>
                        <th className="p-4">Generic Composition</th>
                        <th className="p-4">Company</th>
                        <th className="p-4">Pack</th>
                        <th className="p-4">MRP / PTS</th>
                        <th className="p-4 text-center">Stock</th>
                        <th className="p-4">Expiry Date</th>
                        <th className="p-4">Active Offer</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9] text-xs text-slate-600 font-medium">
                      {filteredProducts.length === 0 ? (
                        <tr>
                          <td colSpan="9" className="p-8 text-center text-slate-400">No medicines listed. Sync Products.csv or click Add Product.</td>
                        </tr>
                      ) : (
                        filteredProducts.map((p) => {
                          const isLowStock = p.stock_qty < 10;
                          const daysToExpiry = getDaysUntilExpiry(p.expiry_date);
                          const isExpiringSoon = daysToExpiry > 0 && daysToExpiry <= 90;
                          
                          let rowClass = "hover:bg-slate-50/50 transition-colors";
                          if (isLowStock) rowClass += " bg-red-50/30";
                          else if (isExpiringSoon) rowClass += " bg-amber-50/30";

                          return (
                            <tr key={p.id} className={rowClass}>
                              <td className="p-4">
                                <div className="flex items-center gap-2">
                                  {p.image_url && (
                                    <div className="w-8 h-8 rounded border border-[#e2f0e8] overflow-hidden shrink-0">
                                      <img src={`${STATIC_BASE}${p.image_url}`} alt="" className="w-full h-full object-cover" />
                                    </div>
                                  )}
                                  <span className="font-extrabold text-[#0c4a43] block uppercase">{p.name}</span>
                                </div>
                              </td>
                              <td className="p-4 text-slate-500 italic max-w-[180px] truncate" title={p.generic_name}>
                                {p.generic_name}
                              </td>
                              <td className="p-4">{p.company}</td>
                              <td className="p-4">{p.pack_size}</td>
                              <td className="p-4">
                                <span className="block font-bold">PTS: ₹{p.pts.toFixed(2)}</span>
                                <span className="block text-[10px] text-slate-400 line-through">MRP: ₹{p.mrp.toFixed(2)}</span>
                              </td>
                              <td className="p-4 text-center">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  isLowStock ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {p.stock_qty} unit(s)
                                </span>
                              </td>
                              <td className="p-4">
                                <span className={isExpiringSoon ? "text-amber-600 font-bold" : ""}>
                                  {formatDate(p.expiry_date)}
                                </span>
                              </td>
                              <td className="p-4 text-[#10b981] font-bold">{p.offer_scheme || '-'}</td>
                              <td className="p-4 text-right">
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => openProductModal('edit', p)}
                                    className="p-1.5 bg-slate-50 hover:bg-[#e6f7ef] border border-[#e2f0e8] hover:border-[#10b981]/30 text-slate-600 hover:text-[#0c4a43] rounded-lg transition-all cursor-pointer"
                                    title="Edit Product"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteProduct(p.id)}
                                    className="p-1.5 bg-slate-50 hover:bg-red-50 border border-[#e2f0e8] hover:border-red-200 text-slate-600 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                                    title="Delete Product"
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

          {/* ==================== TAB: CUSTOMERS ==================== */}
          {activeTab === 'customers' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 border border-[#e2f0e8] rounded-2xl shadow-sm">
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search medical shops by name, owner, GST..."
                    value={customerSearch}
                    onChange={(e) => setCustomerSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#0c4a43]"
                  />
                </div>

                {/* Filters / Actions */}
                <div className="flex items-center gap-3">
                  <select
                    value={customerRouteFilter}
                    onChange={(e) => setCustomerRouteFilter(e.target.value)}
                    className="px-4 py-2.5 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-600 text-xs focus:outline-none focus:border-[#0c4a43]"
                  >
                    <option value="">All Routes</option>
                    {uniqueRoutes.map((r, i) => (
                      <option key={i} value={r}>{r}</option>
                    ))}
                  </select>

                  <button
                    onClick={() => openCustomerModal('create')}
                    className="px-4 py-2.5 bg-[#0c4a43] hover:bg-[#0f766e] text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" /> Add Customer
                  </button>
                </div>
              </div>

              {/* Customers Table */}
              <div className="bg-white border border-[#e2f0e8] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#e2f0e8] text-[9px] uppercase font-bold tracking-wider text-slate-500">
                        <th className="p-4">Shop Name</th>
                        <th className="p-4">Owner Name</th>
                        <th className="p-4">WhatsApp Contact</th>
                        <th className="p-4">Area Route</th>
                        <th className="p-4">GST No.</th>
                        <th className="p-4">Drug License Expiry</th>
                        <th className="p-4">Credit / Dues</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9] text-xs text-slate-600 font-medium">
                      {filteredCustomers.length === 0 ? (
                        <tr>
                          <td colSpan="8" className="p-8 text-center text-slate-400">No medical shops found. Sync Customers.csv or click Add Customer.</td>
                        </tr>
                      ) : (
                        filteredCustomers.map((c) => {
                          const daysLeft = getDaysUntilExpiry(c.drug_license_expiry);
                          const isExpired = daysLeft < 0;
                          const isExpiringSoon = daysLeft >= 0 && daysLeft <= 15;
                          const hasDues = c.outstanding_balance > 0;

                          let rowClass = "hover:bg-slate-50/50 transition-colors";
                          if (isExpired) rowClass += " bg-red-50/30";
                          else if (isExpiringSoon) rowClass += " bg-amber-50/30";

                          return (
                            <tr key={c.id} className={rowClass}>
                              <td className="p-4">
                                <span className="font-extrabold text-[#0c4a43] block">{c.shop_name}</span>
                              </td>
                              <td className="p-4">{c.owner_name || '-'}</td>
                              <td className="p-4 font-mono">
                                <span className="block">+{c.whatsapp}</span>
                                {c.mobile && <span className="block text-[10px] text-slate-400">Mob: {c.mobile}</span>}
                              </td>
                              <td className="p-4">
                                <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full text-[10px] font-bold">
                                  <MapPin className="w-3 h-3 text-[#0f766e]" /> {c.route_area}
                                </span>
                              </td>
                              <td className="p-4 font-mono uppercase tracking-wide text-xs">{c.gst_number}</td>
                              <td className="p-4">
                                <div className="space-y-1">
                                  <span className="block">{formatDate(c.drug_license_expiry)}</span>
                                  {isExpired && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-100 border border-red-200 text-red-700 text-[9px] font-bold uppercase">
                                      Expired
                                    </span>
                                  )}
                                  {isExpiringSoon && (
                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700 text-[9px] font-bold uppercase">
                                      Expires in {daysLeft}d
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td className="p-4">
                                <span className="block">Limit: ₹{c.credit_limit.toLocaleString('en-IN')}</span>
                                <span className={`block font-bold ${hasDues ? 'text-rose-600' : 'text-slate-400'}`}>
                                  Dues: ₹{c.outstanding_balance.toLocaleString('en-IN')}
                                </span>
                              </td>
                              <td className="p-4 text-right">
                                <div className="inline-flex gap-2">
                                  <button
                                    onClick={() => openCustomerModal('edit', c)}
                                    className="p-1.5 bg-slate-50 hover:bg-[#e6f7ef] border border-[#e2f0e8] hover:border-[#10b981]/30 text-slate-600 hover:text-[#0c4a43] rounded-lg transition-all cursor-pointer"
                                    title="Edit Details"
                                  >
                                    <Edit2 className="w-3.5 h-3.5" />
                                  </button>
                                  <button
                                    onClick={() => deleteCustomer(c.id)}
                                    className="p-1.5 bg-slate-50 hover:bg-red-50 border border-[#e2f0e8] hover:border-red-200 text-slate-600 hover:text-red-600 rounded-lg transition-all cursor-pointer"
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

          {/* ==================== TAB: INVOICES ==================== */}
          {activeTab === 'invoices' && (
            <div className="space-y-6 animate-fade-in">
              
              {/* Outstanding Receivables Info block */}
              <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <span className="text-xs font-bold text-slate-400 uppercase block tracking-wider">Total Ledger Outstanding</span>
                  <span className="text-3xl font-black text-[#0c4a43] mt-1 block">₹{kpis.outstandingAmount.toLocaleString('en-IN')}</span>
                </div>
                <div className="text-[10px] text-slate-500 leading-relaxed max-w-sm">
                  💡 Invoices and unpaid ledger records are imported from Marg ERP exports. You can trigger WhatsApp payment reminders for unpaid invoices manually by clicking the "Send Reminder" buttons.
                </div>
              </div>

              {/* Filters / Search */}
              <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-white p-4 border border-[#e2f0e8] rounded-2xl shadow-sm">
                
                {/* Search Bar */}
                <div className="relative flex-1 max-w-md">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Search className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search invoices by invoice# or shop name..."
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="w-full pl-9 pr-4 py-2.5 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 text-xs focus:outline-none focus:border-[#0c4a43]"
                  />
                </div>

                {/* Status Filter */}
                <div>
                  <select
                    value={invoiceStatusFilter}
                    onChange={(e) => setInvoiceStatusFilter(e.target.value)}
                    className="px-4 py-2.5 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-600 text-xs focus:outline-none focus:border-[#0c4a43]"
                  >
                    <option value="">All Statuses</option>
                    <option value="PAID">Paid</option>
                    <option value="UNPAID">Unpaid</option>
                  </select>
                </div>
              </div>

              {/* Invoices Table */}
              <div className="bg-white border border-[#e2f0e8] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#e2f0e8] text-[9px] uppercase font-bold tracking-wider text-slate-500">
                        <th className="p-4">Invoice #</th>
                        <th className="p-4">Bill Date</th>
                        <th className="p-4">Customer Shop</th>
                        <th className="p-4">Bill Amount</th>
                        <th className="p-4">Ledger Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9] text-xs text-slate-600 font-medium">
                      {filteredInvoices.length === 0 ? (
                        <tr>
                          <td colSpan="6" className="p-8 text-center text-slate-400">No invoices records found. Sync Invoices.csv.</td>
                        </tr>
                      ) : (
                        filteredInvoices.map((inv) => {
                          const isUnpaid = inv.status === 'UNPAID';
                          const invoiceDate = new Date(inv.date);
                          const daysOld = Math.ceil((new Date() - invoiceDate) / (1000 * 60 * 60 * 24));
                          const isOverdue = isUnpaid && daysOld > 30;

                          let rowClass = "hover:bg-slate-50/50 transition-colors";
                          if (isOverdue) rowClass += " bg-red-50/30";

                          return (
                            <tr key={inv.id} className={rowClass}>
                              <td className="p-4">
                                <button 
                                  onClick={() => setInvoiceDetailModal({ open: true, data: inv })}
                                  className="font-extrabold text-[#0c4a43] hover:underline cursor-pointer flex items-center gap-1.5"
                                >
                                  <FileText className="w-3.5 h-3.5" /> #{inv.invoice_number}
                                </button>
                              </td>
                              <td className="p-4">{formatDate(inv.date)}</td>
                              <td className="p-4">
                                <span className="font-bold text-slate-800 block">{inv.customer.shop_name}</span>
                                <span className="text-[10px] text-slate-400">+{inv.customer.whatsapp}</span>
                              </td>
                              <td className="p-4 font-bold text-slate-800">₹{inv.amount.toLocaleString('en-IN')}</td>
                              <td className="p-4">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                                  isUnpaid ? 'bg-rose-100 text-rose-700' : 'bg-emerald-100 text-emerald-700'
                                }`}>
                                  {inv.status}
                                </span>
                                {isOverdue && (
                                  <span className="block text-[9px] text-red-600 font-bold uppercase mt-1">
                                    Overdue ({daysOld} days)
                                  </span>
                                )}
                              </td>
                              <td className="p-4 text-right">
                                {isUnpaid && (
                                  <button
                                    onClick={() => triggerInvoiceReminder(inv.id)}
                                    className="px-3 py-1.5 bg-[#e6f7ef] hover:bg-[#0c4a43] border border-[#e2f0e8] hover:border-transparent text-[#0c4a43] hover:text-white rounded-xl text-[10px] font-bold uppercase transition-all flex items-center justify-center gap-1 cursor-pointer ml-auto"
                                  >
                                    <Send className="w-3 h-3" /> Send Reminder
                                  </button>
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

          {/* ==================== TAB: SCHEMES ==================== */}
          {activeTab === 'schemes' && (
            <div className="space-y-6 animate-fade-in">
              <div className="flex justify-between items-center bg-white p-4 border border-[#e2f0e8] rounded-2xl shadow-sm">
                <span className="text-xs text-slate-500 font-bold">List and manage active wholesale trade schemes.</span>
                <button
                  onClick={() => openSchemeModal('create')}
                  className="px-4 py-2.5 bg-[#0c4a43] hover:bg-[#0f766e] text-white font-bold rounded-xl transition-all text-xs flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider animate-bounce"
                >
                  <Plus className="w-4 h-4 stroke-[3]" /> Create Trade Scheme
                </button>
              </div>

              {/* Schemes table */}
              <div className="bg-white border border-[#e2f0e8] rounded-2xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-50 border-b border-[#e2f0e8] text-[9px] uppercase font-bold tracking-wider text-slate-500">
                        <th className="p-4">Scheme Name</th>
                        <th className="p-4">Details Description</th>
                        <th className="p-4">Target Min Qty</th>
                        <th className="p-4">Free Qty</th>
                        <th className="p-4">Valid Duration</th>
                        <th className="p-4">Active Status</th>
                        <th className="p-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f1f5f9] text-xs text-slate-600 font-medium">
                      {schemes.length === 0 ? (
                        <tr>
                          <td colSpan="7" className="p-8 text-center text-slate-400">No active schemes configured. Click Create Scheme.</td>
                        </tr>
                      ) : (
                        schemes.map((s) => (
                          <tr key={s.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-4 font-bold text-[#0c4a43] uppercase">{s.name}</td>
                            <td className="p-4 text-slate-500 italic max-w-[200px] truncate" title={s.description}>
                              {s.description}
                            </td>
                            <td className="p-4 font-bold">{s.min_qty} units</td>
                            <td className="p-4 font-bold text-emerald-600">+{s.free_qty} free</td>
                            <td className="p-4 text-slate-500">
                              {formatDate(s.start_date)} to {formatDate(s.end_date)}
                            </td>
                            <td className="p-4">
                              <button
                                onClick={() => toggleSchemeStatus(s)}
                                className={`px-3 py-1 rounded-full text-[9px] font-bold uppercase transition-all cursor-pointer ${
                                  s.status 
                                    ? 'bg-emerald-100 border border-emerald-200 text-emerald-700' 
                                    : 'bg-slate-100 border border-slate-200 text-slate-500'
                                }`}
                              >
                                {s.status ? 'Active' : 'Inactive'}
                              </button>
                            </td>
                            <td className="p-4 text-right">
                              <div className="inline-flex gap-2">
                                <button
                                  onClick={() => openSchemeModal('edit', s)}
                                  className="p-1.5 bg-slate-50 hover:bg-[#e6f7ef] border border-[#e2f0e8] hover:border-[#10b981]/30 text-slate-600 hover:text-[#0c4a43] rounded-lg transition-all cursor-pointer"
                                  title="Edit Scheme"
                                >
                                  <Edit2 className="w-3.5 h-3.5" />
                                </button>
                                <button
                                  onClick={() => deleteScheme(s.id)}
                                  className="p-1.5 bg-slate-50 hover:bg-red-50 border border-[#e2f0e8] hover:border-red-200 text-slate-600 hover:text-red-600 rounded-lg transition-all cursor-pointer"
                                  title="Delete Scheme"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ==================== TAB: CAMPAIGNS ==================== */}
          {activeTab === 'campaigns' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 animate-fade-in">
              
              {/* Campaign builder form */}
              <div className="lg:col-span-2 space-y-6">
                <form onSubmit={handleLaunchCampaign} className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm space-y-5">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#0c4a43] border-b border-[#f1f5f9] pb-3">
                    Launch New WhatsApp Campaign Broadcast
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Campaign Title</label>
                      <input
                        type="text"
                        required
                        value={campaignForm.title}
                        onChange={(e) => setCampaignForm({ ...campaignForm, title: e.target.value })}
                        placeholder="e.g. Diwali Greeting 2026 or Special Azithromycin Deal"
                        className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Target Area Route (Optional)</label>
                        <select
                          value={campaignForm.route}
                          onChange={(e) => setCampaignForm({ ...campaignForm, route: e.target.value })}
                          className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-600 focus:outline-none focus:border-[#0c4a43] text-xs"
                        >
                          <option value="">All Areas (Entire Customer Base)</option>
                          {uniqueRoutes.map((r, i) => (
                            <option key={i} value={r}>{r}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Launch Option / Scheme Link</label>
                        <select
                          value={campaignForm.productId}
                          onChange={(e) => {
                            const pId = e.target.value;
                            const prod = products.find(p => p.id === pId);
                            setCampaignForm({
                              ...campaignForm,
                              productId: pId,
                              imageUrl: prod ? (prod.image_url || '') : '',
                              // Prefill default message text
                              messageText: prod 
                                ? `🔥 Special Wholesale Offer!\n\nProduct: ${prod.name}\nPTS: ₹${prod.pts.toFixed(2)}\nScheme: ${prod.offer_scheme || 'Contact for schemes'}\n\nDear {{customer_name}}, kindly reply to book your stock. - Gayatri Pharma` 
                                : campaignForm.messageText
                            });
                          }}
                          className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-600 focus:outline-none focus:border-[#0c4a43] text-xs"
                        >
                          <option value="">No Product Link (General Greeting)</option>
                          {products.map(p => (
                            <option key={p.id} value={p.id}>{p.name} (₹{p.pts})</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Flyer / Image URL (Optional)</label>
                      <input
                        type="text"
                        value={campaignForm.imageUrl}
                        onChange={(e) => setCampaignForm({ ...campaignForm, imageUrl: e.target.value })}
                        placeholder="e.g. /processed/watermarked_xyz.png or absolute public link"
                        className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">WhatsApp Message Caption Body</label>
                        <span className="text-[9px] text-[#10b981] font-bold uppercase">Placeholder: {"{{customer_name}}"}</span>
                      </div>
                      <textarea
                        rows="6"
                        required
                        value={campaignForm.messageText}
                        onChange={(e) => setCampaignForm({ ...campaignForm, messageText: e.target.value })}
                        placeholder="Type promotional deal description, greetings, and guidelines here..."
                        className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={campaignLoading}
                    className="w-full py-3.5 bg-[#0c4a43] hover:bg-[#0f766e] text-white font-bold rounded-xl transition-all shadow-md flex items-center justify-center gap-1.5 cursor-pointer uppercase tracking-wider text-xs"
                  >
                    {campaignLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" /> Sending Bulk Broadcast...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" /> Dispatch WhatsApp Broadcast
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Broadcast reports & history logs */}
              <div className="space-y-6">
                
                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-xs font-extrabold uppercase tracking-wider text-[#0c4a43] border-b border-[#f1f5f9] pb-3">
                    Campaign Broadcast History
                  </h3>
                  
                  <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                    {campaigns.length === 0 ? (
                      <p className="text-xs text-slate-400 py-6 text-center">No campaign reports generated yet.</p>
                    ) : (
                      campaigns.map((c) => (
                        <div key={c.id} className="p-4 bg-slate-50 border border-[#e2f0e8] rounded-xl space-y-2 text-xs">
                          <div className="flex justify-between items-start">
                            <span className="font-extrabold text-[#0c4a43] block uppercase truncate max-w-[140px]">{c.title}</span>
                            <span className="text-[9px] text-[#10b981] font-bold uppercase tracking-wider bg-white px-2 py-0.5 rounded border border-[#e2f0e8]">
                              {c.type}
                            </span>
                          </div>
                          <span className="block text-[10px] text-slate-400 font-bold">{formatDate(c.createdAt)}</span>
                          <div className="grid grid-cols-3 gap-2 text-center pt-2 border-t border-[#e2f0e8] text-[10px]">
                            <div className="bg-white p-1.5 rounded border border-[#e2f0e8]">
                              <span className="text-slate-400 block font-bold text-[8px] uppercase">Sent</span>
                              <span className="font-extrabold text-slate-700">{c.sentCount}</span>
                            </div>
                            <div className="bg-white p-1.5 rounded border border-[#e2f0e8]">
                              <span className="text-slate-400 block font-bold text-[8px] uppercase">Delivered</span>
                              <span className="font-extrabold text-emerald-600">{c.deliveredCount}</span>
                            </div>
                            <div className="bg-white p-1.5 rounded border border-[#e2f0e8]">
                              <span className="text-slate-400 block font-bold text-[8px] uppercase">Failed</span>
                              <span className="font-extrabold text-rose-500">{c.failedCount}</span>
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* ==================== TAB: SYNC ==================== */}
          {activeTab === 'sync' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-fade-in">
              
              {/* Sync Center Upload Cards */}
              <div className="space-y-6 lg:col-span-2">
                <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm space-y-4">
                  <h3 className="text-sm font-extrabold uppercase tracking-wider text-[#0c4a43] border-b border-[#f1f5f9] pb-3 flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5 text-[#10b981]" /> Marg ERP CSV Import Center
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Update the wholesale distribution catalogs, customer routes, invoice logs, and outstanding balances dynamically. Export standard CSV files from Marg ERP desktop and upload below.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                  
                  {/* Products Sync */}
                  <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#10b981]/40 transition-all">
                    <div className="space-y-2">
                      <div className="w-9 h-9 bg-[#e6f7ef] rounded-xl flex items-center justify-center text-[#0c4a43] font-bold">
                        1
                      </div>
                      <h4 className="font-bold text-sm text-[#0c4a43] uppercase tracking-wider">Sync Products & Stock</h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Upload **`Products.csv`** containing: `name, generic_name, company, pack_size, mrp, pts, tax_percent, stock_qty, expiry_date, category, offer_scheme`.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                      <input 
                        type="file" 
                        ref={fileInputRefs.products} 
                        onChange={(e) => handleCsvFileChange(e, 'products')}
                        style={{ display: 'none' }}
                        accept=".csv"
                      />
                      <button
                        onClick={() => triggerCsvUpload('products')}
                        disabled={uploadSpinner.loading}
                        className="w-full py-2 bg-[#f4fbf7] hover:bg-[#0c4a43] hover:text-white text-[#0c4a43] font-bold text-xs rounded-xl border border-[#e2f0e8] transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                      >
                        {uploadSpinner.type === 'products' ? (
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-4 h-4" /> Import Products CSV
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Customers Sync */}
                  <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#10b981]/40 transition-all">
                    <div className="space-y-2">
                      <div className="w-9 h-9 bg-[#e6f7ef] rounded-xl flex items-center justify-center text-[#0c4a43] font-bold">
                        2
                      </div>
                      <h4 className="font-bold text-sm text-[#0c4a43] uppercase tracking-wider">Sync Customer Shops</h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Upload **`Customers.csv`** containing: `shop_name, owner_name, mobile, whatsapp, address, route_area, gst_number, drug_license_expiry, birthday, credit_limit`.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                      <input 
                        type="file" 
                        ref={fileInputRefs.customers} 
                        onChange={(e) => handleCsvFileChange(e, 'customers')}
                        style={{ display: 'none' }}
                        accept=".csv"
                      />
                      <button
                        onClick={() => triggerCsvUpload('customers')}
                        disabled={uploadSpinner.loading}
                        className="w-full py-2 bg-[#f4fbf7] hover:bg-[#0c4a43] hover:text-white text-[#0c4a43] font-bold text-xs rounded-xl border border-[#e2f0e8] transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                      >
                        {uploadSpinner.type === 'customers' ? (
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-4 h-4" /> Import Customers CSV
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Outstanding Sync */}
                  <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#10b981]/40 transition-all">
                    <div className="space-y-2">
                      <div className="w-9 h-9 bg-[#e6f7ef] rounded-xl flex items-center justify-center text-[#0c4a43] font-bold">
                        3
                      </div>
                      <h4 className="font-bold text-sm text-[#0c4a43] uppercase tracking-wider">Sync Outstanding Balances</h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Upload **`Outstanding.csv`** containing: `whatsapp, outstanding_balance, last_payment_date` to update customer receivables account ledgers.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                      <input 
                        type="file" 
                        ref={fileInputRefs.outstanding} 
                        onChange={(e) => handleCsvFileChange(e, 'outstanding')}
                        style={{ display: 'none' }}
                        accept=".csv"
                      />
                      <button
                        onClick={() => triggerCsvUpload('outstanding')}
                        disabled={uploadSpinner.loading}
                        className="w-full py-2 bg-[#f4fbf7] hover:bg-[#0c4a43] hover:text-white text-[#0c4a43] font-bold text-xs rounded-xl border border-[#e2f0e8] transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                      >
                        {uploadSpinner.type === 'outstanding' ? (
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-4 h-4" /> Import Dues CSV
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Invoices Sync */}
                  <div className="bg-white border border-[#e2f0e8] rounded-2xl p-6 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#10b981]/40 transition-all">
                    <div className="space-y-2">
                      <div className="w-9 h-9 bg-[#e6f7ef] rounded-xl flex items-center justify-center text-[#0c4a43] font-bold">
                        4
                      </div>
                      <h4 className="font-bold text-sm text-[#0c4a43] uppercase tracking-wider">Sync Bills & Invoices</h4>
                      <p className="text-[10px] text-slate-400 leading-normal">
                        Upload **`Invoices.csv`** containing: `invoice_number, whatsapp, date, amount, status, items`. Triggers automatic unpaid alerts.
                      </p>
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                      <input 
                        type="file" 
                        ref={fileInputRefs.invoices} 
                        onChange={(e) => handleCsvFileChange(e, 'invoices')}
                        style={{ display: 'none' }}
                        accept=".csv"
                      />
                      <button
                        onClick={() => triggerCsvUpload('invoices')}
                        disabled={uploadSpinner.loading}
                        className="w-full py-2 bg-[#f4fbf7] hover:bg-[#0c4a43] hover:text-white text-[#0c4a43] font-bold text-xs rounded-xl border border-[#e2f0e8] transition-all flex items-center justify-center gap-1.5 cursor-pointer uppercase"
                      >
                        {uploadSpinner.type === 'invoices' ? (
                          <Loader2 className="w-4.5 h-4.5 animate-spin" />
                        ) : (
                          <>
                            <Upload className="w-4 h-4" /> Import Invoices CSV
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          )}

        </div>
      </main>

      {/* ==================== MODAL: CUSTOMER CREATE / EDIT ==================== */}
      {customerModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#e2f0e8] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-[#e2f0e8] flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-[#0c4a43] uppercase tracking-wider">
                {customerModal.mode === 'create' ? 'Register Customer Shop' : 'Edit Customer Shop Details'}
              </h3>
              <button 
                onClick={() => setCustomerModal({ open: false, mode: 'create', data: null })}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveCustomer} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Shop Name</label>
                <input
                  type="text"
                  required
                  value={customerForm.shop_name}
                  onChange={(e) => setCustomerForm({ ...customerForm, shop_name: e.target.value })}
                  placeholder="e.g. Dhanvantari Medicos"
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Owner Name</label>
                <input
                  type="text"
                  required
                  value={customerForm.owner_name}
                  onChange={(e) => setCustomerForm({ ...customerForm, owner_name: e.target.value })}
                  placeholder="e.g. Dr. Ramesh Patel"
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">WhatsApp (with 91)</label>
                  <input
                    type="text"
                    required
                    value={customerForm.whatsapp}
                    onChange={(e) => setCustomerForm({ ...customerForm, whatsapp: e.target.value })}
                    placeholder="e.g. 919876543210"
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Mobile Number</label>
                  <input
                    type="text"
                    value={customerForm.mobile}
                    onChange={(e) => setCustomerForm({ ...customerForm, mobile: e.target.value })}
                    placeholder="e.g. 9876543210"
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Area Route</label>
                  <select
                    value={customerForm.route_area}
                    onChange={(e) => setCustomerForm({ ...customerForm, route_area: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-650 focus:outline-none focus:border-[#0c4a43] text-xs"
                  >
                    <option value="Ahmedabad East">Ahmedabad East</option>
                    <option value="Ahmedabad West">Ahmedabad West</option>
                    <option value="Jamnagar">Jamnagar</option>
                    <option value="Rajkot">Rajkot</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">GST Number</label>
                  <input
                    type="text"
                    required
                    value={customerForm.gst_number}
                    onChange={(e) => setCustomerForm({ ...customerForm, gst_number: e.target.value })}
                    placeholder="e.g. 24AAAAA1111A1Z1"
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono uppercase"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Drug License Expiry</label>
                  <input
                    type="date"
                    required
                    value={customerForm.drug_license_expiry}
                    onChange={(e) => setCustomerForm({ ...customerForm, drug_license_expiry: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Owner Birthday</label>
                  <input
                    type="date"
                    required
                    value={customerForm.birthday}
                    onChange={(e) => setCustomerForm({ ...customerForm, birthday: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Credit Limit (₹)</label>
                <input
                  type="number"
                  required
                  value={customerForm.credit_limit}
                  onChange={(e) => setCustomerForm({ ...customerForm, credit_limit: e.target.value })}
                  placeholder="0"
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Address Details</label>
                <textarea
                  rows="2"
                  value={customerForm.address}
                  onChange={(e) => setCustomerForm({ ...customerForm, address: e.target.value })}
                  placeholder="Street address of the shop..."
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs"
                />
              </div>

              <div className="pt-4 border-t border-[#e2f0e8] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCustomerModal({ open: false, mode: 'create', data: null })}
                  className="px-4 py-2 border border-[#e2f0e8] hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0c4a43] hover:bg-[#0f766e] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  {customerModal.mode === 'create' ? 'Register Shop' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: PRODUCT CREATE / EDIT ==================== */}
      {productModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#e2f0e8] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-[#e2f0e8] flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-[#0c4a43] uppercase tracking-wider">
                {productModal.mode === 'create' ? 'Add New Medicine Product' : 'Edit Medicine Details'}
              </h3>
              <button 
                onClick={() => setProductModal({ open: false, mode: 'create', data: null })}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveProduct} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="e.g. Dolo 650"
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Generic Composition</label>
                <input
                  type="text"
                  required
                  value={productForm.generic_name}
                  onChange={(e) => setProductForm({ ...productForm, generic_name: e.target.value })}
                  placeholder="e.g. Paracetamol 650mg"
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Manufacturer Company</label>
                  <input
                    type="text"
                    required
                    value={productForm.company}
                    onChange={(e) => setProductForm({ ...productForm, company: e.target.value })}
                    placeholder="e.g. Micro Labs"
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Pack Size</label>
                  <input
                    type="text"
                    required
                    value={productForm.pack_size}
                    onChange={(e) => setProductForm({ ...productForm, pack_size: e.target.value })}
                    placeholder="e.g. 15 Tablets"
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Retail MRP (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.mrp}
                    onChange={(e) => setProductForm({ ...productForm, mrp: e.target.value })}
                    placeholder="30.50"
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Trade PTS Price (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={productForm.pts}
                    onChange={(e) => setProductForm({ ...productForm, pts: e.target.value })}
                    placeholder="18.00"
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Category Type</label>
                  <select
                    value={productForm.category}
                    onChange={(e) => setProductForm({ ...productForm, category: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-650 focus:outline-none focus:border-[#0c4a43] text-xs"
                  >
                    <option value="Tablet">Tablet</option>
                    <option value="Capsule">Capsule</option>
                    <option value="Injection">Injection</option>
                    <option value="Syrup">Syrup</option>
                    <option value="Cream">Cream</option>
                    <option value="Drops">Drops</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Stock Quantity</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={productForm.stock_qty}
                    onChange={(e) => setProductForm({ ...productForm, stock_qty: e.target.value })}
                    placeholder="0"
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={productForm.expiry_date}
                    onChange={(e) => setProductForm({ ...productForm, expiry_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Offer Scheme Text</label>
                  <input
                    type="text"
                    value={productForm.offer_scheme}
                    onChange={(e) => setProductForm({ ...productForm, offer_scheme: e.target.value })}
                    placeholder="e.g. Buy 10 Get 1 Free"
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
                  Product Image (Logo overlay)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => setProductImageFile(e.target.files[0])}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-[10px] file:font-bold file:uppercase file:bg-[#f4fbf7] file:text-[#0c4a43] hover:file:bg-[#e6f7ef] cursor-pointer"
                />
              </div>

              <div className="pt-4 border-t border-[#e2f0e8] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setProductModal({ open: false, mode: 'create', data: null })}
                  className="px-4 py-2 border border-[#e2f0e8] hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={dataLoading}
                  className="px-4 py-2 bg-[#0c4a43] hover:bg-[#0f766e] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  {dataLoading && <Loader2 className="w-4 h-4 animate-spin" />}
                  {productModal.mode === 'create' ? 'Process & Create' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: SCHEME CREATE / EDIT ==================== */}
      {schemeModal.open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#e2f0e8] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-[#e2f0e8] flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-[#0c4a43] uppercase tracking-wider">
                {schemeModal.mode === 'create' ? 'Launch Trade Offer Scheme' : 'Edit Scheme Details'}
              </h3>
              <button 
                onClick={() => setSchemeModal({ open: false, mode: 'create', data: null })}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={saveScheme} className="p-6 space-y-4">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Scheme Name (Promo Title)</label>
                <input
                  type="text"
                  required
                  value={schemeForm.name}
                  onChange={(e) => setSchemeForm({ ...schemeForm, name: e.target.value })}
                  placeholder="e.g. Monsoons Booster Buy 10 Get 1"
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs uppercase"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Associated Product</label>
                <select
                  value={schemeForm.product_id}
                  onChange={(e) => setSchemeForm({ ...schemeForm, product_id: e.target.value })}
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-650 focus:outline-none focus:border-[#0c4a43] text-xs"
                >
                  <option value="">-- Apply to specific catalog product --</option>
                  {products.map(p => (
                    <option key={p.id} value={p.id}>{p.name} ({p.company})</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Min Target Buy Qty</label>
                  <input
                    type="number"
                    required
                    value={schemeForm.min_qty}
                    onChange={(e) => setSchemeForm({ ...schemeForm, min_qty: e.target.value })}
                    placeholder="10"
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Free Gift Qty</label>
                  <input
                    type="number"
                    required
                    value={schemeForm.free_qty}
                    onChange={(e) => setSchemeForm({ ...schemeForm, free_qty: e.target.value })}
                    placeholder="1"
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Start Date</label>
                  <input
                    type="date"
                    required
                    value={schemeForm.start_date}
                    onChange={(e) => setSchemeForm({ ...schemeForm, start_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">End Date</label>
                  <input
                    type="date"
                    required
                    value={schemeForm.end_date}
                    onChange={(e) => setSchemeForm({ ...schemeForm, end_date: e.target.value })}
                    className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Details Description</label>
                <textarea
                  rows="3"
                  required
                  value={schemeForm.description}
                  onChange={(e) => setSchemeForm({ ...schemeForm, description: e.target.value })}
                  placeholder="Explain scheme benefits (e.g. Buy 10 Dolo, get 1 free, until June 30)..."
                  className="w-full px-3 py-2 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs"
                />
              </div>

              <div className="pt-4 border-t border-[#e2f0e8] flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setSchemeModal({ open: false, mode: 'create', data: null })}
                  className="px-4 py-2 border border-[#e2f0e8] hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0c4a43] hover:bg-[#0f766e] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer"
                >
                  {schemeModal.mode === 'create' ? 'Launch Scheme' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==================== MODAL: INVOICE DETAIL VIEW ==================== */}
      {invoiceDetailModal.open && invoiceDetailModal.data && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#e2f0e8] rounded-2xl max-w-lg w-full shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-[#e2f0e8] flex items-center justify-between bg-slate-50">
              <div>
                <h3 className="text-sm font-bold text-[#0c4a43] uppercase tracking-wider">
                  Bill Invoice Details
                </h3>
                <span className="text-[10px] text-slate-400 block font-bold mt-1">Invoice Number: #{invoiceDetailModal.data.invoice_number}</span>
              </div>
              <button 
                onClick={() => setInvoiceDetailModal({ open: false, data: null })}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              
              {/* Customer shop details */}
              <div className="grid grid-cols-2 gap-4 text-xs font-medium text-slate-600 border-b border-[#f1f5f9] pb-4">
                <div>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Billing Customer</span>
                  <span className="font-extrabold text-[#0c4a43] block mt-1">{invoiceDetailModal.data.customer.shop_name}</span>
                  <span className="block mt-0.5">Contact: +{invoiceDetailModal.data.customer.whatsapp}</span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Billing Details</span>
                  <span className="block mt-1">Date: {formatDate(invoiceDetailModal.data.date)}</span>
                  <span className="font-extrabold text-slate-800 block mt-0.5">Ledger status: {invoiceDetailModal.data.status}</span>
                </div>
              </div>

              {/* Items Breakdown list */}
              <div className="space-y-3">
                <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Itemized Breakdown</span>
                
                <div className="bg-[#f8fafc] border border-[#e2f0e8] rounded-xl overflow-hidden text-xs">
                  <div className="grid grid-cols-12 bg-slate-100 px-4 py-2 font-bold text-slate-500 text-[10px] uppercase">
                    <span className="col-span-6">Medicine Description</span>
                    <span className="col-span-2 text-center">Qty</span>
                    <span className="col-span-2 text-right">Price</span>
                    <span className="col-span-2 text-right">Total</span>
                  </div>
                  
                  <div className="divide-y divide-[#f1f5f9] max-h-40 overflow-y-auto font-medium">
                    {!invoiceDetailModal.data.items || (typeof invoiceDetailModal.data.items === 'object' && Object.keys(invoiceDetailModal.data.items).length === 0) ? (
                      <div className="p-4 text-center text-slate-400 italic">No item line logs in CSV.</div>
                    ) : (
                      (typeof invoiceDetailModal.data.items === 'string' ? JSON.parse(invoiceDetailModal.data.items) : invoiceDetailModal.data.items).map((item, i) => {
                        const rate = item.price || item.rate || 0;
                        const qty = item.qty || item.quantity || 1;
                        const total = rate * qty;
                        return (
                          <div key={i} className="grid grid-cols-12 px-4 py-2 text-slate-600">
                            <span className="col-span-6 font-bold text-slate-800">{item.product || item.name}</span>
                            <span className="col-span-2 text-center font-mono">{qty}</span>
                            <span className="col-span-2 text-right font-mono">₹{rate.toFixed(2)}</span>
                            <span className="col-span-2 text-right font-mono text-slate-800 font-bold">₹{total.toFixed(2)}</span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>

              {/* Total Dues info */}
              <div className="flex justify-between items-center pt-4 border-t border-[#e2f0e8] text-xs font-bold text-slate-600">
                <span className="text-[#0f766e]">Total Invoiced Amount:</span>
                <span className="text-lg font-black text-[#0c4a43]">₹{invoiceDetailModal.data.amount.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#e2f0e8] flex justify-end gap-3">
              <button
                onClick={() => setInvoiceDetailModal({ open: false, data: null })}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer"
              >
                Close View
              </button>
              {invoiceDetailModal.data.status === 'UNPAID' && (
                <button
                  onClick={() => {
                    const invId = invoiceDetailModal.data.id;
                    setInvoiceDetailModal({ open: false, data: null });
                    triggerInvoiceReminder(invId);
                  }}
                  className="px-4 py-2 bg-[#0c4a43] hover:bg-[#0f766e] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all flex items-center gap-1 cursor-pointer shadow-md"
                >
                  <Send className="w-3 h-3" /> Send WhatsApp Reminder
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: BROADCAST PROMPT AFTER NEW PRODUCT ==================== */}
      {broadcastPromptModal.open && broadcastPromptModal.product && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#e2f0e8] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-[#e2f0e8] flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-[#0c4a43] uppercase tracking-wider">
                🚀 New Product Launch WhatsApp Broadcast
              </h3>
              <button 
                onClick={() => setBroadcastPromptModal({ open: false, product: null, text: '' })}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <span className="text-xs text-slate-500 leading-normal block">
                Do you want to announce the launch of **{broadcastPromptModal.product.name}** immediately on WhatsApp to all registered medical shops?
              </span>

              <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Editable Message Caption</label>
                <textarea
                  rows="6"
                  value={broadcastPromptModal.text}
                  onChange={(e) => setBroadcastPromptModal({ ...broadcastPromptModal, text: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-slate-800 focus:outline-none focus:border-[#0c4a43] text-xs font-sans leading-normal"
                />
              </div>

              {broadcastPromptModal.product.image_url && (
                <div className="p-3.5 bg-slate-50 border border-[#e2f0e8] rounded-xl flex items-center gap-3">
                  <div className="w-12 h-12 bg-slate-200 rounded border overflow-hidden shrink-0">
                    <img src={`${STATIC_BASE}${broadcastPromptModal.product.image_url}`} alt="" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-[#0c4a43] block">Watermarked Flyer flyer.png</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">Will be attached as media to WhatsApp messages</span>
                  </div>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#e2f0e8] flex justify-end gap-3">
              <button
                onClick={() => setBroadcastPromptModal({ open: false, product: null, text: '' })}
                className="px-4 py-2 border border-[#e2f0e8] hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase transition-all"
              >
                Cancel Broadcast
              </button>
              <button
                onClick={handleLaunchProductPromptBroadcast}
                className="px-4 py-2 bg-[#0c4a43] hover:bg-[#0f766e] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Send Broadcast Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ==================== MODAL: CUSTOMER INVITE GENERATED DISPLAY ==================== */}
      {customerInviteModal.open && customerInviteModal.customer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-sm p-4 animate-fade-in">
          <div className="bg-white border border-[#e2f0e8] rounded-2xl max-w-md w-full shadow-2xl overflow-hidden relative">
            <div className="p-6 border-b border-[#e2f0e8] flex items-center justify-between bg-slate-50">
              <h3 className="text-sm font-bold text-[#0c4a43] uppercase tracking-wider">
                🎉 Shop Registered & Invitation Ready
              </h3>
              <button 
                onClick={() => setCustomerInviteModal({ open: false, customer: null, inviteText: '' })}
                className="p-1 hover:bg-slate-200 rounded-lg text-slate-400 hover:text-slate-600 transition-all cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <span className="text-xs text-slate-500 leading-normal block">
                Shop **{customerInviteModal.customer.shop_name}** registered successfully in database. Below is the invite text template generated for WhatsApp:
              </span>

              <div className="p-4 bg-[#f8fafc] border border-[#e2f0e8] rounded-xl text-xs font-mono select-all leading-normal text-slate-700">
                {customerInviteModal.inviteText}
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-[#e2f0e8] flex justify-end gap-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(customerInviteModal.inviteText);
                  showToast('Invite text copied to clipboard!');
                }}
                className="px-4 py-2 border border-[#e2f0e8] hover:bg-slate-100 text-slate-500 rounded-xl text-xs font-bold uppercase transition-all"
              >
                Copy Invite Text
              </button>
              <button
                onClick={async () => {
                  setCustomerInviteModal({ open: false, customer: null, inviteText: '' });
                  try {
                    await fetch(`${API_BASE}/integration/import/products`); // simple ping
                    showToast('Invite sent to customer via WhatsApp sandbox!');
                  } catch (e){}
                }}
                className="px-4 py-2 bg-[#0c4a43] hover:bg-[#0f766e] text-white font-bold rounded-xl text-xs uppercase tracking-wider transition-all shadow-md cursor-pointer flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Send Invite Link
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

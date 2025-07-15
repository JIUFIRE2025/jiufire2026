import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit,
  Trash2,
  Eye,
  Search,
  Filter,
  Star, 
  Building, 
  Save, 
  X, 
  Upload, 
  Image as ImageIcon, 
  Award, 
  Sliders, 
  CheckCircle, 
  AlertCircle, 
  ArrowRight, 
  Briefcase, 
  Users,
  Info
} from 'lucide-react';
import { supabase, FeaturedCase, PartnerCase } from '../lib/supabase';
import ImageUploader from './ImageUploader';

const CaseManagement: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'featured' | 'partner'>('featured');
  const [featuredCases, setFeaturedCases] = useState<FeaturedCase[]>([]);
  const [partnerCases, setPartnerCases] = useState<PartnerCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showEditor, setShowEditor] = useState(false);
  const [editingItem, setEditingItem] = useState<FeaturedCase | PartnerCase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // 精选案例表单数据
  const [featuredFormData, setFeaturedFormData] = useState({
    title: '',
    company_name: '',
    industry: '',
    description: '',
    image_url: '',
    is_active: true,
    sort_order: 0
  });

  // 合作客户案例表单数据
  const [partnerFormData, setPartnerFormData] = useState({
    company_name: '',
    logo_url: '',
    industry: '',
    description: '',
    results: '',
    image_url: '',
    is_active: true,
    sort_order: 0
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // 获取精选案例
      const { data: featuredData, error: featuredError } = await supabase
        .from('featured_cases')
        .select('*')
        .order('sort_order', { ascending: true });

      if (featuredError) throw featuredError;
      setFeaturedCases(featuredData || []);

      // 获取合作客户案例
      const { data: partnerData, error: partnerError } = await supabase
        .from('partner_cases')
        .select('*')
        .order('sort_order', { ascending: true });

      if (partnerError) throw partnerError;
      setPartnerCases(partnerData || []);

    } catch (error) {
      console.error('获取数据失败:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFeaturedSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!featuredFormData.title.trim() || !featuredFormData.company_name.trim() || !featuredFormData.industry.trim()) {
      setSubmitError('请填写必填字段');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      if (editingItem && 'title' in editingItem) {
        // 更新精选案例
        const { error } = await supabase
          .from('featured_cases')
          .update({
            ...featuredFormData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // 创建新精选案例
        const { error } = await supabase
          .from('featured_cases')
          .insert([featuredFormData]);

        if (error) throw error;
      }

      await fetchData();
      resetForm();
    } catch (error) {
      console.error('保存精选案例失败:', error);
      setSubmitError('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!partnerFormData.company_name.trim() || !partnerFormData.industry.trim()) {
      setSubmitError('请填写必填字段');
      return;
    }

    setIsSubmitting(true);
    setSubmitError(null);
    
    try {
      if (editingItem && !('title' in editingItem)) {
        // 更新合作客户案例
        const { error } = await supabase
          .from('partner_cases')
          .update({
            ...partnerFormData,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingItem.id);

        if (error) throw error;
      } else {
        // 创建新合作客户案例
        const { error } = await supabase
          .from('partner_cases')
          .insert([partnerFormData]);

        if (error) throw error;
      }

      await fetchData();
      resetForm();
    } catch (error) {
      console.error('保存合作客户案例失败:', error);
      setSubmitError('保存失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEdit = (item: FeaturedCase | PartnerCase, type: 'featured' | 'partner') => {
    setEditingItem(item);
    
    if (type === 'featured' && 'title' in item) {
      setFeaturedFormData({
        title: item.title,
        company_name: item.company_name,
        industry: item.industry,
        description: item.description,
        image_url: item.image_url || '',
        is_active: item.is_active,
        sort_order: item.sort_order
      });
      setActiveTab('featured');
    } else if (type === 'partner' && !('title' in item)) {
      setPartnerFormData({
        company_name: item.company_name,
        logo_url: item.logo_url || '',
        industry: item.industry,
        description: item.description,
        results: item.results,
        image_url: item.image_url || '',
        is_active: item.is_active,
        sort_order: item.sort_order
      });
      setActiveTab('partner');
    }
    
    setShowEditor(true);
  };

  const handleDelete = async (id: string, type: 'featured' | 'partner') => {
    if (!confirm('确定要删除这条记录吗？')) return;

    try {
      const table = type === 'featured' ? 'featured_cases' : 'partner_cases';
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('删除失败:', error);
    }
  };

  const toggleActive = async (id: string, currentStatus: boolean, type: 'featured' | 'partner') => {
    try {
      const table = type === 'featured' ? 'featured_cases' : 'partner_cases';
      const { error } = await supabase
        .from(table)
        .update({ is_active: !currentStatus })
        .eq('id', id);
      
      if (error) throw error;
      await fetchData();
    } catch (error) {
      console.error('更新状态失败:', error);
    }
  };

  const resetForm = () => {
    setFeaturedFormData({
      title: '',
      company_name: '',
      industry: '',
      description: '',
      image_url: '',
      is_active: true,
      sort_order: 0
    });
    setPartnerFormData({
      company_name: '',
      logo_url: '',
      industry: '',
      description: '',
      results: '',
      image_url: '',
      is_active: true,
      sort_order: 0
    });
    setEditingItem(null);
    setShowEditor(false);
    setSubmitError(null);
  };

  const openNewEditor = (type: 'featured' | 'partner') => {
    setActiveTab(type);
    setEditingItem(null);
    setShowEditor(true);
  };

  const filteredFeaturedCases = featuredCases.filter(case_ =>
    case_.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPartnerCases = partnerCases.filter(case_ =>
    case_.company_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    case_.industry.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#194fe8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">精选案例</p>
              <p className="text-2xl font-bold text-gray-900">{featuredCases.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center">
              <Star className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">活跃精选案例</p>
              <p className="text-2xl font-bold text-orange-600">
                {featuredCases.filter(c => c.is_active).length}
              </p>
            </div>
            <div className="w-14 h-14 bg-orange-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-orange-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">合作客户案例</p>
              <p className="text-2xl font-bold text-purple-600">{partnerCases.length}</p>
            </div>
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-7 h-7 text-purple-600" />
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">活跃合作案例</p>
              <p className="text-2xl font-bold text-green-600">
                {partnerCases.filter(c => c.is_active).length}
              </p>
            </div>
            <div className="w-14 h-14 bg-green-100 rounded-lg flex items-center justify-center">
              <Users className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* 标签页和操作栏 */}
      <div className="bg-white rounded-lg p-6 shadow-md border border-gray-200">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* 标签页 */}
          <div className="flex space-x-1 bg-gray-100 rounded-lg p-1 shadow-inner">
            <button
              onClick={() => setActiveTab('featured')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'featured'
                  ? 'bg-white text-[#194fe8] shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              精选案例管理
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'partner'
                  ? 'bg-white text-[#194fe8] shadow-sm font-semibold'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              合作客户案例管理
            </button>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            {/* 搜索框 */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 w-5 h-5" />
              <input
                type="text"
                placeholder="搜索..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent w-64"
              />
            </div>

            {/* 新建按钮 */}
            <button
              onClick={() => openNewEditor(activeTab)}
              className="flex items-center space-x-2 bg-[#194fe8] hover:bg-[#1640c7] text-white px-5 py-2.5 rounded-lg transition-colors shadow-sm hover:shadow-md"
            >
              <Plus className="w-5 h-5" />
              <span>新建{activeTab === 'featured' ? '精选案例' : '合作客户案例'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* 数据表格 */}
      <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          {activeTab === 'featured' ? (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    案例信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    公司名称
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    行业
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    排序
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredFeaturedCases.map((case_) => (
                  <tr key={case_.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-start space-x-3">
                        {case_.image_url ? (
                          <img
                            src={case_.image_url}
                            alt={case_.title}
                            className="w-16 h-12 object-cover rounded"
                          />
                        ) : (
                          <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center">
                            <ImageIcon className="w-6 h-6 text-gray-400" />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium text-gray-900 line-clamp-1">
                            {case_.title}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {case_.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {case_.company_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {case_.industry}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        case_.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {case_.is_active ? '活跃' : '停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {case_.sort_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(case_, 'featured')}
                          className="text-[#194fe8] hover:text-[#1640c7] transition-colors p-1.5 hover:bg-blue-50 rounded"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(case_.id, case_.is_active, 'featured')}
                          className="text-orange-600 hover:text-orange-700 transition-colors p-1.5 hover:bg-orange-50 rounded"
                          title={case_.is_active ? '停用' : '激活'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(case_.id, 'featured')}
                          className="text-red-600 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    公司信息
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    行业
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    状态
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    排序
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    操作
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPartnerCases.map((case_) => (
                  <tr key={case_.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {case_.logo_url ? (
                          <img
                            src={case_.logo_url}
                            alt={case_.company_name}
                            className="w-10 h-10 object-cover rounded-full mr-3"
                          />
                        ) : (
                          <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center mr-3">
                            <Building className="w-5 h-5 text-gray-600" />
                          </div>
                        )}
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {case_.company_name}
                          </div>
                          <div className="text-sm text-gray-500 line-clamp-1">
                            {case_.description.substring(0, 50)}...
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-700 rounded-full">
                        {case_.industry}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        case_.is_active 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-gray-100 text-gray-700'
                      }`}>
                        {case_.is_active ? '活跃' : '停用'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {case_.sort_order}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEdit(case_, 'partner')}
                          className="text-[#194fe8] hover:text-[#1640c7] transition-colors p-1.5 hover:bg-blue-50 rounded"
                          title="编辑"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => toggleActive(case_.id, case_.is_active, 'partner')}
                          className="text-green-600 hover:text-green-700 transition-colors p-1.5 hover:bg-green-50 rounded"
                          title={case_.is_active ? '停用' : '激活'}
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(case_.id, 'partner')}
                          className="text-red-600 hover:text-red-700 transition-colors p-1.5 hover:bg-red-50 rounded"
                          title="删除"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {((activeTab === 'featured' && filteredFeaturedCases.length === 0) || 
          (activeTab === 'partner' && filteredPartnerCases.length === 0)) && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              {activeTab === 'featured' ? (
                <Star className="w-8 h-8 text-gray-500" />
              ) : (
                <Briefcase className="w-8 h-8 text-gray-500" />
              )}
            </div>
            <p className="text-gray-600 font-medium">暂无{activeTab === 'featured' ? '精选案例' : '合作客户案例'}数据</p>
            <p className="text-gray-500 mt-2">点击"新建"按钮添加{activeTab === 'featured' ? '精选案例' : '合作客户案例'}</p>
          </div>
        )}
      </div>

      {/* 编辑器模态框 */}
      {showEditor && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex min-h-screen items-center justify-center p-4">
            <div className="fixed inset-0 bg-black bg-opacity-60" onClick={resetForm} />
            
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#194fe8] rounded-lg flex items-center justify-center">
                    {activeTab === 'featured' ? (
                      <Star className="w-5 h-5 text-white" />
                    ) : (
                      <Briefcase className="w-5 h-5 text-white" />
                    )}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {editingItem ? '编辑' : '新建'}{activeTab === 'featured' ? '精选案例' : '合作客户案例'}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {activeTab === 'featured' ? '在首页精选案例区域展示' : '在合作客户案例区域展示'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={activeTab === 'featured' ? handleFeaturedSubmit : handlePartnerSubmit} className="p-6 space-y-6">
                {activeTab === 'featured' ? (
                  <>
                    {/* 精选案例表单 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          案例标题 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={featuredFormData.title}
                          onChange={(e) => setFeaturedFormData({ ...featuredFormData, title: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入案例标题"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          公司名称 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={featuredFormData.company_name}
                          onChange={(e) => setFeaturedFormData({ ...featuredFormData, company_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入公司名称"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          所属行业 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={featuredFormData.industry}
                          onChange={(e) => setFeaturedFormData({ ...featuredFormData, industry: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入所属行业"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          案例描述 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          value={featuredFormData.description}
                          onChange={(e) => setFeaturedFormData({ ...featuredFormData, description: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          rows={4}
                          placeholder="请输入案例描述"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          排序顺序
                        </label>
                        <input
                          type="number"
                          value={featuredFormData.sort_order}
                          onChange={(e) => setFeaturedFormData({ ...featuredFormData, sort_order: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="排序顺序"
                        />
                      </div>

                      <div>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={featuredFormData.is_active}
                            onChange={(e) => setFeaturedFormData({ ...featuredFormData, is_active: e.target.checked })}
                            className="w-4 h-4 text-[#194fe8] border-gray-300 rounded focus:ring-[#194fe8]"
                          />
                          <span className="text-sm font-medium text-gray-700">激活此案例</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        案例图片
                      </label>
                      <ImageUploader
                        value={featuredFormData.image_url}
                        onChange={(url) => setFeaturedFormData({ ...featuredFormData, image_url: url })}
                        placeholder="上传案例图片"
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* 合作客户案例表单 */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          公司名称 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={partnerFormData.company_name}
                          onChange={(e) => setPartnerFormData({ ...partnerFormData, company_name: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入公司名称"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          所属行业 <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={partnerFormData.industry}
                          onChange={(e) => setPartnerFormData({ ...partnerFormData, industry: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="请输入所属行业"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          案例描述 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          value={partnerFormData.description}
                          onChange={(e) => setPartnerFormData({ ...partnerFormData, description: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          rows={3}
                          placeholder="请输入案例描述"
                        />
                      </div>

                      <div className="lg:col-span-2">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          实施效果 <span className="text-red-500">*</span>
                        </label>
                        <textarea
                          required
                          value={partnerFormData.results}
                          onChange={(e) => setPartnerFormData({ ...partnerFormData, results: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          rows={3}
                          placeholder="请输入实施效果"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          排序顺序
                        </label>
                        <input
                          type="number"
                          value={partnerFormData.sort_order}
                          onChange={(e) => setPartnerFormData({ ...partnerFormData, sort_order: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#194fe8] focus:border-transparent"
                          placeholder="排序顺序"
                        />
                      </div>

                      <div>
                        <label className="flex items-center space-x-3">
                          <input
                            type="checkbox"
                            checked={partnerFormData.is_active}
                            onChange={(e) => setPartnerFormData({ ...partnerFormData, is_active: e.target.checked })}
                            className="w-4 h-4 text-[#194fe8] border-gray-300 rounded focus:ring-[#194fe8]"
                          />
                          <span className="text-sm font-medium text-gray-700">激活此案例</span>
                        </label>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        公司Logo
                      </label>
                      <ImageUploader
                        value={partnerFormData.logo_url}
                        onChange={(url) => setPartnerFormData({ ...partnerFormData, logo_url: url })}
                        placeholder="上传公司Logo"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-3">
                        案例图片
                      </label>
                      <ImageUploader
                        value={partnerFormData.image_url}
                        onChange={(url) => setPartnerFormData({ ...partnerFormData, image_url: url })}
                        placeholder="上传案例图片"
                      />
                    </div>
                  </>
                )}

                {/* 错误提示 */}
                {submitError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-sm text-red-600 flex items-start">
                      <AlertCircle className="w-5 h-5 mr-2 flex-shrink-0 mt-0.5" />
                      {submitError}
                    </p>
                  </div>
                )}

                {/* 提示信息 */}
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start">
                    <Info className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-sm text-blue-700 font-medium">提示</p>
                      <p className="text-sm text-blue-600 mt-1">
                        {activeTab === 'featured' ? 
                          '精选案例将在首页精选案例区域展示，建议上传高质量图片，并提供完整的案例描述。' : 
                          '合作客户案例将在客户案例页面展示，建议上传公司Logo和案例图片，并详细描述实施效果。'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
                  <button
                    type="button"
                    onClick={resetForm}
                    disabled={isSubmitting}
                    className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-medium disabled:opacity-50 shadow-sm"
                  >
                    取消
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-8 py-3 bg-[#194fe8] hover:bg-[#1640c7] text-white rounded-lg transition-colors flex items-center space-x-2 font-medium disabled:opacity-50 shadow-sm hover:shadow-md"
                  >
                    {isSubmitting ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        <span>保存中...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-5 h-5" />
                        <span>{editingItem ? '更新' : '创建'}</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CaseManagement;
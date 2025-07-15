import React, { useState, useEffect } from 'react';
import { memo, useMemo, useCallback } from 'react';
import { 
  Building, 
  TrendingUp, 
  Award, 
  ArrowRight,
  CheckCircle,
  BarChart3,
  Target,
  Globe,
  Star,
  Eye,
  Users,
  Zap,
  Image as ImageIcon,
  ChevronLeft, 
  ChevronRight,
  ExternalLink
} from 'lucide-react';
import { supabase, CustomerCase, CaseConfiguration, FeaturedCase, PartnerCase, isSupabaseConfigured } from '../lib/supabase';
import FormButton from './FormButton';

const CustomerCasesPage = memo(() => {
  const [cases, setCases] = useState<CustomerCase[]>([]);
  const [configurations, setConfigurations] = useState<CaseConfiguration[]>([]);
  const [featuredCases, setFeaturedCases] = useState<FeaturedCase[]>([]);
  const [partnerCases, setPartnerCases] = useState<PartnerCase[]>([]);
  const [currentConfigIndex, setCurrentConfigIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 默认案例数据 - 根据设计图更新
  const defaultCases = useMemo((): CustomerCase[] => [
    {
      id: 'case-1',
      company_name: '安克创新',
      company_logo: 'A',
      industry: '3C类',
      description: '上市企业「安克创新」：用领星ERP加速数字化建设',
      results: '安克创新通过和领星ERP携手，加速数字化建设，智能集成业务、销售、库存等环节的关键数据，高效管理分析业务情况。',
      metrics: {
        stock_code: '300866',
        image_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'
      },
      is_featured: true,
      sort_order: 1,
      status: 'active' as const,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'case-2',
      company_name: '巨星集团',
      company_logo: '巨',
      industry: '制造业',
      description: '五金品牌「巨星集团」：借助领星ERP征战全球',
      results: '巨星集团通过领星ERP系统，实现了全球化业务管理和供应链优化。',
      metrics: {
        stock_code: '002444',
        image_url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800'
      },
      is_featured: true,
      sort_order: 2,
      status: 'active' as const,
      created_at: '2024-02-10T00:00:00Z',
      updated_at: '2024-02-10T00:00:00Z'
    },
    {
      id: 'case-3',
      company_name: '齐心科技',
      company_logo: 'C',
      industry: '办公用品',
      description: '办公品牌「齐心科技」：借助领星ERP实现精细化管理',
      results: '齐心科技通过领星ERP系统，提升了办公用品的精细化管理水平。',
      metrics: {
        stock_code: '002301',
        image_url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800'
      },
      is_featured: true,
      sort_order: 3,
      status: 'active' as const,
      created_at: '2024-03-05T00:00:00Z',
      updated_at: '2024-03-05T00:00:00Z'
    },
    {
      id: 'case-4',
      company_name: '大力',
      company_logo: 'T',
      industry: '家居用品',
      description: '家居品牌「大力」：借助领星ERP实现精细化管理',
      results: '大力品牌通过领星ERP系统，实现了家居用品的精细化管理。',
      metrics: {
        stock_code: '301595',
        image_url: 'https://images.pexels.com/photos/6444/pencil-typography-black-design.jpg?auto=compress&cs=tinysrgb&w=800'
      },
      is_featured: true,
      sort_order: 4,
      status: 'active' as const,
      created_at: '2024-04-12T00:00:00Z',
      updated_at: '2024-04-12T00:00:00Z'
    },
    {
      id: 'case-5',
      company_name: '晨光文具',
      company_logo: 'M',
      industry: '文具用品',
      description: '全球最大文具制造商之一「晨光文具」，领星助力数字化升级',
      results: '订单处理效率提升50%，库存管理优化40%',
      metrics: {
        efficiency_improvement: '50%',
        inventory_optimization: '40%',
        cost_reduction: '30%',
        image_url: 'https://images.pexels.com/photos/3184360/pexels-photo-3184360.jpeg?auto=compress&cs=tinysrgb&w=800'
      },
      is_featured: false,
      sort_order: 5,
      status: 'active' as const,
      created_at: '2024-05-20T00:00:00Z',
      updated_at: '2024-05-20T00:00:00Z'
    },
    {
      id: 'case-6',
      company_name: '纳思达',
      company_logo: 'N',
      industry: '制造业',
      description: '上市公司「纳思达」：领星助力多条统一体管理',
      results: '多条线统一管理，效率提升35%',
      metrics: {
        management_efficiency: '35%',
        cost_optimization: '25%',
        quality_improvement: '30%',
        image_url: 'https://images.pexels.com/photos/3184317/pexels-photo-3184317.jpeg?auto=compress&cs=tinysrgb&w=800'
      },
      is_featured: false,
      sort_order: 6,
      status: 'active' as const,
      created_at: '2024-06-15T00:00:00Z',
      updated_at: '2024-06-15T00:00:00Z'
    },
    {
      id: 'case-7',
      company_name: '健合集团',
      company_logo: 'H',
      industry: '健康食品',
      description: '全家营养养与健康企业「健合集团」：携手领星提效',
      results: '营养健康产品管理效率提升40%',
      metrics: {
        product_management: '40%',
        supply_chain: '35%',
        customer_service: '45%',
        image_url: 'https://images.pexels.com/photos/3184339/pexels-photo-3184339.jpeg?auto=compress&cs=tinysrgb&w=800'
      },
      is_featured: false,
      sort_order: 7,
      status: 'active' as const,
      created_at: '2024-07-10T00:00:00Z',
      updated_at: '2024-07-10T00:00:00Z'
    },
    {
      id: 'case-8',
      company_name: '倍轻松',
      company_logo: 'B',
      industry: '智能硬件',
      description: '智能硬件品牌「倍轻松」：借助领星实现数字化管理',
      results: '智能硬件产品数字化管理效率提升50%',
      metrics: {
        digital_management: '50%',
        product_innovation: '35%',
        market_response: '40%',
        image_url: 'https://images.pexels.com/photos/3184292/pexels-photo-3184292.jpeg?auto=compress&cs=tinysrgb&w=800'
      },
      is_featured: false,
      sort_order: 8,
      status: 'active' as const,
      created_at: '2024-08-05T00:00:00Z',
      updated_at: '2024-08-05T00:00:00Z'
    }
  ], []);

  // 默认配置数据
  const defaultConfigurations = useMemo((): CaseConfiguration[] => [
    {
      id: 'config-1',
      title: '上市企业「安克创新」：用久火ERP加速数字化建设',
      subtitle: 'Anker Innovations',
      description: '安克创新通过与久火ERP合作，加速数字化建设，智能集成业务、销售、库存等环节的关键数据，高效管理分析业务情况。',
      company_name: '安克创新',
      company_logo: 'A',
      stock_code: '300866',
      image_url: 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800',
      link_url: '#',
      is_active: true,
      sort_order: 1,
      created_at: '2024-01-15T00:00:00Z',
      updated_at: '2024-01-15T00:00:00Z'
    },
    {
      id: 'config-2',
      title: '五金品牌「巨星集团」：借助久火ERP征战全球',
      subtitle: 'Great Star Tools',
      description: '巨星集团通过久火ERP系统，实现了全球化业务管理和供应链优化，显著提升了运营效率和市场竞争力。',
      company_name: '巨星集团',
      company_logo: '巨',
      stock_code: '002444',
      image_url: 'https://images.pexels.com/photos/3184338/pexels-photo-3184338.jpeg?auto=compress&cs=tinysrgb&w=800',
      link_url: '#',
      is_active: true,
      sort_order: 2,
      created_at: '2024-02-10T00:00:00Z',
      updated_at: '2024-02-10T00:00:00Z'
    },
    {
      id: 'config-3',
      title: '办公品牌「齐心科技」：借助久火ERP实现精细化管理',
      subtitle: 'Comix Group',
      description: '齐心科技通过久火ERP系统，提升了办公用品的精细化管理水平，优化了供应链流程和客户服务质量。',
      company_name: '齐心科技',
      company_logo: 'C',
      stock_code: '002301',
      image_url: 'https://images.pexels.com/photos/3184465/pexels-photo-3184465.jpeg?auto=compress&cs=tinysrgb&w=800',
      link_url: '#',
      is_active: true,
      sort_order: 3,
      created_at: '2024-03-05T00:00:00Z',
      updated_at: '2024-03-05T00:00:00Z'
    }
  ], []);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Check if Supabase is configured before making requests
      if (!isSupabaseConfigured()) {
        console.warn('Supabase not configured, using default data');
        setCases(defaultCases);
        setConfigurations(defaultConfigurations);
        setLoading(false);
        return;
      }

      try {
        
        // 获取精选案例
        const { data: featuredData, error: featuredError } = await supabase
          .from('featured_cases')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (!featuredError && featuredData && featuredData.length > 0) {
          setFeaturedCases(featuredData);
        } else {
          console.warn('获取精选案例失败或无数据:', featuredError);
        }

        // 获取合作客户案例
        const { data: partnerData, error: partnerError } = await supabase
          .from('partner_cases')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (!partnerError && partnerData && partnerData.length > 0) {
          setPartnerCases(partnerData);
        } else {
          console.warn('获取合作客户案例失败或无数据:', partnerError);
        }

        // 获取客户案例
        const { data: casesData, error: casesError } = await supabase
          .from('customer_cases')
          .select('*')
          .eq('status', 'active')
          .order('sort_order', { ascending: true });

        if (casesError || !casesData || casesData.length === 0) {
          console.warn('获取客户案例失败:', casesError);
          setCases(defaultCases);
        } else {
          setCases(casesData);
        }

        // 获取案例配置
        const { data: configsData, error: configsError } = await supabase
          .from('case_configurations')
          .select('*')
          .eq('is_active', true)
          .order('sort_order', { ascending: true });

        if (configsError || !configsData || configsData.length === 0) {
          console.warn('获取案例配置失败:', configsError);
          setConfigurations(defaultConfigurations);
        } else {
          setConfigurations(configsData);
        }
      } catch (fetchError) {
        console.warn('Supabase fetch failed, using default data:', fetchError);
        setCases(defaultCases);
        setConfigurations(defaultConfigurations);
      }
    } catch (error) {
      console.error('获取数据失败:', error);
      // Don't set error state, just use default data
      if (featuredCases.length === 0) {
        setFeaturedCases(defaultCases.filter(c => c.is_featured).map(c => ({
          id: c.id,
          title: c.description,
          company_name: c.company_name,
          industry: c.industry,
          description: c.results,
          image_url: c.metrics?.image_url,
          is_active: true,
          sort_order: c.sort_order,
          created_at: c.created_at,
          updated_at: c.updated_at
        })));
      }
      
      if (partnerCases.length === 0) {
        setPartnerCases(defaultCases.filter(c => !c.is_featured).map(c => ({
          id: c.id,
          company_name: c.company_name,
          logo_url: '',
          industry: c.industry,
          description: c.description,
          results: c.results,
          image_url: c.metrics?.image_url,
          is_active: true,
          sort_order: c.sort_order,
          created_at: c.created_at,
          updated_at: c.updated_at
        })));
      }
      
      if (cases.length === 0) {
        setCases(defaultCases);
      }
      
      if (configurations.length === 0) {
        setConfigurations(defaultConfigurations);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const nextConfiguration = useCallback(() => {
    setCurrentConfigIndex((prev) => 
      prev === configurations.length - 1 ? 0 : prev + 1
    );
  }, [configurations.length]);

  const prevConfiguration = useCallback(() => {
    setCurrentConfigIndex((prev) => 
      prev === 0 ? configurations.length - 1 : prev - 1
    );
  }, [configurations.length]);

  const goToConfiguration = useCallback((index: number) => {
    setCurrentConfigIndex(index);
  }, []);

  // 使用 useMemo 缓存计算结果
  const displayFeaturedCases = useMemo(() => {
    // 优先使用新的精选案例表数据
    if (featuredCases && featuredCases.length > 0) {
      return featuredCases;
    }
    // 回退到旧的案例数据
    return cases.filter(c => c.is_featured);
  }, [featuredCases, cases]);

  const displayPartnerCases = useMemo(() => {
    // 优先使用新的合作客户案例表数据
    if (partnerCases && partnerCases.length > 0) {
      return partnerCases;
    }
    // 回退到旧的案例数据
    const regular = cases.filter(c => !c.is_featured);
    return regular.length > 0 ? regular : defaultCases.filter(c => !c.is_featured);
  }, [partnerCases, cases, defaultCases]);

  const currentConfig = useMemo(() => 
    configurations[currentConfigIndex], 
    [configurations, currentConfigIndex]
  );
  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-[#194fe8] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">正在加载客户案例...</p>
          {error && (
            <p className="text-sm text-gray-500 mt-2">将显示默认内容</p>
          )}
        </div>
      </div>
    );
  }

  // 如果没有数据且不在加载中，显示错误状态
  if (!loading && cases.length === 0 && configurations.length === 0) {
    return (
      <div className="min-h-screen bg-white pt-16 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无客户案例</h3>
          <p className="text-gray-500 mb-4">请稍后再试或联系管理员</p>
          <button
            onClick={fetchData}
            className="bg-[#194fe8] hover:bg-[#1640c7] text-white px-4 py-2 rounded-lg transition-colors"
          >
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-16 w-full">
      {/* 优化后的Banner设计 */}
      <section className="relative min-h-[500px] flex items-center bg-gradient-to-r from-blue-50 to-purple-50 overflow-hidden py-16 w-full">
        {/* 背景装饰元素 */}
        <div className="absolute inset-0">
          <div className="absolute top-10 right-20 w-20 h-20 bg-gradient-to-br from-blue-200/30 to-purple-200/30 rounded-full blur-xl"></div>
          <div className="absolute bottom-10 left-20 w-16 h-16 bg-gradient-to-br from-teal-200/30 to-blue-200/30 rounded-full blur-lg"></div>
          <div className="absolute top-1/2 right-1/3 w-12 h-12 bg-gradient-to-br from-purple-200/20 to-pink-200/20 rounded-full blur-lg"></div>
        </div>

        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm mb-6">
              <div className="w-2 h-2 bg-[#194fe8] rounded-full"></div>
              <span className="text-sm font-medium text-gray-700">客户案例</span>
            </div>
            
            <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              为外贸企业打造全链路管理系统
            </h1>
            
            <p className="text-lg text-gray-600 leading-relaxed max-w-4xl mx-auto mb-8">
              您想要的新描述文字
            </p>

            {/* 统计数据 */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              <div className="text-center">
                <div className="text-4xl font-bold text-[#194fe8] mb-2">4+</div>
                <div className="text-sm text-gray-600">成功案例</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#194fe8] mb-2">4+</div>
                <div className="text-sm text-gray-600">覆盖行业</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#194fe8] mb-2">60%</div>
                <div className="text-sm text-gray-600">平均效率提升</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-[#194fe8] mb-2">95%</div>
                <div className="text-sm text-gray-600">客户满意度</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 主要内容区域 */}
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {/* 案例配置展示区域 */}
        {currentConfig && (
          <div className="mb-20">
            <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-8 border border-gray-200 relative overflow-hidden shadow-md">
              <div className="grid lg:grid-cols-2 gap-8 items-center">
                {/* 左侧图片区域 */}
                <div className="relative">
                  <img
                    src={currentConfig.image_url || 'https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800'}
                    alt={currentConfig.title}
                    className="w-full h-64 object-cover rounded-lg shadow-md"
                  />
                  {currentConfig.stock_code && (
                    <div className="absolute bottom-4 left-4 bg-blue-600 text-white px-3 py-1 rounded-md text-sm font-medium shadow-sm">
                      股票代码：{currentConfig.stock_code}
                    </div>
                  )}
                </div>
                
                {/* 右侧内容区域 */}
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <div className="w-10 h-10 bg-[#194fe8] text-white rounded-lg flex items-center justify-center font-bold text-sm shadow-sm">
                      {currentConfig.company_logo}
                    </div>
                    {currentConfig.subtitle && (
                      <span className="text-sm font-medium text-gray-700">{currentConfig.subtitle}</span>
                    )}
                  </div>
                  
                  <h3 className="text-2xl font-bold text-gray-900 mb-4 leading-tight">
                    {currentConfig.title}
                  </h3>
                  
                  {currentConfig.description && (
                    <p className="text-gray-700 mb-6 leading-relaxed">
                      {currentConfig.description}
                    </p>
                  )}
                  
                  {currentConfig.link_url && (
                    <button 
                      onClick={() => window.open(currentConfig.link_url, '_blank')}
                      className="text-[#194fe8] hover:text-[#1640c7] font-medium flex items-center space-x-2 transition-colors group"
                    >
                      <span>查看详情</span>
                      <ExternalLink className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </button>
                  )}
                </div>
              </div>
              
              {/* 导航控制 */}
              {configurations.length > 1 && (
                <>
                  {/* 左右箭头 */}
                  <button
                    onClick={prevConfiguration}
                    className="absolute left-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                  </button>
                  <button
                    onClick={nextConfiguration}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110"
                  >
                    <ChevronRight className="w-5 h-5 text-gray-600" />
                  </button>
                  
                  {/* 底部指示器 */}
                  <div className="flex justify-center mt-8 space-x-2">
                    {configurations.map((_, index) => (
                      <div
                        key={index}
                        onClick={() => goToConfiguration(index)}
                        className={`w-8 h-1 rounded-full transition-colors ${
                          index === currentConfigIndex ? 'bg-[#194fe8]' : 'bg-gray-300'
                        } cursor-pointer hover:bg-[#194fe8]/70`}
                      ></div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        )}

        {/* 精选案例 - 只显示图片 */}
        <div className="mb-20">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
              <Star className="w-5 h-5 text-orange-500" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">精选案例 <span className="text-gray-500 font-normal">({displayFeaturedCases.length || 0})</span></h2>
          </div>
          
          {displayFeaturedCases.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayFeaturedCases.map((case_) => (
              <div
                key={case_.id} 
                className="bg-white rounded-xl border border-gray-200 hover:border-[#194fe8] hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                {/* 只显示图片区域 */}
                <div className="relative h-48 overflow-hidden">
                  {case_.image_url ? (
                    <img
                      src={case_.image_url}
                      alt={'title' in case_ ? case_.title : case_.company_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <img
                      src="https://images.pexels.com/photos/3184291/pexels-photo-3184291.jpeg?auto=compress&cs=tinysrgb&w=800"
                      alt={case_.company_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  )}
                  
                  {/* 股票代码标签 */}
                  {'metrics' in case_ && case_.metrics?.stock_code && (
                    <div className="absolute bottom-3 left-3 bg-[#194fe8] text-white px-3 py-1 rounded-md text-sm font-medium shadow-md">
                      股票代码：{case_.metrics.stock_code}
                    </div>
                  )}
                </div>

                {/* 公司信息 */}
                <div className="p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-3 py-1 bg-blue-50 text-[#194fe8] text-xs font-medium rounded-full">{case_.industry}</span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-3 group-hover:text-[#194fe8] transition-colors text-lg leading-tight line-clamp-2">
                    {'title' in case_ ? case_.title : case_.description}
                  </h3>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-[#194fe8] font-medium">查看详情</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#194fe8] group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">暂无精选案例</p>
            </div>
          )}
        </div>

        {/* 合作客户案例 - 4列网格布局 */}
        <div className="mb-20">
          <div className="flex items-center space-x-3 mb-10">
            <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">合作客户案例 <span className="text-gray-500 font-normal">({displayPartnerCases.length || 0})</span></h2>
          </div>

          {displayPartnerCases.length > 0 ? (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {displayPartnerCases.map((case_) => (
              <div
                key={case_.id}
                className="bg-white rounded-xl border border-gray-200 hover:border-[#194fe8] hover:shadow-lg transition-all duration-300 overflow-hidden group cursor-pointer"
              >
                {/* 案例图片区域 - 移除logo占位符 */}
                <div className="relative h-44 overflow-hidden">
                  {('image_url' in case_ && case_.image_url) ? (
                    <img
                      src={case_.image_url}
                      alt={case_.company_name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-gray-50 to-blue-100 flex items-center justify-center p-4">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md">
                        <Building className="w-10 h-10 text-[#194fe8]" />
                      </div>
                    </div>
                  )}
                </div>

                {/* 案例信息 */}
                <div className="p-5">
                  <div className="flex items-center space-x-2 mb-3">
                    <span className="px-3 py-1 bg-blue-50 text-[#194fe8] text-xs font-medium rounded-full">{case_.industry}</span>
                  </div>
                  
                  <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#194fe8] transition-colors text-lg">
                    {case_.company_name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                    {'results' in case_ ? case_.results : case_.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-sm text-[#194fe8] font-medium">查看详情</span>
                    <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-[#194fe8] group-hover:translate-x-2 transition-all duration-300" />
                  </div>
                </div>
              </div>
            ))}
            </div>
          ) : (
            <div className="bg-gray-50 rounded-lg p-8 text-center">
              <p className="text-gray-500">正在加载合作客户案例...</p>
            </div>
          )}

          {/* 分页 */}
          <div className="flex justify-center items-center space-x-2 mt-12">
            <button className="w-9 h-9 bg-[#194fe8] text-white rounded-full flex items-center justify-center text-sm font-medium shadow-sm hover:bg-[#1640c7] transition-colors">
              1
            </button>
            <button className="w-9 h-9 text-gray-600 hover:bg-gray-100 rounded-full flex items-center justify-center text-sm transition-colors">
              2
            </button>
            <button className="w-9 h-9 text-gray-600 hover:bg-gray-100 rounded-full flex items-center justify-center text-sm transition-colors">
              3
            </button>
            <button className="w-9 h-9 text-gray-600 hover:bg-gray-100 rounded-full flex items-center justify-center text-sm transition-colors">
              4
            </button>
            <span className="text-gray-400">...</span>
            <button className="w-9 h-9 text-gray-600 hover:bg-gray-100 rounded-full flex items-center justify-center text-sm transition-colors">
              7
            </button>
            <button className="w-9 h-9 text-gray-600 hover:bg-gray-100 rounded-full flex items-center justify-center text-sm transition-colors">
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* CTA区域 */}
      <section className="bg-[#194fe8] py-20">
        <div className="max-w-4xl mx-auto px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-6">
            成为下一个成功案例
          </h2>
          <p className="text-blue-100 text-lg mb-10">
            加入这些成功企业的行列，让久火ERP助力您的数字化转型
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <FormButton className="bg-white text-[#194fe8] hover:bg-gray-100 shadow-lg hover:shadow-xl transition-all px-8 py-3 text-base">
              免费试用
            </FormButton>
            <FormButton variant="outline" className="border-white text-white hover:bg-white hover:text-[#194fe8] shadow-lg hover:shadow-xl transition-all px-8 py-3 text-base">
              预约演示
            </FormButton>
          </div>
        </div>
      </section>
    </div>
  );
});

CustomerCasesPage.displayName = 'CustomerCasesPage';

export default CustomerCasesPage;
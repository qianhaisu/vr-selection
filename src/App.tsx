import React, { useState, useMemo } from 'react';
import _ from 'lodash';
import { 
  Layout, 
  Menu, 
  Table, 
  Tag, 
  Space, 
  Button, 
  Input, 
  Select, 
  Card, 
  Statistic, 
  Row, 
  Col, 
  Modal, 
  Descriptions, 
  Steps, 
  Badge,
  Dropdown,
  message,
  Tabs,
  Tooltip,
  Progress,
  Form,
  Typography,
  Alert
} from 'antd';
import { 
  UserOutlined, 
  HomeOutlined, 
  SafetyCertificateOutlined, 
  LogoutOutlined,
  FilterOutlined,
  ExportOutlined,
  CheckCircleOutlined,
  SyncOutlined,
  LockOutlined,
  EditOutlined,
  AppstoreOutlined,
  TableOutlined,
  LinkOutlined,
  FileSearchOutlined,
  FolderOpenOutlined,
  FilePdfOutlined,
  FileImageOutlined,
  FileTextOutlined,
  PieChartOutlined,
  BarChartOutlined,
  ReloadOutlined,
  ArrowUpOutlined,
  LoginOutlined,
  BoxPlotOutlined
} from '@ant-design/icons';
import { 
  PieChart, Pie, Cell, 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, 
  ResponsiveContainer, LineChart, Line, ComposedChart
} from 'recharts';
import { HOUSES, USERS, User, House } from './data/mockData';

const { Header, Content, Sider } = Layout;
const { Option } = Select;
const { Title, Text } = Typography;

const App: React.FC = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [currentUser, setCurrentUser] = useState<User>(USERS[0]); // Default to Consultant for demo
  const [houses, setHouses] = useState<House[]>(HOUSES);
  const [selectedHouse, setSelectedHouse] = useState<House | null>(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isContractModalVisible, setIsContractModalVisible] = useState(false);
  const [contractStep, setContractStep] = useState(0);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [selectionDeadline, setSelectionDeadline] = useState<'open' | 'closed'>('open');
  const [activeMenu, setActiveMenu] = useState('1');
  const [selectionTab, setSelectionTab] = useState('visual');
  
  // Dashboard filters
  const [dashConsultant, setDashConsultant] = useState<string | null>(null);
  const [dashLayout, setDashLayout] = useState<string | null>(null);
  const [dashStyle, setDashStyle] = useState<string | null>(null);
  
  // Drill-down state
  const [drillDownVisible, setDrillDownVisible] = useState(false);
  const [drillDownTitle, setDrillDownTitle] = useState('');
  const [drillDownData, setDrillDownData] = useState<House[]>([]);

  const VR_LINK = "https://bbc-dip.qunhefc.com/pub/kxj/selection/main/bbc/home?obsActivityId=3FO4K4VOHXCV&projectId=8552&obsFloorplanId=3FO4K4WN89FV";

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setIsLoggedIn(true);
    setActiveMenu('1');
    setSelectionTab('visual');
    message.success(`欢迎回来，${user.name}！`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    message.info('已退出登录');
  };

  const handleSubmitApproval = (houseId: string) => {
    setHouses(prev => prev.map(h => {
      if (h.id === houseId) {
        return {
          ...h,
          selectionStatus: '待审批',
          approvalStatus: '营销初审中',
          operateTime: new Date().toLocaleString(),
          operator: currentUser.name
        };
      }
      return h;
    }));
    message.success('选配方案已提交 OA 审批');
    setIsModalVisible(false);
  };

  const handleInitiateChange = (houseId: string) => {
    setHouses(prev => prev.map(h => {
      if (h.id === houseId) {
        return {
          ...h,
          selectionStatus: '变更审批中',
          approvalStatus: '变更待审批',
          operateTime: new Date().toLocaleString(),
          operator: currentUser.name
        };
      }
      return h;
    }));
    message.success('已发起变更申请，房源进入变更审批流程');
    setIsModalVisible(false);
  };

  const handleRequestUnlock = (houseId: string) => {
    setHouses(prev => prev.map(h => {
      if (h.id === houseId) {
        return {
          ...h,
          selectionStatus: '解锁审批中',
          approvalStatus: '解锁待审批 (OA 流程已发起)',
          operateTime: new Date().toLocaleString(),
          operator: currentUser.name
        };
      }
      return h;
    }));
    message.success('已发起解锁申请，OA 审批流程已同步启动');
    setIsModalVisible(false);
  };

  const handleInitiateContract = (houseId: string) => {
    const house = houses.find(h => h.id === houseId);
    if (!house) return;
    setSelectedHouse(house);
    setContractStep(0);
    setIsContractModalVisible(true);
  };

  const confirmSendContract = () => {
    if (!selectedHouse) return;
    setContractStep(1);
    setTimeout(() => {
      setHouses(prev => prev.map(h => {
        if (h.id === selectedHouse.id) {
          return {
            ...h,
            contractStatus: '已发起待签约',
            operateTime: new Date().toLocaleString(),
            operator: currentUser.name
          };
        }
        return h;
      }));
      message.success('合同已成功发起，已发送短信邀请客户签约');
    }, 1500);
  };

  // Filter houses based on role and search
  const filteredHouses = useMemo(() => {
    if (!currentUser) return [];
    return houses.filter(house => {
      const matchesRole = currentUser.role === 'admin' || currentUser.role === 'engineer' || currentUser.role === 'supply_chain' || currentUser.role === 'cost' || house.consultantId === currentUser.id;
      const matchesSearch = (house.roomNo || '').includes(searchText) || (house.customerName || '').includes(searchText) || (house.consultant || '').includes(searchText);
      const matchesStatus = !statusFilter || house.selectionStatus === statusFilter;
      return matchesRole && matchesSearch && matchesStatus;
    });
  }, [houses, currentUser, searchText, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: houses.length,
      locked: houses.filter(h => h.selectionStatus === '已锁死').length,
      approving: houses.filter(h => h.selectionStatus.includes('审批')).length,
      pending: houses.filter(h => h.selectionStatus === '待选配').length,
    };
  }, [houses]);

  const getStatusColor = (status: string) => {
    if (selectionDeadline === 'closed') return 'error';
    switch (status) {
      case '已锁死': return 'error';
      case '待审批': return 'warning';
      case '审批中': return 'processing';
      case '选配中': return 'blue';
      case '变更审批中': return 'volcano';
      case '待选配': return 'default';
      default: return 'default';
    }
  };

  const columns = [
    {
      title: '房号',
      dataIndex: 'roomNo',
      key: 'roomNo',
      fixed: 'left' as const,
      render: (text: string) => <a>{text}</a>,
    },
    {
      title: '客户',
      dataIndex: 'customerName',
      key: 'customerName',
    },
    {
      title: '布局/风格',
      key: 'layoutStyle',
      render: (_: any, record: House) => `${record.layout} / ${record.style}`,
    },
    {
      title: '置业顾问',
      dataIndex: 'consultant',
      key: 'consultant',
    },
    {
      title: '金额 (万元)',
      dataIndex: 'amount',
      key: 'amount',
      render: (val: number) => <span style={{ fontWeight: 'bold', color: '#cf1322' }}>{val || '-'}</span>,
    },
    {
      title: '销控状态',
      dataIndex: 'selectionStatus',
      key: 'selectionStatus',
      render: (status: string) => {
        const isLocked = selectionDeadline === 'closed' || status === '已锁死';
        return (
          <Tag color={isLocked ? 'error' : getStatusColor(status)} icon={isLocked ? <LockOutlined /> : null}>
            {selectionDeadline === 'closed' ? '已停止选配 (强制锁定)' : status}
          </Tag>
        );
      },
    },
    {
      title: '合同状态',
      dataIndex: 'contractStatus',
      key: 'contractStatus',
      render: (status: string) => {
        if (!status) return '-';
        const colors = {
          '未发起': 'default',
          '已发起待签约': 'processing',
          '客户已签待归档': 'warning',
          '已归档': 'success'
        };
        return <Tag color={colors[status as keyof typeof colors]}>{status}</Tag>;
      }
    },
    {
      title: '审批状态',
      dataIndex: 'approvalStatus',
      key: 'approvalStatus',
      render: (status: string) => {
        let dotStatus: 'default' | 'processing' | 'success' | 'error' | 'warning' = 'default';
        if (status.includes('中')) dotStatus = 'processing';
        if (status.includes('完成')) dotStatus = 'success';
        if (status.includes('待')) dotStatus = 'warning';
        return <Badge status={dotStatus} text={status} />;
      }
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: House) => (
        <Space size="middle">
          <Button type="link" onClick={() => { setSelectedHouse(record); setIsModalVisible(true); }}>详情</Button>
          {(currentUser.role === 'consultant' || currentUser.role === 'admin') && (
            <>
              {record.selectionStatus === '选配中' && selectionDeadline === 'open' && (
                <Button type="link" onClick={() => handleSubmitApproval(record.id)}>提交审批</Button>
              )}
              {(record.selectionStatus === '已锁死' || selectionDeadline === 'closed') && (
                <Button type="link" onClick={() => handleRequestUnlock(record.id)}>申请解锁</Button>
              )}
              {(record.selectionStatus === '已锁死' || selectionDeadline === 'closed') && record.contractStatus === '未发起' && record.customerName && (
                <Button type="link" onClick={() => handleInitiateContract(record.id)}>发起合同</Button>
              )}
            </>
          )}
        </Space>
      ),
    },
  ];

  const handleUserSwitch = (user: User) => {
    setCurrentUser(user);
    message.success(`已切换为：${user.name} (${user.role})`);
  };

  const userMenu = {
    items: USERS.map(u => ({
      key: u.id,
      label: `${u.name} - ${u.role}`,
      onClick: () => handleUserSwitch(u)
    }))
  };

  // Dashboard Logic
  const dashboardData = useMemo(() => {
    const filtered = houses.filter(h => {
      const matchesConsultant = !dashConsultant || h.consultant === dashConsultant;
      const matchesLayout = !dashLayout || h.layout === dashLayout;
      const matchesStyle = !dashStyle || h.style === dashStyle;
      return matchesConsultant && matchesLayout && matchesStyle;
    });

    const validHouses = filtered.filter(h => h.selectionStatus !== '待选配');
    const totalValidCount = validHouses.length || 1;

    // 3.1 Layout Stats
    const layoutCounts = _.countBy(validHouses, 'layout');
    const layoutChartData = Object.entries(layoutCounts).map(([name, value]) => ({
      name,
      value,
      percent: ((value / totalValidCount) * 100).toFixed(2)
    }));

    // 3.2 Style Stats
    const styleCounts = _.countBy(validHouses, 'style');
    const styleChartData = Object.entries(styleCounts).map(([name, value]) => ({
      name,
      value,
      percent: ((value / totalValidCount) * 100).toFixed(2)
    }));
    const topStyle = _.maxBy(styleChartData, 'value');

    // 3.3 Component Stats (Data Table)
    const getComponentStats = (field: keyof House) => {
      const groups = _.groupBy(validHouses.filter(h => h[field]), field);
      return Object.entries(groups).map(([name, group]) => ({
        name,
        count: group.length,
        amount: _.sumBy(group, 'amount')
      }));
    };

    const kitchenStats = getComponentStats('kitchenBrand');
    const wallStats = getComponentStats('materialWall');
    const islandStats = getComponentStats('islandPos');

    // 3.4 Package Stats
    const packageGroups = _.groupBy(validHouses, 'packagePlan');
    const packageData = Object.entries(packageGroups).map(([name, group]) => ({
      name,
      count: group.length,
      amount: _.sumBy(group, 'amount')
    }));

    return {
      layoutChartData,
      styleChartData,
      topStyle,
      kitchenStats,
      wallStats,
      islandStats,
      packageData,
      totalValid: validHouses.length
    };
  }, [houses, dashConsultant, dashLayout, dashStyle]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

  const handleDrillDown = (title: string, filterFn: (h: House) => boolean) => {
    const filtered = houses.filter(h => h.selectionStatus !== '待选配' && filterFn(h));
    setDrillDownTitle(title);
    setDrillDownData(filtered);
    setDrillDownVisible(true);
  };

  const renderDashboard = () => {
    if (currentUser.role !== 'admin' && currentUser.role !== 'engineer' && currentUser.role !== 'supply_chain' && currentUser.role !== 'cost') {
      return <Card><div style={{ textAlign: 'center', padding: '40px' }}>您没有权限查看统计看板</div></Card>;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {/* Filter Bar */}
        <Card size="small" bodyStyle={{ padding: '12px 24px' }}>
          <Row justify="space-between" align="middle">
            <Col>
              <Space size="middle">
                <span style={{ fontWeight: 'bold', marginRight: 8 }}>数据筛选:</span>
                <Select placeholder="置业顾问" style={{ width: 140 }} allowClear onChange={setDashConsultant}>
                  {Array.from(new Set(houses.map(h => h.consultant))).map(c => <Option key={c} value={c}>{c}</Option>)}
                </Select>
                <Select placeholder="户型布局" style={{ width: 120 }} allowClear onChange={setDashLayout}>
                  <Option value="4 室">4 室</Option>
                  <Option value="3+1 室">3+1 室</Option>
                </Select>
                <Select placeholder="装修风格" style={{ width: 120 }} allowClear onChange={setDashStyle}>
                  <Option value="CCD风格">CCD风格</Option>
                  <Option value="丹健风格">丹健风格</Option>
                </Select>
                <Button icon={<ReloadOutlined />} onClick={() => message.success('数据已刷新')}>刷新</Button>
              </Space>
            </Col>
            <Col>
              <Button icon={<ExportOutlined />} type="primary">导出统计报表</Button>
            </Col>
          </Row>
        </Card>

        {dashboardData.totalValid === 0 && (
          <Card><div style={{ textAlign: 'center', padding: '40px', color: '#8c8c8c' }}>暂无选配数据</div></Card>
        )}

        {/* 3.5 Progress Stats */}
        <Row gutter={16} style={{ display: 'flex', alignItems: 'stretch' }}>
          <Col span={6}>
            <Card size="small" style={{ height: '100%' }}>
              <Statistic title="总房源" value={houses.length} suffix="套" />
              <div style={{ height: 22 }}></div> {/* Placeholder to match height with progress bar */}
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ height: '100%' }}>
              <Statistic 
                title="已选配房源" 
                value={dashboardData.totalValid} 
                suffix="套"
                valueStyle={{ color: '#1890ff' }}
              />
              <div style={{ marginTop: 8 }}>
                <Progress 
                  percent={parseFloat(((dashboardData.totalValid / houses.length) * 100).toFixed(1))} 
                  size="small" 
                  status="active"
                  strokeColor="#1890ff"
                />
              </div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ height: '100%' }}>
              <Statistic title="待审批房源" value={houses.filter(h => h.selectionStatus === '待审批').length} suffix="套" valueStyle={{ color: '#faad14' }} />
              <div style={{ height: 22 }}></div>
            </Card>
          </Col>
          <Col span={6}>
            <Card size="small" style={{ height: '100%' }}>
              <Statistic title="已锁死房源" value={houses.filter(h => h.selectionStatus === '已锁死').length} suffix="套" valueStyle={{ color: '#52c41a' }} />
              <div style={{ height: 22 }}></div>
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* 3.1 Layout Stats */}
          <Col span={12}>
            <Card title="户型布局选择统计" size="small" style={{ height: '100%' }}>
              <div style={{ height: 260, display: 'flex', alignItems: 'center' }}>
                <ResponsiveContainer width="50%" height="100%">
                  <PieChart>
                    <Pie 
                      data={dashboardData.layoutChartData} 
                      innerRadius={60} 
                      outerRadius={80} 
                      paddingAngle={5} 
                      dataKey="value"
                      onClick={(data) => handleDrillDown(`布局明细: ${data.name}`, h => h.layout === data.name)}
                      style={{ cursor: 'pointer' }}
                    >
                      {dashboardData.layoutChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div style={{ width: '50%', paddingLeft: '20px' }}>
                  <Table 
                    dataSource={dashboardData.layoutChartData}
                    pagination={false}
                    size="small"
                    columns={[
                      { title: '布局', dataIndex: 'name', key: 'name', render: (t, r, i) => <Badge color={COLORS[i % COLORS.length]} text={t} /> },
                      { title: '户数', dataIndex: 'value', key: 'value' },
                      { title: '占比', dataIndex: 'percent', key: 'percent', render: (v) => `${v}%` }
                    ]}
                  />
                </div>
              </div>
            </Card>
          </Col>

          {/* 3.2 Style Stats */}
          <Col span={12}>
            <Card title="装修风格选择统计" size="small" style={{ height: '100%' }} extra={
              dashboardData.topStyle && <Tag color="gold" icon={<ArrowUpOutlined />}>最受欢迎: {dashboardData.topStyle.name}</Tag>
            }>
              <div style={{ height: 260, display: 'flex', alignItems: 'center' }}>
                <ResponsiveContainer width="50%" height="100%">
                  <BarChart 
                    layout="vertical" 
                    data={dashboardData.styleChartData} 
                    margin={{ left: 10, right: 30 }}
                    onClick={(data) => {
                      if (data && data.activeLabel) {
                        handleDrillDown(`风格明细: ${data.activeLabel}`, h => h.style === data.activeLabel);
                      }
                    }}
                    style={{ cursor: 'pointer' }}
                  >
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" width={60} />
                    <RechartsTooltip />
                    <Bar dataKey="value" fill="#1890ff" radius={[0, 4, 4, 0]} barSize={30}>
                      {dashboardData.styleChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[(index + 2) % COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
                <div style={{ width: '50%', paddingLeft: '20px' }}>
                  <Table 
                    dataSource={dashboardData.styleChartData}
                    pagination={false}
                    size="small"
                    columns={[
                      { title: '风格', dataIndex: 'name', key: 'name', render: (t, r, i) => <Badge color={COLORS[(i + 2) % COLORS.length]} text={t} /> },
                      { title: '户数', dataIndex: 'value', key: 'value' },
                      { title: '占比', dataIndex: 'percent', key: 'percent', render: (v) => `${v}%` }
                    ]}
                  />
                </div>
              </div>
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* 3.3 Component Stats (Data Table) */}
          <Col span={24}>
            <Card title="可选部品选配统计 (厨电/背景墙/岛台)" size="small">
              <Row gutter={24}>
                <Col span={8}>
                  <Table 
                    title={() => <div style={{ fontWeight: 'bold', textAlign: 'center' }}>厨电品牌</div>}
                    dataSource={dashboardData.kitchenStats}
                    pagination={false}
                    size="small"
                    columns={[
                      { title: '品牌', dataIndex: 'name', key: 'name' },
                      { title: '户数', dataIndex: 'count', key: 'count', sorter: (a, b) => a.count - b.count },
                      { title: '金额(万)', dataIndex: 'amount', key: 'amount', render: (v) => v.toFixed(2) }
                    ]}
                  />
                </Col>
                <Col span={8}>
                  <Table 
                    title={() => <div style={{ fontWeight: 'bold', textAlign: 'center' }}>背景墙材质</div>}
                    dataSource={dashboardData.wallStats}
                    pagination={false}
                    size="small"
                    columns={[
                      { title: '材质', dataIndex: 'name', key: 'name' },
                      { title: '户数', dataIndex: 'count', key: 'count' },
                      { title: '金额(万)', dataIndex: 'amount', key: 'amount', render: (v) => v.toFixed(2) }
                    ]}
                  />
                </Col>
                <Col span={8}>
                  <Table 
                    title={() => <div style={{ fontWeight: 'bold', textAlign: 'center' }}>岛台位置</div>}
                    dataSource={dashboardData.islandStats}
                    pagination={false}
                    size="small"
                    columns={[
                      { title: '位置', dataIndex: 'name', key: 'name' },
                      { title: '户数', dataIndex: 'count', key: 'count' },
                      { title: '金额(万)', dataIndex: 'amount', key: 'amount', render: (v) => v.toFixed(2) }
                    ]}
                  />
                </Col>
              </Row>
            </Card>
          </Col>
        </Row>

        <Row gutter={16}>
          {/* 3.4 Package Stats (Data Table) */}
          <Col span={24}>
            <Card title="套餐包选配统计" size="small">
              <Table 
                dataSource={dashboardData.packageData}
                pagination={false}
                size="small"
                columns={[
                  { title: '套餐名称', dataIndex: 'name', key: 'name' },
                  { title: '选配户数', dataIndex: 'count', key: 'count', sorter: (a, b) => a.count - b.count },
                  { title: '销售总额(万)', dataIndex: 'amount', key: 'amount', render: (v) => v.toFixed(2), sorter: (a, b) => a.amount - b.amount },
                  { title: '占比', key: 'percent', render: (_, record) => `${((record.count / (dashboardData.totalValid || 1)) * 100).toFixed(2)}%` },
                  { 
                    title: '操作', 
                    key: 'op', 
                    render: (_, record) => <Button type="link" size="small" onClick={() => handleDrillDown(`套餐包明细: ${record.name}`, h => h.packagePlan === record.name)}>查看明细</Button> 
                  }
                ]}
                footer={() => (
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '40px', padding: '0 20px' }}>
                    <Statistic title="累计销售总额" value={_.sumBy(dashboardData.packageData, 'amount')} precision={2} suffix="万" valueStyle={{ fontSize: 18, color: '#cf1322' }} />
                    <Statistic title="平均选配单价" value={_.sumBy(dashboardData.packageData, 'amount') / (dashboardData.totalValid || 1)} precision={2} suffix="万" valueStyle={{ fontSize: 18 }} />
                  </div>
                )}
              />
            </Card>
          </Col>
        </Row>

        <Modal
          title={drillDownTitle}
          open={drillDownVisible}
          onCancel={() => setDrillDownVisible(false)}
          width={900}
          footer={[
            <Button key="export" icon={<ExportOutlined />} onClick={() => message.success('明细已导出')}>导出明细</Button>,
            <Button key="close" onClick={() => setDrillDownVisible(false)}>关闭</Button>
          ]}
        >
          <Table 
            dataSource={drillDownData}
            rowKey="id"
            size="small"
            columns={[
              { title: '房号', dataIndex: 'roomNo', key: 'roomNo' },
              { title: '客户', dataIndex: 'customerName', key: 'customerName' },
              { title: '置业顾问', dataIndex: 'consultant', key: 'consultant' },
              { title: '布局', dataIndex: 'layout', key: 'layout' },
              { title: '风格', dataIndex: 'style', key: 'style' },
              { title: '套餐包', dataIndex: 'packagePlan', key: 'packagePlan' },
              { title: '金额(万)', dataIndex: 'amount', key: 'amount' },
            ]}
            pagination={{ pageSize: 8 }}
          />
        </Modal>
      </div>
    );
  };

  const renderVisualBoard = (mode: 'selection' | 'archive' = 'selection') => {
    return (
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '16px', padding: '16px' }}>
        {filteredHouses.map(house => (
          <Tooltip title={house.selectionStatus} key={house.id}>
            <Card 
              hoverable 
              size="small"
              style={{ 
                borderTop: `4px solid ${
                  (house.selectionStatus === '已锁死' || (selectionDeadline === 'closed' && mode === 'selection')) ? '#ff4d4f' : 
                  house.selectionStatus === '待选配' ? '#d9d9d9' : 
                  house.selectionStatus === '选配中' ? '#1890ff' : '#faad14'
                }`,
                textAlign: 'center',
                cursor: 'pointer',
                backgroundColor: (selectionDeadline === 'closed' && mode === 'selection') ? '#fafafa' : '#fff',
                opacity: (selectionDeadline === 'closed' && mode === 'selection') ? 0.8 : 1
              }}
              onClick={() => {
                // Only consultant can go to selection VR
                if (currentUser.role === 'consultant' && mode === 'selection' && selectionDeadline === 'open' && house.customerName && (house.selectionStatus === '待选配' || house.selectionStatus === '选配中')) {
                  window.open(VR_LINK, '_blank');
                } else {
                  setSelectedHouse(house);
                  setIsModalVisible(true);
                }
              }}
            >
              <div style={{ fontWeight: 'bold', fontSize: '14px' }}>{house.roomNo.split(' ').pop()}</div>
              <div style={{ fontSize: '12px', color: '#8c8c8c', marginTop: '4px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {house.customerName || '空置'}
              </div>
              {mode === 'selection' ? (
                <>
                  {currentUser.role === 'consultant' && house.customerName && selectionDeadline === 'open' && (house.selectionStatus === '待选配' || house.selectionStatus === '选配中') && (
                    <div style={{ marginTop: '8px', color: '#1890ff', fontSize: '12px' }}>
                      <LinkOutlined /> 去选装
                    </div>
                  )}
                  {(house.selectionStatus === '已锁死' || selectionDeadline === 'closed') && (
                    <div style={{ marginTop: '8px', color: '#ff4d4f', fontSize: '12px' }}>
                      <LockOutlined /> {selectionDeadline === 'closed' ? '已停止选配' : '已锁死'}
                    </div>
                  )}
                </>
              ) : (
                <div style={{ marginTop: '8px' }}>
                  {house.selectionStatus === '待选配' ? (
                    <Tag color="default" style={{ fontSize: '10px', margin: 0 }}>未建档</Tag>
                  ) : (
                    <div style={{ display: 'flex', justifyContent: 'center', gap: '4px' }}>
                      <FilePdfOutlined style={{ color: house.files?.list ? '#ff4d4f' : '#d9d9d9' }} />
                      <FileTextOutlined style={{ color: house.files?.contract ? '#1890ff' : '#d9d9d9' }} />
                      <FileImageOutlined style={{ color: house.files?.drawing ? '#52c41a' : '#d9d9d9' }} />
                      <LinkOutlined style={{ color: house.files?.vrEffect ? '#722ed1' : '#d9d9d9' }} />
                    </div>
                  )}
                </div>
              )}
            </Card>
          </Tooltip>
        ))}
      </div>
    );
  };

  if (!isLoggedIn) {
    return (
      <div style={{ 
        height: '100vh', 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        backgroundImage: 'url("https://images.unsplash.com/photo-1600607687940-47a04b629753?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative'
      }}>
        {/* Overlay for better contrast */}
        <div style={{ 
          position: 'absolute', 
          top: 0, left: 0, right: 0, bottom: 0, 
          backgroundColor: 'rgba(0, 21, 41, 0.45)',
          backdropFilter: 'blur(4px)'
        }} />

        <Card 
          style={{ 
            width: 420, 
            borderRadius: 16, 
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
            border: '1px solid rgba(255,255,255,0.2)',
            background: 'rgba(255, 255, 255, 0.92)',
            zIndex: 1
          }}
          bodyStyle={{ padding: '40px 32px' }}
        >
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <div style={{ 
              width: 64, 
              height: 64, 
              background: '#003a8c', 
              borderRadius: '16px', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              margin: '0 auto 20px',
              boxShadow: '0 8px 16px rgba(0,58,140,0.3)'
            }}>
              <HomeOutlined style={{ fontSize: 32, color: '#fff' }} />
            </div>
            <Title level={2} style={{ margin: 0, color: '#001529', fontWeight: 700, letterSpacing: '1px' }}>
              华润生产定制化系统
            </Title>
            <div style={{ marginTop: 8 }}>
              <Tag color="gold" style={{ borderRadius: 4, padding: '0 12px' }}>深圳后海湾澐玺</Tag>
            </div>
          </div>

          <Form layout="vertical" size="large">
            <div style={{ marginBottom: 24 }}>
              <Text strong style={{ color: '#595959', display: 'block', marginBottom: 12 }}>
                身份验证 / Identity Verification
              </Text>
              <Select 
                placeholder="请选择您的登录角色" 
                style={{ width: '100%' }}
                suffixIcon={<UserOutlined />}
                onChange={(val) => {
                  const user = USERS.find(u => u.id === val);
                  if (user) handleLogin(user);
                }}
              >
                {USERS.map(u => (
                  <Option key={u.id} value={u.id}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span>{u.name}</span>
                      <Text type="secondary" style={{ fontSize: 12 }}>{u.role}</Text>
                    </div>
                  </Option>
                ))}
              </Select>
            </div>

            <Button 
              type="primary" 
              block 
              size="large" 
              disabled 
              style={{ height: 48, borderRadius: 8, fontWeight: 600, marginTop: 8 }}
            >
              进入系统
            </Button>

            <div style={{ marginTop: 32, textAlign: 'center', borderTop: '1px solid #f0f0f0', paddingTop: 20 }}>
              <Space direction="vertical" size={4}>
                <Text type="secondary" style={{ fontSize: 12 }}>
                  © 2026 华润置地 · 生产定制化管理平台
                </Text>
                <Text type="secondary" style={{ fontSize: 11 }}>
                  Real Estate & Home Decoration Management System
                </Text>
              </Space>
            </div>
          </Form>
        </Card>
      </div>
    );
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sider theme="dark" breakpoint="lg" collapsedWidth="0" width={220}>
        <div style={{ height: 'auto', padding: '20px 16px', margin: '16px', background: 'linear-gradient(135deg, #001529 0%, #003a8c 100%)', borderRadius: 8, color: '#fff', textAlign: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: '18px', fontWeight: 'bold', letterSpacing: '1px' }}>华润生产定制化系统</div>
          <div style={{ fontSize: '13px', marginTop: '8px', color: '#69c0ff', fontWeight: '500' }}>深圳后海湾澐玺</div>
        </div>
        <Menu 
          theme="dark" 
          selectedKeys={[activeMenu]} 
          mode="inline"
          onClick={({ key }) => setActiveMenu(key)}
        >
          <Menu.Item key="1" icon={<HomeOutlined />}>选装管理</Menu.Item>
          <Menu.Item key="2" icon={<FolderOpenOutlined />}>一户一档</Menu.Item>
          {(currentUser.role === 'admin' || currentUser.role === 'engineer' || currentUser.role === 'supply_chain' || currentUser.role === 'cost') && (
            <Menu.Item key="3" icon={<PieChartOutlined />}>统计看板</Menu.Item>
          )}
          <Menu.Item key="4" icon={<SafetyCertificateOutlined />}>权限管理</Menu.Item>
        </Menu>
      </Sider>
      <Layout>
        <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 1px 4px rgba(0,21,41,.08)' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span style={{ fontSize: '20px', fontWeight: 'bold', color: '#001529' }}>华润生产定制化系统</span>
            <span style={{ margin: '0 12px', color: '#d9d9d9' }}>|</span>
            <span style={{ fontSize: '16px', color: '#595959' }}>深圳后海湾澐玺</span>
          </div>
          <Space size="large">
            <Dropdown menu={userMenu}>
              <Button icon={<UserOutlined />}>
                {currentUser.name} ({currentUser.role})
              </Button>
            </Dropdown>
            <Button icon={<LogoutOutlined />} type="text" onClick={handleLogout}>退出</Button>
          </Space>
        </Header>
        <Content style={{ margin: '24px' }}>
          {activeMenu === '3' ? (
            renderDashboard()
          ) : activeMenu === '1' ? (
            <>
              <Row gutter={16} style={{ marginBottom: 24 }}>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="总房源" value={stats.total} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="已锁死" value={stats.locked} valueStyle={{ color: '#cf1322' }} prefix={<LockOutlined />} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="审批中" value={stats.approving} valueStyle={{ color: '#1890ff' }} prefix={<SyncOutlined spin />} />
                  </Card>
                </Col>
                <Col span={6}>
                  <Card size="small">
                    <Statistic title="待选配" value={stats.pending} />
                  </Card>
                </Col>
              </Row>

              <Card>
                <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Space size="large">
                    <Space>
                      <Text strong>客户选配截止节点:</Text>
                      <Select 
                        value={selectionDeadline} 
                        style={{ width: 180 }}
                        onChange={(val) => {
                          setSelectionDeadline(val);
                          if (val === 'closed') {
                            setHouses(prev => prev.map(h => h.customerName ? { ...h, selectionStatus: '已锁死' } : h));
                          }
                          message.warning(val === 'closed' ? '已切换至：已开工停止选配，所有房源已锁定' : '已切换至：未开工可选配');
                        }}
                      >
                        <Option value="open">未开工可选配</Option>
                        <Option value="closed">已开工停止选配</Option>
                      </Select>
                    </Space>
                    <Space>
                      <Input 
                        placeholder="搜索房号/客户/顾问" 
                        style={{ width: 220 }} 
                        value={searchText}
                        onChange={e => setSearchText(e.target.value)}
                      />
                      <Select 
                        placeholder="销控状态" 
                        style={{ width: 150 }} 
                        allowClear
                        onChange={val => setStatusFilter(val)}
                      >
                        <Option value="待选配">待选配</Option>
                        <Option value="选配中">选配中</Option>
                        <Option value="待审批">待审批</Option>
                        <Option value="已锁死">已锁死</Option>
                        <Option value="变更审批中">变更审批中</Option>
                      </Select>
                    </Space>
                  </Space>
                  <Button icon={<ExportOutlined />}>导出 Excel</Button>
                </div>
                
                <Tabs 
                  activeKey={selectionTab} 
                  onChange={setSelectionTab}
                  items={[
                    {
                      key: 'list',
                      label: <span><TableOutlined /> 列表视图</span>,
                      children: (
                        <Table 
                          columns={columns} 
                          dataSource={filteredHouses} 
                          rowKey="id"
                          pagination={{ pageSize: 10 }}
                          scroll={{ x: 1000 }}
                          rowClassName={(record) => (selectionDeadline === 'closed' || record.selectionStatus === '已锁死') ? 'locked-row' : ''}
                        />
                      )
                    },
                    {
                      key: 'visual',
                      label: <span><AppstoreOutlined /> 房号销控表</span>,
                      children: renderVisualBoard('selection')
                    }
                  ]}
                />
              </Card>
            </>
          ) : activeMenu === '2' ? (
            <Card title="一户一档管理">
              <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                <Input.Search 
                  placeholder="搜索房号、客户、置业顾问" 
                  style={{ width: 350 }} 
                  onSearch={val => setSearchText(val)}
                  onChange={e => setSearchText(e.target.value)}
                />
              </div>
              <Tabs 
                defaultActiveKey="list" 
                items={[
                  {
                    key: 'list',
                    label: <span><TableOutlined /> 列表视图</span>,
                    children: (
                      <Table 
                        dataSource={filteredHouses}
                        rowKey="id"
                        columns={[
                          { title: '房号', dataIndex: 'roomNo', key: 'roomNo', fixed: 'left' },
                          { title: '客户', dataIndex: 'customerName', key: 'customerName', render: (val) => val || '-' },
                          { title: '置业顾问', dataIndex: 'consultant', key: 'consultant' },
                          {
                            title: '档案状态',
                            key: 'archiveStatus',
                            render: (_, record) => (
                              record.selectionStatus === '待选配' ? 
                              <Tag color="default">未建档</Tag> : 
                              <Tag color="success">已建档</Tag>
                            )
                          },
                          { 
                            title: '档案内容', 
                            key: 'files',
                            render: (_, record) => (
                              <Space size="middle">
                                <Tooltip title={record.selectionStatus === '待选配' ? "未建档" : "选配清单"}>
                                  <Button 
                                    type="text" 
                                    icon={<FilePdfOutlined style={{ color: record.files?.list ? '#ff4d4f' : '#d9d9d9' }} />} 
                                    disabled={!record.files?.list}
                                    onClick={() => message.info(`正在打开 ${record.roomNo} 的选配清单`)}
                                  />
                                </Tooltip>
                                <Tooltip title={record.selectionStatus === '待选配' ? "未建档" : "电子合同"}>
                                  <Button 
                                    type="text" 
                                    icon={<FileTextOutlined style={{ color: record.files?.contract ? '#1890ff' : '#d9d9d9' }} />} 
                                    disabled={!record.files?.contract}
                                    onClick={() => message.info(`正在打开 ${record.roomNo} 的电子合同`)}
                                  />
                                </Tooltip>
                                <Tooltip title={record.selectionStatus === '待选配' ? "未建档" : "施工图纸"}>
                                  <Button 
                                    type="text" 
                                    icon={<FileImageOutlined style={{ color: record.files?.drawing ? '#52c41a' : '#d9d9d9' }} />} 
                                    disabled={!record.files?.drawing}
                                    onClick={() => { setSelectedHouse(record); setIsModalVisible(true); }}
                                  />
                                </Tooltip>
                                <Tooltip title={record.selectionStatus === '待选配' ? "未建档" : "VR 效果图"}>
                                  <Button 
                                    type="text" 
                                    icon={<LinkOutlined style={{ color: record.files?.vrEffect ? '#722ed1' : '#d9d9d9' }} />} 
                                    disabled={!record.files?.vrEffect}
                                    onClick={() => window.open(record.files?.vrEffect, '_blank')}
                                  />
                                </Tooltip>
                              </Space>
                            )
                          },
                          { title: '最后更新', dataIndex: 'operateTime', key: 'operateTime' },
                          { 
                            title: '操作', 
                            key: 'op', 
                            render: (_, record) => (
                              <Button type="link" onClick={() => { setSelectedHouse(record); setIsModalVisible(true); }}>查看详情</Button>
                            ) 
                          }
                        ]}
                      />
                    )
                  },
                  {
                    key: 'visual',
                    label: <span><AppstoreOutlined /> 房间档案表</span>,
                    children: renderVisualBoard('archive')
                  }
                ]}
              />
            </Card>
          ) : (
            <Card title="权限管理">
              <Table 
                dataSource={USERS}
                rowKey="id"
                columns={[
                  { title: '账号', dataIndex: 'account', key: 'account' },
                  { title: '姓名', dataIndex: 'name', key: 'name' },
                  { title: '角色', dataIndex: 'role', key: 'role', render: (role) => <Tag color="blue">{role}</Tag> },
                          { title: '数据权限', key: 'data', render: (_, record) => record.role === 'admin' ? '全项目' : (record.role === 'engineer' || record.role === 'supply_chain' || record.role === 'cost' ? '全项目(只读)' : '本人名下') },
                          { title: '操作', key: 'op', render: () => <Button type="link">编辑权限</Button> }
                        ]}
                        pagination={false}
                      />
                    </Card>
                  )}
                </Content>
              </Layout>
        
              <Modal
                title={`房源详情 - ${selectedHouse?.roomNo}`}
                open={isModalVisible}
                onCancel={() => setIsModalVisible(false)}
                footer={[
                  <Button key="back" onClick={() => setIsModalVisible(false)}>关闭</Button>,
                  (currentUser.role === 'consultant' || currentUser.role === 'admin') && (
                    <>
                      {(selectedHouse?.selectionStatus === '已锁死' || selectionDeadline === 'closed') && (
                        <Button key="unlock" type="primary" icon={<LockOutlined />} onClick={() => handleRequestUnlock(selectedHouse!.id)}>申请解锁</Button>
                      )}
                      {selectedHouse?.selectionStatus === '选配中' && selectionDeadline === 'open' && (
                        <Button key="submit" type="primary" icon={<CheckCircleOutlined />} onClick={() => handleSubmitApproval(selectedHouse!.id)}>提交审批</Button>
                      )}
                      {(selectedHouse?.selectionStatus === '已锁死' || selectionDeadline === 'closed') && selectedHouse?.contractStatus === '未发起' && selectedHouse?.customerName && (
                        <Button key="contract" type="primary" icon={<FileTextOutlined />} onClick={() => handleInitiateContract(selectedHouse!.id)}>发起合同</Button>
                      )}
                    </>
                  )
                ]}
                width={800}
              >
        {selectedHouse && (
          <div>
            {selectedHouse.selectionStatus === '待选配' && (
              <Alert
                message="档案未建立"
                description="该房源尚未启动选装流程，目前仅显示基础房源信息，暂无选配清单、合同及施工图纸。"
                type="warning"
                showIcon
                style={{ marginBottom: 24 }}
              />
            )}
            <Descriptions title="一户一档基础信息" bordered size="small">
              <Descriptions.Item label="客户姓名">{selectedHouse.customerName || '-'}</Descriptions.Item>
              <Descriptions.Item label="联系电话">{selectedHouse.customerPhone || '-'}</Descriptions.Item>
              <Descriptions.Item label="置业顾问">{selectedHouse.consultant}</Descriptions.Item>
              <Descriptions.Item label="户型">{selectedHouse.houseType} 户型</Descriptions.Item>
              <Descriptions.Item label="布局">{selectedHouse.layout}</Descriptions.Item>
              <Descriptions.Item label="风格">{selectedHouse.style}</Descriptions.Item>
              <Descriptions.Item label="选配方案" span={2}>{selectedHouse.packagePlan}</Descriptions.Item>
              <Descriptions.Item label="合同金额">¥ {selectedHouse.amount || 0} 万元</Descriptions.Item>
              <Descriptions.Item label="销控状态">
                <Tag color={selectionDeadline === 'closed' ? 'error' : getStatusColor(selectedHouse.selectionStatus)}>
                  {selectionDeadline === 'closed' ? '已停止选配' : selectedHouse.selectionStatus}
                </Tag>
              </Descriptions.Item>
              <Descriptions.Item label="审批状态">{selectedHouse.approvalStatus}</Descriptions.Item>
              <Descriptions.Item label="合同状态">
                {selectedHouse.contractStatus ? (
                  <Tag color={
                    selectedHouse.contractStatus === '已归档' ? 'success' : 
                    selectedHouse.contractStatus === '已发起待签约' ? 'processing' : 'default'
                  }>
                    {selectedHouse.contractStatus}
                  </Tag>
                ) : '-'}
              </Descriptions.Item>
            </Descriptions>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 16, fontSize: '16px' }}>审批流进度</div>
              <Steps
                direction="vertical"
                size="small"
                current={selectedHouse.selectionStatus === '已锁死' ? 3 : 1}
                items={[
                  { title: '提交选配方案', description: `操作人: ${selectedHouse.consultant}`, subTitle: '已完成' },
                  { title: '营销初审', description: '审批人: 王经理', subTitle: selectedHouse.approvalStatus === '营销初审中' ? '进行中' : '已完成' },
                  { title: '法务终审', description: '审批人: 刘法务', subTitle: selectedHouse.approvalStatus === '法务审核中' ? '进行中' : (selectedHouse.selectionStatus === '已锁死' ? '已完成' : '待处理') },
                  { title: '房源锁死', description: '系统自动执行', subTitle: selectedHouse.selectionStatus === '已锁死' ? '已完成' : '待执行' },
                ]}
              />
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 16, fontSize: '16px' }}>选配清单明细</div>
              {selectedHouse.selectionItems && selectedHouse.selectionItems.length > 0 ? (
                <Table 
                  dataSource={selectedHouse.selectionItems}
                  rowKey="id"
                  size="small"
                  pagination={false}
                  columns={[
                    { title: '类别', dataIndex: 'category', key: 'category' },
                    { title: '名称', dataIndex: 'name', key: 'name' },
                    { title: '规格', dataIndex: 'spec', key: 'spec' },
                    { title: '金额(万)', dataIndex: 'price', key: 'price', render: (v) => v > 0 ? v : '标准交付' },
                  ]}
                  summary={(pageData) => {
                    let total = 0;
                    pageData.forEach(({ price }) => {
                      total += price;
                    });
                    return (
                      <Table.Summary.Row>
                        <Table.Summary.Cell index={0} colSpan={3}>合计</Table.Summary.Cell>
                        <Table.Summary.Cell index={1}>
                          <Text type="danger" strong>{total} 万</Text>
                        </Table.Summary.Cell>
                      </Table.Summary.Row>
                    );
                  }}
                />
              ) : (
                <Alert message="暂无选配明细" type="info" showIcon />
              )}
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 16, fontSize: '16px' }}>施工图清单</div>
              {selectedHouse.drawings && selectedHouse.drawings.length > 0 ? (
                <>
                  <Table 
                    dataSource={selectedHouse.drawings}
                    rowKey="id"
                    size="small"
                    pagination={false}
                    columns={[
                      { 
                        title: '图纸名称', 
                        dataIndex: 'name', 
                        key: 'name',
                        render: (text, record) => (
                          <Space>
                            <FilePdfOutlined style={{ color: record.category === '通用图纸' ? '#1890ff' : '#52c41a' }} />
                            <span>{text}</span>
                          </Space>
                        )
                      },
                      { 
                        title: '图纸类别', 
                        dataIndex: 'category', 
                        key: 'category',
                        render: (cat) => <Tag color={cat === '通用图纸' ? 'blue' : 'green'}>{cat}</Tag>
                      },
                      { 
                        title: '操作', 
                        key: 'op', 
                        render: (_, record) => (
                          <Space>
                            <Button type="link" size="small" onClick={() => {
                              Modal.info({
                              title: (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '95%' }}>
                                  <span>{record.name} - CAD 施工图预览</span>
                                  <Tag color="black">DWG Format</Tag>
                                </div>
                              ),
                              width: 1000,
                              centered: true,
                              maskClosable: true,
                              content: (
                                <div style={{ 
                                  background: '#212121', 
                                  borderRadius: '4px', 
                                  border: '1px solid #444',
                                  overflow: 'hidden',
                                  position: 'relative'
                                }}>
                                  {/* CAD Toolbar Simulation */}
                                  <div style={{ 
                                    background: '#333', 
                                    padding: '4px 12px', 
                                    display: 'flex', 
                                    gap: '16px', 
                                    borderBottom: '1px solid #444',
                                    color: '#ccc',
                                    fontSize: '12px'
                                  }}>
                                    <Space size="middle">
                                      <Tooltip title="平移 (P)"><SyncOutlined /></Tooltip>
                                      <Tooltip title="缩放 (Z)"><FileSearchOutlined /></Tooltip>
                                      <Tooltip title="图层管理 (LA)"><AppstoreOutlined /></Tooltip>
                                      <Tooltip title="测量 (DI)"><BarChartOutlined /></Tooltip>
                                    </Space>
                                    <div style={{ flex: 1 }}></div>
                                    <Space>
                                      {record.pdfUrl && (
                                        <Button 
                                          type="primary" 
                                          size="small" 
                                          icon={<FilePdfOutlined />} 
                                          onClick={() => window.open(record.pdfUrl, '_blank')}
                                          style={{ fontSize: '11px', height: '22px' }}
                                        >
                                          打开原始 PDF
                                        </Button>
                                      )}
                                      <Tag color="#555" style={{ margin: 0, fontSize: '10px' }}>X: 142.53</Tag>
                                      <Tag color="#555" style={{ margin: 0, fontSize: '10px' }}>Y: -89.12</Tag>
                                      <Tag color="#555" style={{ margin: 0, fontSize: '10px' }}>Z: 0.00</Tag>
                                    </Space>
                                  </div>

                                  <div style={{ 
                                    padding: '20px', 
                                    textAlign: 'center',
                                    position: 'relative',
                                    background: 'radial-gradient(circle, #2a2a2a 1px, transparent 1px)',
                                    backgroundSize: '20px 20px', // CAD Grid effect
                                    cursor: 'crosshair'
                                  }}>
                                    {/* CAD Status Overlay */}
                                    <div style={{ 
                                      position: 'absolute', 
                                      top: 10, 
                                      left: 10, 
                                      color: '#52c41a', 
                                      fontSize: '10px', 
                                      fontFamily: 'monospace',
                                      textAlign: 'left',
                                      zIndex: 1,
                                      pointerEvents: 'none',
                                      opacity: 0.8,
                                      lineHeight: '1.2'
                                    }}>
                                      PROJECT: RUSHING SEAL GARDEN (HOUHAI)<br/>
                                      SHEET: {record.name.split('(')[1]?.replace(')', '') || 'N/A'}<br/>
                                      DATE: 20 AUG, 2025<br/>
                                      LAYER: 0-DECO-PLAN<br/>
                                      UCS: WORLD
                                    </div>

                                  {/* The Drawing Image with CAD Filter */}
                                  <img 
                                    src={record.previewUrl} 
                                    style={{ 
                                      width: '100%', 
                                      filter: 'invert(1) contrast(1.5) brightness(1.2)', // Enhanced CAD line effect for better visibility
                                      display: 'block',
                                      mixBlendMode: 'screen'
                                    }} 
                                  />

                                    {/* CAD Crosshair Simulation */}
                                    <div style={{
                                      position: 'absolute',
                                      top: '50%',
                                      left: '50%',
                                      width: '40px',
                                      height: '40px',
                                      border: '1px solid rgba(255,255,255,0.3)',
                                      transform: 'translate(-50%, -50%)',
                                      pointerEvents: 'none'
                                    }}>
                                      <div style={{ position: 'absolute', top: '50%', left: '-20px', right: '-20px', height: '1px', background: 'rgba(255,255,255,0.3)' }} />
                                      <div style={{ position: 'absolute', left: '50%', top: '-20px', bottom: '-20px', width: '1px', background: 'rgba(255,255,255,0.3)' }} />
                                    </div>
                                  </div>

                                  {/* CAD Footer Info */}
                                  <div style={{ 
                                    background: '#333', 
                                    padding: '4px 12px', 
                                    color: '#8c8c8c', 
                                    fontSize: '11px',
                                    borderTop: '1px solid #444'
                                  }}>
                                    <Space split={<span style={{ color: '#444' }}>|</span>}>
                                      <span>SCALE: 1:60 @ A2</span>
                                      <span>PAPER: ISO A2 (594x420)</span>
                                      <span>UNIT: Millimeters</span>
                                      <span>STATUS: CONSTRUCTION DRAWING</span>
                                    </Space>
                                  </div>
                                </div>
                              ),
                              okText: '关闭预览'
                            });
                            }}>预览图纸</Button>
                            {record.pdfUrl && (
                              <Button 
                                type="link" 
                                size="small" 
                                icon={<FilePdfOutlined />} 
                                onClick={() => window.open(record.pdfUrl, '_blank')}
                              >
                                打开 PDF
                              </Button>
                            )}
                          </Space>
                        ) 
                      }
                    ]}
                  />
                  <div style={{ marginTop: 16, textAlign: 'right' }}>
                    <Button 
                      type="primary" 
                      icon={<BoxPlotOutlined />} 
                      onClick={() => window.open('https://www.kujiale.com/pub/bim/tool-page/pure-design-viewer?designid=3FO3BBCDLAWV&from=saas_my_design_detail&gs.nav.type=auto-site', '_blank')}
                    >
                      3D 模型展示
                    </Button>
                  </div>
                </>
              ) : (
                <Alert message="暂无匹配施工图" type="info" showIcon />
              )}
            </div>

            <div style={{ marginTop: 24 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 16, fontSize: '16px' }}>其他附件</div>
              <Space wrap>
                <Button type="dashed" icon={<FilePdfOutlined />} disabled={!selectedHouse.files?.list} onClick={() => message.info('正在预览选配清单...')}>选配清单.pdf</Button>
                <Button type="dashed" icon={<FileTextOutlined />} disabled={!selectedHouse.files?.contract} onClick={() => message.info('正在预览电子合同...')}>电子合同(已签署).pdf</Button>
                <Button type="dashed" icon={<LinkOutlined />} disabled={!selectedHouse.files?.vrEffect} onClick={() => window.open(selectedHouse.files?.vrEffect, '_blank')}>VR 效果图</Button>
              </Space>
            </div>
          </div>
        )}
      </Modal>

      {/* Contract Initiation & Signing Simulation Modal */}
      <Modal
        title="发起电子合同签约"
        open={isContractModalVisible}
        onCancel={() => setIsContractModalVisible(false)}
        width={contractStep === 2 ? 400 : 800}
        footer={null}
        centered
      >
        {selectedHouse && (
          <div style={{ padding: '10px 0' }}>
            {contractStep === 0 && (
              <div>
                <Steps
                  current={0}
                  items={[
                    { title: '确认信息' },
                    { title: '生成合同' },
                    { title: '发送短信' },
                    { title: '客户签约' },
                  ]}
                  style={{ marginBottom: 32 }}
                />
                <Row gutter={24}>
                  <Col span={12}>
                    <Title level={5}>客户及房源信息</Title>
                    <Descriptions column={1} bordered size="small">
                      <Descriptions.Item label="房号">{selectedHouse.roomNo}</Descriptions.Item>
                      <Descriptions.Item label="客户姓名">{selectedHouse.customerName}</Descriptions.Item>
                      <Descriptions.Item label="联系电话">{selectedHouse.customerPhone}</Descriptions.Item>
                      <Descriptions.Item label="选配风格">{selectedHouse.style}</Descriptions.Item>
                      <Descriptions.Item label="合同总额"><Text type="danger" strong>¥ {selectedHouse.amount} 万元</Text></Descriptions.Item>
                    </Descriptions>
                  </Col>
                  <Col span={12}>
                    <Title level={5}>选配清单摘要</Title>
                    <div style={{ maxHeight: 200, overflowY: 'auto', border: '1px solid #f0f0f0', padding: 8 }}>
                      {selectedHouse.selectionItems?.map(item => (
                        <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4, fontSize: 12 }}>
                          <span>{item.category}: {item.name}</span>
                          <Text type="secondary">{item.price > 0 ? `+${item.price}万` : '标配'}</Text>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 16 }}>
                      <Text strong>附件：</Text>
                      <Space direction="vertical" style={{ width: '100%', marginTop: 8 }}>
                        <Tag icon={<FilePdfOutlined />} color="red">定制化选配清单.pdf</Tag>
                        <Tag icon={<FilePdfOutlined />} color="blue">装修服务协议.pdf</Tag>
                        <Tag icon={<FileImageOutlined />} color="green">确认施工图纸集.zip</Tag>
                      </Space>
                    </div>
                  </Col>
                </Row>
                <div style={{ marginTop: 32, textAlign: 'right' }}>
                  <Button onClick={() => setIsContractModalVisible(false)} style={{ marginRight: 8 }}>取消</Button>
                  <Button type="primary" onClick={confirmSendContract}>确认并生成合同</Button>
                </div>
              </div>
            )}

            {contractStep === 1 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <SyncOutlined spin style={{ fontSize: 48, color: '#1890ff', marginBottom: 24 }} />
                <Title level={4}>正在生成电子合同并发送短信...</Title>
                <Text type="secondary">系统正在调用电子签章接口，并向客户 {selectedHouse.customerPhone} 发送签约链接</Text>
                <div style={{ marginTop: 32 }}>
                  <Button type="primary" ghost onClick={() => setContractStep(2)}>模拟客户手机端签约</Button>
                </div>
              </div>
            )}

            {contractStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                {/* Phone Mockup */}
                <div style={{ 
                  width: 300, 
                  height: 600, 
                  border: '12px solid #333', 
                  borderRadius: 36, 
                  overflow: 'hidden',
                  position: 'relative',
                  background: '#f5f5f5',
                  boxShadow: '0 20px 50px rgba(0,0,0,0.2)'
                }}>
                  {/* Phone Header */}
                  <div style={{ height: 40, background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderBottom: '1px solid #eee' }}>
                    <Text strong style={{ fontSize: 12 }}>电子合同签约</Text>
                  </div>
                  {/* Phone Content */}
                  <div style={{ padding: 16, height: 500, overflowY: 'auto' }}>
                    <div style={{ background: '#fff', padding: 12, borderRadius: 8, marginBottom: 16, boxShadow: '0 2px 8px rgba(0,0,0,0.05)' }}>
                      <Title level={5} style={{ fontSize: 14, marginBottom: 8 }}>尊敬的{selectedHouse.customerName}：</Title>
                      <Text style={{ fontSize: 12 }}>您好！您在“深圳后海湾澐玺”项目的装修定制化选配方案已确认，请在线签署相关协议。</Text>
                    </div>
                    
                    <div style={{ background: '#fff', padding: 12, borderRadius: 8, marginBottom: 16 }}>
                      <div style={{ textAlign: 'center', borderBottom: '1px solid #f0f0f0', paddingBottom: 8, marginBottom: 8 }}>
                        <Text strong style={{ fontSize: 14 }}>装修定制化服务协议</Text>
                      </div>
                      <div style={{ fontSize: 10, color: '#595959' }}>
                        <p>甲方：华润置地（深圳）有限公司</p>
                        <p>乙方：{selectedHouse.customerName}</p>
                        <p>房号：{selectedHouse.roomNo}</p>
                        <p>选配总额：¥ {selectedHouse.amount} 万元</p>
                        <div style={{ height: 100, background: '#fafafa', border: '1px dashed #d9d9d9', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '10px 0' }}>
                          <Text type="secondary">合同正文内容预览...</Text>
                        </div>
                      </div>
                    </div>

                    <Button type="primary" block style={{ borderRadius: 20 }} onClick={() => {
                      message.loading('正在提交签名...', 1.5).then(() => {
                        setHouses(prev => prev.map(h => {
                          if (h.id === selectedHouse.id) {
                            return { ...h, contractStatus: '已归档' };
                          }
                          return h;
                        }));
                        setContractStep(3);
                      });
                    }}>立即签署</Button>
                  </div>
                  {/* Phone Footer */}
                  <div style={{ position: 'absolute', bottom: 10, left: '50%', transform: 'translateX(-50%)', width: 100, height: 4, background: '#333', borderRadius: 2 }} />
                </div>
                <div style={{ marginTop: 20 }}>
                  <Text type="secondary">以上为客户手机端模拟界面</Text>
                </div>
              </div>
            )}

            {contractStep === 3 && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <CheckCircleOutlined style={{ fontSize: 64, color: '#52c41a', marginBottom: 24 }} />
                <Title level={3}>合同签署完成！</Title>
                <Text type="secondary">客户已完成在线签约，合同已自动归档至“一户一档”系统。</Text>
                <div style={{ marginTop: 32 }}>
                  <Button type="primary" onClick={() => setIsContractModalVisible(false)}>返回列表</Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Modal>
    </Layout>
  );
};

export default App;

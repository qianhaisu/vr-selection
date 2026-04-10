import _ from 'lodash';

export interface User {
  id: string;
  name: string;
  role: 'consultant' | 'admin' | 'engineer' | 'supply_chain' | 'cost';
  account: string;
}

export interface SelectionItem {
  id: string;
  category: string;
  name: string;
  spec: string;
  price: number;
}

export interface Drawing {
  id: string;
  name: string;
  category: '通用图纸' | '选装图纸';
  previewUrl: string;
  matchKey: string;
  pdfUrl?: string;
}

export interface House {
  id: string;
  roomNo: string;
  unit: string;
  houseType: string;
  layout: string;
  style: string;
  customerName: string;
  customerPhone: string;
  consultant: string;
  consultantId: string;
  packagePlan: string;
  amount: number;
  selectionStatus: string;
  approvalStatus: string;
  operateTime: string;
  operator: string;
  contractStatus?: '未发起' | '已发起待签约' | '客户已签待归档' | '已归档';
  // New fields for statistics
  kitchenBrand?: '方太' | '嘉格纳';
  materialWall?: '背景墙 A' | '背景墙 B';
  materialFloor?: '大理石' | '木地板';
  islandPos?: '位置 1' | '位置 2';
  files?: {
    list?: string;
    contract?: string;
    drawing?: string;
    vrEffect?: string;
  };
  selectionItems?: SelectionItem[];
  drawings?: Drawing[];
}

export const USERS: User[] = [
  { id: 'zxm001', name: '张小明', role: 'consultant', account: 'zxm001' },
  { id: 'lxh002', name: '李小红', role: 'consultant', account: 'lxh002' },
  { id: 'admin001', name: '王经理', role: 'admin', account: 'admin001' },
  { id: 'engineer001', name: '工程部', role: 'engineer', account: 'engineer001' },
  { id: 'supply001', name: '供应链部', role: 'supply_chain', account: 'supply001' },
  { id: 'cost001', name: '成本部', role: 'cost', account: 'cost001' },
];

export const MOCK_DRAWINGS: Drawing[] = [
  // CCD Style - General Drawings (Using high-quality architectural plan images)
  { 
    id: 'ccd-1', 
    name: '平面布置图 (FF-295A-01)', 
    category: '通用图纸', 
    matchKey: 'CCD风格', 
    previewUrl: 'https://ossprod.vicp.net/floorplan/ccd_plan_main.png',
    pdfUrl: '/ccd-plan.pdf'
  },
  { 
    id: 'ccd-2', 
    name: '地坪尺寸图 (FC-295A-01)', 
    category: '通用图纸', 
    matchKey: 'CCD风格', 
    previewUrl: 'https://ossprod.vicp.net/floorplan/ccd_floor_detail.png',
    pdfUrl: '/ccd-plan.pdf'
  },
  { 
    id: 'ccd-3', 
    name: '天花布置图 (RC-295A-01)', 
    category: '通用图纸', 
    matchKey: 'CCD风格', 
    previewUrl: 'https://ossprod.vicp.net/floorplan/ccd_ceiling_plan.png',
    pdfUrl: '/ccd-plan.pdf'
  },

  // Danjian Style - General Drawings
  { 
    id: 'dj-1', 
    name: '平面家具布置图 (1-T403A-P01)', 
    category: '通用图纸', 
    matchKey: '丹健风格', 
    previewUrl: 'https://ossprod.vicp.net/floorplan/dj_furniture_plan.png',
    pdfUrl: '/dj-plan.pdf'
  },
  { 
    id: 'dj-2', 
    name: '地面材料铺装图 (1-T403A-P05)', 
    category: '通用图纸', 
    matchKey: '丹健风格', 
    previewUrl: 'https://ossprod.vicp.net/floorplan/dj_floor_material.png',
    pdfUrl: '/dj-plan.pdf'
  },
  { 
    id: 'dj-3', 
    name: '天花布置图 (1-T403A-P06)', 
    category: '通用图纸', 
    matchKey: '丹健风格', 
    previewUrl: 'https://ossprod.vicp.net/floorplan/dj_ceiling_plan.png',
    pdfUrl: '/dj-plan.pdf'
  },

  // Selection Drawings - CAD Style Mock
  { id: 's-1', name: '岛台大样图 (DT-ISLAND-01)', category: '选装图纸', matchKey: '位置 1', previewUrl: 'https://ossprod.vicp.net/floorplan/detail_island_01.png' },
  { id: 's-2', name: '岛台大样图 (DT-ISLAND-02)', category: '选装图纸', matchKey: '位置 2', previewUrl: 'https://ossprod.vicp.net/floorplan/detail_island_02.png' },
  { id: 's-3', name: '背景墙立面图 (EL-WALL-01)', category: '选装图纸', matchKey: '哑光马毛岩板', previewUrl: 'https://ossprod.vicp.net/floorplan/detail_wall_01.png' },
  { id: 's-4', name: '背景墙立面图 (EL-WALL-02)', category: '选装图纸', matchKey: '布纹岩板', previewUrl: 'https://ossprod.vicp.net/floorplan/detail_wall_02.png' },
  { id: 's-5', name: '背景墙立面图 (EL-WALL-03)', category: '选装图纸', matchKey: '挪威木纹', previewUrl: 'https://ossprod.vicp.net/floorplan/detail_wall_03.png' },
  { id: 's-6', name: '厨电点位图 (EP-KITCHEN-01)', category: '选装图纸', matchKey: '方太', previewUrl: 'https://ossprod.vicp.net/floorplan/detail_kitchen_01.png' },
  { id: 's-7', name: '厨电点位图 (EP-KITCHEN-02)', category: '选装图纸', matchKey: '嘉格纳', previewUrl: 'https://ossprod.vicp.net/floorplan/detail_kitchen_02.png' },
  { id: 's-8', name: '地坪拼花大样图 (FC-DETAIL-01)', category: '选装图纸', matchKey: '波斯白玉石材', previewUrl: 'https://ossprod.vicp.net/floorplan/detail_floor_01.png' },
  { id: 's-9', name: '地坪拼花大样图 (FC-DETAIL-02)', category: '选装图纸', matchKey: '兰欧米黄石材', previewUrl: 'https://ossprod.vicp.net/floorplan/detail_floor_02.png' },
  { id: 's-10', name: '地坪拼花大样图 (FC-DETAIL-03)', category: '选装图纸', matchKey: '拼花木地板', previewUrl: 'https://ossprod.vicp.net/floorplan/detail_floor_03.png' },
];

const STATUS_LIST = ['待选配', '选配中', '待审批', '审批中', '已锁死', '变更审批中'];
const LAYOUTS = ['4 室', '3+1 室'];
const STYLES = ['CCD风格', '丹健风格'];
const KITCHEN_BRANDS = ['方太', '嘉格纳'];
const WALL_MATERIALS = ['哑光马毛岩板', '布纹岩板', '挪威木纹'];
const FLOOR_MATERIALS = ['波斯白玉石材', '兰欧米黄石材', '拼花木地板'];
const ISLAND_POSITIONS = ['位置 1', '位置 2'];
const CONSULTANTS = [
  { id: 'zxm001', name: '张小明' },
  { id: 'lxh002', name: '李小红' }
];

const generateMockHouses = (): House[] => {
  const houses: House[] = [];
  const floors = [5, 6, 8, 9, 10, 12, 15, 16, 18, 20, 22, 25, 28, 30];
  const units = ['1 单元', '2 单元', '3 单元'];
  const rooms = ['01', '02', '03', '05', '06'];

  const CUSTOMER_NAMES = ['张先生', '李女士', '王先生', '赵女士', '陈先生', '刘女士', '孙先生', '周女士', '吴先生', '郑女士'];

  let idCounter = 1;

  // Generate all data
  units.forEach(unit => {
    floors.forEach(floor => {
      rooms.forEach(room => {
        const roomNo = `2 栋 ${unit} ${floor}${room}`;
        
        const status = STATUS_LIST[Math.floor(Math.random() * STATUS_LIST.length)];
        const consultant = CONSULTANTS[Math.floor(Math.random() * CONSULTANTS.length)];
        
        const isOccupied = status !== '待选配';
        const layout = LAYOUTS[Math.floor(Math.random() * LAYOUTS.length)];
        const style = isOccupied ? STYLES[Math.floor(Math.random() * STYLES.length)] : '-';
        const kitchenBrand = isOccupied ? KITCHEN_BRANDS[Math.floor(Math.random() * KITCHEN_BRANDS.length)] : undefined;
        const materialWall = isOccupied ? WALL_MATERIALS[Math.floor(Math.random() * WALL_MATERIALS.length)] : undefined;
        const materialFloor = isOccupied ? FLOOR_MATERIALS[Math.floor(Math.random() * FLOOR_MATERIALS.length)] : undefined;
        const islandPos = isOccupied ? ISLAND_POSITIONS[Math.floor(Math.random() * ISLAND_POSITIONS.length)] : undefined;

        const selectionItems: SelectionItem[] = isOccupied ? [
          { id: 's1', category: '户型布局', name: layout, spec: '标准交付', price: 0 },
          { id: 's2', category: '装修风格', name: style, spec: '精装定制', price: 20 },
          { id: 's3', category: '厨电品牌', name: kitchenBrand || '方太', spec: '嵌入式套装', price: 15 },
          { id: 's4', category: '背景墙', name: materialWall || '哑光马毛岩板', spec: '岩板/木饰面', price: 10 },
          { id: 's5', category: '地板材质', name: materialFloor || '波斯白玉石材', spec: '天然石材/实木', price: 12 },
          { id: 's6', category: '岛台', name: islandPos || '位置 1', spec: '石材定制', price: 8 },
        ] : [];

        const drawings = isOccupied ? MOCK_DRAWINGS.filter(d => 
          d.matchKey === style || 
          d.matchKey === kitchenBrand || 
          d.matchKey === materialWall || 
          d.matchKey === materialFloor ||
          d.matchKey === islandPos
        ) : [];

        houses.push({
          id: String(idCounter++),
          roomNo,
          unit,
          houseType: '295',
          layout,
          style,
          customerName: isOccupied ? CUSTOMER_NAMES[Math.floor(Math.random() * CUSTOMER_NAMES.length)] : '',
          customerPhone: isOccupied ? `13${Math.floor(Math.random() * 1000000000)}` : '',
          consultant: consultant.name,
          consultantId: consultant.id,
          packagePlan: isOccupied ? `套餐包 ${['A', 'B', 'C', 'D'][Math.floor(Math.random() * 4)]}` : '待选配',
          amount: isOccupied ? _.sumBy(selectionItems, 'price') + 50 : 0,
          selectionStatus: status,
          approvalStatus: status === '已锁死' ? '审批完成' : (status === '待选配' ? '未启动' : '进行中'),
          operateTime: isOccupied ? '2026-03-22 10:00' : '-',
          operator: isOccupied ? consultant.name : '-',
          contractStatus: isOccupied ? '未发起' : undefined,
          kitchenBrand: kitchenBrand as any,
          materialWall: materialWall as any,
          materialFloor: materialFloor as any,
          islandPos: islandPos as any,
          files: isOccupied ? {
            list: `清单_${floor}${room}.pdf`,
            contract: `合同_${floor}${room}.pdf`,
            drawing: `图纸_${floor}${room}.dwg`,
            vrEffect: `https://yun.kujiale.com/design/3FO3BEGAIQGC/airoaming`
          } : {},
          selectionItems,
          drawings
        });
      });
    });
  });

  // Sort houses by roomNo (numerically)
  houses.sort((a, b) => {
    const getNum = (s: string) => {
      const match = s.match(/\d+/g);
      return match ? match.map(Number) : [];
    };
    const aNums = getNum(a.roomNo);
    const bNums = getNum(b.roomNo);
    for (let i = 0; i < Math.min(aNums.length, bNums.length); i++) {
      if (aNums[i] !== bNums[i]) return aNums[i] - bNums[i];
    }
    return a.roomNo.localeCompare(b.roomNo);
  });

  return houses.slice(0, 60);
};

export const HOUSES: House[] = generateMockHouses();

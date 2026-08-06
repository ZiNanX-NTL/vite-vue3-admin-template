export interface OverviewMetric {
  label: string;
  value: string;
  detail: string;
  progress: number;
}

export interface OverviewModule {
  index: string;
  icon: string;
  title: string;
  description: string;
  signal: string;
}

export interface OverviewWorkflowStep {
  code: string;
  title: string;
  description: string;
}

/**
 * 展示用模拟数据。接入真实接口时，只需要替换本文件的导出对象，组件结构无需修改。
 */
export const overviewContent = {
  eyebrow: 'AGRITECH / COMPANY PROFILE',
  title: '让每一块农田，\n都成为可计算的生产单元',
  description: '我们用遥感、物联网与智能算法，把分散的农事经验整理成可感知、可分析、可协同的数字化生产网络。',
  dataNote: '演示数据 · 非生产环境',
  metrics: [
    { label: '接入管理面积', value: '128.6 万亩', detail: '覆盖 24 个示范区域', progress: 0.86 },
    { label: '设备在线率', value: '98.7%', detail: '本月稳定运行', progress: 0.987 },
    { label: '风险预警闭环', value: '326 条', detail: '平均 12 分钟响应', progress: 0.72 }
  ] satisfies OverviewMetric[],
  modules: [
    { index: '01', icon: 'ph:broadcast', title: '天空地一体感知', description: '卫星遥感、气象站与田间传感器协同采集，形成连续的农田数字底图。', signal: 'LIVE / 24H' },
    { index: '02', icon: 'ph:fingerprint', title: '作物数字档案', description: '以地块为索引沉淀长势、投入与产量记录，让每一次决策都有据可循。', signal: 'DATA / TRACE' },
    { index: '03', icon: 'ph:warning-octagon', title: 'AI 风险预警', description: '将病虫害、旱涝与长势异常转译为可执行的分级预警。', signal: 'AI / EARLY' },
    { index: '04', icon: 'ph:arrows-clockwise', title: '农事协同闭环', description: '从预警到派单、执行、回传，帮助管理者把响应变成可追踪的流程。', signal: 'FLOW / CLOSED' }
  ] satisfies OverviewModule[],
  workflow: [
    { code: 'SENSE', title: '感知采集', description: '多源数据入网' },
    { code: 'READ', title: '状态解析', description: '生成地块画像' },
    { code: 'ACT', title: '策略下发', description: '形成农事任务' },
    { code: 'LOOP', title: '结果回流', description: '持续校正模型' }
  ] satisfies OverviewWorkflowStep[],
  demoPlot: {
    id: 'A-07',
    name: '北岸水稻示范田',
    crop: '水稻 · 分蘖期',
    health: 87,
    status: '长势良好',
    updated: '刚刚更新'
  }
};

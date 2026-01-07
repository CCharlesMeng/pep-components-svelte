import mockData from './data.json' with { type: 'json' };

// 导出主配置
export const mainConfig = mockData;

// 模拟一个过期的倒计时数据用于测试逻辑
export const expiredConfig = {
  ...mockData,
  title: "过期自动隐藏测试",
  tabList: [
    {
      title: "测试页签",
      cards: {
        products: [
          {
            title: "可见产品",
            desc: "这个产品没有设置过期时间，应始终可见",
            icon: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/Migration/MGC.png"
          },
          {
            title: "已隐藏产品",
            desc: "这个产品设置了过期时间（2020年），应被逻辑隐藏",
            endTime: "2020/01/01 00:00",
            icon: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/Compute/ECS.png"
          }
        ]
      }
    }
  ]
};

// 居左布局示例配置
export const leftLayoutConfig = {
  title: "手动配置：居左 + 两列布局",
  cardType: "left" as const,
  cardColumn: "2" as const,
  isShowMb: true,
  tabList: [
    {
      title: "配置示例",
      cards: {
        products: [
          {
            title: "高性价比服务器",
            desc: "适合中小型企业入门使用，性能稳定可靠。",
            icon: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/Compute/ECS.png",
            tags: ["热销", "限时"],
            keywords: [{ keyword: "低至 1 折" }]
          },
          {
            title: "弹性公网 IP",
            desc: "提供覆盖全球的稳定网络接入能力。",
            icon: "https://res-static.hc-cdn.cn/cloudbu-site/public/new-product-icon/Networking/EIP.png",
            btnGroups: [{ btnType: "por-btn-secondary" as const, btnLinkText: "查看详情" }]
          }
        ]
      }
    }
  ]
};


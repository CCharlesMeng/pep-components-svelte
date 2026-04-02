<script lang="ts">
  import Carousel from "@pep/shared/ui/carousel/Carousel.svelte";

  // ── 公共 Banner 数据（宽屏，带文案）
  const banners = [
    {
      img: "https://picsum.photos/seed/hw-ecs/1200/450",
      title: "弹性云服务器 ECS",
      desc: "高性能甄选，支持 200+ 企业应用场景，弹性伸缩按需付费",
    },
    {
      img: "https://picsum.photos/seed/hw-obs/1200/450",
      title: "对象存储服务 OBS",
      desc: "安全、高可靠、低成本的云存储，支持海量非结构化数据",
    },
    {
      img: "https://picsum.photos/seed/hw-rds/1200/450",
      title: "云数据库 RDS",
      desc: "稳定可靠、弹性伸缩、便捷管理的在线关系型数据库服务",
    },
    {
      img: "https://picsum.photos/seed/hw-cce/1200/450",
      title: "容器引擎 CCE",
      desc: "高可用、高性能的企业级 Kubernetes 集群托管服务",
    },
  ];

  // ── 产品卡片数据（多图预览用，小尺寸）
  const cards = [
    { img: "https://picsum.photos/seed/card-ecs/400/280", title: "ECS", sub: "弹性云服务器" },
    { img: "https://picsum.photos/seed/card-obs/400/280", title: "OBS", sub: "对象存储服务" },
    { img: "https://picsum.photos/seed/card-rds/400/280", title: "RDS", sub: "云数据库" },
    { img: "https://picsum.photos/seed/card-cce/400/280", title: "CCE", sub: "容器引擎" },
    { img: "https://picsum.photos/seed/card-cdn/400/280", title: "CDN", sub: "内容分发网络" },
    { img: "https://picsum.photos/seed/card-vpc/400/280", title: "VPC", sub: "虚拟私有云" },
  ];
</script>

<!-- ══════════════════════════════════════════════
     场景一：基础轮播（滑动 + 循环 + 自动播放 + 导航 + 分页）
══════════════════════════════════════════════ -->
<div class="por-section" data-bg="white">
  <div class="por-container">
    <div class="por-section-head" data-theme="dark">
      <h2 class="por-section-title">场景一：基础轮播</h2>
      <p class="por-section-subtitle">滑动过渡 · 循环 · 自动播放（5s）· 导航箭头 · 分页圆点</p>
    </div>
    <div class="por-section-body">
      <Carousel loop autoplay pagination navigation>
        {#each banners as b}
          <div class="por-carousel-slide s-banner">
            <img src={b.img} alt={b.title} class="s-img" />
            <div class="s-caption">
              <h3 class="s-title">{b.title}</h3>
              <p class="s-desc">{b.desc}</p>
            </div>
          </div>
        {/each}
      </Carousel>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════
     场景二：淡入淡出过渡
══════════════════════════════════════════════ -->
<div class="por-section" data-bg="light">
  <div class="por-container">
    <div class="por-section-head" data-theme="dark">
      <h2 class="por-section-title">场景二：淡入淡出过渡</h2>
      <p class="por-section-subtitle">transition="fade" · 循环 · 自动播放（4s）· 导航箭头 · 分页圆点</p>
    </div>
    <div class="por-section-body">
      <Carousel transition="fade" loop autoplay={{ delay: 4000 }} pagination navigation>
        {#each banners.slice(0, 3) as b}
          <div class="por-carousel-slide s-banner">
            <img src={b.img} alt={b.title} class="s-img" />
            <div class="s-caption">
              <h3 class="s-title">{b.title}</h3>
              <p class="s-desc">{b.desc}</p>
            </div>
          </div>
        {/each}
      </Carousel>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════
     场景三：多图同屏预览（preview=3）
══════════════════════════════════════════════ -->
<div class="por-section" data-bg="white">
  <div class="por-container">
    <div class="por-section-head" data-theme="dark">
      <h2 class="por-section-title">场景三：多图同屏预览</h2>
      <p class="por-section-subtitle">preview={3} · 一屏展示 3 张 · 循环 · 导航箭头 · 分页圆点</p>
    </div>
    <div class="por-section-body">
      <Carousel preview={3} loop navigation pagination>
        {#each cards as c}
          <div class="por-carousel-slide s-card">
            <img src={c.img} alt={c.title} class="s-card-img" />
            <div class="s-card-body">
              <strong class="s-card-title">{c.title}</strong>
              <span class="s-card-sub">{c.sub}</span>
            </div>
          </div>
        {/each}
      </Carousel>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════
     场景四：快速自动播放（1.5s）
══════════════════════════════════════════════ -->
<div class="por-section" data-bg="grey">
  <div class="por-container">
    <div class="por-section-head" data-theme="dark">
      <h2 class="por-section-title">场景四：快速自动播放</h2>
      <p class="por-section-subtitle">autoplay delay=1500ms · 循环 · 仅分页圆点，无导航箭头</p>
    </div>
    <div class="por-section-body">
      <Carousel loop autoplay={{ delay: 1500 }} pagination>
        {#each banners as b}
          <div class="por-carousel-slide s-banner s-banner-compact">
            <img src={b.img} alt={b.title} class="s-img" />
            <div class="s-caption">
              <h3 class="s-title">{b.title}</h3>
            </div>
          </div>
        {/each}
      </Carousel>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════
     场景五：慢速沉浸式切换（speed=1200）
══════════════════════════════════════════════ -->
<div class="por-section" data-bg="white">
  <div class="por-container">
    <div class="por-section-head" data-theme="dark">
      <h2 class="por-section-title">场景五：慢速沉浸式切换</h2>
      <p class="por-section-subtitle">speed=1200ms · 循环 · 自动播放（6s）· 导航箭头 · 分页圆点</p>
    </div>
    <div class="por-section-body">
      <Carousel speed={1200} loop autoplay={{ delay: 6000 }} navigation pagination>
        {#each banners as b}
          <div class="por-carousel-slide s-banner">
            <img src={b.img} alt={b.title} class="s-img" />
            <div class="s-caption">
              <h3 class="s-title">{b.title}</h3>
              <p class="s-desc">{b.desc}</p>
            </div>
          </div>
        {/each}
      </Carousel>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════
     场景六：深色主题
══════════════════════════════════════════════ -->
<div class="por-section" data-bg="dark">
  <div class="por-container">
    <div class="por-section-head" data-theme="light">
      <h2 class="por-section-title">场景六：深色主题</h2>
      <p class="por-section-subtitle">dark=true · 循环 · 自动播放 · 导航箭头 · 分页圆点</p>
    </div>
    <div class="por-section-body">
      <Carousel dark loop autoplay navigation pagination>
        {#each banners as b}
          <div class="por-carousel-slide s-banner">
            <img src={b.img} alt={b.title} class="s-img" />
            <div class="s-caption">
              <h3 class="s-title">{b.title}</h3>
              <p class="s-desc">{b.desc}</p>
            </div>
          </div>
        {/each}
      </Carousel>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════
     场景七：模拟触摸拖拽（鼠标可拖动）
══════════════════════════════════════════════ -->
<div class="por-section" data-bg="light">
  <div class="por-container">
    <div class="por-section-head" data-theme="dark">
      <h2 class="por-section-title">场景七：模拟触摸拖拽</h2>
      <p class="por-section-subtitle">simulateTouch=true · 鼠标可拖拽切换 · 循环 · 导航 · 分页</p>
    </div>
    <div class="por-section-body">
      <Carousel simulateTouch loop navigation pagination>
        {#each banners as b}
          <div class="por-carousel-slide s-banner">
            <img src={b.img} alt={b.title} class="s-img" />
            <div class="s-caption">
              <h3 class="s-title">{b.title}</h3>
              <p class="s-desc">{b.desc}</p>
            </div>
          </div>
        {/each}
      </Carousel>
    </div>
  </div>
</div>

<!-- ══════════════════════════════════════════════
     场景八：图文 + 视频混排
══════════════════════════════════════════════ -->
<div class="por-section" data-bg="white">
  <div class="por-container">
    <div class="por-section-head" data-theme="dark">
      <h2 class="por-section-title">场景八：图文 + 视频混排</h2>
      <p class="por-section-subtitle">幻灯片内容自由组合，第 2 张为视频 · 循环 · 导航 · 分页</p>
    </div>
    <div class="por-section-body">
      <Carousel loop navigation pagination autoplay>
        <!-- 图片幻灯片 -->
        <div class="por-carousel-slide s-banner">
          <img src="https://picsum.photos/seed/mix1/1200/450" alt="图片幻灯片" class="s-img" />
          <div class="s-caption">
            <h3 class="s-title">图片幻灯片示例</h3>
            <p class="s-desc">普通图片内容，支持链接跳转</p>
          </div>
        </div>
        <!-- 视频幻灯片 -->
        <div class="por-carousel-slide s-banner s-video-slide">
          <video
            class="s-img"
            src="https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4"
            autoplay
            muted
            loop
            playsinline
          ></video>
          <div class="s-caption">
            <h3 class="s-title">视频幻灯片示例</h3>
            <p class="s-desc">支持嵌入 HTML5 视频，自动播放静音</p>
          </div>
        </div>
        <!-- 纯色文字幻灯片 -->
        <div class="por-carousel-slide s-text-slide">
          <div class="s-text-content">
            <div class="s-text-icon">☁️</div>
            <h3 class="s-text-title">纯文字幻灯片</h3>
            <p class="s-text-body">幻灯片内容完全自由，不限于图片，<br />可放任意 HTML 结构</p>
            <a href="https://www.huaweicloud.com" class="s-text-btn" target="_blank">了解更多</a>
          </div>
        </div>
        <!-- 图片幻灯片 4 -->
        <div class="por-carousel-slide s-banner">
          <img src="https://picsum.photos/seed/mix4/1200/450" alt="第四张" class="s-img" />
          <div class="s-caption">
            <h3 class="s-title">多媒体自由组合</h3>
            <p class="s-desc">图片、视频、文字卡片均可作为一张幻灯片</p>
          </div>
        </div>
      </Carousel>
    </div>
  </div>
</div>

<style>
  /* ── Banner 幻灯片 ── */
  .s-banner {
    position: relative;
    width: 100%;
    height: 420px;
    overflow: hidden;
    background: #1a1a2e;
  }

  .s-banner-compact {
    height: 300px;
  }

  .s-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  .s-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 28px 40px;
    background: linear-gradient(transparent, rgba(0, 0, 0, 0.65));
    color: #fff;
  }

  .s-title {
    margin: 0 0 8px;
    font-size: 22px;
    font-weight: 700;
    line-height: 1.3;
  }

  .s-desc {
    margin: 0;
    font-size: 14px;
    opacity: 0.88;
    line-height: 1.6;
  }

  /* ── 卡片（多图预览）── */
  .s-card {
    padding: 0 8px;
    box-sizing: border-box;
  }

  .s-card-img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    display: block;
    border-radius: 6px 6px 0 0;
  }

  .s-card-body {
    padding: 14px 16px;
    background: #fff;
    border-radius: 0 0 6px 6px;
    border: 1px solid #eee;
    border-top: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .s-card-title {
    font-size: 16px;
    font-weight: 600;
    color: #1a1a1a;
  }

  .s-card-sub {
    font-size: 13px;
    color: #666;
  }

  /* ── 视频幻灯片 ── */
  .s-video-slide video {
    object-fit: cover;
  }

  /* ── 纯文字幻灯片 ── */
  .s-text-slide {
    width: 100%;
    height: 420px;
    background: linear-gradient(135deg, #1e3a5f 0%, #0f6cbd 100%);
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .s-text-content {
    text-align: center;
    color: #fff;
    padding: 32px;
  }

  .s-text-icon {
    font-size: 56px;
    margin-bottom: 16px;
    line-height: 1;
  }

  .s-text-title {
    margin: 0 0 12px;
    font-size: 26px;
    font-weight: 700;
  }

  .s-text-body {
    margin: 0 0 24px;
    font-size: 15px;
    opacity: 0.9;
    line-height: 1.7;
  }

  .s-text-btn {
    display: inline-block;
    padding: 10px 28px;
    background: #fff;
    color: #0f6cbd;
    border-radius: 4px;
    font-size: 14px;
    font-weight: 600;
    text-decoration: none;
    transition: opacity 0.2s;
  }

  .s-text-btn:hover {
    opacity: 0.9;
  }
</style>

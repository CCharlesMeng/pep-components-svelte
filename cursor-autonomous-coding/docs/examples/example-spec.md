# 示例项目规格 - 博客系统

> 这是一个完整的项目规格示例，展示如何编写详细的spec.md文件

## 项目概述

### 项目名称
个人博客系统 - "DevBlog"

### 项目描述
一个功能完整的个人博客平台，支持文章发布、评论互动、标签分类、全文搜索等功能。界面简洁美观，注重阅读体验。

### 项目目标
1. 为开发者提供一个易于部署的个人博客解决方案
2. 提供优秀的写作和阅读体验
3. 支持Markdown写作，代码高亮
4. SEO友好，响应式设计

### 目标用户
- 个人开发者
- 技术博主
- 内容创作者

---

## 技术栈

### 前端
- **框架**: React 18
- **构建工具**: Vite
- **样式**: Tailwind CSS + PostCSS
- **状态管理**: Zustand
- **路由**: React Router v6
- **Markdown**: react-markdown + remark-gfm
- **代码高亮**: prism-react-renderer
- **表单**: React Hook Form
- **HTTP**: Axios
- **日期处理**: date-fns

### 后端
- **运行时**: Node.js 18+
- **框架**: Express.js
- **数据库**: PostgreSQL 14+
- **ORM**: Prisma
- **认证**: JWT + bcrypt
- **验证**: Joi
- **日志**: Winston
- **文件上传**: Multer

### 开发工具
- **代码质量**: ESLint + Prettier
- **类型检查**: TypeScript
- **测试**: Vitest + React Testing Library
- **API测试**: Supertest
- **端到端**: Playwright
- **Git Hooks**: Husky + lint-staged

### 部署
- **前端**: Vercel / Netlify
- **后端**: Railway / Fly.io
- **数据库**: Supabase / Neon
- **CDN**: Cloudflare
- **CI/CD**: GitHub Actions

---

## 核心功能详解

### 1. 文章管理

#### 1.1 文章创建与编辑
- **功能描述**: 
  - 支持Markdown编辑器，实时预览
  - 自动保存草稿（每30秒）
  - 支持插入图片、代码块、引用等
  - 设置文章标题、摘要、封面图
  - 选择文章分类和标签
  - 设置发布状态（草稿/发布）
  - 定时发布功能

- **验收标准**:
  - [ ] Markdown编辑器正常工作
  - [ ] 实时预览准确渲染
  - [ ] 代码块有语法高亮
  - [ ] 图片上传和显示正常
  - [ ] 草稿自动保存不丢失
  - [ ] 可以设置封面图
  - [ ] 标签可以多选
  - [ ] 定时发布准时生效

#### 1.2 文章列表与查看
- **功能描述**:
  - 文章列表分页显示
  - 支持按时间、热度、评论数排序
  - 文章详情页完整渲染
  - 显示阅读时长估算
  - 显示发布时间和更新时间
  - 相关文章推荐
  - 文章分享功能

- **验收标准**:
  - [ ] 分页加载流畅
  - [ ] 排序功能正确
  - [ ] Markdown完整渲染
  - [ ] 代码块可复制
  - [ ] 图片懒加载
  - [ ] 推荐算法合理
  - [ ] 分享链接正确

#### 1.3 文章搜索
- **功能描述**:
  - 全文搜索（标题+内容）
  - 按标签筛选
  - 按分类筛选
  - 按日期范围筛选
  - 搜索结果高亮
  - 搜索历史记录

- **验收标准**:
  - [ ] 搜索响应快速（<500ms）
  - [ ] 结果准确相关
  - [ ] 支持中英文搜索
  - [ ] 高亮显示关键词
  - [ ] 筛选条件可组合
  - [ ] 搜索历史保存

### 2. 评论系统

#### 2.1 评论发表
- **功能描述**:
  - 游客可评论（需填写昵称和邮箱）
  - 注册用户直接评论
  - 支持Markdown语法
  - 支持@回复
  - 表情支持
  - 评论预览

- **验收标准**:
  - [ ] 游客评论正常
  - [ ] 用户评论关联账号
  - [ ] Markdown渲染正确
  - [ ] @通知功能工作
  - [ ] 表情显示正常
  - [ ] 预览准确

#### 2.2 评论管理
- **功能描述**:
  - 作者可以删除评论
  - 作者可以回复评论
  - 评论楼层显示
  - 评论点赞功能
  - 评论举报功能
  - 评论审核（可选）

- **验收标准**:
  - [ ] 删除立即生效
  - [ ] 回复正确嵌套
  - [ ] 楼层显示清晰
  - [ ] 点赞数实时更新
  - [ ] 举报提交成功
  - [ ] 审核功能可开关

### 3. 用户系统

#### 3.1 用户注册与登录
- **功能描述**:
  - 邮箱注册
  - 邮箱验证
  - 密码强度检查
  - 登录（邮箱+密码）
  - 记住登录状态
  - 找回密码

- **验收标准**:
  - [ ] 注册流程流畅
  - [ ] 邮件发送成功
  - [ ] 弱密码被拒绝
  - [ ] 登录获得token
  - [ ] Token正确刷新
  - [ ] 密码重置可用

#### 3.2 用户Profile
- **功能描述**:
  - 修改昵称
  - 上传头像
  - 个人简介
  - 社交链接（GitHub/Twitter等）
  - 邮箱设置
  - 隐私设置

- **验收标准**:
  - [ ] 信息修改成功
  - [ ] 头像上传显示
  - [ ] 简介支持Markdown
  - [ ] 社交链接有效
  - [ ] 邮箱修改需验证
  - [ ] 隐私设置生效

### 4. 分类与标签

#### 4.1 分类管理
- **功能描述**:
  - 创建分类
  - 编辑分类
  - 删除分类（需检查是否有文章）
  - 分类描述
  - 分类图标
  - 分类排序

- **验收标准**:
  - [ ] CRUD操作正常
  - [ ] 删除前检查依赖
  - [ ] 描述显示正确
  - [ ] 图标上传成功
  - [ ] 排序可拖拽
  - [ ] 数据验证完整

#### 4.2 标签管理
- **功能描述**:
  - 自动提取标签
  - 手动添加标签
  - 标签热度统计
  - 标签云展示
  - 标签合并
  - 标签删除

- **验收标准**:
  - [ ] 自动提取准确
  - [ ] 手动添加成功
  - [ ] 热度计算正确
  - [ ] 标签云美观
  - [ ] 合并保留文章关联
  - [ ] 删除清理关联

### 5. 仪表板

#### 5.1 数据统计
- **功能描述**:
  - 文章总数
  - 评论总数
  - 访问量统计
  - 访客分析
  - 热门文章Top10
  - 最近评论
  - 增长趋势图

- **验收标准**:
  - [ ] 数据实时更新
  - [ ] 统计准确无误
  - [ ] 图表清晰易读
  - [ ] 可选日期范围
  - [ ] 导出统计报告
  - [ ] 性能良好

#### 5.2 快捷操作
- **功能描述**:
  - 快速发布文章
  - 快速查看评论
  - 待审核内容提醒
  - 草稿列表
  - 定时发布列表
  - 最近编辑

- **验收标准**:
  - [ ] 快捷入口明显
  - [ ] 操作响应快速
  - [ ] 提醒及时准确
  - [ ] 列表信息完整
  - [ ] 点击跳转正确

### 6. 设置

#### 6.1 网站设置
- **功能描述**:
  - 网站标题
  - 网站描述
  - 网站Logo
  - 网站图标
  - 关于页面
  - 社交链接
  - SEO设置

- **验收标准**:
  - [ ] 设置立即生效
  - [ ] Logo上传显示
  - [ ] 图标正确生成
  - [ ] 关于页Markdown
  - [ ] 社交图标显示
  - [ ] SEO meta正确

#### 6.2 主题设置
- **功能描述**:
  - 浅色/深色主题
  - 自定义主题色
  - 字体选择
  - 布局调整
  - 代码高亮主题
  - 自定义CSS

- **验收标准**:
  - [ ] 主题切换流畅
  - [ ] 自定义色生效
  - [ ] 字体正确加载
  - [ ] 布局响应式
  - [ ] 代码主题匹配
  - [ ] 自定义CSS安全

---

## 数据模型

### User（用户）
```typescript
{
  id: string
  email: string (unique)
  password: string (hashed)
  name: string
  avatar?: string
  bio?: string
  role: 'admin' | 'author' | 'user'
  emailVerified: boolean
  createdAt: Date
  updatedAt: Date
  
  // 关系
  posts: Post[]
  comments: Comment[]
}
```

### Post（文章）
```typescript
{
  id: string
  title: string
  slug: string (unique)
  content: string (Markdown)
  excerpt?: string
  coverImage?: string
  status: 'draft' | 'published'
  publishedAt?: Date
  viewCount: number
  authorId: string
  categoryId?: string
  createdAt: Date
  updatedAt: Date
  
  // 关系
  author: User
  category?: Category
  tags: Tag[]
  comments: Comment[]
}
```

### Category（分类）
```typescript
{
  id: string
  name: string (unique)
  slug: string (unique)
  description?: string
  icon?: string
  order: number
  createdAt: Date
  updatedAt: Date
  
  // 关系
  posts: Post[]
}
```

### Tag（标签）
```typescript
{
  id: string
  name: string (unique)
  slug: string (unique)
  count: number
  createdAt: Date
  updatedAt: Date
  
  // 关系
  posts: Post[]
}
```

### Comment（评论）
```typescript
{
  id: string
  content: string
  authorName?: string
  authorEmail?: string
  authorId?: string
  postId: string
  parentId?: string
  likes: number
  status: 'pending' | 'approved' | 'spam'
  createdAt: Date
  updatedAt: Date
  
  // 关系
  author?: User
  post: Post
  parent?: Comment
  replies: Comment[]
}
```

---

## API端点

### 认证 (Auth)
- `POST /api/auth/register` - 注册
- `POST /api/auth/login` - 登录
- `POST /api/auth/logout` - 登出
- `POST /api/auth/refresh` - 刷新token
- `POST /api/auth/forgot-password` - 忘记密码
- `POST /api/auth/reset-password` - 重置密码
- `POST /api/auth/verify-email` - 验证邮箱

### 文章 (Posts)
- `GET /api/posts` - 获取文章列表（支持分页、筛选、排序）
- `GET /api/posts/:slug` - 获取单篇文章
- `POST /api/posts` - 创建文章（需认证）
- `PUT /api/posts/:id` - 更新文章（需认证）
- `DELETE /api/posts/:id` - 删除文章（需认证）
- `GET /api/posts/:id/related` - 获取相关文章
- `POST /api/posts/:id/view` - 增加浏览量

### 评论 (Comments)
- `GET /api/posts/:postId/comments` - 获取文章评论
- `POST /api/posts/:postId/comments` - 发表评论
- `PUT /api/comments/:id` - 更新评论（需认证）
- `DELETE /api/comments/:id` - 删除评论（需认证）
- `POST /api/comments/:id/like` - 点赞评论

### 分类 (Categories)
- `GET /api/categories` - 获取所有分类
- `GET /api/categories/:slug` - 获取单个分类
- `GET /api/categories/:slug/posts` - 获取分类下的文章
- `POST /api/categories` - 创建分类（需管理员）
- `PUT /api/categories/:id` - 更新分类（需管理员）
- `DELETE /api/categories/:id` - 删除分类（需管理员）

### 标签 (Tags)
- `GET /api/tags` - 获取所有标签
- `GET /api/tags/:slug` - 获取单个标签
- `GET /api/tags/:slug/posts` - 获取标签下的文章
- `POST /api/tags` - 创建标签（需认证）
- `PUT /api/tags/:id` - 更新标签（需管理员）
- `DELETE /api/tags/:id` - 删除标签（需管理员）
- `POST /api/tags/merge` - 合并标签（需管理员）

### 用户 (Users)
- `GET /api/users/me` - 获取当前用户信息
- `PUT /api/users/me` - 更新用户信息
- `PUT /api/users/me/avatar` - 上传头像
- `PUT /api/users/me/password` - 修改密码

### 搜索 (Search)
- `GET /api/search` - 全文搜索

### 统计 (Stats)
- `GET /api/stats/overview` - 总览统计
- `GET /api/stats/popular-posts` - 热门文章
- `GET /api/stats/recent-comments` - 最近评论

### 设置 (Settings)
- `GET /api/settings` - 获取网站设置
- `PUT /api/settings` - 更新设置（需管理员）

---

## 非功能性需求

### 性能
- 首屏加载时间 < 2秒
- API响应时间 < 500ms (P95)
- 支持10000+文章
- 支持1000+并发用户

### 安全
- 所有API都需要CORS配置
- 密码使用bcrypt加密
- JWT token过期时间15分钟
- Refresh token过期时间7天
- 防止SQL注入
- 防止XSS攻击
- 防止CSRF攻击
- 文件上传大小限制5MB
- 评论频率限制（防spam）

### 可用性
- 99.9%正常运行时间
- 错误日志记录
- 自动健康检查
- 数据库自动备份（每日）

### 可维护性
- 代码测试覆盖率 > 80%
- API文档完整
- 代码注释充分
- Git提交规范

### 可扩展性
- 数据库支持读写分离
- 支持Redis缓存
- 支持CDN加速
- 支持水平扩展

---

## UI/UX要求

### 设计原则
- 简洁现代
- 阅读优先
- 响应式设计
- 无障碍支持

### 颜色方案
- 主色：#3B82F6（蓝色）
- 辅色：#8B5CF6（紫色）
- 成功：#10B981（绿色）
- 警告：#F59E0B（橙色）
- 错误：#EF4444（红色）
- 深色模式自动适配

### 字体
- 标题：Inter / Noto Sans SC
- 正文：Inter / Noto Sans SC
- 代码：JetBrains Mono / Fira Code

### 响应式断点
- Mobile: < 640px
- Tablet: 640px - 1024px
- Desktop: > 1024px

---

## 成功标准

### 功能完整性
- [ ] 所有核心功能实现
- [ ] 所有API端点可用
- [ ] 所有页面渲染正确

### 代码质量
- [ ] 测试覆盖率 > 80%
- [ ] 无严重linter警告
- [ ] 代码审查通过

### 性能
- [ ] Lighthouse分数 > 90
- [ ] 核心Web指标达标
- [ ] 无性能瓶颈

### 用户体验
- [ ] 界面美观易用
- [ ] 交互流畅自然
- [ ] 错误提示友好
- [ ] 加载状态明确

---

## 实施计划

### Phase 1: 基础架构（1-2周）
- 项目初始化
- 数据库设计
- API架构
- 认证系统

### Phase 2: 核心功能（2-3周）
- 文章CRUD
- 评论系统
- 分类标签
- 搜索功能

### Phase 3: 用户体验（1-2周）
- UI美化
- 响应式设计
- 主题系统
- 性能优化

### Phase 4: 高级功能（1-2周）
- 仪表板
- 统计分析
- 定时发布
- 批量操作

### Phase 5: 测试部署（1周）
- 单元测试
- 集成测试
- E2E测试
- 生产部署

---

这是一个完整的项目规格示例。根据这个模板，你可以为自己的项目编写详细的spec.md文件。


# OpenClaw Knowledge Base Skill

泓鉴公司 AI 知识助理 - 企业级三级权限知识资产管理系统

## 🏢 三级权限架构

### 1. 个人私有库 (Personal Vault)
- **记录策略**: 所有私聊记录默认自动归档
- **删除机制**: 支持"删除关于 [主题] 的知识"、"以上话题不用记录"等指令
- **访问控制**: 仅所有者可见，支持显式共享（"把 A 的经验传给 B"）

### 2. 群组项目库 (Group Project)  
- **记录策略**: 
  - 隐式：自动识别群文件上传、高频话题讨论
  - 显式：响应 "@OpenClaw 记录本次讨论"、"/team 记录" 等指令
- **访问控制**: 绑定当前群成员列表，成员被踢出后立即失效

### 3. 部门/虚拟团队库 (Org/Team Vault)
- **记录策略**: 通过 `/team [团队名] 记录...` 指令显式沉淀跨部门知识
- **访问控制**: 绑定特定团队标识，团队成员可见

## 🛠️ 安装与配置

```bash
# 环境变量配置
BAILEN_API_KEY=your_dashscope_api_key
BAILEN_KB_ID=your_knowledge_base_id
DINGTALK_APP_KEY=your_dingtalk_app_key  
DINGTALK_APP_SECRET=your_dingtalk_app_secret
```

将 `skills/knowledge-base/` 目录放置到 OpenClaw 项目的根目录 `skills/` 文件夹中即可。

## 🔒 安全特性

- **数据隔离**: 三级权限严格分离，禁止跨域访问
- **动态权限**: 成员变动实时生效，踢人即失效  
- **隐私保护**: 日志中不打印完整知识内容
- **容错机制**: API 失败时使用缓存数据，保证服务可用性
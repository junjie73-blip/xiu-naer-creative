# 修哪儿 — 社区报修进度追踪平台需求规格说明

## Why
社区公共设施报修长期存在"报上去就石沉大海"的顽疾：居民不知道维修进度、负责人和完成时间，物业与维修方因报修渠道分散而容易遗漏，导致小问题拖成大问题。本规格基于 `xiu-naer-creative.html` 的创意介绍，将"像查快递一样查报修"的核心理念转化为可执行的产品需求与开发规范。

## What Changes
- 基于创意介绍生成正式的需求规格文档（本文件）。
- 明确产品形态：微信小程序（居民端）+ Web 管理后台（物业/社区端）。
- 定义核心用户、痛点、使用流程、技术架构与价值主张。
- 制定 MVP 功能范围、验收标准及未来三期规划。
- 在开发准备阶段使用 `write-coding-standards-from-file` skill 基于项目文件生成编码规范文档。

## Impact
- Affected specs: 产品需求、技术架构、开发任务、编码规范。
- Affected code: 微信小程序端、Web 管理后台、后端 API 服务、AI 识别服务、数据库与基础设施。

## ADDED Requirements

### Requirement: 居民端微信小程序
The system SHALL provide a WeChat Mini Program for residents to report public facility issues.

#### Scenario: 成功上报
- **WHEN** 居民发现公共设施问题并打开小程序
- **THEN** 居民可通过扫码/定位选择社区，拍照上传、填写问题描述并提交报修单

#### Scenario: 进度追踪
- **WHEN** 居民进入"我的报修"页面
- **THEN** 系统以快递式时间线展示报修单状态（已提交/已受理/处理中/待验收/已完成）及每一步时间戳

#### Scenario: 完成评价
- **WHEN** 维修完成后
- **THEN** 居民可对维修结果进行评分与文字评价，形成闭环

### Requirement: AI 识别与智能派单
The system SHALL use AI to automatically classify repair issues and assign priority.

#### Scenario: AI 自动分类
- **WHEN** 居民上传报修图片
- **THEN** AI 识别问题类型（路灯/电梯/水管/路面等）并评估严重程度（一般/紧急/重大）

#### Scenario: 智能派单
- **WHEN** 报修单生成后
- **THEN** 系统根据问题类型、地理位置、维修人员负载自动派单或推荐最优维修资源

### Requirement: 物业/社区 Web 管理后台
The system SHALL provide a Web-based management console for property managers and community administrators.

#### Scenario: 工单管理
- **WHEN** 物业人员登录后台
- **THEN** 可查看、筛选、分配、更新工单状态，并查看超时预警

#### Scenario: 数据统计
- **WHEN** 社区管理者进入数据看板
- **THEN** 可查看报修量、响应时长、完成率、满意度等核心指标

### Requirement: 超时预警与升级
The system SHALL automatically escalate overdue repair orders.

#### Scenario: 超时提醒
- **WHEN** 工单超过预设处理时限
- **THEN** 系统自动向维修人员、物业主管推送催办通知，并向居民同步"已升级"状态

### Requirement: 实时通知
The system SHALL push real-time status updates to residents.

#### Scenario: 状态变更通知
- **WHEN** 工单状态发生变更或出现超时
- **THEN** 居民收到微信小程序订阅消息或短信通知

### Requirement: 编码规范
The system SHALL follow a project-specific coding standards document.

#### Scenario: 规范生成
- **WHEN** 项目进入开发准备阶段
- **THEN** 使用 `write-coding-standards-from-file` skill 分析项目文件并生成 `CODING_STANDARDS.md`，统一前端、后端与小程序的命名、格式与注释规范

## MODIFIED Requirements
（无）

## REMOVED Requirements
（无）

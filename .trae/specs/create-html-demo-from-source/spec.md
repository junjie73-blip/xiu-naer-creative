# 基于源 HTML 创建独立 Demo 展示页 Spec

## Why
用户已有一个完整的「修哪儿」创意展示 HTML 文件（`F:\小说\xiu-naer-creative\xiu-naer-creative.html`），希望在工作目录中生成一个可直接预览的 HTML Demo，方便本地或浏览器打开查看效果，同时解决原文件对外部资源（字体、脚本）的依赖问题。

## What Changes
- 在工作目录 `F:\小说\xiu-naer-creative\` 下创建 `demo.html`，承载源文件中的全部展示内容。
- 将源文件中引用的外部本地资源（`./_shared/fonts/...`、`./_shared/js/mermaid.min.js`）替换为等价方案：字体降级为系统字体栈，移除未实际使用的 `mermaid.min.js` 引用。
- 保持原页面结构、样式、动画、交互（滚动渐显、返回顶部、粒子背景）完整不变。
- 生成的 `demo.html` 为单文件自包含，浏览器直接打开即可运行，无需额外资源。

## Impact
- 受影响能力：静态 HTML 展示页生成、资源自包含处理。
- 受影响文件：`demo.html`（新增）。
- 不影响源文件 `F:\小说\xiu-naer-creative\xiu-naer-creative.html` 的内容。

## ADDED Requirements
### Requirement: 创建可独立运行的 HTML Demo
系统 SHALL 基于源 HTML 文件内容生成一个名为 `demo.html` 的单文件展示页。

#### Scenario: 成功生成并预览
- **WHEN** 用户在工作目录中打开 `demo.html`
- **THEN** 页面应正确渲染标题、Hero 区域、七个内容区块、CTA、Footer 及返回顶部按钮
- **AND** 动画（滚动渐显、粒子背景、Hover 效果）应正常生效
- **AND** 页面不应因缺失外部资源而出现 404 或功能异常

### Requirement: 外部资源依赖处理
系统 SHALL 移除或替换所有对外部本地文件的依赖，使 `demo.html` 无需 `_shared` 目录即可正常运行。

#### Scenario: 无外部资源依赖
- **WHEN** 检查 `demo.html` 中的资源引用
- **THEN** 不应存在指向 `./_shared/...` 的本地文件引用
- **AND** 字体应使用系统字体栈作为降级方案
- **AND** 未实际使用的脚本引用应被移除

## MODIFIED Requirements
无

## REMOVED Requirements
无

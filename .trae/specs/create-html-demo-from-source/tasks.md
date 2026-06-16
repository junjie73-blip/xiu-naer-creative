# Tasks
- [x] Task 1: 生成自包含 Demo 文件
  - [x] SubTask 1.1: 读取源 HTML 文件内容
  - [x] SubTask 1.2: 替换本地字体引用为系统字体降级方案
  - [x] SubTask 1.3: 移除未实际使用的 mermaid.min.js 引用
  - [x] SubTask 1.4: 在工作目录创建 `demo.html` 并写入处理后的内容

- [x] Task 2: 验证 Demo 可正确运行
  - [x] SubTask 2.1: 检查 `demo.html` 不存在指向 `_shared` 的本地引用
  - [x] SubTask 2.2: 使用浏览器打开页面，确认布局、动画、交互正常

# Task Dependencies
- [Task 2] depends on [Task 1]

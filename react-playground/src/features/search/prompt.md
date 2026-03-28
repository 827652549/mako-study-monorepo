需求概述: 给 react-playground/ 模块加一个完整的搜索功能：





输入框实时搜索



结果高亮匹配文字



搜索历史记录（localStorage）



对应的单元测试



接入到/playground路由中, 直接导入进去即可



Tech Lead: 实现UI草图设计, 并通过plan模式设计prd和技术方案(含具体命名), 输出markdown文件.

并行跑:





subagent1:  根据markdown, 注意输出框的React UI层(搜索框+内容区+搜索记录区)和CSS样式, 不含任何逻辑



subagent2:  根据markdown,实现搜索逻辑模块(只输出函数/hook, 不碰UI文件). 注意输出结构化的内容(内容节点+高亮参数)



subagent3: 根据markdown, 实现搜索记录模块(只输出函数/hook, 不碰UI文件), 搜索的项目被记录到localStorage里并回显示到搜索记录区

三个都完成后并行跑:





subagent4: 把2和3接入1(唯一一个改UI文件的agent)



subagent5: 单元测试, 实现subagent2和subagent的3的单元测试用例, 并接入到package.json的script脚本命令里, 不需要UI

最后Tech Lead 检验build是否成功
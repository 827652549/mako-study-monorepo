# async 中间件测试
https://linear.app/mako2077/issue/MAK-117/middlewareuse-对-async-的返回依赖

结论是，middleware.use() 对 async 的返回依赖，如果 async 返回的是一个 Promise，那么 middleware.use() 会等待这个 Promise 完成后再继续执行后续的中间件。如果 async 返回的是一个非 Promise 的值，那么 middleware.use() 会立即执行后续的中间件。
// 写一个极简的内存泄漏程序, 需要按照时间动态增长
import express, { Request, Response } from 'express';

const app = express();
const PORT = 3000;

// 内存泄漏源 1: 全局数组不断增长
const leakedArray: any[] = [];

// 内存泄漏源 2: 全局 Map 不断存储数据
const leakedMap = new Map<string, any>();

// 内存泄漏源 3: 定时器累积
const timers: NodeJS.Timeout[] = [];

// 内存泄漏源 4: 事件监听器累积
const EventEmitter = require('events');
const emitter = new EventEmitter();

app.use(express.json());

// API 1: 每次请求都向数组添加数据
app.get('/api/data', (req: Request, res: Response) => {
  const largeObject = {
    id: Date.now(),
    data: new Array(10000).fill('x').join(''),
    timestamp: new Date(),
    random: Math.random()
  };

  leakedArray.push(largeObject);

  res.json({
    message: 'Data added',
    arrayLength: leakedArray.length
  });
});

// API 2: 每次请求都向 Map 存储数据
app.get('/api/cache/:key', (req: Request, res: Response) => {
  const { key } = req.params;
  const largeData = {
    key,
    content: new Array(5000).fill('data').join('-'),
    createdAt: Date.now()
  };

  leakedMap.set(`${key}-${Date.now()}`, largeData);

  res.json({
    message: 'Cached',
    mapSize: leakedMap.size
  });
});

// API 3: 每次请求都创建新的定时器而不清理
app.get('/api/timer', (req: Request, res: Response) => {
  const intervalId = setInterval(() => {
    // 这个定时器会一直运行
    leakedArray.push({ timerCheck: Date.now() });
  }, 100);

  timers.push(intervalId);

  res.json({
    message: 'Timer created',
    timerCount: timers.length
  });
});

// API 4: 每次请求都添加新的事件监听器
app.get('/api/listener', (req: Request, res: Response) => {
  const listener = (data: any) => {
    leakedMap.set(`event-${Date.now()}`, data);
  };

  emitter.on('leakEvent', listener);

  res.json({
    message: 'Listener added',
    listenerCount: emitter.listenerCount('leakEvent')
  });
});

// API 5: 模拟闭包内存泄漏
let closureCache: any = {};
app.get('/api/closure', (req: Request, res: Response) => {
  const largeString = new Array(10000).fill('closure-data').join('#');

  const leakyFunction = () => {
    console.log(largeString); // 闭包引用
    return largeString;
  };

  closureCache[`fn-${Date.now()}`] = leakyFunction;

  res.json({
    message: 'Closure created',
    closureCount: Object.keys(closureCache).length
  });
});

// 健康检查接口
app.get('/health', (req: Request, res: Response) => {
  const memUsage = process.memoryUsage();

  res.json({
    status: 'ok',
    memory: {
      heapUsed: `${Math.round(memUsage.heapUsed / 1024 / 1024 * 100) / 100} MB`,
      heapTotal: `${Math.round(memUsage.heapTotal / 1024 / 1024 * 100) / 100} MB`,
      rss: `${Math.round(memUsage.rss / 1024 / 1024 * 100) / 100} MB`,
      external: `${Math.round(memUsage.external / 1024 / 1024 * 100) / 100} MB`
    },
    leaks: {
      arrayLength: leakedArray.length,
      mapSize: leakedMap.size,
      timerCount: timers.length,
      listenerCount: emitter.listenerCount('leakEvent'),
      closureCount: Object.keys(closureCache).length
    }
  });
});
// 快照接口：触发生成 heapsnapshot 文件
app.get('/snapshot', (req: Request, res: Response) => {
  const v8 = require('v8');
  const filename = v8.writeHeapSnapshot();
  res.json({ message: 'Snapshot saved', filename });
});

// 根路径
app.get('/', (req: Request, res: Response) => {
  res.send(`
    <h1>Node.js 内存泄漏练习服务</h1>
    <p>当前内存泄漏源:</p>
    <ul>
      <li><a href="/api/data">/api/data</a> - 数组增长</li>
      <li><a href="/api/cache/test">/api/cache/:key</a> - Map 缓存增长</li>
      <li><a href="/api/timer">/api/timer</a> - 定时器累积</li>
      <li><a href="/api/listener">/api/listener</a> - 事件监听器累积</li>
      <li><a href="/api/closure">/api/closure</a> - 闭包泄漏</li>
    </ul>
    <p><a href="/health">/health</a> - 查看内存状态</p>
  `);
});

app.listen(PORT, () => {
  console.log(`🚀 服务器运行在 http://localhost:${PORT}`);
  console.log('💡 访问 /health 查看内存使用情况');
  console.log('⚠️  这是一个故意设计的内存泄漏示例，用于练习排查技能');
});

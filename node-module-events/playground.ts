import { EventEmitter } from 'node:events';
// const ee1 = new EventEmitter({ captureRejections: true });
// ee1.on('something', async (value) => {
//     throw new Error('kaboom');
// });
//
// ee1.on('error', console.log);
// 监听未处理的拒绝事件

// const ee2 = new EventEmitter();
const ee2 = new EventEmitter({ captureRejections: true });
ee2.on('something', async (value) => {
    throw new Error('kaboom');
});
ee2.on('error',()=>{
    console.log('error事件');
})

//@ts-ignore
ee2[Symbol.for('nodejs.rejection')] = console.log;
// ee1.emit('something', 'value');
ee2.emit('something', 'value');

await new Promise(()=>{
    setTimeout(()=>{
        console.log('end');},2000)
})
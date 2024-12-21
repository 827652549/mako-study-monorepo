import { Consumer, KafkaClient } from 'kafka-node'
import express from 'express'

const kafkaClient = new KafkaClient({ kafkaHost: '127.0.0.1:9092' })
const consumer = new Consumer(
  kafkaClient,
  [
    { topic: 'Test-topic', partition: 0 },
    { topic: 'Test-topic', partition: 1 },
  ],
  {
    groupId: 'new-consumer-group-test-0',
    autoCommit: true
  },
)

consumer.on('message', function (message) {
  console.log(message)
  // 手动提交偏移量
  consumer.commit((err, data) => {
    if (err) {
      console.error('Commit error:', err);
    }
  });
})
consumer.on('error', function (err) {
  console.log('error', err)
})

process.on('SIGINT', function () {
  consumer.close(true, function () {
    process.exit()
  })
})

const app = express()
const port = 3222
app.listen(port, () => {
  console.log('http://localhost:' + port)
})


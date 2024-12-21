import express from 'express'
import { CompressionCodecs, CompressionTypes, Kafka } from 'kafkajs'
import SnappyCodec from 'kafkajs-snappy';

// 添加 Snappy 编码支持
CompressionCodecs[CompressionTypes.Snappy] = SnappyCodec;

const kafka = new Kafka({
  clientId: 'my-app',
  brokers: [ '127.0.0.1:9092'],
})
const consumer = kafka.consumer({ groupId: 'new-consumer-group-test-1' })

// @ts-ignore
await consumer.connect()
// @ts-ignore
await consumer.subscribe({ topic: 'Test-topic', fromBeginning: true })

// @ts-ignore
await consumer.run({
  eachMessage: async ({ topic, partition, message }) => {
    console.log({
      value: message.value.toString(),
      offset: message.offset,
      topic,
      partition
    })
  },
})

const app = express()
const port = 3222
app.listen(port, () => {
  console.log('http://localhost:' + port)
})


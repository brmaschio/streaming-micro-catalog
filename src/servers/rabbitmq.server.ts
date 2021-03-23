import {Context} from '@loopback/context';
import {Server} from '@loopback/core';
import {repository} from '@loopback/repository';
import {Channel, connect, Connection} from 'amqplib';
import {CategoryRepository} from '../repositories';

export class RabbitmqServer extends Context implements Server {

  private _listening: boolean;
  conn: Connection;

  constructor(
    @repository(CategoryRepository) private categoryRepo: CategoryRepository
  ) {
    super();
    console.log(categoryRepo);
  }

  async start(): Promise<void> {

    this.conn = await connect({
      hostname: 'rabbitmq',
      username: 'admin',
      password: 'admin',
    });

    this._listening = true;
    this.boot();
  }

  async boot() {

    const channel: Channel = await this.conn.createChannel();
    const queue = await channel.assertQueue('micro-catalog/sync-videos');
    const exchange = await channel.assertExchange('amq.topic', 'topic');

    await channel.bindQueue(queue.queue, exchange.exchange, 'model.*.*');

    // const result = channel.sendToQueue('first-qieue', Buffer.from('hello word'));
    await channel.publish('amq.direct', 'minha-route-key', Buffer.from('publicado por minha route key'));

    channel.consume(queue.queue, (message) => {

      if (!message) {
        return;
      }

      const stringMsg = message.content.toString();
      console.log(JSON.parse(stringMsg));

      const [model, event] = message.fields.routingKey.split('.').slice(1);
      console.log(model, event);

    });
    // console.log(result);

  }

  async stop(): Promise<void> {

    await this.conn.close();

    this._listening = false;

  }

  get listening(): boolean {
    return this._listening;
  }

}
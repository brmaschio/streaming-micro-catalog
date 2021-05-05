import { bind, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { CategoryRepository } from '../repositories';
import { rabbitmqSubscribe } from '../decorators/rabbitmq-subscribe.decorator';
import { ConsumeMessage } from 'amqplib';

@bind({ scope: BindingScope.SINGLETON })
export class CategorySyncService {

  constructor(
    @repository(CategoryRepository) private categoryRepo: CategoryRepository,
  ) { }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-category',
    routingKey: 'model.category.*',
  })
  async handler({ data, message }: { data: any; message: ConsumeMessage }) {

    console.log(data);

    const [, event] = message.fields.routingKey.split('.').slice(1);

    switch (event) {
      case 'created':
        await this.categoryRepo.create(data);
        break;
      case 'updated':
        await this.categoryRepo.updateById(data.id, data);
        break;
      case 'deleted':
        await this.categoryRepo.deleteById(data.id);
        break;
      default:
        break;
    }

  }

}

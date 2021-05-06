import { bind, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { CategoryRepository } from '../repositories';
import { rabbitmqSubscribe } from '../decorators/rabbitmq-subscribe.decorator';
import { ConsumeMessage } from 'amqplib';
import { BaseModelSyncService } from './base-model-sync.service';

@bind({ scope: BindingScope.SINGLETON })
export class CategorySyncService extends BaseModelSyncService {

  constructor(
    @repository(CategoryRepository) private categoryRepo: CategoryRepository,
  ) {
    super();
  }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-videos/category',
    routingKey: 'model.category.*',
  })
  async handler({ data, message }: { data: any; message: ConsumeMessage }) {

    await this.sync({ repo: this.categoryRepo, data, message });

  }

}

import { bind, BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { CategoryRepository } from '../repositories';
import { rabbitmqSubscribe } from '../decorators/rabbitmq-subscribe.decorator';

@bind({ scope: BindingScope.TRANSIENT })
export class CategorySyncService {

  constructor(
    @repository(CategoryRepository) private categoryRepo: CategoryRepository,
  ) { }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-category',
    routingKey: 'model.category.*',
  })
  async handler({ data }: { data: any }) {
    
    console.log(data);

  }
}

import { bind, BindingScope, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { CategoryRepository } from '../repositories';
import { rabbitmqSubscribe } from '../decorators/rabbitmq-subscribe.decorator';
import { ConsumeMessage } from 'amqplib';
import { BaseModelSyncService } from './base-model-sync.service';
import { ValidatorService } from './validator.service';

@bind({ scope: BindingScope.SINGLETON })
export class CategorySyncService extends BaseModelSyncService {

  constructor(
    @repository(CategoryRepository) private categoryRepo: CategoryRepository,
    @service(ValidatorService) private validator: ValidatorService,
  ) {
    super(validator);
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

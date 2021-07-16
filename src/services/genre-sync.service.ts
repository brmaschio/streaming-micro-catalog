import { bind, /* inject, */ BindingScope, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { ConsumeMessage } from 'amqplib';
import { rabbitmqSubscribe } from '../decorators/rabbitmq-subscribe.decorator';
import { CategoryRepository, GenreRepository } from '../repositories';
import { BaseModelSyncService } from './base-model-sync.service';
import { ValidatorService } from './validator.service';
import { Message } from 'amqplib';

@bind({ scope: BindingScope.SINGLETON })
export class GenreSyncServiceService extends BaseModelSyncService {

  constructor(
    @repository(GenreRepository) private genreRepo: GenreRepository,
    @service(ValidatorService) private validator: ValidatorService,
    @repository(CategoryRepository) private categoryRepo: CategoryRepository,
  ) {
    super(validator);
  }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-videos/genre',
    routingKey: 'model.genre.*',
  })
  async handler({ data, message }: { data: any; message: ConsumeMessage }) {

    await this.sync({ repo: this.genreRepo, data, message });

  }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-videos/genre_categories',
    routingKey: 'model.genre_categories.*',
  })
  async handlerCategories({ data, message }: { data: any; message: Message }) {
    await this.syncRelations({
      id: data.id,
      relation: 'categories',
      repo: this.genreRepo,
      relationIds: data.relation_ids,
      repoRelation: this.categoryRepo,
      message,
    });
  }

}

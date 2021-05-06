import { bind, /* inject, */ BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { ConsumeMessage } from 'amqplib';
import { rabbitmqSubscribe } from '../decorators/rabbitmq-subscribe.decorator';
import { GenreRepository } from '../repositories';
import { BaseModelSyncService } from './base-model-sync.service';

@bind({ scope: BindingScope.SINGLETON })
export class GenreSyncServiceService extends BaseModelSyncService {

  constructor(
    @repository(GenreRepository) private genreRepo: GenreRepository,
  ) { 
    super();
  }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-videos/genre',
    routingKey: 'model.genre.*',
  })
  async handler({ data, message }: { data: any; message: ConsumeMessage }) {

    await this.sync({ repo: this.genreRepo, data, message });

  }

}

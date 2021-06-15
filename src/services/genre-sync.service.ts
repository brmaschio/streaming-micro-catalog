import { bind, /* inject, */ BindingScope, service } from '@loopback/core';
import { repository } from '@loopback/repository';
import { ConsumeMessage } from 'amqplib';
import { rabbitmqSubscribe } from '../decorators/rabbitmq-subscribe.decorator';
import { GenreRepository } from '../repositories';
import { BaseModelSyncService } from './base-model-sync.service';
import { ValidatorService } from './validator.service';

@bind({ scope: BindingScope.SINGLETON })
export class GenreSyncServiceService extends BaseModelSyncService {

  constructor(
    @repository(GenreRepository) private genreRepo: GenreRepository,
    @service(ValidatorService) private validator: ValidatorService,
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

}

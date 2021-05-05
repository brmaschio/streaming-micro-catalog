import { bind, /* inject, */ BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { ConsumeMessage } from 'amqplib';
import { rabbitmqSubscribe } from '../decorators/rabbitmq-subscribe.decorator';
import { GenreRepository } from '../repositories';

@bind({ scope: BindingScope.SINGLETON })
export class GenreSyncServiceService {

  constructor(
    @repository(GenreRepository) private genreRepo: GenreRepository,
  ) { }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-gente',
    routingKey: 'model.genre.*',
  })
  async handler({ data, message }: { data: any; message: ConsumeMessage }) {

    console.log(data);

    const [, event] = message.fields.routingKey.split('.').slice(1);

    switch (event) {
      case 'created':
        await this.genreRepo.create(data);
        break;
      case 'updated':
        await this.genreRepo.updateById(data.id, data);
        break;
      case 'deleted':
        await this.genreRepo.deleteById(data.id);
        break;
      default:
        break;
    }

  }

}

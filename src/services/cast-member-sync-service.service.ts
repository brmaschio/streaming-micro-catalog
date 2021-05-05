import { bind, /* inject, */ BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { ConsumeMessage } from 'amqplib';
import { rabbitmqSubscribe } from '../decorators/rabbitmq-subscribe.decorator';
import { CastMemberRepository } from '../repositories';

@bind({ scope: BindingScope.SINGLETON })
export class CastMemberSyncServiceService {

  constructor(
    @repository(CastMemberRepository) private castMemberRepo: CastMemberRepository,
  ) { }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-cast-member',
    routingKey: 'model.cast-member.*',
  })
  async handler({ data, message }: { data: any; message: ConsumeMessage }) {

    console.log(data);

    const [, event] = message.fields.routingKey.split('.').slice(1);

    switch (event) {
      case 'created':
        await this.castMemberRepo.create(data);
        break;
      case 'updated':
        await this.castMemberRepo.updateById(data.id, data);
        break;
      case 'deleted':
        await this.castMemberRepo.deleteById(data.id);
        break;
      default:
        break;
    }

  }

}

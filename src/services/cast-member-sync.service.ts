import { bind, /* inject, */ BindingScope } from '@loopback/core';
import { repository } from '@loopback/repository';
import { ConsumeMessage } from 'amqplib';
import { rabbitmqSubscribe } from '../decorators/rabbitmq-subscribe.decorator';
import { CastMemberRepository } from '../repositories';
import { BaseModelSyncService } from './base-model-sync.service';

@bind({ scope: BindingScope.SINGLETON })
export class CastMemberSyncServiceService extends BaseModelSyncService {

  constructor(
    @repository(CastMemberRepository) private castMemberRepo: CastMemberRepository,
  ) { 
    super();
  }

  @rabbitmqSubscribe({
    exchange: 'amq.topic',
    queue: 'micro-catalog/sync-videos/cast_member',
    routingKey: 'model.cast_member.*',
  })
  async handler({ data, message }: { data: any; message: ConsumeMessage }) {

    await this.sync({ repo: this.castMemberRepo, data, message });

  }

}

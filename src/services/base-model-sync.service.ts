import { DefaultCrudRepository } from "@loopback/repository";
import { Message } from "amqplib";
import { pick } from 'lodash';
import { ValidatorService } from "./validator.service";

export interface SyncOptions {
    repo: DefaultCrudRepository<any, any>;
    data: any;
    message: Message;
}

export abstract class BaseModelSyncService {

    constructor(
        private validateService: ValidatorService
    ) {}

    protected async sync({ repo, data, message }: SyncOptions) {

        const action = this.getAction(message);
        const entity = this.createEntity(data, repo);

        switch (action) {
            case 'created':
                await this.validateService.validate({
                    data: entity,
                    entityClass: repo.entityClass,
                  });
                await repo.create(entity);
                break;
            case 'updated':
                await this.updateOrCreate(repo, entity.id, entity);
                break;
            case 'deleted':
                await repo.deleteById(entity.id);
                break;
            default:
                break;
        }

    }

    protected getAction(message: Message) {
        return message.fields.routingKey.split('.')[2];
    }

    protected createEntity(data: any, repo: DefaultCrudRepository<any, any>) {
        return pick(data, Object.keys(repo.entityClass.definition.properties));
    }

    protected async updateOrCreate(repo: DefaultCrudRepository<any, any>, id: string, entity: any) {
        const exists = await repo.exists(id);

        await this.validateService.validate({
            data: entity,
            entityClass: repo.entityClass,
            ...(exists && {options: {partial: true}}),
          });

        return exists ? repo.updateById(id, entity) : repo.create(entity);
    }

}

import { getModelSchemaRef } from '@loopback/openapi-v3';
import {Entity, model, property} from '@loopback/repository';

export interface SmallCategory {
  id: string;
  name: string;
  is_active: boolean;
}

@model({settings: {strict: false}})
export class Category extends Entity {
  @property({
    type: 'string',
    id: true,
    generated: false,
    required: true,
  })
  id: string;

  @property({
    type: 'string',
    required: true,
    jsonSchema: {
      minLength: 1,
      maxLength: 255,
    },
  })
  name: string;

  @property({
    type: 'string',
    required: false,
    default: null,
    jsonSchema: {
      nullable: true,
    },
  })
  description: string;

  @property({
    type: 'boolean',
    required: false,
    default: true
  })
  is_active: boolean;

  @property({
    type: 'date',
    required: true,
  })
  created_at: String;

  @property({
    type: 'date',
    required: true,
  })
  updated_at: String;

  // Indexer property to allow additional data
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [prop: string]: any;

  constructor(data?: Partial<Category>) {
    super(data);
  }
}

export interface CategoryRelations {
  // describe navigational properties here
}

export type CategoryWithRelations = Category & CategoryRelations;

const schema = getModelSchemaRef(Category, {
  title: 'new schema',
  partial: true
});

console.log(schema);

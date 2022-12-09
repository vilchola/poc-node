import * as aws from 'aws-sdk';
import { Container } from 'inversify';
import { Kafka, logLevel } from 'kafkajs';
import 'reflect-metadata';
import { getVariable } from '../../../../libs/utils';
import { TransactionService, TransactionServiceImpl } from '../application';
import { TopicRepository, TransactionRepository } from '../domain';
import { TopicRepositoryImpl } from '../infrastructure/TopicRepositoryImpl';
import { TransactionRepositoryImpl } from '../infrastructure/TransactionRepositoryImpl';
import { TYPES } from './TYPES';

export class ContainerContext {
  readonly container: Container;

  constructor() {
    this.container = new Container({ defaultScope: 'Singleton' });
    this.container.bind(TYPES.DocumentClient).toConstantValue(this.documentClient());
    this.container.bind(TYPES.TopicCreate).toConstantValue(this.kafka('poc-node-transaction-created'));
    this.container.bind(TYPES.TopicValidate).toConstantValue(this.kafka('poc-node-transaction-validated'));
    this.container.bind<TopicRepository>(TYPES.TopicRepository).to(TopicRepositoryImpl);
    this.container.bind<TransactionRepository>(TYPES.TransactionRepository).to(TransactionRepositoryImpl);
    this.container.bind<TransactionService>(TYPES.TransactionService).to(TransactionServiceImpl);
  }

  private documentClient(): aws.DynamoDB.DocumentClient {
    return new aws.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });
  }

  private kafka(clientId: string): Kafka {
    return new Kafka({
      clientId: clientId,
      brokers: getVariable('TOPIC_BROKERS').split(','),
      sasl: {
        mechanism: getVariable('TOPIC_MECHANISM'),
        username: getVariable('TOPIC_USERNAME'),
        password: getVariable('TOPIC_PASSWORD'),
      },
      ssl: true,
      logLevel: logLevel.ERROR,
    });
  }
}

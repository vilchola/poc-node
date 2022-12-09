import { inject, injectable } from 'inversify';
import { Kafka, Producer } from 'kafkajs';
import { Logger } from '../../../../libs/Logger';
import { getVariable, toJSON } from '../../../../libs/utils';
import { TYPES } from '../di/TYPES';
import { TopicRepository, Transaction } from '../domain';

@injectable()
export class TopicRepositoryImpl implements TopicRepository {
  private readonly log = new Logger('TopicRepositoryImpl');

  private readonly topic: string;

  constructor(
    @inject(TYPES.TopicCreate) private readonly topicCreate: Kafka,
    @inject(TYPES.TopicValidate) private readonly topicValidate: Kafka,
  ) {
    this.topic = getVariable('TOPIC');
  }

  async publishCreate(transaction: Transaction): Promise<void> {
    await this.publish(this.topicCreate.producer({ idempotent: true, retry: { retries: 3 } }), transaction, 'create');
  }

  async publishValidate(transaction: Transaction): Promise<void> {
    await this.publish(
      this.topicValidate.producer({ idempotent: true, retry: { retries: 3 } }),
      transaction,
      'validate',
    );
  }

  private async publish(producer: Producer, transaction: Transaction, key: string): Promise<void> {
    await producer.connect();
    const response = await producer.send({
      topic: this.topic,
      messages: [{ key: `${key}-${transaction.transactionExternalId}`, value: JSON.stringify(transaction) }],
    });
    this.log.debug('[publish]', toJSON(response));
    await producer.disconnect();
  }
}

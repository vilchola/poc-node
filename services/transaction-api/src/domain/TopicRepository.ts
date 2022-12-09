import { Transaction } from './Transaction';

export interface TopicRepository {
  publishCreate(transaction: Transaction): Promise<void>;

  publishValidate(transaction: Transaction): Promise<void>;
}

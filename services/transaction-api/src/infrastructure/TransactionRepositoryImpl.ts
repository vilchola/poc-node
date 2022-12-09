import * as aws from 'aws-sdk';
import { inject, injectable } from 'inversify';
import { Logger } from '../../../../libs/Logger';
import { getVariable } from '../../../../libs/utils';
import { TYPES } from '../di/TYPES';
import { Transaction, TransactionRepository } from '../domain';

@injectable()
export class TransactionRepositoryImpl implements TransactionRepository {
  private readonly log = new Logger('TransactionRepositoryImpl');

  private readonly table: string;

  constructor(@inject(TYPES.DocumentClient) private readonly documentClient: aws.DynamoDB.DocumentClient) {
    this.table = getVariable('TABLE');
  }

  async createTransaction(transaction: Transaction): Promise<void> {
    const params = {
      TableName: this.table,
      Item: transaction,
    };
    this.log.debug('[params]', params);

    await this.documentClient.put(params).promise();
  }

  validateTransaction(transaction: Transaction): Transaction {
    if (transaction.value > 1000 || transaction.value < 0) {
      transaction.transactionStatus.name = 'rejected';
    } else {
      transaction.transactionStatus.name = 'approved';
    }

    return transaction;
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    const params = {
      TableName: this.table,
      Key: {
        transactionExternalId: transaction.transactionExternalId,
      },
      UpdateExpression: 'set transactionStatus = :transactionStatus',
      ExpressionAttributeValues: {
        ':transactionStatus': transaction.transactionStatus,
      },
      ReturnValues: 'UPDATED_NEW',
    };
    this.log.debug('[params]', params);

    await this.documentClient.update(params).promise();
  }
}

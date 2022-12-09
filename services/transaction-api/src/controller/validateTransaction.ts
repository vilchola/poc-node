import { APIGatewayProxyResult, MSKEvent } from 'aws-lambda';
import { Logger } from '../../../../libs/Logger';
import { toJSON } from '../../../../libs/utils';
import { TransactionService } from '../application';
import { ContainerContext } from '../di/context.di';
import { TYPES } from '../di/TYPES';
import { Transaction } from '../domain';

export const { container } = new ContainerContext();
const log = new Logger('validateTransaction');

export function handler(event: MSKEvent): APIGatewayProxyResult {
  log.info('start validateTransaction');
  if (!event.records) {
    log.info('end validateTransaction');
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid message' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  const transactionService: TransactionService = container.get(TYPES.TransactionService);
  log.debug('[MSKEvent]', toJSON(event));
  for (const key in event.records) {
    event.records[key].map(async (record) => {
      const key = Buffer.from(record.key, 'base64').toString();
      const message = Buffer.from(record.value, 'base64').toString();
      log.debug('key:', key);
      log.debug('message:', message);

      const transaction = JSON.parse(message) as Transaction;
      await transactionService.validateTransaction(transaction);
    });
  }
  log.info('end validateTransaction');

  return {
    statusCode: 200,
    body: JSON.stringify({ message: `Transaction validated successfully!` }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
}

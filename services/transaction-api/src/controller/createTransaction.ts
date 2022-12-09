import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { Logger } from '../../../../libs/Logger';
import { toJSON } from '../../../../libs/utils';
import { TransactionService } from '../application';
import { ContainerContext } from '../di/context.di';
import { TYPES } from '../di/TYPES';
import { Transaction } from '../domain';

export const { container } = new ContainerContext();
const log = new Logger('createTransaction');

export async function handler(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  log.info('start createTransaction');
  if (!event.body) {
    log.info('end createTransaction');
    return {
      statusCode: 400,
      body: JSON.stringify({ message: 'Invalid message' }),
      headers: {
        'Content-Type': 'application/json',
      },
    };
  }

  log.debug('[APIGatewayProxyEvent]', toJSON(event));
  const request = JSON.parse(event.body) as Transaction;
  const transaction = new Transaction(
    request.accountExternalIdDebit,
    request.accountExternalIdCredit,
    request.transferTypeId,
    request.value,
  );
  const transactionService: TransactionService = container.get(TYPES.TransactionService);
  await transactionService.createTransaction(transaction);
  log.info('end createTransaction');

  return {
    statusCode: 201,
    body: JSON.stringify({ message: 'Transaction created successfully!' }),
    headers: {
      'Content-Type': 'application/json',
    },
  };
}

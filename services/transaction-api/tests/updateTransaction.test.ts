require('./init');
import { describe, expect } from '@jest/globals';
import { APIGatewayProxyResult, MSKEvent } from 'aws-lambda';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../libs/Logger';
import { getVariable, toJSON } from '../../../libs/utils';
import * as updateTransaction from '../src/controller/updateTransaction';
import { TYPES } from '../src/di/TYPES';

const documentClientMock = { update: jest.fn() };
updateTransaction.container.rebind(TYPES.DocumentClient).toConstantValue(documentClientMock);

describe('updateTransaction', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('testing lambda: updateTransaction - Invalid message', () => {
    expect.hasAssertions();
    const event = { records: undefined } as unknown as MSKEvent;
    const response = updateTransaction.handler(event) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(400);
    expect(documentClientMock.update).toHaveBeenCalledTimes(0);
  });

  it('testing lambda: updateTransaction - Transaction updated', async () => {
    expect.hasAssertions();
    documentClientUpdateMocks();
    documentClientUpdateMocks();
    const event = { records: { topic: getMessages() } } as unknown as MSKEvent;
    const response = updateTransaction.handler(event) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveProperty('message', 'Transaction updated successfully!');
    expect(documentClientMock.update).toHaveBeenCalledTimes(2);
  });
});

function getMessages() {
  const message1 = {
    accountExternalIdDebit: uuidv4(),
    accountExternalIdCredit: uuidv4(),
    transferTypeId: 1,
    value: 120,
    transactionExternalId: uuidv4(),
    transactionType: { transferTypeId: 1 },
    transactionStatus: { name: 'approved' },
    createdAt: new Date().toISOString(),
  };

  const message2 = {
    accountExternalIdDebit: uuidv4(),
    accountExternalIdCredit: uuidv4(),
    transferTypeId: 1,
    value: 120,
    transactionExternalId: uuidv4(),
    transactionType: { transferTypeId: 1 },
    transactionStatus: { name: 'approved' },
    createdAt: new Date().toISOString(),
  };

  return [
    {
      topic: getVariable('TOPIC'),
      key: Buffer.from(JSON.stringify('validate')).toString('base64'),
      value: Buffer.from(JSON.stringify(message1)).toString('base64'),
    },
    {
      topic: getVariable('TOPIC'),
      key: Buffer.from(JSON.stringify('validate')).toString('base64'),
      value: Buffer.from(JSON.stringify(message2)).toString('base64'),
    },
  ];
}

function documentClientUpdateMocks(): void {
  documentClientMock.update.mockImplementationOnce((param) => {
    return {
      promise(): Promise<unknown> {
        Logger.debug('[documentClientUpdateMock()] param:', toJSON(param));
        return Promise.resolve();
      },
    };
  });
}

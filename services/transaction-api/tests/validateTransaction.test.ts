require('./init');
import { describe, expect } from '@jest/globals';
import { APIGatewayProxyResult, MSKEvent } from 'aws-lambda';
import { RecordMetadata } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../libs/Logger';
import { getVariable, toJSON } from '../../../libs/utils';
import * as validateTransaction from '../src/controller/validateTransaction';
import { TYPES } from '../src/di/TYPES';

const topicMock = { connect: jest.fn(), disconnect: jest.fn(), producer: jest.fn(), send: jest.fn() };
validateTransaction.container.rebind(TYPES.TopicValidate).toConstantValue(topicMock);

describe('validateTransaction', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('testing lambda: validateTransaction - Invalid message', () => {
    expect.hasAssertions();
    const event = { records: undefined } as unknown as MSKEvent;
    const response = validateTransaction.handler(event) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(400);
    expect(topicMock.producer).toHaveBeenCalledTimes(0);
  });

  it('testing lambda: validateTransaction - Transaction approved', () => {
    expect.hasAssertions();
    topicMocks();
    const event = { records: { topic: getMessages(120) } } as unknown as MSKEvent;
    const response = validateTransaction.handler(event) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveProperty('message', 'Transaction validated successfully!');
    expect(topicMock.producer).toHaveBeenCalledTimes(1);
  });

  it('testing lambda: validateTransaction - Transaction rejected', () => {
    expect.hasAssertions();
    topicMocks();
    const event = { records: { topic: getMessages(1120) } } as unknown as MSKEvent;
    const response = validateTransaction.handler(event) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(200);
    expect(JSON.parse(response.body)).toHaveProperty('message', 'Transaction validated successfully!');
    expect(topicMock.producer).toHaveBeenCalledTimes(1);
  });
});

function getMessages(value: number) {
  const message = {
    accountExternalIdDebit: uuidv4(),
    accountExternalIdCredit: uuidv4(),
    transferTypeId: 1,
    value: value,
    transactionExternalId: uuidv4(),
    transactionType: { transferTypeId: 1 },
    transactionStatus: { name: 'pending' },
    createdAt: new Date().toISOString(),
  };

  return [
    {
      topic: getVariable('TOPIC'),
      key: Buffer.from(JSON.stringify('create')).toString('base64'),
      value: Buffer.from(JSON.stringify(message)).toString('base64'),
    },
  ];
}

function topicMocks(): void {
  topicMock.producer.mockImplementationOnce(() => {
    return {
      connect(): Promise<void> {
        return Promise.resolve();
      },
      disconnect(): Promise<void> {
        return Promise.resolve();
      },
      send(param): Promise<RecordMetadata[]> {
        Logger.debug('[topicMock()] param:', toJSON(param));
        return Promise.resolve([param]);
      },
    };
  });
}

require('./init');
import { describe, expect } from '@jest/globals';
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import { RecordMetadata } from 'kafkajs';
import { v4 as uuidv4 } from 'uuid';
import { Logger } from '../../../libs/Logger';
import { toJSON } from '../../../libs/utils';
import * as createTransaction from '../src/controller/createTransaction';
import { TYPES } from '../src/di/TYPES';

const documentClientMock = { put: jest.fn() };
createTransaction.container.rebind(TYPES.DocumentClient).toConstantValue(documentClientMock);

const topicMock = { connect: jest.fn(), disconnect: jest.fn(), producer: jest.fn(), send: jest.fn() };
createTransaction.container.rebind(TYPES.TopicCreate).toConstantValue(topicMock);

describe('createTransaction', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  it('testing lambda: createTransaction - Bad request', async () => {
    expect.hasAssertions();
    const request = undefined;
    const event = { body: JSON.stringify(request) } as unknown as APIGatewayProxyEvent;
    const response = (await createTransaction.handler(event)) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(400);
    expect(documentClientMock.put).toHaveBeenCalledTimes(0);
    expect(topicMock.producer).toHaveBeenCalledTimes(0);
  });

  it('testing lambda: createTransaction - Transaction created successfully', async () => {
    expect.hasAssertions();
    documentClientPutMocks();
    topicMocks();
    const request = {
      accountExternalIdDebit: uuidv4(),
      accountExternalIdCredit: uuidv4(),
      transferTypeId: 1,
      value: 120,
    };
    const event = { body: JSON.stringify(request) } as unknown as APIGatewayProxyEvent;
    const response = (await createTransaction.handler(event)) as APIGatewayProxyResult;
    expect(response.statusCode).toBe(201);
    expect(documentClientMock.put).toHaveBeenCalledTimes(1);
    expect(topicMock.producer).toHaveBeenCalledTimes(1);
  });
});

function documentClientPutMocks(): void {
  documentClientMock.put.mockImplementationOnce((param) => {
    return {
      promise(): Promise<unknown> {
        Logger.debug('[documentClientPutMock()] param:', toJSON(param));
        return Promise.resolve();
      },
    };
  });
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

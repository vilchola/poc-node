import { v4 as uuidv4 } from 'uuid';

export class Transaction {
  accountExternalIdDebit: string;
  accountExternalIdCredit: string;
  transferTypeId: number;
  value: number;
  transactionExternalId: string;
  transactionType?: TransactionType;
  transactionStatus: TransactionStatus;
  createdAt?: string;

  constructor(accountExternalIdDebit: string, accountExternalIdCredit: string, transferTypeId: number, value: number) {
    this.accountExternalIdDebit = accountExternalIdDebit;
    this.accountExternalIdCredit = accountExternalIdCredit;
    this.transferTypeId = transferTypeId;
    this.value = value;
    this.transactionExternalId = uuidv4();
    this.transactionType = { transferTypeId: transferTypeId };
    this.transactionStatus = { name: 'pending' };
    this.createdAt = new Date().toISOString();
  }
}

export class TransactionType {
  transferTypeId: number;
  name?: string;
}

export class TransactionStatus {
  name: StatusTransaction;
}

export type StatusTransaction = 'pending' | 'approved' | 'rejected';

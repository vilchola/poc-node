import 'reflect-metadata';
import { Transaction } from '../domain';

export interface TransactionService {
  createTransaction(transaction: Transaction): Promise<void>;

  validateTransaction(transaction: Transaction): Promise<void>;

  updateTransaction(transaction: Transaction): Promise<void>;
}

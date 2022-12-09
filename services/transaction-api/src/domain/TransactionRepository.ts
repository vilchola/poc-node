import { Transaction } from './Transaction';

export interface TransactionRepository {
  createTransaction(transaction: Transaction): Promise<void>;

  validateTransaction(transaction: Transaction): Transaction;

  updateTransaction(transaction: Transaction): Promise<void>;
}

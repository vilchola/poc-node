import { inject, injectable } from 'inversify';
import { TYPES } from '../di/TYPES';
import { TopicRepository, Transaction, TransactionRepository } from '../domain';
import { TransactionService } from './TransactionService';

@injectable()
export class TransactionServiceImpl implements TransactionService {
  constructor(
    @inject(TYPES.TopicRepository) private topicRepository: TopicRepository,
    @inject(TYPES.TransactionRepository)
    private transactionRepository: TransactionRepository,
  ) {}

  async createTransaction(transaction: Transaction): Promise<void> {
    await this.transactionRepository.createTransaction(transaction);
    await this.topicRepository.publishCreate(transaction);
  }

  async validateTransaction(transaction: Transaction): Promise<void> {
    const validatedTransaction = this.transactionRepository.validateTransaction(transaction);
    await this.topicRepository.publishValidate(validatedTransaction);
  }

  async updateTransaction(transaction: Transaction): Promise<void> {
    await this.transactionRepository.updateTransaction(transaction);
  }
}

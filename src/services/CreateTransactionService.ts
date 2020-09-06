/* eslint-disable prettier/prettier */
import { getRepository, getCustomRepository } from 'typeorm';
import AppError from '../errors/AppError';

import Transaction from '../models/Transaction';
import TransactionRepository from '../repositories/TransactionsRepository';

interface Request {
  title: string;
  value: number;
  type: string;
  category_id: string;
}

class CreateTransactionService {
  public async execute({ title, value, type, category_id }: Request): Promise<Transaction> {
      const transactionRepository = getRepository(Transaction);
      const customTransactionRepository = getCustomRepository(TransactionRepository);

      const balance = await customTransactionRepository.getBalance();

      if(type !== 'income' && type !== 'outcome') {
        throw new AppError('type must be either income or outcome');
      }

      if(type === 'outcome' && value > balance.total) {
        throw new AppError('you dont have enough balance to do it.');
      }

      const transaction = transactionRepository.create({ title, value, type, category_id });
      await transactionRepository.save(transaction);

      return transaction;
  }
}

export default CreateTransactionService;

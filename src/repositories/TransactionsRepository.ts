import { EntityRepository, Repository, getRepository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactionRepository = getRepository(Transaction);

    const incomeArray = await transactionRepository.find({
      where: { type: 'income' },
    });

    const outcomeArray = await transactionRepository.find({
      where: { type: 'outcome' },
    });

    const income = this.sumArray(incomeArray);

    const outcome = this.sumArray(outcomeArray);

    const total = income - outcome;

    return {
      income,
      outcome,
      total,
    };
  }

  private sumArray(array: Transaction[]) {
    return array.reduce(function (accumulator, currentValue) {
      return accumulator + currentValue.value;
    }, 0);
  }
}

export default TransactionsRepository;

import { getRepository } from 'typeorm';
import Transaction from '../models/Transaction';
import AppError from '../errors/AppError';
// import AppError from '../errors/AppError';

interface Request {
  id: string;
}

class DeleteTransactionService {
  public async execute({ id }: Request): Promise<void> {
    const transactionsRepository = getRepository(Transaction);

    try {
      await transactionsRepository.delete(id);
    } catch (err) {
      throw new AppError(
        'there was an error while trying to delete the transaction',
      );
    }
  }
}

export default DeleteTransactionService;

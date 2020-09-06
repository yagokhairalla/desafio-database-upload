import { Router } from 'express';
import { getRepository, getCustomRepository } from 'typeorm';
import multer from 'multer';

import Transaction from '../models/Transaction';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import CreateCategoryService from '../services/CreateCategoryService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

import uploadConfig from '../config/upload';

const upload = multer(uploadConfig);

const transactionsRouter = Router();
/*
  GET /transactions: Essa rota deve retornar uma listagem com todas as transações que você cadastrou até agora,
  junto com o valor da soma de entradas, retiradas e total de crédito.
*/
transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getRepository(Transaction);

  const transactions = await transactionsRepository.find();
  const customTransactionsRepository = getCustomRepository(
    TransactionsRepository,
  );

  const balance = await customTransactionsRepository.getBalance();

  return response.status(200).json({ transactions, balance });
});

/*
  POST /transactions: A rota deve receber title, value, type, e category dentro do corpo da requisição,
  sendo o type o tipo da transação, que deve ser income para entradas (depósitos) e outcome para saídas (retiradas).
  Ao cadastrar uma nova transação, ela deve ser armazenada dentro do seu banco de dados, possuindo os campos id, title,
  value, type, category_id, created_at, updated_at.
*/
transactionsRouter.post('/', async (request, response) => {
  const { title, value, type, category } = request.body;

  const createCategoryService = new CreateCategoryService();
  const { id } = await createCategoryService.execute({ title: category });

  const createTransactionService = new CreateTransactionService();
  const transaction = await createTransactionService.execute({
    title,
    value,
    type,
    category_id: id,
  });

  return response.status(200).json(transaction);
});

/*
  DELETE /transactions/:id: A rota deve deletar uma transação com o id presente nos parâmetros da rota;
*/
transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  const deleteTransactionService = new DeleteTransactionService();
  await deleteTransactionService.execute({ id });

  return response.send();
});

/*
  POST /transactions/import: A rota deve permitir a importação de um arquivo com formato .csv contendo as mesmas
  informações necessárias para criação de uma transação id, title, value, type, category_id, created_at, updated_at,
  onde cada linha do arquivo CSV deve ser um novo registro para o banco de dados, e por fim retorne todas as transactions
  que foram importadas para seu banco de dados.
*/
transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const importTransactionService = new ImportTransactionsService();

    const transactions = await importTransactionService.execute(
      request.file.path,
    );

    return response.json(transactions);
  },
);

export default transactionsRouter;

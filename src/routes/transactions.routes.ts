import { Router } from 'express';
import multer from 'multer';
import { getCustomRepository } from 'typeorm';

import uploadConfig from '../config/upload';

import TransactionsRepository from '../repositories/TransactionsRepository';
import CreateTransactionService from '../services/CreateTransactionService';
import DeleteTransactionService from '../services/DeleteTransactionService';
import ImportTransactionsService from '../services/ImportTransactionsService';

const upload = multer(uploadConfig);

const transactionsRouter = Router();

transactionsRouter.get('/', async (request, response) => {
  const transactionsRepository = getCustomRepository(TransactionsRepository);

  response.json({
    transactions: await transactionsRepository.find(),
    balance: await transactionsRepository.getBalance(),
  });
});

transactionsRouter.post('/', async (request, response) => {
  const transaction = await new CreateTransactionService().execute(
    request.body,
  );

  response.json(transaction);
});

transactionsRouter.delete('/:id', async (request, response) => {
  const { id } = request.params;
  await new DeleteTransactionService().execute({ id });

  response.sendStatus(204);
});

transactionsRouter.post(
  '/import',
  upload.single('file'),
  async (request, response) => {
    const { file } = request;
    await new ImportTransactionsService().execute({
      filename: file.filename,
    });
    response.send();
  },
);

export default transactionsRouter;

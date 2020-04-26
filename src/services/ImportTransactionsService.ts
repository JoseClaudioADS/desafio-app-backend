import csvParse from 'csv-parse';
import fs from 'fs';
import path from 'path';

import Transaction from '../models/Transaction';

import CreateTransactionService from './CreateTransactionService';

interface Request {
  filename: string;
}

interface TransactionLine {
  title: string;
  value: number;
  type: 'income' | 'outcome';
  category: string;
}

class ImportTransactionsService {
  async execute({ filename }: Request): Promise<Transaction[]> {
    const createTransactionService = new CreateTransactionService();

    const csvFilePath = path.resolve(__dirname, '..', '..', 'tmp', filename);
    const transactions = await this.loadCSV(csvFilePath);

    const transactionsCreated: Transaction[] = [];

    //TODO a regra da verificação da categoria, não me permite utilizar o Promise.all()
    //rodando ao mesmo tempo não tem como saber se já incluí alguma

    //Não faz sentido criar todo o código do CreateTransactionService aqui, devemos reusar,
    //caso uma transação for criada de forma diferente, teriamos de mudar em 2 lugares.
    for (const { title, type, value, category } of transactions) {
      transactionsCreated.push(
        await createTransactionService.execute({
          title,
          value,
          type,
          category,
        }),
      );
    }

    return transactionsCreated;
  }

  async loadCSV(csvFilePath: string): Promise<TransactionLine[]> {
    const readCSVStream = fs.createReadStream(csvFilePath);

    const parseStream = csvParse({
      from_line: 2,
      ltrim: true,
      rtrim: true,
    });

    const parseCSV = readCSVStream.pipe(parseStream);

    const lines: TransactionLine[] = [];

    parseCSV.on('data', line => {
      lines.push({
        title: line[0],
        type: line[1],
        value: line[2],
        category: line[3],
      });
    });

    await new Promise(resolve => {
      parseCSV.on('end', resolve);
    });

    return lines;
  }
}

export default ImportTransactionsService;

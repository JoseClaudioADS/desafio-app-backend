import { EntityRepository, Repository } from 'typeorm';

import Transaction from '../models/Transaction';

interface Balance {
  income: number;
  outcome: number;
  total: number;
}

@EntityRepository(Transaction)
class TransactionsRepository extends Repository<Transaction> {
  public async getBalance(): Promise<Balance> {
    const transactions = await this.find();

    return transactions.reduce(
      (balance, transaction) => {
        const balanceTmp = balance;

        if (transaction.type === 'income')
          balanceTmp.income += transaction.value;
        else balanceTmp.outcome += transaction.value;

        balanceTmp.total = balanceTmp.income - balanceTmp.outcome;

        return balanceTmp;
      },
      { income: 0, outcome: 0, total: 0 } as Balance,
    );
  }
}

export default TransactionsRepository;

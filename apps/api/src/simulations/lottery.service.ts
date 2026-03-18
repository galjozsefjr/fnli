import { randomInt } from 'crypto';
import { intersection } from 'lodash';

export class LotteryService {
  constructor() {}

  createRandomLotteryNumbers(count = 5, start = 1, end = 90) {
    const valueSet = new Set<number>();
    while (valueSet.size < count) {
      valueSet.add(randomInt(start, end + 1));
    }
    return Array.from(valueSet.values()).toSorted((a, b) => a - b);
  }

  countMatches(lotteryNumbersA: number[], lotteryNumbersB: number[]) {
    return intersection(lotteryNumbersA, lotteryNumbersB).length;
  }
}

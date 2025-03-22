import axios from 'axios';
import { sleep } from 'radash';

export const press = async (options: PressOptions) => {
  await axios.get('http://127.0.0.1:8000/press', {
    params: { key: options.key },
  });
  await sleep(5000);
}

export interface PressOptions {
  key: string;
}

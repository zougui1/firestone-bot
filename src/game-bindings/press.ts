import axios from 'axios';

export const press = async (options: PressOptions) => {
  await axios.get('http://127.0.0.1:8000/press', {
    params: { key: options.key },
  });
}

export interface PressOptions {
  key: string;
}

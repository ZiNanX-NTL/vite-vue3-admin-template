import axios from 'axios';
export function loadGeojson(filepath: string, dataType = 'features'): Promise<any> {
  return new Promise((resolve, reject) => {
    axios
      .get(filepath)
      .then((res: any) => {
        resolve(res.data[dataType]);
      })
      .catch(err => {
        reject(err);
      });
  });
}

import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
interface RequestParams {
  path: string;
  method?: any;
  data?: any;
  responseType?: any;
  baseUrl?: any;
}


@Injectable({
  providedIn: 'root'
})
export class ApiClientService {

  constructor(private http: HttpClient) {
  }

  async call(params: RequestParams): Promise<any> {
    const {data = {}, method = 'GET', path, responseType = 'json', baseUrl = null} = params;
    const url = `${baseUrl || environment.baseUrl}${path}`;
    const headers = new HttpHeaders();
    headers.append('Access-Control-Allow-Origin', '*');

    const response = await new Promise<any>(resolve => {
      if (method === 'GET') {
        this.http.get(url, {
          params: data,
          responseType,
          headers
        }).subscribe(result => {
          resolve({
            status: 200,
            json: () => result
          });
        });
      } else {


        this.http.post(url, data).subscribe(result => {
          resolve({
            status: 200,
            json: () => result
          });
        });
      }
    });

    if ([200, 201].indexOf(response.status) === -1) {
      throw new Error(response.statusText).message;
    }


    return await response.json();
  }
}

import {Injectable} from '@angular/core';
import {environment} from '../../environments/environment';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Product} from "../models/product.interface";
import APIS from '../../app/apis';

@Injectable({
  providedIn: 'root'
})
export class ApiClientService {

  constructor(private http: HttpClient) {
  }
  importProductList(files: {}) {
    return this.http.post(environment.baseUrl + APIS.IMPORT_PRODUCT_LIST, files);
  }
}

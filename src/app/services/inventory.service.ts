import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class InventoryService {
  constructor(private http: HttpClient) {}

  getInventories(): Observable<any[]> {
    return this.http.get<any[]>('/api/inventories');
  }

updateInventory(id: number): Observable<any> {
  return this.http.put(`/api/inventories/${id}`, {}); // 空のボディで送る
}



}
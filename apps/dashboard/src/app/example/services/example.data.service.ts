import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { ExampleService } from '../../shared/service';
import { convertExampleJsonToList } from '../functions/convert';
import { ExampleItem } from '../models/example.item.model';

@Injectable({
  providedIn: 'root',
})
export class ExampleDataService {
  jsonService = inject(ExampleService);

  getGPIOExampleList(): Observable<ExampleItem[]> {
    return this.jsonService.getJsonArray('./assets/json/gpio.json').pipe(
      map((json) => convertExampleJsonToList(json)),
      catchError((error) => [])
    );
  }

  getI2CExampleList(): Observable<ExampleItem[]> {
    return this.jsonService.getJsonArray('./assets/json/i2c.json').pipe(
      map((json) => convertExampleJsonToList(json)),
      catchError((error) => [])
    );
  }

  getRemoteExampleList(): Observable<ExampleItem[]> {
    return this.jsonService.getJsonArray('./assets/json/remote.json').pipe(
      map((json) => convertExampleJsonToList(json)),
      catchError((error) => [])
    );
  }
}

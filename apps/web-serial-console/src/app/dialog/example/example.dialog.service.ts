import { inject, Injectable } from '@angular/core';
import { catchError, map, Observable } from 'rxjs';
import { convertExampleJsonToList } from '../../functions';
import { ExampleItem } from '../../models';
import { ExampleService } from '../../service';

@Injectable({
  providedIn: 'root',
})
export class ExampleDialogService {
  jsonService = inject(ExampleService);

  getGPIOExampleList(): Observable<ExampleItem[]> {
    return this.jsonService.getJsonArray('./assets/json/gpio.json').pipe(
      map((json) => convertExampleJsonToList(json)),
      catchError((error) => []),
    );
  }

  getI2CExampleList(): Observable<ExampleItem[]> {
    return this.jsonService.getJsonArray('./assets/json/i2c.json').pipe(
      map((json) => convertExampleJsonToList(json)),
      catchError((error) => []),
    );
  }

  getRemoteExampleList(): Observable<ExampleItem[]> {
    return this.jsonService.getJsonArray('./assets/json/remote.json').pipe(
      map((json) => convertExampleJsonToList(json)),
      catchError((error) => []),
    );
  }
}
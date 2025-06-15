
import { Injectable,signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ServiceService {
  booleanActivate: boolean = false;
    constructor() { }
  setActivate(){
    this.booleanActivate = !this.booleanActivate;
  }
  getActivate(){
    return this.booleanActivate;
  }
}

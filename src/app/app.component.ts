import { Component, NgModule, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { routes } from './app.routes'
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-root',
  standalone: true,
  imports:[
    CommonModule,
    RouterModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatFormFieldModule,
    RouterModule,
    MatIconModule
  ],
  templateUrl: './app.html',
  styleUrls: ['./app.css']

})
export class App {
  protected readonly title = signal('stock-app');
}



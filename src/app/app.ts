import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FallbackPopup } from '@shared/ui/fallback-popup';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [RouterOutlet, FallbackPopup],
})
export class App {}

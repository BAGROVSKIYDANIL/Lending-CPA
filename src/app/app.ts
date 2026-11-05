import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { FallbackPopup } from '@shared/ui/fallback-popup';
import { ViewportService } from '@shared/services/viewport.service';
import { Header } from '@widgets/header/header';

@Component({
  selector: 'app-root',
  standalone: true,
  templateUrl: './app.html',
  styleUrl: './app.scss',
  imports: [RouterOutlet, FallbackPopup, Header],
})
export class App {
  readonly viewport = inject(ViewportService);
}

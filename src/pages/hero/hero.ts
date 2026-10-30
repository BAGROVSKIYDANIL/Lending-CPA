import {Component, inject} from '@angular/core';
import {Header} from "@widgets/header/header";
import {Socials} from "@shared/ui/socials/socials";
import {ViewportService} from "@shared/services/viewport.service"

@Component({
    imports: [
        Header,
        Socials
    ],
  selector: 'app-hero',
  styleUrl: './hero.scss',
  templateUrl: './hero.html',
})
export class Hero {
    readonly viewport = inject(ViewportService);

}

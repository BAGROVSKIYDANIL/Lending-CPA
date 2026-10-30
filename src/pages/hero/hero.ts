import {Component, inject} from '@angular/core';
import {Header} from "@widgets/header/header";
import {Socials} from "@shared/ui/socials/socials";
import { ViewportService} from "@shared/services/viewport.service"
import { TranslatePipe } from '@ngx-translate/core';

@Component({
    imports: [
        Header,
        Socials,
        TranslatePipe,
    ],
  selector: 'app-hero',
  styleUrl: './hero.scss',
  templateUrl: './hero.html',
})
export class Hero {
    readonly viewport = inject(ViewportService);

}

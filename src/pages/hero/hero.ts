import { Component } from '@angular/core';
import {Header} from "@widgets/header/header";
import {Socials} from "@shared/ui/socials/socials";

@Component({
    imports: [
        Header,
        Socials
    ],
  selector: 'app-hero',
  styleUrl: './hero.scss',
  templateUrl: './hero.html',
})
export class Hero {}

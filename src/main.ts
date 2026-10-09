import '@angular/localize/init';
import './styles.scss';
import { registerLocaleData } from '@angular/common';
import ru from '@angular/common/locales/ru';
import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';

if (__APP_LOCALE__ === 'ru') registerLocaleData(ru);

bootstrapApplication(App, appConfig)
  .catch((err) => console.error(err));

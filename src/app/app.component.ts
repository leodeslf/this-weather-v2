import { Component, OnInit } from '@angular/core';

const ipdata = [
  'https://api.ipdata.co/es?',
  'api-key=e74737cb776b0fb96e8fd1241bc119c7438e15e55e224cea3e5b333a&',
  'fields=city,country_code'
].join('');

const openweatherapi = [
  'https://api.openweathermap.org/data/2.5/weather?',
  'appid=b280c897878592322aafe56701248929&',
  'lang=sp&units=metric&'
].join('');

export interface Card {
  id: number,
  name: string,
  temp: number,
  text: string,
  icon: string,
  here?: boolean
}

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  cards: Card[] = [];
  home: string;
  homeConfirmed: boolean = localStorage.getItem('home') !== null;
  message: string = '';
  messageTimeOut: any;
  query: string = '';

  ngOnInit(): void {
    // Try to get a previously confirmed home query.
    if (this.homeConfirmed) {
      this.home = localStorage.getItem('home');
      this.checkQuery(this.home);
      return;
    }
    this.setHomeByIP();
  }

  setHomeByIP(): void {
    fetch(ipdata).then(res => {
      if (res.status > 200) return;
      res.json().then(json => {
        this.home = json.city + ', ' + json.country_code;
        this.checkQuery(this.home);
      });
    }).catch(() => {
      console.error('Problems with api.ipdata.co');
    });
  }

  setHomeByGPS(): void {
    navigator.geolocation.getCurrentPosition(pos => {
      this.home = `lat=${pos.coords.latitude}&lon=${pos.coords.longitude}`;
      this.checkQuery(this.home, true);
      this.saveHome();
      this.homeConfirmed = true;
    });
  }

  getFinalURL(query: string): string {
    // Search by coordinates (lat, lon) or city name (q).
    const param = query.slice(0, 4) === 'lat=' ? '' : 'q=';
    return openweatherapi + param + query;
  }

  getCardFromData(data: any): Card {
    const card: Card = {
      id: data.id,
      name: data.name,
      temp: Math.round(data.main.temp),
      text:
        data.weather[0].description[0].toUpperCase() +
        data.weather[0].description.slice(1),
      icon: data.weather[0].icon,
    }

    /**
     * API uses the same icon for several cases. To avoid repeated files we
     * change 'n' (night) for 'd' (day).
     */
    if (card.icon[2] === 'n') {
      // Number code could have a zero at the left, so we need it as a string.
      let nums = [card.icon[0], card.icon[1]].join('');
      // Cases where it repeats.
      if (+nums > 2 && +nums < 10 || +nums > 10) card.icon = nums + 'd';
    }
    // Add identifier.
    card.icon = '#_' + card.icon;
    return card;
  }

  checkQuery(query: string, isHome?: boolean): void {
    if (query === '') return;
    this.query = '';
    this.message = 'Cargando...';
    fetch(this.getFinalURL(query)).then(res => {
      if (res.status > 200) throw res;
      res.json().then((json) => {
        // Avoid repeated cards.
        let repeatedIndex = this.cards.indexOf(
          this.cards.filter(card => card.id === json.id)[0]
        );
        // Add a new one or override home, otherwise,
        // tell where the repeated one is.
        if (repeatedIndex < 0) {
          if (isHome) {
            this.cards[0] = this.getCardFromData(json);
          } else {
            this.cards.push(this.getCardFromData(json));
          }
        } else {
          this.cards[repeatedIndex].here = true;
          setTimeout(() => this.cards[repeatedIndex].here = false, 400);
        }
      });
    }).then(() => {
      this.message = '';
    }).catch(() => {
      this.message = `Sin resultados para "${query}"`;
      clearTimeout(this.messageTimeOut);
      this.messageTimeOut = setTimeout(() => this.message = '', 3500);
    });
  }

  saveHome(): void {
    localStorage.setItem('home', this.home);
    this.homeConfirmed = true;
  }

  deleteCard(id: number): void {
    this.cards = this.cards.filter(card => card.id !== id);
  }
}

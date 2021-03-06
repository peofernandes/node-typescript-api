import { StormGlass, ForecastPoint } from '@src/clients/stormGlass'
import { time } from 'console'

export enum BeachPosition {
  S = 'S',
  E = 'E',
  W = 'W',
  N = 'N'
}

export interface Beach {
  name: string
  position: BeachPosition
  lat: number
  lng: number
  user: string  
}

export interface TimeForecast {
  time: string
  forecast: BeachForecast[]
}

export interface BeachForecast extends Omit<Beach, 'user'>, ForecastPoint {}

export class Forecast {
  constructor(protected stormGlass = new StormGlass()) {}

  public async processForecastForBeaches(beaches: Beach[]): Promise<TimeForecast[]> {
    const pointsWithCorrectSources: BeachForecast[] = []

    for (const beach of beaches) {
      const points = await this.stormGlass.fetchPoints(beach.lat, beach.lng)
      const enricheBeachData = points.map(e => ({
        ...{
          lat: beach.lat,
          lng: beach.lng,
          name: beach.name,
          position: beach.position,
          rating: 2
        },
        ...e
      }))
      pointsWithCorrectSources.push(...enricheBeachData)
    }

    return this.mapForecastByTime(pointsWithCorrectSources)
  }

  private mapForecastByTime (forecast: BeachForecast[]): TimeForecast[] {
    const forecasByTime: TimeForecast[] = []

    for(const point of forecast) {
      const timePoint = forecasByTime.find(f => f.time === point.time)
      if (timePoint) {
        timePoint.forecast.push(point)
      } else {
        forecasByTime.push({
          time: point.time,
          forecast: [point]
        })
      }
    }

    return forecasByTime    
  }
}
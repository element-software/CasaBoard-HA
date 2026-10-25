"use client";
import { useEntity, useHA } from "@casaboard/ha";
import { useEffect, useState } from "react";
import { Skeleton } from "@heroui/react";
import { useEntityLoading } from "@repo/hooks/useEntityLoading";

interface ForecastItem {
  datetime: string;
  condition: string;
  temperature: number;
  templow?: number;
  precipitation?: number;
  precipitation_probability?: number;
}

const CONDITION_LABELS: Record<string, string> = {
  "clear-night": "Clear Night",
  sunny: "Sunny",
  partlycloudy: "Partly Cloudy",
  cloudy: "Cloudy",
  rainy: "Rainy",
  pouring: "Pouring",
  snowy: "Snowy",
  "snowy-rainy": "Snowy Rain",
  windy: "Windy",
  "windy-variant": "Windy",
  fog: "Foggy",
  hail: "Hail",
  lightning: "Lightning",
  "lightning-rainy": "Storms",
  exceptional: "Exceptional",
};

function formatCondition(condition: string): string {
  if (CONDITION_LABELS[condition]) return CONDITION_LABELS[condition];
  return condition
    .split(/[-_]/)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

function formatForecastDay(datetime: string): string {
  const date = new Date(datetime);
  return date.toLocaleDateString("en-GB", { weekday: "short" });
}

function hasPrecipitation(item: ForecastItem): boolean {
  const rainy = /rain|pour|lightning|hail|snow/.test(item.condition);
  if (rainy) return true;
  if ((item.precipitation_probability ?? 0) >= 30) return true;
  if ((item.precipitation ?? 0) > 0) return true;
  return false;
}

type GlyphSize = "lg" | "sm";

/** Stylized weather glyphs matching the HomeKit weather card mockup. */
function WeatherGlyph({
  condition,
  size = "lg",
}: {
  condition: string;
  size?: GlyphSize;
}) {
  const dim = size === "lg" ? 56 : 28;
  const sun = "#F2C94C";
  const cloud = "#C4C4C4";
  const night = "#8E8E93";
  const rain = "#7B8DB0";

  const isSunny = condition === "sunny";
  const isClearNight = condition === "clear-night";
  const isPartly = condition === "partlycloudy" || condition === "windy-variant";
  const isStorm = /lightning/.test(condition);
  const isRain = /rain|pour|hail/.test(condition);
  const isSnow = /snow/.test(condition);

  // Forecast row uses the simplified pill-cloud language from the mockup
  if (size === "sm") {
    if (isSunny) {
      return (
        <svg width={dim} height={dim} viewBox="0 0 28 28" aria-hidden="true">
          <circle cx="14" cy="14" r="8" fill={sun} />
        </svg>
      );
    }
    if (isPartly) {
      return (
        <svg width={dim} height={dim} viewBox="0 0 28 28" aria-hidden="true">
          <circle cx="17" cy="10" r="7" fill={sun} />
          <rect x="3" y="14" width="20" height="8" rx="4" fill={cloud} />
        </svg>
      );
    }
    return (
      <svg width={dim} height={dim} viewBox="0 0 28 28" aria-hidden="true">
        <rect x="4" y="10" width="20" height="8" rx="4" fill={cloud} />
      </svg>
    );
  }

  if (isSunny) {
    return (
      <svg width={dim} height={dim} viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="28" cy="28" r="16" fill={sun} />
      </svg>
    );
  }

  if (isClearNight) {
    return (
      <svg width={dim} height={dim} viewBox="0 0 56 56" aria-hidden="true">
        <path
          d="M34 12c-8.8 0-16 7.2-16 16s7.2 16 16 16c2.4 0 4.7-.5 6.8-1.5C35.6 46 29.2 48.5 22 48.5 11.2 48.5 2.5 39.8 2.5 29S11.2 9.5 22 9.5c5.4 0 10.2 2.1 13.8 5.6-.5-.1-1.1-.1-1.8-.1z"
          fill={night}
        />
      </svg>
    );
  }

  if (isPartly) {
    return (
      <svg width={dim} height={dim} viewBox="0 0 56 56" aria-hidden="true">
        <circle cx="34" cy="20" r="14" fill={sun} />
        <rect x="8" y="28" width="36" height="14" rx="7" fill={cloud} />
      </svg>
    );
  }

  // Large current-condition glyph — pill cloud with optional accents
  return (
    <svg width={dim} height={dim} viewBox="0 0 56 56" aria-hidden="true">
      <rect x="6" y="20" width="44" height="16" rx="8" fill={cloud} />
      {isStorm && (
        <path
          d="M28 34 L24 44 H30 L26 52"
          stroke={sun}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      )}
      {isRain && !isStorm && (
        <>
          <line x1="20" y1="40" x2="18" y2="48" stroke={rain} strokeWidth="2" strokeLinecap="round" />
          <line x1="28" y1="40" x2="26" y2="48" stroke={rain} strokeWidth="2" strokeLinecap="round" />
          <line x1="36" y1="40" x2="34" y2="48" stroke={rain} strokeWidth="2" strokeLinecap="round" />
        </>
      )}
      {isSnow && (
        <>
          <circle cx="20" cy="44" r="2" fill={rain} />
          <circle cx="28" cy="46" r="2" fill={rain} />
          <circle cx="36" cy="44" r="2" fill={rain} />
        </>
      )}
    </svg>
  );
}

interface WeatherProps {
  entityId: string;
  forecastType?: "daily" | "hourly";
  forecastCount?: number;
}

export const Weather = ({
  entityId,
  forecastType = "daily",
  forecastCount = 5,
}: WeatherProps) => {
  const entity = useEntity(entityId);
  const { connection } = useHA();
  const { isEntityReady, showNotAvailable, isLoaded } = useEntityLoading(entity);
  const [forecast, setForecast] = useState<ForecastItem[]>([]);

  useEffect(() => {
    if (!connection || !entityId) return;

    let cancelled = false;

    connection
      .sendMessagePromise({
        type: "call_service",
        domain: "weather",
        service: "get_forecasts",
        target: { entity_id: entityId },
        service_data: { type: forecastType },
        return_response: true,
      } as any)
      .then((result: any) => {
        if (cancelled) return;
        const data = result?.response?.[entityId]?.forecast;
        if (Array.isArray(data) && data.length > 0) {
          setForecast(data);
        }
      })
      .catch(() => {
        if (!cancelled && Array.isArray(entity?.attributes?.forecast)) {
          setForecast(entity.attributes.forecast);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [connection, entityId, forecastType]);

  useEffect(() => {
    if (forecast.length === 0 && Array.isArray(entity?.attributes?.forecast)) {
      setForecast(entity.attributes.forecast);
    }
  }, [entity?.attributes?.forecast, forecast.length]);

  if (!entityId) {
    return (
      <div className="weather-hk weather-hk--empty">
        <WeatherGlyph condition="cloudy" size="sm" />
        <span>Configure Weather Entity</span>
      </div>
    );
  }

  const condition = isEntityReady ? entity!.state : "";
  const currentTemp: number = entity?.attributes?.temperature ?? 0;
  const visibleForecast = forecast.slice(0, forecastCount);

  return (
    <Skeleton
      isLoaded={isLoaded}
      className="flex h-full w-full flex-col rounded-[1.75rem]"
      classNames={{ content: "flex h-full min-h-0 w-full flex-1 flex-col" }}
    >
      {showNotAvailable ? (
        <div className="weather-hk weather-hk--unavailable">
          <div className="weather-hk__current">
            <WeatherGlyph condition="cloudy" size="lg" />
            <div className="weather-hk__now">
              <div className="weather-hk__temp">—</div>
              <div className="weather-hk__condition">Unavailable</div>
            </div>
          </div>
        </div>
      ) : isEntityReady ? (
        <div className="weather-hk">
          <div className="weather-hk__current">
            <WeatherGlyph condition={condition} size="lg" />
            <div className="weather-hk__now">
              <div className="weather-hk__temp">{currentTemp.toFixed(1)}°</div>
              <div className="weather-hk__condition">{formatCondition(condition)}</div>
            </div>
          </div>

          {visibleForecast.length > 0 && (
            <div
              className="weather-hk__forecast"
              style={{
                gridTemplateColumns: `repeat(${Math.min(visibleForecast.length, forecastCount)}, minmax(0, 1fr))`,
              }}
            >
              {visibleForecast.map((item, i) => (
                <div key={`${item.datetime}-${i}`} className="weather-hk__day">
                  <div className="weather-hk__day-label">
                    {forecastType === "hourly"
                      ? new Date(item.datetime)
                          .toLocaleTimeString("en-GB", { hour: "numeric", hour12: true })
                          .replace(" ", "")
                          .toUpperCase()
                      : formatForecastDay(item.datetime)}
                  </div>
                  <div className="weather-hk__day-icon">
                    <WeatherGlyph condition={item.condition} size="sm" />
                    <span
                      className={
                        hasPrecipitation(item)
                          ? "weather-hk__precip"
                          : "weather-hk__precip weather-hk__precip--empty"
                      }
                    />
                  </div>
                  <div className="weather-hk__day-temp">
                    {Math.round(item.temperature)}°
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div className="weather-hk opacity-0" />
      )}
    </Skeleton>
  );
};

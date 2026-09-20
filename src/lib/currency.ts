// Moneda global de la tienda. El administrador la elige desde
// /admin/dashboard/content (pestaña "Moneda") y se guarda en
// settings/siteContent.currency.
//
// Ojo: la moneda sólo cambia CÓMO se muestra el precio, no lo convierte.
// El número guardado en cada producto se muestra tal cual con el símbolo
// elegido; no hay tasa de cambio en ninguna parte.

export type CurrencyCode = 'USD' | 'EUR';

export interface CurrencyDef {
  code: CurrencyCode;
  /** Símbolo que se antepone al importe. */
  symbol: string;
  /** Nombre para el selector del panel. */
  label: string;
  /** Nombre en minúsculas para frases dentro del sitio. */
  name: string;
  /** Locale usado para separadores de miles y decimales. */
  locale: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyDef> = {
  USD: {
    code: 'USD',
    symbol: '$',
    label: 'Dólar estadounidense (USD)',
    name: 'dólares',
    locale: 'es-VE',
  },
  EUR: {
    code: 'EUR',
    symbol: '€',
    label: 'Euro (EUR)',
    name: 'euros',
    locale: 'es-ES',
  },
};

export const DEFAULT_CURRENCY: CurrencyCode = 'USD';

/** Lista para poblar el selector del panel. */
export const CURRENCY_OPTIONS = Object.values(CURRENCIES);

/**
 * Devuelve la definición de una moneda. Cae en la moneda por defecto si el
 * valor es `undefined` (contenido guardado antes de existir este ajuste) o si
 * es un código desconocido.
 */
export function resolveCurrency(code?: string | null): CurrencyDef {
  if (code && code in CURRENCIES) {
    return CURRENCIES[code as CurrencyCode];
  }
  return CURRENCIES[DEFAULT_CURRENCY];
}

/** Formatea un importe con el símbolo y los separadores de la moneda dada. */
export function formatPrice(amount: number, code?: string | null): string {
  const currency = resolveCurrency(code);
  const value = amount.toLocaleString(currency.locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return `${currency.symbol}${value}`;
}

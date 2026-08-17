import { NextRequest, NextResponse } from 'next/server';

// ============================================================================
// SHIPPING RATE API
// ============================================================================
// Origin: Bandung (default)
//
// CURRENT: Uses mock/placeholder rates based on city keywords.
//
// TO CONNECT TO REAL API (RajaOngkir / Biteship):
// 1. Set the API key in .env.local:
//    RAJAONGKIR_API_KEY=your_api_key_here
// 2. Uncomment the fetchRajaOngkir() function below and
//    replace the mock call in POST handler.
// ============================================================================

const ORIGIN_CITY = 'Bandung';
const ORIGIN_ID = 23; // RajaOngkir city ID for Bandung

// Mock shipping rates by destination region (in Rupiah, full amount)
// These are realistic estimates for 1kg package from Bandung
const MOCK_RATES: Record<string, { regular: number; express: number; sameday: number }> = {
  // Jabodetabek
  'jakarta':     { regular: 12000, express: 20000, sameday: 45000 },
  'jakarta pusat': { regular: 12000, express: 20000, sameday: 45000 },
  'jakarta selatan': { regular: 12000, express: 20000, sameday: 45000 },
  'jakarta barat': { regular: 12000, express: 20000, sameday: 45000 },
  'jakarta timur': { regular: 13000, express: 22000, sameday: 45000 },
  'jakarta utara': { regular: 13000, express: 22000, sameday: 45000 },
  'bogor':       { regular: 12000, express: 18000, sameday: 40000 },
  'depok':       { regular: 12000, express: 18000, sameday: 40000 },
  'tangerang':   { regular: 13000, express: 20000, sameday: 42000 },
  'tangerang selatan': { regular: 13000, express: 20000, sameday: 42000 },
  'bekasi':      { regular: 13000, express: 20000, sameday: 42000 },

  // Jawa Barat (dekat Bandung)
  'bandung':     { regular: 8000,  express: 12000, sameday: 25000 },
  'cimahi':      { regular: 8000,  express: 12000, sameday: 25000 },
  'sumedang':    { regular: 10000, express: 15000, sameday: 30000 },
  'garut':       { regular: 12000, express: 18000, sameday: 35000 },
  'cirebon':     { regular: 15000, express: 22000, sameday: 45000 },
  'tasikmalaya': { regular: 14000, express: 20000, sameday: 40000 },
  'sukabumi':    { regular: 13000, express: 18000, sameday: 35000 },

  // Jawa Tengah
  'semarang':    { regular: 25000, express: 38000, sameday: 0 },
  'surabaya':    { regular: 35000, express: 55000, sameday: 0 },
  'solo':        { regular: 28000, express: 42000, sameday: 0 },
  'yogyakarta':  { regular: 28000, express: 42000, sameday: 0 },
  'magelang':    { regular: 30000, express: 45000, sameday: 0 },

  // Jawa Timur
  'malang':      { regular: 38000, express: 58000, sameday: 0 },
  'sidoarjo':    { regular: 35000, express: 55000, sameday: 0 },

  // Bali & Nusa Tenggara
  'denpasar':    { regular: 55000, express: 85000, sameday: 0 },
  'bali':        { regular: 55000, express: 85000, sameday: 0 },
  'mataram':     { regular: 65000, express: 95000, sameday: 0 },

  // Sumatera
  'medan':       { regular: 45000, express: 70000, sameday: 0 },
  'palembang':   { regular: 40000, express: 62000, sameday: 0 },
  'lampung':     { regular: 35000, express: 55000, sameday: 0 },
  'padang':      { regular: 42000, express: 65000, sameday: 0 },
  'pekanbaru':   { regular: 43000, express: 67000, sameday: 0 },

  // Kalimantan
  'banjarmasin': { regular: 55000, express: 85000, sameday: 0 },
  'balikpapan':  { regular: 60000, express: 90000, sameday: 0 },
  'pontianak':   { regular: 55000, express: 85000, sameday: 0 },
  'samarinda':   { regular: 62000, express: 95000, sameday: 0 },

  // Sulawesi
  'makassar':    { regular: 65000, express: 100000, sameday: 0 },
  'manado':      { regular: 75000, express: 115000, sameday: 0 },

  // Papua & Maluku
  'jayapura':    { regular: 120000, express: 180000, sameday: 0 },
  'ambon':       { regular: 100000, express: 150000, sameday: 0 },
};

// Default rates for unmatched cities
const DEFAULT_RATES = { regular: 20000, express: 32000, sameday: 0 };

/**
 * Match destination city to mock rates (case-insensitive, partial match).
 */
function getMockRates(destination: string): { regular: number; express: number; sameday: number } {
  const lower = destination.toLowerCase().trim();

  // Exact match
  if (MOCK_RATES[lower]) return MOCK_RATES[lower];

  // Partial match — check if destination contains a known city key
  for (const [key, rates] of Object.entries(MOCK_RATES)) {
    if (lower.includes(key) || key.includes(lower)) {
      return rates;
    }
  }

  return DEFAULT_RATES;
}

// ============================================================================
// RAJAONGKIR PLACEHOLDER
// ============================================================================
// Uncomment this function and set RAJAONGKIR_API_KEY in .env.local to use
// real shipping rates from RajaOngkir API.
//
// async function fetchRajaOngkir(
//   destinationCityId: number,
//   weight: number = 1000, // in grams
//   courier: string = 'jne'
// ): Promise<{ service: string; cost: number; eta: string }[]> {
//   const apiKey = process.env.RAJAONGKIR_API_KEY;
//   if (!apiKey) throw new Error('RAJAONGKIR_API_KEY not set');
//
//   const res = await fetch('https://pro.rajaongkir.com/api/cost', {
//     method: 'POST',
//     headers: {
//       'Content-Type': 'application/x-www-form-urlencoded',
//       'key': apiKey,
//     },
//     body: new URLSearchParams({
//       origin: String(ORIGIN_ID),
//       originType: 'city',
//       destination: String(destinationCityId),
//       destinationType: 'city',
//       weight: String(weight),
//       courier,
//     }),
//   });
//
//   const json = await res.json();
//   if (json.rajaongkir?.status?.code !== 200) {
//     throw new Error(json.rajaongkir?.status?.description || 'RajaOngkir API error');
//   }
//
//   return json.rajaongkir.results[0].costs.map((c: any) => ({
//     service: c.service.toLowerCase().replace(/\s+/g, '-'),
//     cost: c.cost[0].value,
//     eta: c.cost[0].etd,
//   }));
// }
//
// // Biteship alternative (uncomment to use):
// // async function fetchBiteship(destination: string, postalCode: string) {
// //   const apiKey = process.env.BITESHIP_API_KEY;
// //   if (!apiKey) throw new Error('BITESHIP_API_KEY not set');
// //   const res = await fetch('https://api.biteship.com/v1/rates/couriers', {
// //     method: 'POST',
// //     headers: { 'Authorization': apiKey, 'Content-Type': 'application/json' },
// //     body: JSON.stringify({
// //       origin_postal_code: '40115', // Bandung postal code
// //       destination_postal_code: postalCode,
// //       destination_latitude: 0,
// //       destination_longitude: 0,
// //       couriers: 'jne',
// //       items: [{ weight: 1000, length: 20, width: 15, height: 2 }],
// //     }),
// //   });
// //   const json = await res.json();
// //   return json.pricing;
// // }
// ============================================================================

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { destination, postalCode } = body;

    if (!destination || typeof destination !== 'string' || destination.trim().length < 2) {
      return NextResponse.json(
        { success: false, error: 'Destination city is required' },
        { status: 400 }
      );
    }

    // ========================================================================
    // TO USE REAL API: replace the mock block below with:
    //   const rates = await fetchRajaOngkir(destinationCityId);
    // ========================================================================

    // Get mock rates based on destination city
    const rates = getMockRates(destination);

    const response = {
      success: true,
      origin: ORIGIN_CITY,
      destination: destination.trim(),
      postalCode: postalCode || null,
      rates: [
        {
          service: 'jne-regular',
          courier: 'JNE',
          service_name: 'Regular',
          cost: rates.regular,
          eta: '3-5',
        },
        {
          service: 'jne-express',
          courier: 'JNE',
          service_name: 'Express',
          cost: rates.express,
          eta: '1-2',
        },
        {
          service: 'jne-sameday',
          courier: 'JNE',
          service_name: 'Same Day',
          cost: rates.sameday,
          eta: '0',
          // sameday: 0 means unavailable for this destination
          // The frontend will hide this option or show "Tidak tersedia"
        },
      ],
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Shipping rate error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to calculate shipping rates' },
      { status: 500 }
    );
  }
}

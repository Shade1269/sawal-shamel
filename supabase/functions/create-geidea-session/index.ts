import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GeideaSessionRequest {
  amount: number;
  currency: string;
  orderId: string;
  customerEmail?: string;
  customerName?: string;
  customerPhone?: string;
  callbackUrl: string;
  webhookUrl?: string;
  merchantReferenceId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const MERCHANT_PUBLIC_KEY = Deno.env.get('GEIDEA_MERCHANT_PUBLIC_KEY');
    const API_PASSWORD = Deno.env.get('GEIDEA_API_PASSWORD');

    if (!MERCHANT_PUBLIC_KEY || !API_PASSWORD) {
      throw new Error('Geidea credentials not configured');
    }

    const requestData: GeideaSessionRequest = await req.json();

    console.log('Creating Geidea session for order:', requestData.orderId);

    // Generate timestamp
    const timestamp = new Date().toISOString();

    // Generate signature using HMAC-SHA256
    const amountStr = requestData.amount.toFixed(2);
    const signatureString = `${MERCHANT_PUBLIC_KEY}${amountStr}${requestData.currency}${requestData.merchantReferenceId}${timestamp}`;
    
    const encoder = new TextEncoder();
    const keyData = encoder.encode(API_PASSWORD);
    const messageData = encoder.encode(signatureString);
    
    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    
    const signatureBuffer = await crypto.subtle.sign('HMAC', cryptoKey, messageData);
    const signatureArray = Array.from(new Uint8Array(signatureBuffer));
    const signature = btoa(String.fromCharCode(...signatureArray));

    // Create Basic Authentication header
    const authString = `${MERCHANT_PUBLIC_KEY}:${API_PASSWORD}`;
    const encodedAuth = btoa(authString);

    // Prepare Geidea API payload with Apple Pay enabled
    const geideaPayload = {
      amount: requestData.amount,
      currency: requestData.currency,
      merchantReferenceId: requestData.merchantReferenceId,
      timestamp: timestamp,
      signature: signature,
      callbackUrl: requestData.callbackUrl,
      billingAddress: {
        countryCode: 'SAU',
      },
      customerEmail: requestData.customerEmail || '',
      paymentOperation: 'Pay',
      initiatedBy: 'Internet',
      paymentMethods: ['Card', 'ApplePay'],
      ...(requestData.customerName && { cardOnFile: requestData.customerName }),
    };

    console.log('Calling Geidea API...');

    // Call Geidea API (Egypt Production - test keys work here with test cards)
    const geideaResponse = await fetch('https://api.merchant.geidea.net/payment-intent/api/v2/direct/session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'Authorization': `Basic ${encodedAuth}`,
      },
      body: JSON.stringify(geideaPayload),
    });

    const geideaData = await geideaResponse.json();

    console.log('Geidea API response status:', geideaResponse.status);

    if (!geideaResponse.ok) {
      console.error('Geidea API error:', geideaData);
      throw new Error(geideaData.responseMessage || 'Failed to create payment session');
    }

    // Return session data to frontend
    return new Response(
      JSON.stringify({
        success: true,
        sessionId: geideaData.session?.id,
        sessionData: geideaData,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating Geidea session:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});

// API endpoint to save products to Firestore (called from edge functions)
import { addProductToUserStore } from '@/lib/firestore';

export async function POST(request: Request) {
  try {
    const { userId, productData } = await request.json();

    if (!userId || !productData) {
      return new Response(JSON.stringify({ 
        success: false, 
        error: 'Missing userId or productData' 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Save product to Firestore using our existing function
    const result = await addProductToUserStore(userId, productData);

    if (result.success) {
      return new Response(JSON.stringify({ 
        success: true,
        productId: result.productId 
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    } else {
      return new Response(JSON.stringify({ 
        success: false, 
        error: result.error 
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      });
    }

  } catch (error) {
    console.error('Error in save-product-to-firestore API:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
}
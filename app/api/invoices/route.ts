import { NextRequest, NextResponse } from 'next/server'
import { initializeApp, getApps, cert } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { getAuth } from 'firebase-admin/auth'

// Initialize Firebase Admin if not already initialized
if (!getApps().length) {
  const serviceAccount = JSON.parse(
    process.env.FIREBASE_SERVICE_ACCOUNT_KEY || '{}'
  )

  initializeApp({
    credential: cert(serviceAccount)
  })
}

const db = getFirestore()

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract the token
    const idToken = authHeader.split('Bearer ')[1]
    
    // Verify the token
    let decodedToken
    try {
      decodedToken = await getAuth().verifyIdToken(idToken)
    } catch (error) {
      console.error('Error verifying token:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get the user ID from the decoded token
    const uid = decodedToken.uid

    // Parse the request body
    const body = await request.json()
    
    // Add the invoice to Firestore
    const invoicesCollection = db.collection('invoices')
    const result = await invoicesCollection.add({
      ...body,
      createdBy: uid, // Ensure the uid matches the token
      createdAt: new Date().toISOString()
    })

    return NextResponse.json({ 
      success: true, 
      message: 'Invoice saved successfully',
      id: result.id 
    }, { status: 201 })

  } catch (error) {
    console.error('Error processing invoice:', error)
    return NextResponse.json({ 
      error: 'Error processing invoice' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Extract the token
    const idToken = authHeader.split('Bearer ')[1]
    
    // Verify the token
    let decodedToken
    try {
      decodedToken = await getAuth().verifyIdToken(idToken)
    } catch (error) {
      console.error('Error verifying token:', error)
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    // Get the user ID from the decoded token
    const uid = decodedToken.uid

    // Get all invoices for this user
    const invoicesCollection = db.collection('invoices')
    const snapshot = await invoicesCollection
      .where('createdBy', '==', uid)
      .orderBy('createdAt', 'desc')
      .get()

    const invoices = snapshot.docs.map((doc: FirebaseFirestore.QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }))

    return NextResponse.json(invoices)

  } catch (error) {
    console.error('Error fetching invoices:', error)
    return NextResponse.json({ 
      error: 'Error fetching invoices' 
    }, { status: 500 })
  }
}

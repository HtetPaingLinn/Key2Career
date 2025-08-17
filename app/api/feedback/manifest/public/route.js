import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME; // optional explicit DB name

async function getDb() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = dbName ? client.db(dbName) : client.db();
  return { client, db };
}

export async function GET(request) {
  if (!uri) {
    return NextResponse.json({ success: false, error: 'MONGO_URI not configured' }, { status: 500 });
  }

  let client;
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    if (!code) {
      return NextResponse.json({ success: false, error: 'code is required' }, { status: 400 });
    }

    const { client: c, db } = await getDb();
    client = c;

    const manifestsCol = db.collection('manifests');

    const manifestDoc = await manifestsCol.findOne({ publicId: code });
    if (!manifestDoc) {
      return NextResponse.json({ success: false, error: 'Manifest not found' }, { status: 404 });
    }

    const { manifest, manifestHash, version, registeredOnChain, txHash, updatedAt, createdAt, userId } = manifestDoc;
    const recordCount = Array.isArray(manifest?.records) ? manifest.records.length : 0;
    try { console.log('[manifest/public] code=%s count=%d', code, recordCount); } catch {}

    return NextResponse.json({
      success: true,
      publicId: code,
      userId,
      version,
      manifest,
      manifestHash,
      registeredOnChain: !!registeredOnChain,
      txHash: txHash || null,
      updatedAt,
      createdAt,
      recordCount,
    });
  } catch (err) {
    console.error('Error fetching public manifest:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    if (client) await client.close();
  }
}

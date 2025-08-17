import { NextResponse } from 'next/server';
import { MongoClient, ObjectId } from 'mongodb';
import { computeHashForObject, redactRecord, sortKeysDeep } from '@/lib/hashUtils';

const uri = process.env.MONGO_URI;
const dbName = process.env.MONGO_DB_NAME; // optional explicit DB name

async function getDb() {
  const client = new MongoClient(uri);
  await client.connect();
  const db = dbName ? client.db(dbName) : client.db();
  return { client, db };
}

function buildRecordFromFeedback(doc) {
  // doc is a feedback document as per provided schema
  const type = doc.sessionType === 'actual' ? 'actual' : 'session';
  const base = {
    type,
    recordId: (doc.sessionId && doc.sessionId.toString && doc.sessionId.toString()) || doc.sessionId || (doc._id?.toString?.() || doc._id),
    role: doc.role,
    experience: doc.experience,
    topicsToFocus: doc.topicsToFocus,
    submissionTime: doc.submissionTime ?? null,
  };

  const rawFeedback = {
    summary: doc.summary,
    percentageScore: doc.percentageScore,
    skillsBreakdown: doc.skillsBreakdown,
    strengths: doc.strengths,
    areasForImprovement: doc.areasForImprovement,
    performanceMetrics: doc.performanceMetrics,
    totalQuestions: doc.totalQuestions,
    answeredQuestions: doc.answeredQuestions,
    correctAnswers: doc.correctAnswers,
  };
  const redactedFeedback = redactRecord(rawFeedback);

  const record = {
    ...base,
    feedback: {
      summary: redactedFeedback.summary || '',
      percentageScore: redactedFeedback.percentageScore ?? null,
      skillsBreakdown: redactedFeedback.skillsBreakdown || [],
      strengths: redactedFeedback.strengths || [],
      areasForImprovement: redactedFeedback.areasForImprovement || [],
      performanceMetrics: redactedFeedback.performanceMetrics || {},
    },
  };

  const { hash } = computeHashForObject(record);
  return { ...record, hash };
}

export async function POST(request) {
  if (!uri) {
    return NextResponse.json({ success: false, error: 'MONGO_URI not configured' }, { status: 500 });
  }

  let client;
  try {
    const { userId, email } = await request.json();
    if (!userId && !email) {
      return NextResponse.json({ success: false, error: 'userId or email is required' }, { status: 400 });
    }

    const { client: c, db } = await getDb();
    client = c;

    // Collections names as created by Mongoose defaults
    const sessionsCol = db.collection('sessions');
    const actualsCol = db.collection('actuals');
    const manifestsCol = db.collection('manifests');
    const usersCol = db.collection('users');

    // Resolve user by either valid ObjectId, email lookup, or fallback to string userId
    let userQueryValue = null; // can be ObjectId or string
    let userKeyForManifest = null; // string key used for manifests
    if (userId && ObjectId.isValid(userId)) {
      userQueryValue = new ObjectId(userId);
      userKeyForManifest = userId;
    } else if (email) {
      const userDoc = await usersCol.findOne({ email });
      if (!userDoc?._id) {
        return NextResponse.json({ success: false, error: 'User not found by email' }, { status: 404 });
      }
      userQueryValue = userDoc._id;
      userKeyForManifest = userDoc._id.toString();
    } else if (userId) {
      // Fallback: treat provided userId as string identifier stored in session/actual docs
      userQueryValue = String(userId);
      userKeyForManifest = String(userId);
    } else {
      return NextResponse.json({ success: false, error: 'Provide userId or email' }, { status: 400 });
    }

    // Pull feedback documents for both session types with robust matching
    // Try Mongoose pluralized name first: 'feedbacks'
    let usedCollection = 'feedbacks';
    let feedbackCol = db.collection('feedbacks');
    const queryBase = { sessionType: { $in: ['session', 'actual'] } };
    let feedbackDocs = await feedbackCol
      .find({ user: userQueryValue, ...queryBase })
      .sort({ createdAt: -1 })
      .toArray();

    // If none found, try alternate user key representation (string vs ObjectId)
    let altUserKey = null;
    if (userQueryValue && typeof userQueryValue === 'object' && userQueryValue.toString) {
      altUserKey = userQueryValue.toString();
    } else if (typeof userQueryValue === 'string' && ObjectId.isValid(userQueryValue)) {
      altUserKey = new ObjectId(userQueryValue);
    }
    let debugCounts = { primaryWithType: feedbackDocs.length, altWithType: 0, primaryNoType: 0, altNoType: 0, collection: usedCollection };
    if (feedbackDocs.length === 0 && altUserKey) {
      const altDocs = await feedbackCol
        .find({ user: altUserKey, ...queryBase })
        .sort({ createdAt: -1 })
        .toArray();
      debugCounts.altWithType = altDocs.length;
      if (altDocs.length > 0) {
        feedbackDocs = altDocs;
      }
    }

    // If still none, drop sessionType filter and try again
    if (feedbackDocs.length === 0) {
      const primNoType = await feedbackCol
        .find({ user: userQueryValue })
        .sort({ createdAt: -1 })
        .toArray();
      debugCounts.primaryNoType = primNoType.length;
      if (primNoType.length > 0) feedbackDocs = primNoType;

      if (feedbackDocs.length === 0 && altUserKey) {
        const altNoType = await feedbackCol
          .find({ user: altUserKey })
          .sort({ createdAt: -1 })
          .toArray();
        debugCounts.altNoType = altNoType.length;
        if (altNoType.length > 0) feedbackDocs = altNoType;
      }
    }

    // If still none, fallback to singular collection name 'feedback'
    if (feedbackDocs.length === 0) {
      usedCollection = 'feedback';
      feedbackCol = db.collection('feedback');
      const fb1 = await feedbackCol
        .find({ user: userQueryValue, ...queryBase })
        .sort({ createdAt: -1 })
        .toArray();
      if (fb1.length > 0) {
        feedbackDocs = fb1;
        debugCounts.collection = usedCollection;
      } else if (altUserKey) {
        const fb2 = await feedbackCol
          .find({ user: altUserKey, ...queryBase })
          .sort({ createdAt: -1 })
          .toArray();
        if (fb2.length > 0) {
          feedbackDocs = fb2;
          debugCounts.collection = usedCollection;
        } else {
          const fb3 = await feedbackCol.find({ user: userQueryValue }).sort({ createdAt: -1 }).toArray();
          if (fb3.length > 0) {
            feedbackDocs = fb3;
            debugCounts.collection = usedCollection;
          } else if (altUserKey) {
            const fb4 = await feedbackCol.find({ user: altUserKey }).sort({ createdAt: -1 }).toArray();
            if (fb4.length > 0) {
              feedbackDocs = fb4;
              debugCounts.collection = usedCollection;
            }
          }
        }
      }
    }

    // Build manifest records from feedback docs
    const records = feedbackDocs.map((doc) => buildRecordFromFeedback(doc));

    // Stable sort records by (type, recordId) to keep manifest stable
    records.sort((r1, r2) => {
      if (r1.type !== r2.type) return r1.type < r2.type ? -1 : 1;
      return r1.recordId < r2.recordId ? -1 : r1.recordId > r2.recordId ? 1 : 0;
    });

    const manifest = {
      userId: userKeyForManifest,
      generatedAt: new Date().toISOString(),
      records,
    };

    // Compute manifest hash using canonicalized object
    const { hash: manifestHash } = computeHashForObject(manifest);

    // Find existing manifest doc for user; maintain a stable publicId and increment version
    const existing = await manifestsCol.findOne({ userId: userKeyForManifest });
    let publicId = existing?.publicId;
    let version = existing?.version ?? 0;

    if (!publicId) {
      // Create a random short publicId (base36) for sharing
      publicId = Math.random().toString(36).slice(2, 10);
    }
    version += 1;

    const manifestDoc = {
      userId: userKeyForManifest,
      publicId,
      version,
      manifest: sortKeysDeep(manifest), // store sorted for consistency
      manifestHash,
      registeredOnChain: existing?.registeredOnChain ?? false,
      txHash: existing?.txHash ?? null,
      updatedAt: new Date(),
      createdAt: existing?.createdAt ?? new Date(),
    };

    await manifestsCol.updateOne(
      { userId: userKeyForManifest },
      { $set: manifestDoc },
      { upsert: true }
    );

    const sessionCount = records.filter(r => r.type === 'session').length;
    const actualCount = records.filter(r => r.type === 'actual').length;
    return NextResponse.json({
      success: true,
      publicId,
      manifestHash,
      version,
      counts: { sessions: sessionCount, actuals: actualCount, total: records.length },
      debugCounts,
    });
  } catch (err) {
    console.error('Error generating manifest:', err);
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  } finally {
    if (client) await client.close();
  }
}

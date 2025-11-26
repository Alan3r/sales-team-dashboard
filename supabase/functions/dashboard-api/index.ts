import { MongoClient } from "https://deno.land/x/mongo@v0.32.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface Member {
  id: string;
  type: 'member';
  name: string;
  role: string;
  leader_id: string;
}

interface WeekData {
  id: string;
  type: 'week_data';
  name: string;
  role: string;
  leader_id: string;
  week_start: string;
  week_number: number;
  year: number;
  goal: number;
  monday: number;
  tuesday: number;
  wednesday: number;
  thursday: number;
  friday: number;
  saturday: number;
  rq_monday: string;
  rq_tuesday: string;
  rq_wednesday: string;
  rq_thursday: string;
  rq_friday: string;
  rq_notes: string;
}

interface StructureChange {
  id: string;
  type: 'structure_change';
  action: string;
  details: string;
  timestamp: string;
}

let client: MongoClient | null = null;

async function getMongoClient() {
  if (client) return client;
  
  const mongoUri = Deno.env.get('MONGODB_URI');
  if (!mongoUri) {
    throw new Error('MONGODB_URI not configured');
  }

  client = new MongoClient();
  await client.connect(mongoUri);
  return client;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const client = await getMongoClient();
    const db = client.database('dashboard');
    const membersCollection = db.collection<Member>('members');
    const weeksCollection = db.collection<WeekData>('weeks');
    const changesCollection = db.collection<StructureChange>('changes');

    const url = new URL(req.url);
    const pathParts = url.pathname.split('/').filter(p => p);
    const method = req.method;

    console.log('Request:', method, url.pathname);

    // MEMBERS endpoints
    if (pathParts[pathParts.length - 1] === 'members' && method === 'GET') {
      const members = await membersCollection.find().toArray();
      return new Response(JSON.stringify(members), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (pathParts[pathParts.length - 1] === 'members' && method === 'POST') {
      const member: Member = await req.json();
      await membersCollection.insertOne(member);
      return new Response(JSON.stringify({ success: true, member }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (pathParts[pathParts.length - 2] === 'members' && method === 'PUT') {
      const id = pathParts[pathParts.length - 1];
      const updates = await req.json();
      await membersCollection.updateOne(
        { id },
        { $set: updates }
      );
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (pathParts[pathParts.length - 2] === 'members' && method === 'DELETE') {
      const id = pathParts[pathParts.length - 1];
      await membersCollection.deleteOne({ id });
      await weeksCollection.deleteMany({ id });
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // WEEKS endpoints
    if (pathParts[pathParts.length - 1] === 'weeks' && method === 'GET') {
      const weeks = await weeksCollection.find().toArray();
      return new Response(JSON.stringify(weeks), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (pathParts[pathParts.length - 1] === 'weeks' && method === 'POST') {
      const body = await req.json();
      
      // Handle batch insert
      if (Array.isArray(body)) {
        await weeksCollection.insertMany(body);
        return new Response(JSON.stringify({ success: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      
      // Handle single insert
      const weekData: WeekData = body;
      await weeksCollection.insertOne(weekData);
      return new Response(JSON.stringify({ success: true, weekData }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (pathParts[pathParts.length - 3] === 'weeks' && method === 'PUT') {
      const id = pathParts[pathParts.length - 2];
      const weekStart = pathParts[pathParts.length - 1];
      const updates = await req.json();
      await weeksCollection.updateOne(
        { id, week_start: weekStart },
        { $set: updates }
      );
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CHANGES endpoints
    if (pathParts[pathParts.length - 1] === 'changes' && method === 'GET') {
      const changes = await changesCollection.find().sort({ timestamp: -1 }).toArray();
      return new Response(JSON.stringify(changes), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (pathParts[pathParts.length - 1] === 'changes' && method === 'POST') {
      const change: StructureChange = await req.json();
      await changesCollection.insertOne(change);
      return new Response(JSON.stringify({ success: true, change }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // CLEAR ALL endpoint
    if (pathParts[pathParts.length - 1] === 'clear-all' && method === 'POST') {
      await membersCollection.deleteMany({});
      await weeksCollection.deleteMany({});
      await changesCollection.deleteMany({});
      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Not found' }), {
      status: 404,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
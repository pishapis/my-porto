// api/comments/index.js
import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  try {
    if (req.method === 'GET') {
      // Get all comments
      const commentIds = await kv.lrange('comment_ids', 0, -1);
      const comments = [];

      for (const id of commentIds) {
        const comment = await kv.hgetall(`comment:${id}`);
        if (comment) {
          comments.push({ id, ...comment });
        }
      }

      // Sort by timestamp (newest first)
      comments.sort((a, b) => b.timestamp - a.timestamp);

      return res.status(200).json({ success: true, comments });
    }

    if (req.method === 'POST') {
      // Create new comment
      const { name, email, message } = req.body;

      if (!name || !message) {
        return res.status(400).json({ 
          success: false, 
          error: 'Name and message are required' 
        });
      }

      const commentId = Date.now().toString();
      const timestamp = Date.now();

      await kv.hset(`comment:${commentId}`, {
        name,
        email: email || '',
        message,
        timestamp,
      });

      await kv.lpush('comment_ids', commentId);

      return res.status(201).json({ 
        success: true, 
        message: 'Comment added successfully',
        commentId 
      });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (error) {
    console.error('Error:', error);
    return res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
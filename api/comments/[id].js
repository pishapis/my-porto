// api/comments/[id].js
import { createClient } from '@vercel/kv';

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const kv = createClient({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  });

  const { id } = req.query;

  try {
    if (req.method === 'GET') {
      // Get single comment
      const comment = await kv.hgetall(`comment:${id}`);
      
      if (!comment || Object.keys(comment).length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Comment not found' 
        });
      }

      return res.status(200).json({ success: true, comment: { id, ...comment } });
    }

    if (req.method === 'PUT') {
      // Update comment
      const { name, email, message } = req.body;

      const existingComment = await kv.hgetall(`comment:${id}`);
      
      if (!existingComment || Object.keys(existingComment).length === 0) {
        return res.status(404).json({ 
          success: false, 
          error: 'Comment not found' 
        });
      }

      await kv.hset(`comment:${id}`, {
        name: name || existingComment.name,
        email: email || existingComment.email,
        message: message || existingComment.message,
        timestamp: existingComment.timestamp,
        updatedAt: Date.now(),
      });

      return res.status(200).json({ 
        success: true, 
        message: 'Comment updated successfully' 
      });
    }

    if (req.method === 'DELETE') {
      // Delete comment
      const exists = await kv.exists(`comment:${id}`);
      
      if (!exists) {
        return res.status(404).json({ 
          success: false, 
          error: 'Comment not found' 
        });
      }

      await kv.del(`comment:${id}`);
      await kv.lrem('comment_ids', 0, id);

      return res.status(200).json({ 
        success: true, 
        message: 'Comment deleted successfully' 
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
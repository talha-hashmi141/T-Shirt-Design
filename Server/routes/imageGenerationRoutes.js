const express = require('express');
const router = express.Router();
const OpenAI = require('openai');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

router.post('/generate-image', async (req, res) => {
  try {
    const { prompt } = req.body;
    
    const response = await openai.images.generate({
      model: "dall-e-2",
      prompt,
      n: 1,
      size: "512x512",
    });

    const imageUrl = response.data[0].url;
    
    res.json({ imageUrl });
  } catch (error) {
    console.error('Error generating image:', error);
    res.status(500).json({ error: 'Failed to generate image' });
  }
});

module.exports = router; 
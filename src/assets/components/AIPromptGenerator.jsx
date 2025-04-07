import React, { useState } from 'react';

const AIPromptGenerator = ({ onGenerate, placeholder, label }) => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [savedImages, setSavedImages] = useState([]);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    
    setLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      
      if (data.imageUrl) {
        // Add new image to saved images
        setSavedImages(prev => [...prev, {
          id: Date.now(),
          url: data.imageUrl,
          prompt: prompt
        }]);
        
        // Call the parent handler with the generated image URL
        onGenerate(data.imageUrl);
      }
    } catch (error) {
      console.error('Error generating image:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mb-4">
      <h4 className="text-md font-semibold mb-2">{label}</h4>
      <div className="flex gap-2 mb-3">
        <input
          type="text"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder={placeholder}
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleGenerate}
          disabled={loading || !prompt.trim()}
          className={`px-4 py-2 text-sm font-medium text-white rounded ${
            loading || !prompt.trim() 
              ? 'bg-gray-400' 
              : 'bg-black hover:bg-gray-800'
          }`}
        >
          {loading ? 'Generating...' : 'Generate'}
        </button>
      </div>

      {/* Saved Images Gallery */}
      {savedImages.length > 0 && (
        <div className="mt-4">
          <h5 className="text-sm font-semibold mb-2">Saved Generations</h5>
          <div className="grid grid-cols-3 gap-2">
            {savedImages.map(image => (
              <div 
                key={image.id}
                className="relative group cursor-pointer"
                onClick={() => onGenerate(image.url)}
              >
                <img 
                  src={image.url} 
                  alt={image.prompt}
                  className="w-full h-20 object-cover rounded"
                />
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity rounded flex items-center justify-center">
                  <span className="text-white text-xs p-1 text-center">
                    {image.prompt}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIPromptGenerator; 
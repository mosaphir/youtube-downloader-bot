const TELEGRAM_API_KEY = 'your_telegram_bot_api_key';
const YOUTUBE_API_KEY = 'your_youtube_data_api_key';

async function handleRequest(request) {
  if (request.method === 'POST') {
    const update = await request.json();
    
    if (update.message && update.message.text) {
      const chatId = update.message.chat.id;
      const query = update.message.text;

      // Fetch YouTube search results
      const videos = await searchYouTube(query);

      // Format and send response to Telegram
      const message = videos.map(video => `${video.title}: ${video.url}`).join('\n');
      await sendMessageToTelegram(chatId, message);

      return new Response('OK', { status: 200 });
    }
  }

  return new Response('Invalid request', { status: 400 });
}

// Search YouTube videos based on user query
async function searchYouTube(query) {
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=5&q=${encodeURIComponent(query)}&key=${YOUTUBE_API_KEY}`;
  
  const response = await fetch(url);
  const data = await response.json();

  const videos = data.items.map(item => {
    return {
      title: item.snippet.title,
      url: `https://www.youtube.com/watch?v=${item.id.videoId}`
    };
  });

  return videos;
}

// Send message to Telegram
async function sendMessageToTelegram(chatId, message) {
  const url = `https://api.telegram.org/bot${TELEGRAM_API_KEY}/sendMessage`;
  
  const payload = {
    chat_id: chatId,
    text: message
  };

  await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });
}

addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

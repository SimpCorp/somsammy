// functions/api/lessons.js
export async function onRequestGet(context) {
  const privateKey = context.env.IMAGEKIT_PRIVATE_KEY;

  if (!privateKey) {
    return new Response(JSON.stringify({ error: "Missing API key" }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }

  const authHeader = "Basic " + btoa(privateKey + ":");

  try {
    // List files inside the dedicated directory
    const response = await fetch(
      "https://api.imagekit.io/v1/files?path=/midnight-hour-lessons&sort=DESC_CREATED",
      {
        headers: {
          Authorization: authHeader
        }
      }
    );

    const files = await response.json();

    // Map into clean cards for the photo deck
    const deck = (files || []).map(file => {
      // Tags format: ["uploader:Som (18-25)", "note:Base64OrText"]
      let uploader = "Unknown";
      let note = "";

      if (Array.isArray(file.tags)) {
        file.tags.forEach(tag => {
          if (tag.startsWith("uploader:")) {
            uploader = tag.replace("uploader:", "");
          } else if (tag.startsWith("note:")) {
            try {
              note = decodeURIComponent(escape(atob(tag.replace("note:", ""))));
            } catch {
              note = tag.replace("note:", "");
            }
          }
        });
      }

      return {
        fileId: file.fileId,
        url: file.url,
        thumbnailUrl: file.thumbnailUrl || `${file.url}?tr=w-600,q-85,f-auto`,
        uploader: uploader,
        note: note,
        createdAt: file.createdAt
      };
    });

    return new Response(JSON.stringify({ deck }), {
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Cache-Control": "public, max-age=15"
      }
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" }
    });
  }
}

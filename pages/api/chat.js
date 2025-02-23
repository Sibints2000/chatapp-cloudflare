export default async function handler(req, res) {
  if (!req.body || req.method !== "POST") return res.status(405).end();

  const chatServer = process.env.CLOUDFLARE_WORKER_URL;
  const response = await fetch(chatServer, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(req.body),
  });

  const data = await response.json();
  res.status(200).json(data);
}

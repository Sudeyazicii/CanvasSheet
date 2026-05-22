import OpenAI from 'openai';

const apiKey = process.env.VITE_OPENAI_API_KEY?.trim();
const model = process.env.VITE_OPENAI_MODEL?.trim() || 'gpt-4o-mini';

if (!apiKey) {
  console.error('❌ VITE_OPENAI_API_KEY .env icinde bulunamadi');
  process.exit(1);
}

console.log(`OK API key yuklendi (uzunluk: ${apiKey.length}, prefix: ${apiKey.slice(0, 7)}...)`);
console.log(`OK Model: ${model}`);
console.log('\n-> OpenAI cagrisi yapiliyor...\n');

const client = new OpenAI({ apiKey });

const t0 = Date.now();
try {
  const response = await client.chat.completions.create({
    model,
    messages: [
      { role: 'system', content: 'Sen kisa ve ozlu cevap veren bir asistansin.' },
      { role: 'user', content: 'Tek cumleyle: 2 + 2 kac eder ve neden?' }
    ],
    temperature: 0.2,
    max_tokens: 80,
  });

  const elapsed = Date.now() - t0;
  const text = response.choices?.[0]?.message?.content;
  const usage = response.usage;

  console.log('=== BASARILI ===');
  console.log(`Model:    ${response.model}`);
  console.log(`Sure:     ${elapsed}ms`);
  console.log(`Tokens:   prompt=${usage?.prompt_tokens} completion=${usage?.completion_tokens} total=${usage?.total_tokens}`);
  console.log(`Yanit:    ${text}`);
} catch (err) {
  const elapsed = Date.now() - t0;
  console.error(`=== BASARISIZ (${elapsed}ms) ===`);
  console.error(`Hata tipi: ${err.constructor?.name}`);
  console.error(`Status:    ${err.status || 'n/a'}`);
  console.error(`Mesaj:     ${err.message}`);
  process.exit(1);
}

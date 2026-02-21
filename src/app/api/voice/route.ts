import { NextResponse } from 'next/server';
// 1. Import ข้อมูลดวงดาว
import solarSystemData from '@/data/solar_system.json'; 

export async function POST(req: Request) {
  try {
    const { transcript } = await req.json();

    if (!transcript) {
      return NextResponse.json({ error: 'No transcript' }, { status: 400 });
    }

    // -------------------------------------------------------
    // แก้ตรงนี้! เอา URL ของคุณมาใส่ตรงๆ เลย (อย่าลืมเครื่องหมายฟันหนู '...')
    const n8nUrl = 'https://ninenatathawut.app.n8n.cloud/webhook/it-shop-voice';
    // -------------------------------------------------------

    console.log('Sending to n8n:', n8nUrl); // เพิ่มบรรทัดนี้ไว้เช็คใน Terminal

    const response = await fetch(n8nUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        transcript: transcript,
        items: solarSystemData 
      }),
    });

    if (!response.ok) {
       // เพิ่มการเช็ค Error เพื่อดูว่า n8n ตอบกลับมาว่าอะไร
       const errorText = await response.text();
       console.error('n8n Error:', errorText);
       throw new Error(`n8n failed: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
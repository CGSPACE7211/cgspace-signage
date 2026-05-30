import { NextResponse } from 'next/server';

export const revalidate = 1; // 极速更新数据

export async function GET() {
  // 请输入你之前获取的 Notion Token 和新建的 v3 表格 ID
  const NOTION_TOKEN = "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"; 
  const DATABASE_ID = "37045961808280f1945adb22e99baa17";

  try {
    const response = await fetch(`https://api.notion.com/v1/databases/${DATABASE_ID}/query`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Notion-Version': '2022-06-28',
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) throw new Error('Notion Matrix Offline');
    const data = await response.json();

    const items = data.results.map(page => {
      const props = page.properties;
      return {
        id: page.id,
        name: props.Name?.title[0]?.plain_text || 'Unnamed',
        price: props.Price?.number || 0,
        category: props.Category?.select?.name || 'Others',
        active: props.Active?.checkbox || false,
        specialTag: props.Special_Tag?.text?.plain_text || '',
        // 关键一招：获取 Notion 里的高清图片链接
        imageUrl: props.Image?.files[0]?.file?.url || props.Image?.files[0]?.external?.url || null
      };
    }).filter(item => item.active); // 过滤掉没勾选 Active 的

    return NextResponse.json({ success: true, data: items });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

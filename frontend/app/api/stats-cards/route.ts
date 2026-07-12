import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getFallbackPath } from '@/lib/db-fallback';

const filePath = getFallbackPath('stats_cards.json');

const getLocalCards = (): any[] => {
  try {
    if (fs.existsSync(filePath)) {
      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (error) {
    console.error("Error reading stats cards:", error);
  }
  return [];
};

const saveLocalCards = (cards: any[]) => {
  try {
    const dataDir = path.dirname(filePath);
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    fs.writeFileSync(filePath, JSON.stringify(cards, null, 2), 'utf-8');
  } catch (error) {
    console.error("Error saving stats cards:", error);
  }
};

// GET all stats cards
export async function GET() {
  const cards = getLocalCards();
  return NextResponse.json(cards);
}

// POST add a new stats card
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, base_value, prefix, suffix, icon, category } = body;

    if (!title) {
      return NextResponse.json({ success: false, error: "Title is required" }, { status: 400 });
    }

    const cards = getLocalCards();
    const newCard = {
      id: Date.now(),
      title,
      base_value: parseFloat(base_value) || 0,
      prefix: prefix || "",
      suffix: suffix || "",
      icon: icon || "rupee",
      category: category || "none"
    };

    cards.push(newCard);
    saveLocalCards(cards);

    return NextResponse.json({ success: true, card: newCard });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// PUT modify an existing stats card
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, title, base_value, prefix, suffix, icon, category } = body;

    if (!id || !title) {
      return NextResponse.json({ success: false, error: "ID and Title are required" }, { status: 400 });
    }

    const cards = getLocalCards();
    const cardIndex = cards.findIndex(c => c.id === id);

    if (cardIndex === -1) {
      return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });
    }

    cards[cardIndex] = {
      ...cards[cardIndex],
      title,
      base_value: parseFloat(base_value) || 0,
      prefix: prefix || "",
      suffix: suffix || "",
      icon: icon || "rupee",
      category: category || "none"
    };

    saveLocalCards(cards);
    return NextResponse.json({ success: true, card: cards[cardIndex] });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

// DELETE a stats card
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const idStr = searchParams.get('id');

    if (!idStr) {
      return NextResponse.json({ success: false, error: "ID is missing" }, { status: 400 });
    }

    const id = parseInt(idStr, 10);
    const cards = getLocalCards();
    const updatedCards = cards.filter(c => c.id !== id);

    if (cards.length === updatedCards.length) {
      return NextResponse.json({ success: false, error: "Card not found" }, { status: 404 });
    }

    saveLocalCards(updatedCards);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

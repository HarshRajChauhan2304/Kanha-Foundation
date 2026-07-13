import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getFallbackPath } from '@/lib/db-fallback';
import { supabaseAdmin } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

const filePath = getFallbackPath('stats_cards.json');
const donationsFilePath = getFallbackPath('donations.json');

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
  try {
    let donations: any[] = [];
    let dbSuccess = false;

    // 1. Fetch from Supabase
    try {
      const { data, error } = await supabaseAdmin
        .from('donations')
        .select('*');

      if (!error && data) {
        donations = data;
        dbSuccess = true;
      }
    } catch (e) {
      console.warn("Failed to fetch donations from Supabase inside stats-cards route:", e);
    }

    // 2. Fallback to local donations.json if DB fails
    if (!dbSuccess) {
      try {
        if (fs.existsSync(donationsFilePath)) {
          const fileContent = fs.readFileSync(donationsFilePath, 'utf-8');
          donations = JSON.parse(fileContent) || [];
        }
      } catch (e) {
        console.error("Failed to read local donations fallback file inside stats-cards route:", e);
      }
    }

    // 3. Aggregate metrics
    let totalAmount = 0;
    let totalBirthday = 0;
    let totalMeals = 0;
    let totalLives = 0;
    let totalStudykit = 0;
    const donorSet = new Set<string>();

    if (Array.isArray(donations)) {
      donations.forEach(d => {
        // Only count successful donations
        if (d.payment_status && d.payment_status !== 'SUCCESS') return;

        // Parse amount
        const clean = d.amount ? d.amount.replace(/[^\d.]/g, '') : '0';
        const amt = parseFloat(clean) || 0;
        totalAmount += amt;

        // Donor name
        if (d.name) {
          donorSet.add(d.name.trim().toLowerCase());
        }

        // Parse metadata
        let parsedBirthday = 0;
        let parsedMeals = 0;
        let parsedLives = 0;
        let parsedStudykit = 0;
        let hasMetaMetrics = false;

        if (d.time && d.time.includes('|')) {
          try {
            const meta = JSON.parse(d.time.split('|')[1]);
            if (meta) {
              if (meta.meals !== undefined || meta.lives !== undefined || meta.studykit !== undefined || meta.birthday !== undefined) {
                parsedBirthday = meta.birthday || 0;
                parsedMeals = meta.meals || 0;
                parsedLives = meta.lives || 0;
                parsedStudykit = meta.studykit || 0;
                hasMetaMetrics = true;
              }
            }
          } catch (_) {}
        }

        // Fallback parsing
        if (!hasMetaMetrics) {
          const donationFor = (d.donation_for || '').toLowerCase();
          
          if (donationFor.includes('birthday') || donationFor.includes('celebration') || donationFor.includes('anniversary')) {
            parsedBirthday = amt;
          }
          if (donationFor.includes('thali') || donationFor.includes('meals') || donationFor.includes('feed') || 
              donationFor.includes('cows') || donationFor.includes('dogs') || donationFor.includes('chara') || 
              donationFor.includes('fodder') || donationFor.includes('food')) {
            parsedMeals = Math.round(amt / 30);
          }
          if (donationFor.includes('study') || donationFor.includes('notebook') || 
              (donationFor.includes('kit') && (donationFor.includes('study') || donationFor.includes('school') || donationFor.includes('education')))) {
            parsedStudykit = Math.round(amt / 150);
          }
          if (donationFor.includes('women') || donationFor.includes('hygiene') || donationFor.includes('menstrual') || 
              donationFor.includes('pad') || donationFor.includes('girl') || donationFor.includes('child') || 
              donationFor.includes('care') || donationFor.includes('water')) {
            parsedLives = Math.round(amt / 50);
          }
        }

        totalBirthday += parsedBirthday;
        totalMeals += parsedMeals;
        totalLives += parsedLives;
        totalStudykit += parsedStudykit;
      });
    }

    const totalImpacted = totalLives + totalBirthday + totalMeals + totalStudykit;

    // 4. Update the stats cards
    const cards = getLocalCards();
    const updatedCards = cards.map(card => {
      switch (card.category) {
        case 'raised':
          return { ...card, base_value: totalAmount };
        case 'donors':
          return { ...card, base_value: donorSet.size };
        case 'birthday':
          return { ...card, base_value: totalBirthday };
        case 'lives':
          return { ...card, base_value: totalImpacted };
        case 'meals':
          return { ...card, base_value: totalMeals };
        case 'studykit':
          return { ...card, base_value: totalStudykit };
        default:
          return card;
      }
    });

    // Save updated cards to cache file
    saveLocalCards(updatedCards);

    return NextResponse.json(updatedCards);

  } catch (error: any) {
    console.error("Error dynamically aggregating stats cards:", error);
    return NextResponse.json(getLocalCards());
  }
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

import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { supabaseAdmin } from '@/lib/supabase';

async function readLocalJSON(filename: string) {
  try {
    const filePath = path.join(process.cwd(), 'data', filename);
    const data = await fs.readFile(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
}

export async function POST(request: Request) {
  try {
    // Security check to prevent unauthorized database wipes in production
    const expectedSecret = process.env.SEED_SECRET;
    
    if (process.env.NODE_ENV === 'production') {
      const { searchParams } = new URL(request.url);
      const secret = searchParams.get('secret') || request.headers.get('x-seed-secret');
      
      if (!expectedSecret || secret !== expectedSecret) {
        return NextResponse.json({ 
          success: false, 
          error: "Seeding is restricted in production. Please set SEED_SECRET environment variable and pass it as a '?secret=...' query parameter or 'x-seed-secret' header." 
        }, { status: 403 });
      }
    }

    // 1. Read local JSON data
    const causes = await readLocalJSON('causes.json');
    const blogs = await readLocalJSON('blogs.json');
    const reviews = await readLocalJSON('reviews.json');
    const stories = await readLocalJSON('stories.json');
    const donations = await readLocalJSON('donations.json');
    const highlights = await readLocalJSON('about_highlights.json');
    const categories = await readLocalJSON('categories.json');
    const starVolunteers = await readLocalJSON('star_volunteers.json');

    // Helper to throw if Supabase action returns an error
    const checkError = (result: { error: any }, stepName: string) => {
      if (result.error) {
        throw new Error(`[${stepName}] ${result.error.message || JSON.stringify(result.error)}`);
      }
    };

    // 2. Clear existing table rows in Supabase
    checkError(await supabaseAdmin.from('causes').delete().neq('id', 0), "Clear Causes");
    checkError(await supabaseAdmin.from('blogs').delete().neq('id', 0), "Clear Blogs");
    checkError(await supabaseAdmin.from('reviews').delete().neq('id', 0), "Clear Reviews");
    checkError(await supabaseAdmin.from('stories').delete().neq('id', 0), "Clear Stories");
    checkError(await supabaseAdmin.from('directors').delete().neq('id', 0), "Clear Directors");
    checkError(await supabaseAdmin.from('volunteers').delete().neq('id', 0), "Clear Volunteers");
    try {
      await supabaseAdmin.from('page_media').delete().neq('key', '');
    } catch (e) {
      console.warn("Could not clear page_media table in Supabase:", e);
    }
    try {
      await supabaseAdmin.from('page_texts').delete().neq('key', '');
    } catch (e) {
      console.warn("Could not clear page_texts table in Supabase:", e);
    }
    
    try {
      await supabaseAdmin.from('categories').delete().neq('id', 0);
    } catch (e) {
      console.warn("Could not clear categories table in Supabase:", e);
    }

    try {
      await supabaseAdmin.from('star_volunteers').delete().neq('id', 0);
    } catch (e) {
      console.warn("Could not clear star_volunteers table in Supabase:", e);
    }

    // 3. Seed Causes
    if (causes && causes.length > 0) {
      const payload = causes.map((c: any) => ({
        id: c.id,
        title: c.title,
        price: c.price,
        image: c.image,
        video: c.video || null,
        category: c.category
      }));
      checkError(await supabaseAdmin.from('causes').insert(payload), "Insert Causes");
    }

    // Seed Categories
    if (categories && categories.length > 0) {
      try {
        const payload = categories.map((c: any) => ({
          id: c.id,
          name: c.name
        }));
        await supabaseAdmin.from('categories').insert(payload);
      } catch (e) {
        console.warn("Could not seed categories table in Supabase:", e);
      }
    }

    // 4. Seed Blogs
    if (blogs && blogs.length > 0) {
      const payload = blogs.map((b: any) => ({
        id: b.id,
        image: b.image,
        title: b.title,
        date_label: b.date,
        excerpt: b.excerpt
      }));
      checkError(await supabaseAdmin.from('blogs').insert(payload), "Insert Blogs");
    }

    // 5. Seed Reviews
    if (reviews && reviews.length > 0) {
      const payload = reviews.map((r: any) => ({
        id: r.id,
        title: r.title,
        desc_text: r.desc,
        author: r.author,
        video: r.video
      }));
      checkError(await supabaseAdmin.from('reviews').insert(payload), "Insert Reviews");
    }

    // 6. Seed Stories
    if (stories && stories.length > 0) {
      const payload = stories.map((s: any) => ({
        id: s.id,
        url: s.url,
        alt: s.alt
      }));
      checkError(await supabaseAdmin.from('stories').insert(payload), "Insert Stories");
    }

    // Donations seeding removed to prevent overwriting transaction data

    // Seed Star Volunteers
    if (starVolunteers && starVolunteers.length > 0) {
      try {
        const payload = starVolunteers.map((s: any) => ({
          id: s.id,
          volunteer_id: s.volunteer_id,
          name: s.name,
          gender: s.gender,
          email: s.email,
          phone: s.phone,
          profile_photo: s.profile_photo,
          grade: s.grade,
          reason: s.reason,
          week_label: s.week_label,
          tasks_completed: s.tasks_completed
        }));
        await supabaseAdmin.from('star_volunteers').insert(payload);
      } catch (e) {
        console.warn("Could not seed star_volunteers table in Supabase:", e);
      }
    }

    // 8. Seed Directors & Volunteers highlights
    if (highlights) {
      if (highlights.directors && highlights.directors.length > 0) {
        const payload = highlights.directors.map((d: any) => ({
          id: d.id,
          name: d.name,
          role: d.role,
          image: d.image,
          quote: d.quote
        }));
        checkError(await supabaseAdmin.from('directors').insert(payload), "Insert Directors");
      }
      if (highlights.volunteers && highlights.volunteers.length > 0) {
        const payload = highlights.volunteers.map((v: any) => ({
          id: v.id,
          name: v.name,
          role: v.role,
          image: v.image,
          quote: v.quote
        }));
        checkError(await supabaseAdmin.from('volunteers').insert(payload), "Insert Volunteers");
      }
    }

    // 9. Seed static Page Media resources
    const defaultMedia = [
      { key: "home_hero", url: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&auto=format&fit=crop&q=80", title: "Home Page - Hero Background", type: "image" },
      { key: "about_header", url: "/uploads/1783675073183_ChatGPT_Image_Jul_10__2026__02_46_36_PM.png", title: "About Page - Header Background", type: "image" },
      { key: "impacts_header", url: "/uploads/1783682128756_ChatGPT_Image_Jul_10__2026__04_38_17_PM.png", title: "Our Impact Page - Top Banner Header Image", type: "image" },
      { key: "causes_header", url: "/uploads/1783683652022_ChatGPT_Image_Jul_10__2026__05_06_17_PM.png", title: "Causes Page - Top Banner Header Image", type: "image" },
      { key: "about_vision", url: "/uploads/1783512061946_ChatGPT_Image_Jul_8__2026__05_26_34_PM.png", title: "About Page - Vision Image", type: "image" },
      { key: "about_mission", url: "/uploads/1783512033718_ChatGPT_Image_Jul_8__2026__05_28_49_PM.png", title: "About Page - Mission Image", type: "image" },
      { key: "about_team", url: "/uploads/1783629520322_team.png", title: "About Page - Team Image", type: "image" },
      { key: "about_tutorial_video", url: "/uploads/1783507902634_CREATE_VIDEO_USING_THIS_PIC_AN.mp4", title: "About Page - Tutorial Video", type: "video" },
      { key: "about_footer_banner", url: "/uploads/1783629589588_volunteer.png", title: "About Page - Bottom Landscape Banner", type: "image" },
      { key: "home_volunteer_banner", url: "/uploads/1783629633435_team.png", title: "Home Page - Volunteer Onboarding Banner", type: "image" }
    ];
    try {
      await supabaseAdmin.from('page_media').insert(defaultMedia);
    } catch (e) {
      console.warn("Could not seed page_media table in Supabase:", e);
    }

    // 10. Seed static Page Texts resources
    const defaultTexts = [
      { key: "about_banner_title_prefix", value: "About", title: "About Page - Top Banner Title Prefix Text" },
      { key: "about_banner_title_highlight", value: "Kanha Foundation", title: "About Page - Top Banner Title Highlighted Text" },
      { key: "impacts_banner_title_prefix", value: "1.2 cr+", title: "Our Impact Page - Top Banner Title Prefix Text" },
      { key: "impacts_banner_title_highlight", value: "Lives Impacted", title: "Our Impact Page - Top Banner Title Highlighted Text" },
      { key: "impacts_banner_subtitle", value: "Real people. Real stories. Real change — powered by everyday givers like you.", title: "Our Impact Page - Top Banner Subtitle Text" },
      { key: "causes_banner_title_prefix", value: "Causes", title: "Causes Page - Top Banner Title Prefix Text" },
      { key: "causes_banner_title_highlight", value: "We Care", title: "Causes Page - Top Banner Title Highlighted Text" },
      { key: "about_summary_text", value: "Kanha Foundation is a purpose-driven impact platform built to make giving simple, transparent, and meaningful. Our primary initiatives focus on providing healthy meals and essential nutrition to underprivileged children, distributing high-quality study kits to empower young learners, supplying hygienic menstrual kits to underprivileged girls to foster health and dignity, and feeding vulnerable street cows and dogs daily. Every contribution made through our platform is executed on-ground and documented with real photos and videos, ensuring complete transparency and trust. By combining compassion with accountability and technology, Kanha Foundation empowers individuals and organizations to create measurable impact—any day, for any cause—while truly giving with heart.", title: "About Page - Main Summary Text" },
      { key: "about_vision_title", value: "Our Vision", title: "About Page - Vision Section Title" },
      { key: "about_vision_desc", value: "We envision a compassionate world where underprivileged children receive nourishing food and proper study resources, young girls have access to essential menstrual hygiene kits, and street cows and dogs are fed with love. By combining real-time on-ground execution with transparent video proof, we turn acts of giving into personal and verifiable experiences.", title: "About Page - Vision Section Description" },
      { key: "about_mission_title", value: "Our Mission", title: "About Page - Mission Section Title" },
      { key: "about_mission_desc", value: "To directly support underprivileged communities and stray animals by executing targeted on-ground relief drives: distributing food and educational study kits to children, providing menstrual hygiene kits to girls, and feeding stray cows and dogs. We aim to ensure that every act of kindness translates to visible, direct impact.", title: "About Page - Mission Section Description" },
      { key: "about_team_title", value: "Our Team", title: "About Page - Team Section Title" },
      { key: "about_team_desc", value: "Kanha Foundation is powered by a committed team of professionals and verified field partners working together to ensure transparent, on-ground impact. From planning to execution to documentation, our team ensures every donation is handled with care, responsibility, and trust.", title: "About Page - Team Section Description" },
      { key: "about_leadership_title", value: "Our Leadership", title: "About Page - Leadership Title Heading" },
      { key: "about_leadership_sub", value: "Meet the guiding minds behind the mission and growth of Kanha Foundation.", title: "About Page - Leadership Sub-Heading" },
      { key: "about_volunteers_title", value: "Our Team", title: "About Page - Volunteers Title Heading" },
      { key: "about_volunteers_sub", value: "Recognizing the passionate volunteers dedicating their time and hearts on the ground.", title: "About Page - Volunteers Sub-Heading" },
      { key: "about_footer_cta_title", value: "Your Kindness Can Change Lives", title: "About Page - Footer CTA Heading" },
      { key: "about_footer_cta_desc", value: "Join our mission to provide meals, study kits, menstrual kits, and stray animal feeds—fully documented with real-time video verification.", title: "About Page - Footer CTA Description" }
    ];
    try {
      await supabaseAdmin.from('page_texts').insert(defaultTexts);
    } catch (e) {
      console.warn("Could not seed page_texts table in Supabase:", e);
    }

    // 11. Seed detailed stories
    const defaultDetailedStories = [
      {
        id: 1,
        title: "Nourishing Slum Children in Ranchi",
        category: "Food Relief",
        desc: "We distributed fresh hot meals directly to over 500 children in local settlements. Each pack includes fresh rice, pulses, and vegetables, cooked in highly hygienic kitchens. Every drive is fully tracked and updated to sponsors.",
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80",
        stats: "500+ Children Fed",
        date: "July 2026"
      },
      {
        id: 2,
        title: "Empowering schoolkids with Study Kits",
        category: "Education",
        desc: "Many child students have no basic pencils or notebook supplies. Our volunteers packed and delivered comprehensive school kits containing pens, drawing blocks, bags, and pencil cases to encourage learning.",
        image: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&auto=format&fit=crop&q=80",
        stats: "150+ Kits Distributed",
        date: "June 2026"
      },
      {
        id: 3,
        title: "Distribution of Menstrual Kits",
        category: "Women Care",
        desc: "Providing hygienic pads and sanitary kits to adolescent girls in rural settlements to foster dignity, good health, and lower school dropout rates. Includes awareness talks by healthcare volunteers.",
        image: "https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=600&auto=format&fit=crop&q=80",
        stats: "300+ Girls Supported",
        date: "June 2026"
      },
      {
        id: 4,
        title: "Stray Cow & Dog Daily Feed Campaign",
        category: "Stray Care",
        desc: "Ensuring stray cows and street animals receive fresh green fodder, clean water, and food daily. Our localized teams run regular checks and coordinate volunteer feeders across major zones.",
        image: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=600&auto=format&fit=crop&q=80",
        stats: "100+ Animals Fed Daily",
        date: "July 2026"
      }
    ];
    try {
      await supabaseAdmin.from('detailed_stories').insert(defaultDetailedStories);
    } catch (e) {
      console.warn("Detailed stories table insert failed, skipping table seed:", e);
    }

    // 12. Seed success stories
    const defaultSuccessStories = [
      {
        id: 1,
        image: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=600&auto=format&fit=crop&q=80",
        title: "7 Lakh+ Birthday Giving",
        desc: "7 Lakh Moments of Meaningful Giving"
      },
      {
        id: 2,
        image: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&auto=format&fit=crop&q=80",
        title: "Giving With Proof",
        desc: "Transparent impact you can see and trust."
      },
      {
        id: 3,
        image: "https://images.unsplash.com/photo-1509062522246-3755977927d7?w=600&auto=format&fit=crop&q=80",
        title: "20 Lakh+ Lives Impacted",
        desc: "Impacting Lives. Creating Hope."
      },
      {
        id: 4,
        image: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=600&auto=format&fit=crop&q=80",
        title: "35 Lakh+ Meals Served",
        desc: "35 Lakh Meals of Dignity"
      }
    ];
    try {
      await supabaseAdmin.from('success_stories').delete().neq('id', 0);
      await supabaseAdmin.from('success_stories').insert(defaultSuccessStories);
    } catch (e) {
      console.warn("Success stories table seed failed, skipping table seed:", e);
    }

    return NextResponse.json({ success: true, message: "Supabase database seeded successfully!" });
  } catch (error: any) {
    console.error("Seeding API error:", error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

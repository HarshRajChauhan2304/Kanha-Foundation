import { NextResponse } from 'next/server';
import { resilientPost } from '@/lib/db-fallback';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { amount, name, email, phone, address, localCart } = body;

    if (!amount || amount <= 0) {
      return NextResponse.json({ success: false, error: 'Invalid order amount' }, { status: 400 });
    }

    // Determine the Cashfree credentials and environment
    const appId = process.env.CASHFREE_APP_ID || process.env.APP_ID;
    const secretKey = process.env.CASHFREE_SECRET_KEY || process.env.Secret_Key || process.env.SECRET_KEY;
    const isProd = process.env.CASHFREE_ENV === 'production';
    const cashfreeEnv = isProd ? 'production' : 'sandbox';

    if (!appId || !secretKey) {
      console.error('Cashfree credentials missing in server environment variables.');
      return NextResponse.json({
        success: false,
        error: 'Payment gateway configuration is missing.'
      }, { status: 500 });
    }

    // Generate a unique order ID for Cashfree (max 45 chars)
    const timestamp = Date.now();
    const randSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `CF_KF_${timestamp}_${randSuffix}`;

    // Construct customer details for Cashfree
    const cleanEmail = email ? email.trim() : '';
    const customerId = `cust_${timestamp}_${randSuffix}`;
    const customerName = name ? name.trim() : 'Donor';
    
    let cleanPhone = (phone || '').replace(/[^0-9]/g, '');
    if (cleanPhone.length > 10) {
      cleanPhone = cleanPhone.slice(-10);
    }
    if (cleanPhone.length < 10) {
      cleanPhone = '9999999999'; // fallback to valid 10-digit format
    }

    // Construct return URL dynamically
    const host = request.headers.get('host') || 'localhost:3000';
    const protocol = host.includes('localhost') ? 'http' : 'https';
    const returnUrl = `${protocol}://${host}/donate/receipt?order_id={order_id}`;

    // 1. Insert a pending donation record into database
    const generatedDate = new Date().toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    const productTitles = Array.isArray(localCart)
      ? localCart.map((item: any) => item.title).join(', ')
      : 'General Support';

    // Calculate metadata similar to normal donation creation
    let birthdayTotal = 0;
    let birthdayCount = 0;
    let foodTotal = 0;
    let welfareTotal = 0;
    let studyKitTotal = 0;

    if (Array.isArray(localCart)) {
      localCart.forEach((item: any) => {
        const clean = item.amount ? item.amount.replace(/[a-zA-Z]+\.?/g, "").trim() : "0";
        const numericStr = clean.replace(/[^0-9.]/g, "");
        const amt = parseFloat(numericStr) || 0;
        const title = item.title.toLowerCase();
        const category = (item.category || "").toLowerCase();

        const isBirthday = category.includes("birthday") || category.includes("anniversary") || category.includes("memorial") ||
                           title.includes("birthday") || title.includes("anniversary") || title.includes("celebration");
                           
        const isFood = category.includes("needy") || category.includes("animal") || category.includes("nature") || category.includes("food") ||
                       title.includes("thali") || title.includes("meals") || title.includes("feed") || title.includes("cows") || title.includes("dogs") || title.includes("chara") || title.includes("fodder");
                       
        const isWelfare = category.includes("women") || category.includes("education") || category.includes("care") ||
                          title.includes("study") || title.includes("kit") || title.includes("notebook") || title.includes("education") || title.includes("menstrual") || title.includes("water") || title.includes("girl") || title.includes("child");
                          
        const isStudyKit = category.includes("education") || (title.includes("study") && title.includes("kit"));

        if (isBirthday) {
          birthdayTotal += amt;
          birthdayCount += 1;
        }
        if (isFood) foodTotal += amt;
        if (isWelfare) welfareTotal += amt;
        if (isStudyKit) studyKitTotal += amt;
      });
    }

    const mealsCount = Math.round(foodTotal / 30);
    const livesCount = Math.round(welfareTotal / 50);
    const studyKitsCount = Math.round(studyKitTotal / 150);

    const metadata = {
      birthday: birthdayCount,
      meals: mealsCount,
      lives: livesCount,
      studykit: studyKitsCount,
      total: amount,
      marketing: {
        receiveMarketing: !!body.receiveMarketing,
        marketingPhone: body.receiveMarketing ? body.marketingPhone : "",
        marketingEmail: body.receiveMarketing ? (body.marketingEmail || email) : ""
      },
      customisation: amount >= 700 ? {
        isAnonymous: !!body.isAnonymous,
        printedName: body.isAnonymous ? "" : (body.printedName || ""),
        deliveryDate: body.isAnonymous ? "" : (body.deliveryDate || ""),
        photoUrl: body.isAnonymous ? "" : (body.customPhotoUrl || ""),
        videoWish: body.isAnonymous ? "" : (body.videoWish || ""),
        instagramId: body.isAnonymous ? "" : (body.instagramId || ""),
        isGift: body.isAnonymous ? false : !!body.isGift,
        giftMessage: body.isAnonymous ? "" : (body.isGift ? body.giftMessage : ""),
        isOtherRequest: body.isAnonymous ? false : !!body.isOtherRequest,
        otherRequestText: body.isAnonymous ? "" : (body.isOtherRequest ? body.otherRequestText : "")
      } : null
    };

    const timePayload = `${generatedDate}|${JSON.stringify(metadata)}`;

    const dbPayload = {
      name: name || "Anonymous",
      address: address || "",
      email: cleanEmail,
      phone: phone || "",
      amount: `₹${amount.toLocaleString('en-IN')}`,
      time: timePayload,
      donation_for: productTitles,
      is_anonymous: !!body.isAnonymous,
      printed_name: body.isAnonymous ? "" : (body.printedName || ""),
      delivery_date: body.isAnonymous ? "" : (body.deliveryDate || ""),
      photo_url: body.isAnonymous ? "" : (body.customPhotoUrl || ""),
      video_wish: body.isAnonymous ? "" : (body.videoWish || ""),
      instagram_id: body.isAnonymous ? "" : (body.instagramId || ""),
      is_gift: body.isAnonymous ? false : !!body.isGift,
      gift_message: body.isAnonymous ? "" : (body.isGift ? body.giftMessage : ""),
      is_other_request: body.isAnonymous ? false : !!body.isOtherRequest,
      other_request_text: body.isAnonymous ? "" : (body.isOtherRequest ? body.otherRequestText : ""),
      receive_marketing: !!body.receiveMarketing,
      marketing_phone: body.receiveMarketing ? (body.marketingPhone || "") : "",
      marketing_email: body.receiveMarketing ? (body.marketingEmail || email || "") : "",
      is_dedicated: !!body.isDedicated,
      dedicated_to: body.isDedicated ? (body.dedicatedTo || "") : "",
      dedication_msg: body.isDedicated ? (body.dedicationMsg || "") : "",
      receipt_id: orderId,
      transaction_date: generatedDate,
      payment_method: 'Cashfree',
      payment_status: 'PENDING'
    };

    // Save record to DB (or local fallback)
    await resilientPost({
      table: 'donations',
      fallbackFile: 'donations.json',
      bodyData: dbPayload
    });

    // 2. Request order creation from Cashfree
    const cashfreeUrl = isProd
      ? 'https://api.cashfree.com/pg/orders'
      : 'https://sandbox.cashfree.com/pg/orders';

    const cashfreePayload = {
      order_id: orderId,
      order_amount: parseFloat(amount.toFixed(2)),
      order_currency: 'INR',
      customer_details: {
        customer_id: customerId,
        customer_name: customerName,
        customer_email: cleanEmail || 'donor@example.com',
        customer_phone: cleanPhone
      },
      order_meta: {
        return_url: returnUrl
      }
    };

    const cfResponse = await fetch(cashfreeUrl, {
      method: 'POST',
      headers: {
        'x-client-id': appId,
        'x-client-secret': secretKey,
        'x-api-version': '2023-08-01',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(cashfreePayload)
    });

    if (!cfResponse.ok) {
      const errorText = await cfResponse.text();
      console.error('Cashfree order creation failed:', errorText);
      return NextResponse.json({
        success: false,
        error: `Cashfree Error: ${errorText}`
      }, { status: cfResponse.status });
    }

    const cfData = await cfResponse.json();

    return NextResponse.json({
      success: true,
      payment_session_id: cfData.payment_session_id,
      order_id: orderId,
      environment: cashfreeEnv
    });

  } catch (error: any) {
    console.error('Error creating order in backend:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

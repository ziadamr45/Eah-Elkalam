import { NextResponse } from "next/server";

const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || "";
const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODEL = "google/gemini-2.0-flash-001";

interface TrendSummary {
  headline: string;
  explanation: string;
  platform: string;
  category: string;
  heatScore: number;
}

const SYSTEM_PROMPT = `أنت محلل ترندات مصري خبير. بتكتب بالعامية المصرية الأصيلة بروح مصرية خالصة - زي ما المصريين بيتكلموا في الشارع وعلى السوشيال ميديا. 

مهمتك إنك تحلل الترندات دي وتكتب ملخص شامل وممتع وفعلاً مصري. 

الملخص لازم يتكون من الأقسام دي:

1. **🎯 خلاصة الترندات**: ملخص سريع لأهم 3-5 ترندات بالعامية المصرية
2. **📊 التحليل**: إيه اللي شاغل الناس وإيه السبب وراء كل ترند - اكتب بعمق بس بالعامية
3. **🔮 التوقعات**: إيه اللي ممكن يترند بعد كده بناءً على اللي شايفه
4. **💡 الخاتمة**: خاتمة مضحكة بالعامية المصرية فيها حكمة أو نكتة

قواعد مهمة:
- اكتب بالعامية المصرية بس مش الفصحى
- استخدم إيموجي بصراحة
- حط نكت وأمثال مصرية
- خلي الكلام سبيس واحد مش رسمي
- لو في ترند رياضي اذكر الأهلي والزمالك
- لو في ترند اقتصادي اذكر تأثيره على الناس العادية
- لو في ترند تكنولوجي اذكر التأثير على الشباب`;

const FALLBACK_SUMMARY = `🎯 **خلاصة الترندات**

الترندات النهاردة شغالة بجنون! أكتر حاجة لافطة الانتباه هي المواضيع الرياضية والاقتصادية اللي بتعمل ضجة على كل المنصات. الناس شغالة تتكلم وتتناقش والسوشيال ميديا مليانة آراء.

📊 **التحليل**

الرياضة دايماً بتسخن السوشيال خصوصاً لما يكون في ماتشات مهمة - المنتخب والأهلي والزمالك دول محركات أساسية للترند. من الناحية التانية، الاقتصاد والأسعار بيبقوا على رأس اهتمامات المصريين كل يوم. التكنولوجيا برضه بقت تاخد مكان أكبر خصوصاً مع جيل الشباب اللي شغال على السوشيال 24/7.

🔮 **التوقعات**

- ممكن نشوف ترندات جديدة عن الأسعار لو حصل أي تغيير
- مواضيع التعليم هتترند خصوصاً لو في أخبار عن الثانوية
- المسلسلات والأفلام ممكن تعمل ضجة لو في حلقة صادمة

💡 **الخاتمة**

بصراحة يا جماعة الترندات دي بتغير كل يوم بس المصريين بيفضلوا المصريين - يغضبوا وينكتوا في نفس الوقت! زي ما بيقولوا: "المصري لو زعلان بيضحك ولو فرحان بيخاف" 😂🇪🇬`;

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { trends } = body as { trends: TrendSummary[] };

    if (!trends || !Array.isArray(trends) || trends.length === 0) {
      return NextResponse.json(
        { success: false, error: "لازم تبعت ترندات عشان أحللها" },
        { status: 400 }
      );
    }

    // Format trends for the AI prompt
    const trendsText = trends
      .map(
        (t, i) =>
          `${i + 1}. [${t.platform}] ${t.headline} (${t.category}) - حرارة: ${t.heatScore}/10\n   التفاصيل: ${t.explanation}`
      )
      .join("\n\n");

    const userPrompt = `حلل الترندات دي واكتب ملخص بالعامية المصرية:\n\n${trendsText}`;

    try {
      const response = await fetch(OPENROUTER_API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "HTTP-Referer": "https://eh-el-kalam.app",
          "X-Title": "إيه الكلام؟ - Egyptian Trend Radar",
        },
        body: JSON.stringify({
          model: MODEL,
          messages: [
            { role: "system", content: SYSTEM_PROMPT },
            { role: "user", content: userPrompt },
          ],
          temperature: 0.8,
          max_tokens: 1500,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("OpenRouter API error:", response.status, errorText);
        throw new Error(`OpenRouter API returned ${response.status}`);
      }

      const data = await response.json();
      const aiSummary = data.choices?.[0]?.message?.content;

      if (!aiSummary) {
        throw new Error("No content in AI response");
      }

      return NextResponse.json({
        success: true,
        summary: aiSummary,
        source: "openrouter-ai",
        model: MODEL,
        trendCount: trends.length,
      });
    } catch (aiError) {
      console.error("AI Summary generation failed, using fallback:", aiError);
      return NextResponse.json({
        success: true,
        summary: FALLBACK_SUMMARY,
        source: "fallback",
        trendCount: trends.length,
        error: aiError instanceof Error ? aiError.message : "AI generation failed",
      });
    }
  } catch (error) {
    console.error("AI Summary API error:", error);
    return NextResponse.json(
      {
        success: false,
        error: "حصلت مشكلة في توليد الملخص",
        summary: FALLBACK_SUMMARY,
        source: "error-fallback",
      },
      { status: 500 }
    );
  }
}

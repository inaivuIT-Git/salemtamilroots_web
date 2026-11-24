/*
  Blog posts, in English and Tamil. Kept in the code for now: posting means a commit and a deploy.
  Pictures live under public/blog/<slug>/.

  A post body is a list of blocks, so both languages share one layout:
    p      a paragraph            h2    a section heading
    list   bullet points           quote a pull quote
    img    one picture             gallery  two or three pictures side by side
*/

export type Lang = "en" | "ta";
export type Pic = { src: string; width: number; height: number; alt: string; caption?: string };
export type Block =
  | { t: "p"; text: string }
  | { t: "h2"; text: string }
  | { t: "list"; items: { lead?: string; text: string }[] }
  | { t: "quote"; text: string }
  | { t: "img"; pic: Pic; narrow?: boolean }
  | { t: "gallery"; pics: Pic[]; caption?: string };

export type PostText = { title: string; summary: string; readMinutes: number; body: Block[] };
export type Post = {
  slug: string;
  date: string; // YYYY-MM-DD, India time
  author: { en: string; ta: string };
  cover: Omit<Pic, "alt" | "caption">;
  coverAlt: { en: string; ta: string };
  coverCaption?: { en: string; ta: string };
  en: PostText;
  ta: PostText;
};

const dir = "/blog/rooted-in-salem";

const rootedInSalem: Post = {
  slug: "rooted-in-salem",
  date: "2026-11-24",
  author: { en: "The Salem Tamil Roots team", ta: "சேலம் தமிழ் ரூட்ஸ் குழு" },
  cover: { src: `${dir}/menmai-on-banana-leaf.webp`, width: 555, height: 335 },
  coverCaption: {
    en: "Menmai millet brownies: millet, made into something children ask for.",
    ta: "மென்மை சிறுதானிய பிரௌனிகள்: குழந்தைகளே கேட்டு வாங்கும் சிறுதானியம்.",
  },
  coverAlt: {
    en: "Menmai millet brownies with nuts and berries on a banana leaf",
    ta: "வாழை இலையில் பருப்புகளும் பெர்ரிகளும் கொண்ட மென்மை சிறுதானிய பிரௌனிகள்",
  },

  en: {
    title: "Rooted in Salem: the story behind Salem Tamil Roots",
    summary:
      "Why we bring millet foods and herbal wellness from Salem to your table, what we make, and what you'll find in this blog. Our very first post.",
    readMinutes: 4,
    body: [
      {
        t: "p",
        text: "In many Tamil homes, the best food memories begin in a grandmother's kitchen: ragi kali on a cool morning, kambu koozh in the summer heat, a pinch of turmeric in almost everything. Those kitchens didn't follow food trends. They followed the seasons, the fields, and what had worked for generations.",
      },
      {
        t: "p",
        text: "Salem Tamil Roots began with a simple question: why have so many of these foods quietly left our plates? This is our first blog post, so it feels like the right place to tell you who we are and what we are trying to do.",
      },
      { t: "h2", text: "What “roots” means to us" },
      {
        t: "p",
        text: "Ragi (kezhvaragu), kambu, kavuni rice and cholam fed Tamil families for generations. They are hardy grains that grow with little water, and they were once everyday food, not something you looked for on a special shelf.",
      },
      {
        t: "p",
        text: "Today most of us know these grains are good for us, yet they rarely reach the table. Life is busy, children want something sweet, and a bowl of kali can't compete with a packet of biscuits. So we asked a different question: what if tradition tasted like a treat?",
      },
      { t: "h2", text: "Menmai: millet you'll want a second piece of" },
      {
        t: "p",
        text: "That question became Menmai, our millet brownies. Menmai (மென்மை) means softness, and that is the idea: the goodness of millet in a soft, rich brownie that disappears from the lunch box. They come in flavours like chocolate, nuts, berries and pista, and the Naarsuvai Menmai combo brings four of them together in one box.",
      },
      { t: "quote", text: "Made the way our grandmothers did, packed for the way we live now." },
      { t: "h2", text: "Wellness, the way our elders knew it" },
      {
        t: "p",
        text: "Our shelves also carry things Tamil homes have trusted for a long time. Nalungu maavu, the herbal bath powder of the nalungu ritual before a wedding and of a baby's bath, made with turmeric, kasthuri manjal, korai kizhangu, neem, vetiver, vasambu and poolan kizhangu. Soup powders made from the greens our grandparents gathered: mudakkathan, musumusukkai and mookirattai.",
      },
      {
        t: "img",
        pic: {
          src: `${dir}/nalungu-ingredients.webp`,
          width: 1024,
          height: 715,
          alt: "Nalungu maavu bath powder in a bowl, surrounded by turmeric, green gram, rose petals, neem and other herbs",
          caption: "Nalungu maavu and the herbs and roots that go into it.",
        },
      },
      {
        t: "p",
        text: "And the simple things from the farm and the forest: panang kizhangu (palm sprouts), honey and cow ghee.",
      },
      {
        t: "gallery",
        pics: [
          { src: `${dir}/palm-sprouts.webp`, width: 1024, height: 1024, alt: "Palm sprouts with palm fruit and leaves" },
          { src: `${dir}/ghee.webp`, width: 1024, height: 1024, alt: "A jar of cow ghee with cows grazing behind it" },
          { src: `${dir}/honey.webp`, width: 1200, height: 800, alt: "Honey dripping from a wooden dipper into a jar, with honeycomb" },
        ],
        caption: "Panang kizhangu, cow ghee and honey.",
      },
      {
        t: "p",
        text: "We don't promise miracles. These are traditions, not medicines. What we do promise is to tell you plainly what is inside, where it comes from, and how it has traditionally been used.",
      },
      { t: "h2", text: "How we choose what we sell" },
      {
        t: "list",
        items: [
          { lead: "Made in Salem.", text: "The foods and powders on our shelves are made here, in Tamil Nadu." },
          {
            lead: "Explained in Tamil and English.",
            text: "Every product page tells you the tradition behind it, the key ingredients, who it is for, and how to use and store it.",
          },
          { lead: "Old recipes, packed for today.", text: "Traditional ways of making, in packs that suit a modern kitchen and a busy week." },
        ],
      },
      {
        t: "img",
        narrow: true,
        pic: {
          src: `${dir}/harvest.webp`,
          width: 340,
          height: 497,
          alt: "A woman gathering herbs into a basket, with bowls of turmeric, leaves and a brass lamp in front",
          caption: "Herbs and roots, gathered by hand.",
        },
      },
      { t: "h2", text: "What you'll find in this blog" },
      {
        t: "p",
        text: "This is where we will share the longer stories: millet recipes you can make on a weekday, the meaning behind rituals like nalungu, the people and places behind what we sell, and the seasonal foods of Tamil Nadu. Tell us what you would like to read: write to us, or send us a message on WhatsApp.",
      },
      { t: "p", text: "Thank you for being here at the very start. நன்றி." },
    ],
  },

  ta: {
    title: "சேலத்தின் வேர்களிலிருந்து: சேலம் தமிழ் ரூட்ஸ் பிறந்த கதை",
    summary:
      "சேலத்திலிருந்து சிறுதானிய உணவுகளையும் மூலிகை நலப் பொருட்களையும் ஏன் உங்கள் வீட்டுக்குக் கொண்டு வருகிறோம், என்ன செய்கிறோம், இந்த வலைப்பதிவில் என்ன வரும். எங்கள் முதல் பதிவு.",
    readMinutes: 4,
    body: [
      {
        t: "p",
        text: "பல தமிழ் வீடுகளில் சிறந்த உணவு நினைவுகள் பாட்டியின் சமையலறையில்தான் தொடங்குகின்றன: குளிர்ந்த காலையில் கேழ்வரகுக் களி, கோடை வெயிலில் கம்பங்கூழ், ஏறக்குறைய எல்லாவற்றிலும் ஒரு சிட்டிகை மஞ்சள். அந்தச் சமையலறைகள் உணவுப் போக்குகளைப் பின்பற்றவில்லை. பருவங்களையும், வயல்களையும், தலைமுறைகளாகப் பலன் தந்தவற்றையும் பின்பற்றின.",
      },
      {
        t: "p",
        text: "சேலம் தமிழ் ரூட்ஸ் ஒரு எளிய கேள்வியோடு தொடங்கியது: இந்த உணவுகள் ஏன் சத்தமில்லாமல் நம் தட்டுகளிலிருந்து விலகிவிட்டன? இது எங்கள் முதல் வலைப்பதிவு. நாங்கள் யார், என்ன செய்ய முயல்கிறோம் என்று சொல்ல இதுவே சரியான இடம்.",
      },
      { t: "h2", text: "“வேர்கள்” என்றால் எங்களுக்கு என்ன?" },
      {
        t: "p",
        text: "கேழ்வரகு, கம்பு, கவுனி அரிசி, சோளம். இவை தலைமுறை தலைமுறையாகத் தமிழ் குடும்பங்களுக்கு உணவளித்தவை. குறைந்த தண்ணீரிலும் வளரும் உறுதியான தானியங்கள். ஒரு காலத்தில் இவை அன்றாட உணவு; தனி அலமாரியில் தேடி வாங்கும் பொருள் அல்ல.",
      },
      {
        t: "p",
        text: "இவை நல்லவை என்று இன்று நம்மில் பலருக்குத் தெரியும். ஆனாலும் தட்டுக்கு வருவது அரிது. வாழ்க்கை வேகமாக ஓடுகிறது, குழந்தைகள் இனிப்பை விரும்புகிறார்கள், ஒரு கிண்ணம் களி ஒரு பாக்கெட் பிஸ்கட்டுடன் போட்டியிட முடிவதில்லை. அதனால் நாங்கள் வேறொரு கேள்வி கேட்டோம்: பாரம்பரியமே ஒரு விருந்தின் சுவையோடு இருந்தால் என்ன?",
      },
      { t: "h2", text: "மென்மை: இன்னொரு துண்டு கேட்க வைக்கும் சிறுதானியம்" },
      {
        t: "p",
        text: "அந்தக் கேள்விக்கான பதில்தான் மென்மை, எங்கள் சிறுதானிய பிரௌனிகள். சிறுதானியத்தின் நன்மையை மென்மையான, சுவை நிறைந்த பிரௌனியாக மாற்றினோம்; மதிய உணவுப் பெட்டியிலிருந்து முதலில் காலியாவது இதுதான். சாக்லேட், பருப்புகள், பெர்ரி, பிஸ்தா எனப் பல சுவைகளில் கிடைக்கின்றன. நான்கு சுவைகளையும் ஒரே பெட்டியில் தருகிறது நாற்சுவை மென்மை தொகுப்பு.",
      },
      { t: "quote", text: "நம் பாட்டிகள் செய்த முறையில், இன்றைய வாழ்க்கைக்கு ஏற்ப." },
      { t: "h2", text: "நம் முன்னோர் அறிந்த நலம்" },
      {
        t: "p",
        text: "தமிழ் வீடுகள் நெடுங்காலமாக நம்பி வந்த பொருட்களும் எங்கள் அலமாரியில் உள்ளன. திருமணத்துக்கு முன் நடக்கும் நலுங்குச் சடங்கிலும் குழந்தைக் குளியலிலும் இடம்பெறும் மூலிகைக் குளியல் பொடியான நலுங்கு மாவு: மஞ்சள், கஸ்தூரி மஞ்சள், கோரைக்கிழங்கு, வேம்பு, வெட்டிவேர், வசம்பு, பூலான்கிழங்கு சேர்த்துச் செய்யப்படுவது. நம் தாத்தா பாட்டிகள் பறித்த கீரைகளிலிருந்து சூப் பொடிகள்: முடக்கத்தான், முசுமுசுக்கை, மூக்கிரட்டை.",
      },
      {
        t: "img",
        pic: {
          src: `${dir}/nalungu-ingredients.webp`,
          width: 1024,
          height: 715,
          alt: "கிண்ணத்தில் நலுங்கு மாவு, சுற்றிலும் மஞ்சள், பச்சைப்பயறு, ரோஜா இதழ்கள், வேம்பு மற்றும் மூலிகைகள்",
          caption: "நலுங்கு மாவும் அதில் சேரும் மூலிகைகளும் கிழங்குகளும்.",
        },
      },
      { t: "p", text: "அத்துடன் வயலும் காடும் தரும் எளிய பொருட்கள்: பனங்கிழங்கு, தேன், பசு நெய்." },
      {
        t: "gallery",
        pics: [
          { src: `${dir}/palm-sprouts.webp`, width: 1024, height: 1024, alt: "பனம்பழம் மற்றும் ஓலைகளுடன் பனங்கிழங்கு" },
          { src: `${dir}/ghee.webp`, width: 1024, height: 1024, alt: "பின்னால் மேயும் பசுக்களுடன் ஒரு ஜாடி பசு நெய்" },
          { src: `${dir}/honey.webp`, width: 1200, height: 800, alt: "தேன்கூட்டுடன், மரக்கரண்டியிலிருந்து ஜாடியில் வழியும் தேன்" },
        ],
        caption: "பனங்கிழங்கு, பசு நெய், தேன்.",
      },
      {
        t: "p",
        text: "நாங்கள் அற்புதங்களை வாக்களிக்கவில்லை. இவை மரபுகள், மருந்துகள் அல்ல. உள்ளே என்ன இருக்கிறது, எங்கிருந்து வருகிறது, பாரம்பரியமாக எப்படிப் பயன்படுத்தப்பட்டது என்பதைத் தெளிவாகச் சொல்வதே எங்கள் வாக்குறுதி.",
      },
      { t: "h2", text: "நாங்கள் எதைத் தேர்ந்தெடுக்கிறோம்" },
      {
        t: "list",
        items: [
          { lead: "சேலத்தில் தயாரிக்கப்பட்டவை.", text: "எங்கள் அலமாரியில் உள்ள உணவுகளும் பொடிகளும் இங்கே, தமிழ்நாட்டில் தயாரிக்கப்படுகின்றன." },
          {
            lead: "தமிழிலும் ஆங்கிலத்திலும் விளக்கம்.",
            text: "ஒவ்வொரு பொருளின் பக்கமும் அதன் பின்னணி மரபு, முக்கியப் பொருட்கள், யாருக்கு ஏற்றது, எப்படிப் பயன்படுத்துவது, எப்படிச் சேமிப்பது என்று சொல்கிறது.",
          },
          { lead: "பழைய செய்முறை, இன்றைய பொதிவு.", text: "பாரம்பரிய முறையில் தயாரித்து, இன்றைய சமையலறைக்கும் பரபரப்பான வாரத்துக்கும் ஏற்ற பொதிவில்." },
        ],
      },
      {
        t: "img",
        narrow: true,
        pic: {
          src: `${dir}/harvest.webp`,
          width: 340,
          height: 497,
          alt: "கூடையில் மூலிகைகளைச் சேகரிக்கும் பெண், முன்னால் மஞ்சள், இலைகள் கொண்ட கிண்ணங்களும் பித்தளை விளக்கும்",
          caption: "கையால் பறித்த மூலிகைகளும் கிழங்குகளும்.",
        },
      },
      { t: "h2", text: "இந்த வலைப்பதிவில் என்ன வரும்?" },
      {
        t: "p",
        text: "நீண்ட கதைகளை இங்கே பகிர்வோம்: வார நாளிலும் செய்யக்கூடிய சிறுதானியச் சமையல் குறிப்புகள், நலுங்கு போன்ற சடங்குகளின் பொருள், நாங்கள் விற்கும் பொருட்களுக்குப் பின்னால் உள்ள மனிதர்களும் இடங்களும், தமிழ்நாட்டின் பருவகால உணவுகள். நீங்கள் எதைப் படிக்க விரும்புகிறீர்கள் என்று எங்களுக்கு எழுதுங்கள், அல்லது வாட்ஸ்அப்பில் சொல்லுங்கள்.",
      },
      { t: "p", text: "தொடக்கத்திலேயே எங்களுடன் இருப்பதற்கு நன்றி." },
    ],
  },
};

/** Newest first. */
export const posts: Post[] = [rootedInSalem].sort((a, b) => b.date.localeCompare(a.date));
export const findPost = (slug: string) => posts.find((p) => p.slug === slug);

/** "24 November 2026" / "24 நவம்பர் 2026", in India time. */
export const day = (date: string, locale: string) =>
  new Intl.DateTimeFormat(locale === "ta" ? "ta-IN" : "en-IN", { day: "numeric", month: "long", year: "numeric", timeZone: "Asia/Kolkata" }).format(
    new Date(`${date}T12:00:00+05:30`),
  );

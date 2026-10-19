import { useState, useEffect } from "react";
import { Globe, Search, ChevronDown, Check, X } from "lucide-react";

const LANGUAGES = [
  { code: "en", name: "English" },
  { code: "hi", name: "Hindi (हिन्दी)" },
  { code: "bn", name: "Bengali (বাংলা)" },
  { code: "te", name: "Telugu (తెలుగు)" },
  { code: "mr", name: "Marathi (मराठी)" },
  { code: "ta", name: "Tamil (தமிழ்)" },
  { code: "gu", name: "Gujarati (ગુજરાતી)" },
  { code: "ur", name: "Urdu (اردو)" },
  { code: "kn", name: "Kannada (ಕನ್ನಡ)" },
  { code: "ml", name: "Malayalam (മലയാളം)" },
  { code: "pa", name: "Punjabi (ਪੰਜਾਬੀ)" },
  { code: "af", name: "Afrikaans" },
  { code: "sq", name: "Albanian (Shqip)" },
  { code: "am", name: "Amharic (አማርኛ)" },
  { code: "ar", name: "Arabic (العربية)" },
  { code: "hy", name: "Armenian (Հայերեն)" },
  { code: "as", name: "Assamese (অসমীয়া)" },
  { code: "ay", name: "Aymara (Janqi)" },
  { code: "az", name: "Azerbaijani (Azərbaycan)" },
  { code: "bm", name: "Bambara (Bamanankan)" },
  { code: "eu", name: "Basque (Euskara)" },
  { code: "be", name: "Belarusian (Беларуская)" },
  { code: "bho", name: "Bhojpuri (भोजपुरी)" },
  { code: "bs", name: "Bosnian (Bosanski)" },
  { code: "bg", name: "Bulgarian (Български)" },
  { code: "ca", name: "Catalan (Català)" },
  { code: "ceb", name: "Cebuano" },
  { code: "ny", name: "Chichewa (Nyanja)" },
  { code: "zh-CN", name: "Chinese (Simplified) (简体中文)" },
  { code: "zh-TW", name: "Chinese (Traditional) (繁體中文)" },
  { code: "co", name: "Corsican (Corsu)" },
  { code: "hr", name: "Croatian (Hrvatski)" },
  { code: "cs", name: "Czech (Čeština)" },
  { code: "da", name: "Danish (Dansk)" },
  { code: "dv", name: "Dhivehi (ދިވެހިބަސް)" },
  { code: "doi", name: "Dogri (डोगरी)" },
  { code: "nl", name: "Dutch (Nederlands)" },
  { code: "eo", name: "Esperanto" },
  { code: "et", name: "Estonian (Eesti)" },
  { code: "ee", name: "Ewe (Eʋegbe)" },
  { code: "fil", name: "Filipino (Tagalog)" },
  { code: "fi", name: "Finnish (Suomi)" },
  { code: "fr", name: "French (Français)" },
  { code: "fy", name: "Frisian (Frysk)" },
  { code: "gl", name: "Galician (Galego)" },
  { code: "ka", name: "Georgian (ქართული)" },
  { code: "de", name: "German (Deutsch)" },
  { code: "el", name: "Greek (Ελληνικά)" },
  { code: "gn", name: "Guarani" },
  { code: "ht", name: "Haitian Creole (Kreyòl)" },
  { code: "ha", name: "Hausa" },
  { code: "haw", name: "Hawaiian (ʻŌlelo Hawaiʻi)" },
  { code: "he", name: "Hebrew (עברית)" },
  { code: "hmn", name: "Hmong (Lus Hmoob)" },
  { code: "hu", name: "Hungarian (Magyar)" },
  { code: "is", name: "Icelandic (Íslenska)" },
  { code: "ig", name: "Igbo" },
  { code: "ilo", name: "Ilocano (Ilokano)" },
  { code: "id", name: "Indonesian (Bahasa Indonesia)" },
  { code: "ga", name: "Irish (Gaeilge)" },
  { code: "it", name: "Italian (Italiano)" },
  { code: "ja", name: "Japanese (日本語)" },
  { code: "jw", name: "Javanese (Jawa)" },
  { code: "kk", name: "Kazakh (Қазақ)" },
  { code: "km", name: "Khmer (ភាសាខ្មែរ)" },
  { code: "rw", name: "Kinyarwanda" },
  { code: "gom", name: "Konkani (कोंकणी)" },
  { code: "ko", name: "Korean (한국어)" },
  { code: "kri", name: "Krio" },
  { code: "ku", name: "Kurdish (Kurmanji) (Kurdî)" },
  { code: "ckb", name: "Kurdish (Sorani) (کوردی)" },
  { code: "ky", name: "Kyrgyz (Кыргызча)" },
  { code: "lo", name: "Lao (ລາວ)" },
  { code: "la", name: "Latin (Latina)" },
  { code: "lv", name: "Latvian (Latviešu)" },
  { code: "ln", name: "Lingala" },
  { code: "lt", name: "Lithuanian (Lietuvių)" },
  { code: "lg", name: "Luganda" },
  { code: "lb", name: "Luxembourgish (Lëtzebuergesch)" },
  { code: "mk", name: "Macedonian (Македонски)" },
  { code: "mai", name: "Maithili (मैथिली)" },
  { code: "mg", name: "Malagasy" },
  { code: "ms", name: "Malay (Bahasa Melayu)" },
  { code: "mt", name: "Maltese (Malti)" },
  { code: "mi", name: "Maori (Māori)" },
  { code: "mni-Mtei", name: "Meiteilon (Manipuri)" },
  { code: "lus", name: "Mizo" },
  { code: "mn", name: "Mongolian (Монгол)" },
  { code: "my", name: "Myanmar (Burmese) (မြန်မာ)" },
  { code: "ne", name: "Nepali (नेपाली)" },
  { code: "no", name: "Norwegian (Norsk)" },
  { code: "or", name: "Odia (Oriya) (ଓଡ଼ିଆ)" },
  { code: "om", name: "Oromo (Afaan Oromoo)" },
  { code: "ps", name: "Pashto (پښتو)" },
  { code: "fa", name: "Persian (فارسی)" },
  { code: "pl", name: "Polish (Polski)" },
  { code: "pt", name: "Portuguese (Português)" },
  { code: "qu", name: "Quechua" },
  { code: "ro", name: "Romanian (Română)" },
  { code: "ru", name: "Russian (Русский)" },
  { code: "sm", name: "Samoan (Gagana Samoa)" },
  { code: "sa", name: "Sanskrit (संस्कृतम्)" },
  { code: "gd", name: "Scots Gaelic (Gàidhlig)" },
  { code: "nso", name: "Sepedi (Sesotho sa Leboa)" },
  { code: "sr", name: "Serbian (Српски)" },
  { code: "st", name: "Sesotho" },
  { code: "sn", name: "Shona (Chishona)" },
  { code: "sd", name: "Sindhi (سنڌي)" },
  { code: "si", name: "Sinhala (සිංහල)" },
  { code: "sk", name: "Slovak (Slovenčina)" },
  { code: "sl", name: "Slovenian (Slovenščina)" },
  { code: "so", name: "Somali (Soomaali)" },
  { code: "es", name: "Spanish (Español)" },
  { code: "su", name: "Sundanese (Basa Sunda)" },
  { code: "sw", name: "Swahili (Kiswahili)" },
  { code: "sv", name: "Swedish (Svenska)" },
  { code: "tg", name: "Tajik (Тоҷикӣ)" },
  { code: "tt", name: "Tatar (Татар)" },
  { code: "th", name: "Thai (ไทย)" },
  { code: "ti", name: "Tigrinya (ትግርኛ)" },
  { code: "ts", name: "Tsonga (Xitsonga)" },
  { code: "tr", name: "Turkish (Türkçe)" },
  { code: "tk", name: "Turkmen (Türkmençe)" },
  { code: "ak", name: "Twi (Akan)" },
  { code: "uk", name: "Ukrainian (Українська)" },
  { code: "ug", name: "Uyghur (ئۇيغۇرچه)" },
  { code: "uz", name: "Uzbek (Oʻzbekcha)" },
  { code: "vi", name: "Vietnamese (Tiếng Việt)" },
  { code: "cy", name: "Welsh (Cymraeg)" },
  { code: "xh", name: "Xhosa (isiXhosa)" },
  { code: "yi", name: "Yiddish (ייִדיש)" },
  { code: "yo", name: "Yoruba (Ede Yoruba)" },
  { code: "zu", name: "Zulu (isiZulu)" },
];

export function LanguageSelector() {
  const [currentLangCode, setCurrentLangCode] = useState("en");
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Reset to English on mount
  useEffect(() => {
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    document.cookie = "googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=" + window.location.hostname + ";";
    document.cookie = "googtrans=/en/en; path=/;";
    setCurrentLangCode("en");
  }, []);

  // Google Translate init
  useEffect(() => {
    const initTranslate = () => {
      if (
        (window as any).google?.translate?.TranslateElement
      ) {
        new (window as any).google.translate.TranslateElement(
          { pageLanguage: "en" },
          "google_translate_element"
        );
      }
    };

    (window as any).googleTranslateElementInit = initTranslate;

    if ((window as any).google?.translate?.TranslateElement) {
      try { initTranslate(); } catch (_) {}
    } else if (!document.getElementById("google-translate-script")) {
      const script = document.createElement("script");
      script.id = "google-translate-script";
      script.src = "https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit";
      script.async = true;
      document.body.appendChild(script);
    }

    return () => {
      const el = document.getElementById("google_translate_element");
      if (el) el.innerHTML = "";
    };
  }, []);

  const handleSelect = (code: string) => {
    setCurrentLangCode(code);
    setIsOpen(false);
    setSearch("");

    const selectEl =
      (document.querySelector("#google_translate_element select") as HTMLSelectElement) ||
      (document.querySelector(".goog-te-combo") as HTMLSelectElement);

    if (selectEl) {
      selectEl.value = code;
      selectEl.dispatchEvent(new Event("change"));
    }
  };

  const filtered = LANGUAGES.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="relative notranslate" translate="no">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-muted/50 transition-colors"
        title="Translate page"
      >
        <Globe className="h-4 w-4 shrink-0" />
        <span className="text-xs hidden lg:inline">
          {LANGUAGES.find((l) => l.code === currentLangCode)?.name || "English"}
        </span>
        <ChevronDown
          className="h-3 w-3 text-muted-foreground transition-transform duration-200"
          style={{ transform: isOpen ? "rotate(180deg)" : "none" }}
        />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 w-64 rounded-2xl border border-border/50 bg-background/95 backdrop-blur-xl shadow-2xl z-50 overflow-hidden">
            <div className="p-2.5 border-b border-border/50 flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-muted-foreground shrink-0 ml-1" />
              <input
                type="text"
                placeholder="Search language..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-transparent border-none text-xs outline-none py-1 text-foreground placeholder-muted-foreground"
                autoFocus
              />
              {search && (
                <button onClick={() => setSearch("")} className="p-0.5 hover:bg-muted rounded-full">
                  <X className="h-3 w-3 text-muted-foreground" />
                </button>
              )}
            </div>
            <div className="max-h-64 overflow-y-auto py-1">
              {filtered.length === 0 ? (
                <div className="px-3 py-4 text-center text-xs text-muted-foreground">
                  No languages found.
                </div>
              ) : (
                filtered.map((lang) => {
                  const selected = lang.code === currentLangCode;
                  return (
                    <button
                      key={lang.code}
                      onClick={() => handleSelect(lang.code)}
                      className={`w-full text-left px-3 py-2 text-xs flex items-center justify-between transition-colors ${
                        selected
                          ? "bg-muted text-foreground font-bold"
                          : "text-muted-foreground hover:bg-muted/50"
                      }`}
                    >
                      <span>{lang.name}</span>
                      {selected && <Check className="h-3.5 w-3.5 shrink-0" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

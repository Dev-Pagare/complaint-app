import { Injectable, signal } from '@angular/core';

export type Lang = 'en' | 'hi' | 'gu';

const translations: Record<Lang, Record<string, string>> = {
  en: {
    home: 'Home', complaint: 'Complaint', status: 'Status',
    about: 'About Us', contact: 'Contact Us',
    myComplaints: 'My Complaints', login: '🔐 Login', logout: '🚪 Logout',

    heroTitle: 'Surat Municipal Complaint Portal',
    heroSub: 'Report civic issues directly to the Surat Municipal Corporation. Fast, transparent, and trackable.',
    fileComplaint: 'File a Complaint', trackStatus: 'Track Status',

    submitComplaint: 'Submit Complaint →', submitting: '⏳ Submitting...',

    trackYourComplaint: 'Track Your Complaint',
  },
  hi: {
    home: 'होम', complaint: 'शिकायत', status: 'स्थिति',
    about: 'हमारे बारे में', contact: 'संपर्क',
    myComplaints: 'मेरी शिकायतें', login: '🔐 लॉग इन', logout: '🚪 लॉग आउट',
    heroTitle: 'सूरत नगर पालिका शिकायत पोर्टल',
    heroSub: 'नागरिक समस्याओं को सूरत नगर पालिका को सीधे रिपोर्ट करें। तेज़, पारदर्शी और ट्रैक करने योग्य।',
    fileComplaint: 'शिकायत दर्ज करें', trackStatus: 'स्थिति ट्रैक करें',
    submitComplaint: 'शिकायत जमा करें →', submitting: '⏳ जमा हो रहा है...',
    trackYourComplaint: 'अपनी शिकायत ट्रैक करें',
  },
  gu: {
    home: 'હોમ', complaint: 'ફરિયાદ', status: 'સ્થિતિ',
    about: 'અમારા વિશે', contact: 'સંપર્ક',
    myComplaints: 'મારી ફરિયાદો', login: '🔐 લૉગ ઇન', logout: '🚪 લૉગ આઉટ',
    heroTitle: 'સુરત મ્યુનિસિપલ ફરિયાદ પોર્ટલ',
    heroSub: 'નાગરિક સમસ્યાઓ સીધી સુરત મ્યુનિસિપલ કોર્પોરેશનને જણાવો. ઝડપી, પારદર્શી અને ટ્રેક કરી શકાય.',
    fileComplaint: 'ફરિયાદ નોંધો', trackStatus: 'સ્થિતિ ટ્રેક કરો',
    submitComplaint: 'ફરિયાદ સબમિટ કરો →', submitting: '⏳ સબમિટ થઈ રહ્યું છે...',
    trackYourComplaint: 'તમારી ફરિયાદ ટ્રૅક કરો',
  }
};

@Injectable({ providedIn: 'root' })
export class LanguageService {
  currentLang = signal<Lang>('en');

  setLang(lang: Lang) {
    this.currentLang.set(lang);
    localStorage.setItem('appLang', lang);
  }

  t(key: string): string {
    return translations[this.currentLang()][key] ?? key;
  }

  init() {
    const saved = localStorage.getItem('appLang') as Lang;
    if (saved && ['en', 'hi', 'gu'].includes(saved)) {
      this.currentLang.set(saved);
    }
  }
}

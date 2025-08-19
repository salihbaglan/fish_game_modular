let currentLanguage = 'tr'; // Varsayılan dil
let translations = {};

// Dil dosyasını yükle
async function loadLanguage(lang) {
    try {
        const response = await fetch(`locales/${lang}.json`);
        if (!response.ok) {
            console.error(`Dil dosyası yüklenemedi: ${lang}.json, Hata: ${response.status}`);
            // Varsayılan dile (örn: İngilizce) dön veya hata göster
            if (lang !== 'en') { // Sonsuz döngüyü engelle
                return loadLanguage('en');
            }
            return false;
        }
        translations = await response.json();
        currentLanguage = lang;
        localStorage.setItem('preferredLanguage', lang);
        return true;
        updateTexts();
    } catch (error) {
        console.error(`${lang} dil dosyası yüklenirken hata:`, error);
        if (lang !== 'en') {
            return loadLanguage('en');
        }
        return false;
    }
}

// Sayfadaki metinleri çevir
function translatePage() {
    if (Object.keys(translations).length === 0) {
        console.warn('Çeviriler yüklenmemiş, sayfa çevrilemiyor.');
        return;
    }
    document.querySelectorAll('[data-translate-key]').forEach(element => {
        const key = element.dataset.translateKey;
        if (translations[key]) {
            if (element.dataset.translateHtml === 'true') {
                element.innerHTML = translations[key]; // HTML içeriğini de çevir
            } else if (element.tagName === 'INPUT' && element.type === 'submit' || element.tagName === 'BUTTON') {
                element.value = translations[key]; // Butonlar için value
                element.textContent = translations[key]; // Butonlar için textContent
            } else if (element.placeholder) {
                element.placeholder = translations[key];
            }
            else {
                element.textContent = translations[key];
            }
        } else {
            console.warn(`Çeviri anahtarı bulunamadı: ${key}`);
        }
    });
    // Dinamik olarak güncellenmesi gereken diğer metinler için özel fonksiyonlar çağrılabilir.
    // Örneğin, mağaza item fiyatları gibi.
    updateDynamicTexts(); 
}

// Belirli bir çeviri anahtarını al
function getString(key, replacements = {}) {
    let translatedString = translations[key] || key; // Anahtar bulunamazsa anahtarı geri döndür
    for (const placeholder in replacements) {
        translatedString = translatedString.replace(`{${placeholder}}`, replacements[placeholder]);
    }
    return translatedString;
}

// Dinamik metinleri güncelle (Örn: Mağaza butonları)
function updateDynamicTexts() {
    // Mağaza yükseltme butonları
    document.querySelectorAll('.btn-upgrade').forEach(button => {
        const cost = button.dataset.cost || '0'; // data-cost niteliğini oku
        const upgradeText = getString('upgradeButtonText');
        // İkonu korumak için innerHTML yerine textContent'leri ayrı ayrı ayarlayabiliriz
        // veya getString'e HTML desteği ekleyebiliriz. Şimdilik basit tutalım.
        // Butonun içindeki span'ı bulup onun textContent'ini değiştirelim.
        const textSpan = button.querySelector('span');
        if (textSpan) {
            textSpan.textContent = upgradeText;
        }
        // Maliyet kısmını güncelle (parantez içindeki)
        const costTextNode = Array.from(button.childNodes).find(node => node.nodeType === Node.TEXT_NODE && node.textContent.includes('('));
        if (costTextNode) {
            costTextNode.textContent = ` (${cost} `; // İkonun kapanış etiketi için boşluk bırak
        }
    });
}


// Kayıtlı dili yükle ve uygula
async function initLocalization() {
    const preferredLanguage = localStorage.getItem('preferredLanguage') || 'tr';
    await loadLanguage(preferredLanguage);
    translatePage();
    
    // Dil seçme dropdown'ını ayarla
    const languageSelect = document.getElementById('languageSelect');
    if (languageSelect) {
        languageSelect.value = currentLanguage; // Mevcut dili seçili yap
        languageSelect.addEventListener('change', async (event) => {
            await loadLanguage(event.target.value);
            translatePage();
        });
    }
}

export { loadLanguage, translatePage, getString, initLocalization, updateDynamicTexts };
import { db } from './firebase';
import { 
  collection, 
  query, 
  where, 
  getDocs, 
  setDoc, 
  doc, 
  serverTimestamp,
  getDoc
} from 'firebase/firestore';

const COLLECTION_NAME = 'bank_logos';

/**
 * Normalizes bank name for consistent database lookups
 */
export const normalizeBankName = (name: string): string => {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
};

/**
 * Retrieves a stored logo from the memory (Firestore)
 */
export async function getStoredLogo(bankName: string): Promise<string | null> {
  try {
    const id = normalizeBankName(bankName);
    if (!id) return null;

    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      return docSnap.data().logoUrl;
    }
    return null;
  } catch (error) {
    console.error('Error fetching stored logo:', error);
    return null;
  }
}

/**
 * Saves a logo URL to the memory (Firestore)
 */
export async function storeLogo(bankName: string, logoUrl: string): Promise<void> {
  try {
    const id = normalizeBankName(bankName);
    if (!id || !logoUrl) return;

    const docRef = doc(db, COLLECTION_NAME, id);
    await setDoc(docRef, {
      name: id,
      displayName: bankName,
      logoUrl,
      updatedAt: serverTimestamp()
    }, { merge: true });
    
    console.log(`Logo for ${bankName} stored in memory.`);
  } catch (error) {
    console.error('Error storing logo:', error);
  }
}

/**
 * Initial seed for common Brazilian banks if memory is empty
 */
export async function seedInitialLogos(): Promise<void> {
  const initialLogos: Record<string, string> = {
    'itau': 'https://logodownload.org/wp-content/uploads/2014/05/itau-logo-1.png',
    'itau personnalite': 'https://logodownload.org/wp-content/uploads/2014/05/itau-personnalite-logo.png',
    'nubank': 'https://logodownload.org/wp-content/uploads/2019/08/nubank-logo-3.png',
    'bradesco': 'https://logodownload.org/wp-content/uploads/2014/05/bradesco-logo-1.png',
    'santander': 'https://logodownload.org/wp-content/uploads/2014/05/santander-logo-1.png',
    'banco do brasil': 'https://logodownload.org/wp-content/uploads/2014/05/banco-do-brasil-logo-1.png',
    'inter': 'https://logodownload.org/wp-content/uploads/2017/05/banco-inter-logo-1.png',
    'c6': 'https://logodownload.org/wp-content/uploads/2019/09/c6-bank-logo-1.png',
    'xp': 'https://logodownload.org/wp-content/uploads/2019/07/xp-investimentos-logo-1.png',
    'btg': 'https://logodownload.org/wp-content/uploads/2019/09/btg-pactual-logo-1.png',
    'safra': 'https://logodownload.org/wp-content/uploads/2018/10/banco-safra-logo-1.png',
    'caixa': 'https://logodownload.org/wp-content/uploads/2014/05/caixa-logo-1.png'
  };

  for (const [name, url] of Object.entries(initialLogos)) {
    await storeLogo(name, url);
  }
}

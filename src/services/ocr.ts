import config from '../utils/config';

export interface OCRResult {
  text: string;
  raw?: unknown;
}

/**
 * Simple OCR service using OCR.Space.
 * Docs: https://ocr.space/ocrapi
 *
 * Note: This is a network call. If `OCRSPACE_API_KEY` is not configured,
 * this throws a descriptive error so the UI can prompt the user.
 */
export class OCRService {
  static async extractTextFromImageUri(uri: string): Promise<OCRResult> {
    const apiKey = config.ocrSpaceApiKey;
    if (!apiKey || apiKey === 'your_ocrspace_api_key_here') {
      throw new Error('OCR is not configured. Set OCRSPACE_API_KEY and rebuild the app.');
    }

    const form = new FormData();
    form.append('apikey', apiKey);
    form.append('language', 'eng');
    form.append('isOverlayRequired', 'false');
    form.append('OCREngine', '2');

    // React Native FormData file shape
    form.append('file', {
      uri,
      name: 'quote.jpg',
      type: 'image/jpeg',
    } as any);

    const response = await fetch('https://api.ocr.space/parse/image', {
      method: 'POST',
      body: form,
      headers: {
        // Let fetch set the correct multipart boundary.
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`OCR request failed (${response.status})`);
    }

    const data = await response.json();

    const parsedText: string =
      data?.ParsedResults?.[0]?.ParsedText ??
      data?.ParsedResults?.map((r: any) => r?.ParsedText).filter(Boolean).join('\n') ??
      '';

    const text = String(parsedText || '').trim();

    if (!text) {
      const msg = data?.ErrorMessage
        ? Array.isArray(data.ErrorMessage)
          ? data.ErrorMessage.join(', ')
          : String(data.ErrorMessage)
        : 'No text detected in image.';
      throw new Error(msg);
    }

    return { text, raw: data };
  }
}

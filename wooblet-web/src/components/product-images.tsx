'use client';

import { useState } from 'react';
import { useActionMutation } from '@/lib/store';
import { ErrorBox, Field } from './ui';

const MAX_IMAGES = 10;
// Leave room for multipart headers under the hosted API's request limit.
const MAX_BYTES = 3 * 1024 * 1024;
const IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

export function ProductImages({ images, onChange, onBusy, disabled }: {
  images: string[];
  onChange: (images: string[]) => void;
  onBusy: (busy: boolean) => void;
  disabled: boolean;
}) {
  const [upload, { error, reset }] = useActionMutation();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [progress, setProgress] = useState('');

  async function selectFiles(input: HTMLInputElement) {
    const files = Array.from(input.files ?? []);
    input.value = '';
    if (!files.length || busy || disabled) return;
    reset();
    setMessage('');
    if (images.length + files.length > MAX_IMAGES) {
      setMessage('A product can have up to 10 photos. Remove a photo before adding more.');
      return;
    }
    if (files.some(file => !IMAGE_TYPES.includes(file.type) || file.size > MAX_BYTES)) {
      setMessage('Choose JPEG, PNG, or WebP photos, each 3 MB or smaller.');
      return;
    }
    setBusy(true);
    onBusy(true);
    const uploaded = [...images];
    try {
      for (const [index, file] of files.entries()) {
        setProgress(`Uploading photo ${index + 1} of ${files.length}…`);
        const body = new FormData();
        body.append('file', file);
        const result = await upload({ path: 'uploads/image', body }).unwrap();
        uploaded.push(result.url);
        onChange([...uploaded]);
      }
    } catch {
      setMessage('Upload stopped. Photos already uploaded are kept below; select the remaining files to retry.');
    } finally {
      setBusy(false);
      onBusy(false);
      setProgress('');
    }
  }

  return <section aria-label="Product photo gallery">
    <Field label="Product photos">
      <input type="file" aria-label="Product photos" accept={IMAGE_TYPES.join(',')} multiple
        disabled={disabled || busy || images.length >= MAX_IMAGES}
        onChange={event => void selectFiles(event.currentTarget)} />
      <small>JPEG, PNG, or WebP · max 3 MB each · up to 10 photos. The first photo appears in the shop. Save the product to apply changes.</small>
    </Field>
    <p role="status" aria-live="polite">{progress || `${images.length} of ${MAX_IMAGES} photos`}</p>
    {message && <p role="alert" className="notice error">{message}</p>}
    {error && <ErrorBox error={error} />}
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 20 }}>
      {images.map((url, index) => <div key={`${index}-${url}`}>
        <img src={url} alt={`Product photo ${index + 1}`} width={120} height={120}
          style={{ objectFit: 'cover', borderRadius: 12 }} />
        <div className="button-row">
          <button type="button" className="text-link" disabled={disabled || busy || index === 0}
            onClick={() => onChange([url, ...images.filter((_, i) => i !== index)])}>Make cover</button>
          <button type="button" className="text-link danger-text" disabled={disabled || busy}
            aria-label={`Remove product photo ${index + 1}`}
            onClick={() => onChange(images.filter((_, i) => i !== index))}>Remove</button>
        </div>
      </div>)}
    </div>
  </section>;
}

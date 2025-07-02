import React, { useState, useContext } from 'react';
import { TextInput, Button, InlineNotification } from '@carbon/react';
import { useTranslation } from 'react-i18next';
import CameraMediaUploaderContext from './camera-media-uploader-context.resources';
import styles from './paste-image-url.scss';

const PasteImageUrlComponent: React.FC = () => {
  const { t } = useTranslation();
  const [url, setUrl] = useState('');
  const [error, setError] = useState(false);
  const { setFilesToUpload } = useContext(CameraMediaUploaderContext);

  const handleLoadImage = async () => {
    try {
      setError(false);

      const response = await fetch(url, { mode: 'cors' });

      const contentType = response.headers.get('Content-Type');
      if (!response.ok || !contentType?.startsWith('image/')) {
        throw new Error('Invalid image type');
      }

      const blob = await response.blob();
      const reader = new FileReader();

      reader.onloadend = () => {
        const base64 = reader.result as string;

        if (!base64.startsWith('data:image/')) {
          setError(true);
          console.error('Invalid base64 format');
          return;
        }

        setFilesToUpload([
          {
            base64Content: base64,
            fileName: t('imageFromUrl.fileName', 'Image from URL'),
            fileType: 'image',
            fileDescription: '',
            status: 'uploading',
            capturedFromWebcam: false,
          },
        ]);
      };

      reader.onerror = () => {
        console.error('Base64 conversion failed');
        setError(true);
      };

      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Failed to load or convert image:', err);
      setError(true);
    }
  };

  return (
    <div className={styles.pasteUrlContainer}>
      <TextInput
        id="image-url"
        labelText={t('imageUrl.label', 'Paste Image URL')}
        placeholder={t('imageUrl.placeholder', 'https://example.com/photo.png')}
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        invalid={error}
        invalidText={t('imageUrl.invalidText', 'Image failed to load or convert. Please check the URL.')}
        className={styles.urlInput}
      />
      <Button kind="primary" onClick={handleLoadImage} className={styles.loadButton}>
        {t('imageUrl.loadButton', 'Load Image')}
      </Button>

      {error && (
        <InlineNotification
          kind="error"
          title={t('error.title', 'Error')}
          subtitle={t(
            'imageUrlLoadErrorText',
            'The image could not be loaded or converted. Make sure the URL is valid and publicly accessible.',
          )}
          lowContrast
        />
      )}
    </div>
  );
};

export default PasteImageUrlComponent;

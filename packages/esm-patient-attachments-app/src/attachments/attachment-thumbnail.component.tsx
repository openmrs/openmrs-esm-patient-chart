import React from 'react';
import styles from './attachment-thumbnail.scss';
import { DocumentPdf, DocumentUnknown } from '@carbon/react/icons';

export default function AttachmentThumbnail(props: AttachmentThumbnailProps) {
  return (
    <div className={styles.thumbnail}>
      <Thumbnail {...props} />
    </div>
  );
}

function ImageThumbnail(props: ImageProps) {
  return (
    <div className={styles.imageThumbnail} role="button" tabIndex={0} onClick={props?.onClick}>
      <img src={props.src} style={props.style} />
    </div>
  );
}

function PdfThumbnail(props: ImageProps) {
  return (
    <div className={styles.pdfThumbnail} onClick={props.onClick} role="button" tabIndex={0}>
      <DocumentPdf size={24} />
    </div>
  );
}

function OtherThumbnail(props: ImageProps) {
  return (
    <div className={styles.pdfThumbnail} onClick={props.onClick} role="button" tabIndex={0}>
      <DocumentUnknown size={24} />
    </div>
  );
}

function Thumbnail(props: AttachmentThumbnailProps) {
  const contentType = props.item.bytesContentFamily;

  const imageProps = {
    src: props.imageProps.src,
    style: props.imageProps.style,
    onClick: props.imageProps?.onClick,
  };

  if (contentType === 'IMAGE') {
    return <ImageThumbnail {...imageProps} />;
  } else if (contentType === 'PDF') {
    return <PdfThumbnail {...imageProps} />;
  } else {
    return <OtherThumbnail {...imageProps} />;
  }
}

type AttachmentThumbnailProps = {
  imageProps: ImageProps;
  item: ItemProps;
};

type ImageProps = {
  src: string;
  style: Object;
  onClick?: () => void;
};

type ItemProps = {
  id: string;
  dateTime: string;
  bytesMimeType: string;
  bytesContentFamily: string;
};

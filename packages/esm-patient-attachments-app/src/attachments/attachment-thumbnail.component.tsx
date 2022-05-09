import React from 'react';
import styles from './attachment-thumbnail.scss';
import regularFile from '../assets/file-regular.svg';

export default function AttachmentThumbnail(props: AttachmentThumbnailProps) {
  return (
    <div className={styles.thumbnail}>
      <Thumbnail {...props} />
    </div>
  );
}

function ImageThumbnail(props: ImageProps) {
  return (
    <div className={styles.imageThumbnail} role="button" tabIndex={0}>
      <img src={props.src} alt={props.title} style={props.style} />
    </div>
  );
}

function PdfThumbnail(props: ImageProps) {
  function handleClick(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    window.open(props.src, '_blank');
  }

  return (
    <div className={styles.pdfThumbnail} onClick={handleClick} role="button" tabIndex={0}>
      <embed src={props.src} style={{ ...props.style, pointerEvents: 'none', width: '100%' }} />
      {/* <img src={props.src} alt={props.title} style={props.style} /> */}
    </div>
  );
}

function OtherThumbnail(props: ImageProps) {
  function handleClick(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    const anchor = document.createElement('a');
    anchor.setAttribute('href', props.src);
    anchor.setAttribute('download', 'download');
    anchor.click();
  }

  return (
    <div className={styles.otherThumbnail} onClick={handleClick} role="button" tabIndex={0}>
      <img src={regularFile} alt={props.title} style={props.style} className={styles.otherThumbnail} />
    </div>
  );
}

function Thumbnail(props: AttachmentThumbnailProps) {
  const contentType = props.item.bytesContentFamily;

  const imageProps = {
    src: props.imageProps.src,
    title: props.imageProps.title,
    style: props.imageProps.style,
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
  title: string;
  style: Object;
};

type ItemProps = {
  id: string;
  dateTime: string;
  bytesMimeType: string;
  bytesContentFamily: string;
};

import React, { useState } from "react";
import styles from "./attachment-thumbnail.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

export default function AttachmentThumbnail(props: AttachmentThumbnailProps) {
  const [editingCaption, setEditingCaption] = useState(false);
  const [caption, setCaption] = useState(props.imageProps.title);

  function showEditCaptionForm(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingCaption(true);
  }

  function handleClick(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  function cancelEdit(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingCaption(false);
  }

  function updateCaption(e: React.ChangeEvent<HTMLInputElement>) {
    e.preventDefault();
    e.stopPropagation();
    setCaption(e.target.value);
  }

  function saveCaption(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    setEditingCaption(false);
    const data = new FormData();
    data.append("comment", caption);
    fetch(`/openmrs/ws/rest/v1/attachment/${props.item.id}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    });
  }

  function showInfo(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
  }

  return (
    <div className={styles.thumbnail}>
      <div
        className={styles.infoIcon}
        onClick={showInfo}
        role="button"
        tabIndex={0}
      >
        <FontAwesomeIcon icon={faInfoCircle} />
        <span className={styles.infoText}>{props.item.dateTime}</span>
      </div>
      <div className={styles.caption}>
        {editingCaption ? (
          <div onClick={handleClick} role="button" tabIndex={0}>
            <form>
              <input
                type="text"
                defaultValue={caption}
                onChange={updateCaption}
              />
              <div className={styles.actionButtons}>
                <span onClick={cancelEdit} role="button" tabIndex={0}>
                  x
                </span>
                <span onClick={saveCaption} role="button" tabIndex={0}>
                  &#10003;
                </span>
              </div>
            </form>
          </div>
        ) : (
          <div>
            <span
              onClick={showEditCaptionForm}
              role="button"
              tabIndex={0}
              className={styles.captionText}
            >
              {caption}
            </span>
          </div>
        )}
      </div>
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
    window.open(props.src, "_blank");
  }

  return (
    <div
      className={styles.pdfThumbnail}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <img src={props.src} alt={props.title} style={props.style} />
    </div>
  );
}

function OtherThumbnail(props: ImageProps) {
  function handleClick(e: React.SyntheticEvent) {
    e.preventDefault();
    e.stopPropagation();
    const anchor = document.createElement("a");
    anchor.setAttribute("href", props.src);
    anchor.setAttribute("download", "download");
    anchor.click();
  }

  return (
    <div
      className={styles.otherThumbnail}
      onClick={handleClick}
      role="button"
      tabIndex={0}
    >
      <img src={props.src} alt={props.title} style={props.style} />
    </div>
  );
}

function Thumbnail(props: AttachmentThumbnailProps) {
  const contentType = props.item.bytesContentFamily;

  const imageProps = {
    src: props.imageProps.src,
    title: props.imageProps.title,
    style: props.imageProps.style
  };

  if (contentType === "IMAGE") {
    return <ImageThumbnail {...imageProps} />;
  } else if (contentType === "PDF") {
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

import { createContext } from 'react';
import { type CameraMediaUploaderContextType } from './camera-media-uploader-types';

const CameraMediaUploaderContext = createContext<CameraMediaUploaderContextType>({});

export default CameraMediaUploaderContext;

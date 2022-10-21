import { createContext } from 'react';
import { CameraMediaUploaderContextType } from './camera-media-uploader-types';

const CameraMediaUploaderContext = createContext<CameraMediaUploaderContextType>({});

export default CameraMediaUploaderContext;

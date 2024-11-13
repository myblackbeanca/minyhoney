import { Composition } from 'remotion';
import { ColorBarcode } from './components/ColorBarcode';

export const RemotionRoot: React.FC = () => {
  return (
    <>
      <Composition
        id="ColorBarcode"
        component={ColorBarcode}
        durationInFrames={300}
        fps={30}
        width={1000}
        height={200}
        defaultProps={{
          videoUrl: '',
        }}
      />
    </>
  );
};
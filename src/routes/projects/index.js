import { h } from 'preact';
import styled from 'preact-emotion';
import { Centering } from '../../components/_styled';

export default function Projects() {
  return (
    <div>
      <Centering>
        <a href="https://github.com/rkkautsar" target="_blank">
          <p>Open Source Contributions</p>
          <ResponsiveImage
            src="http://ghchart.rshah.org/rkkautsar"
            alt="rkkautsar's Github chart"
          />
        </a>
      </Centering>
    </div>
  );
}

const ResponsiveImage = styled('img')`
  max-width: 100%;
`;

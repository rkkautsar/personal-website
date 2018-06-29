import { h } from 'preact';
import styled from 'preact-emotion';
import { Centering } from '../../components/_styled';
import OutboundLink from '../../components/OutboundLink';

export default function Projects() {
  return (
    <div>
      <Centering>
        <OutboundLink to="https://github.com/rkkautsar" eventLabel="github_from_chart" target="_blank" >
          <p>Open Source Contributions</p>
          <ResponsiveImage
            src="http://ghchart.rshah.org/rkkautsar"
            alt="my GitHub chart"
          />
        </OutboundLink>
      </Centering>
    </div>
  );
}

const ResponsiveImage = styled('img')`
  max-width: 100%;
`;
